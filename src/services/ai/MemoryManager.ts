/**
 * MemoryManager - AI Coach's Long-term Memory
 * 
 * Handles conversation history organized by day, with:
 * - Persistent storage
 * - Full-text search through history
 * - Automatic summarization
 * - Plan/decision tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Conversation,
  Message,
  MemorySearchQuery,
  MemorySearchResult,
  ConversationSummary,
  RichContent,
} from '@/src/types/ai-coach';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  CONVERSATIONS: '@mymacro/ai_conversations',
  SUMMARIES: '@mymacro/ai_summaries',
  PLANS: '@mymacro/ai_plans',
  LAST_CLEANUP: '@mymacro/ai_last_cleanup',
};

const MAX_STORED_DAYS = 90; // Keep 90 days of history
const MAX_MESSAGES_PER_DAY = 100; // Limit messages per conversation

// ============================================================================
// MEMORY MANAGER SERVICE
// ============================================================================

class MemoryManagerService {
  private conversationsCache: Map<string, Conversation> = new Map();
  private summariesCache: Map<string, ConversationSummary> = new Map();
  private initialized = false;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the memory manager, loading cached data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load recent conversations into cache
      const conversations = await this.loadConversations();
      conversations.forEach(conv => {
        this.conversationsCache.set(conv.date, conv);
      });

      // Load summaries
      const summaries = await this.loadSummaries();
      summaries.forEach(sum => {
        this.summariesCache.set(sum.date, sum);
      });

      // Run cleanup if needed
      await this.cleanupOldData();

      this.initialized = true;
    } catch (error) {
      console.error('[MemoryManager] Initialization error:', error);
    }
  }

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  /**
   * Get today's conversation, creating if doesn't exist
   */
  async getTodayConversation(): Promise<Conversation> {
    await this.initialize();

    const today = this.getDateString();
    
    if (this.conversationsCache.has(today)) {
      return this.conversationsCache.get(today)!;
    }

    // Create new conversation for today
    const newConversation: Conversation = {
      id: `conv_${today}_${Date.now()}`,
      date: today,
      messages: [],
      topics: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.conversationsCache.set(today, newConversation);
    await this.saveConversations();

    return newConversation;
  }

  /**
   * Get conversation for a specific date
   */
  async getConversation(date: string): Promise<Conversation | null> {
    await this.initialize();
    return this.conversationsCache.get(date) || null;
  }

  /**
   * Get all conversation dates (for history navigation)
   */
  async getConversationDates(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.conversationsCache.keys()).sort().reverse();
  }

  /**
   * Add a message to today's conversation
   */
  async addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const conversation = await this.getTodayConversation();

    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();

    // Extract topics from the message
    if (message.role === 'user') {
      const topics = this.extractTopics(message.content);
      topics.forEach(topic => {
        if (!conversation.topics.includes(topic)) {
          conversation.topics.push(topic);
        }
      });
    }

    // Limit messages per day
    if (conversation.messages.length > MAX_MESSAGES_PER_DAY) {
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_DAY);
    }

    await this.saveConversations();

    return newMessage;
  }

  /**
   * Get recent messages for context (last N messages from today)
   */
  async getRecentMessages(limit: number = 10): Promise<Message[]> {
    const conversation = await this.getTodayConversation();
    return conversation.messages.slice(-limit);
  }

  // ============================================================================
  // MEMORY SEARCH
  // ============================================================================

  /**
   * Search through conversation history
   */
  async searchMemory(query: MemorySearchQuery): Promise<MemorySearchResult[]> {
    await this.initialize();

    const results: MemorySearchResult[] = [];
    const searchTerms = query.query.toLowerCase().split(' ').filter(t => t.length > 2);

    // Determine date range
    const conversations = Array.from(this.conversationsCache.values());
    const filteredConversations = conversations.filter(conv => {
      if (query.dateRange) {
        return conv.date >= query.dateRange.start && conv.date <= query.dateRange.end;
      }
      return true;
    });

    // Search each conversation
    for (const conv of filteredConversations) {
      const relevantMessages: Message[] = [];
      let totalScore = 0;

      for (const msg of conv.messages) {
        const content = msg.content.toLowerCase();
        let messageScore = 0;

        // Score based on term matches
        for (const term of searchTerms) {
          if (content.includes(term)) {
            messageScore += 1;
            // Bonus for exact phrase match
            if (content.includes(query.query.toLowerCase())) {
              messageScore += 3;
            }
          }
        }

        // Check topic filters
        if (query.topics && query.topics.length > 0) {
          const topicMatch = query.topics.some(t => 
            content.includes(t.toLowerCase()) || conv.topics.includes(t)
          );
          if (topicMatch) {
            messageScore += 2;
          }
        }

        if (messageScore > 0) {
          relevantMessages.push(msg);
          totalScore += messageScore;
        }
      }

      if (relevantMessages.length > 0) {
        // Get summary if available
        const summary = this.summariesCache.get(conv.date);

        results.push({
          conversationId: conv.id,
          date: conv.date,
          relevantMessages: relevantMessages.slice(0, 5), // Top 5 relevant messages
          score: totalScore,
          summary: summary?.summary,
        });
      }
    }

    // Sort by score and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 10);
  }

  /**
   * Get context from memory for a specific topic
   */
  async getContextForTopic(topic: string): Promise<string> {
    const results = await this.searchMemory({
      query: topic,
      limit: 5,
    });

    if (results.length === 0) {
      return '';
    }

    // Build context string from relevant messages
    let context = `## RELEVANT HISTORY FOR: "${topic}"\n\n`;

    for (const result of results) {
      context += `### ${result.date}\n`;
      for (const msg of result.relevantMessages) {
        const role = msg.role === 'user' ? 'User' : 'Coach';
        context += `${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      }
      if (result.summary) {
        context += `Summary: ${result.summary}\n`;
      }
      context += '\n';
    }

    return context;
  }

  // ============================================================================
  // PLAN & DECISION TRACKING
  // ============================================================================

  /**
   * Save a plan or decision for future reference
   */
  async savePlan(plan: {
    type: 'workout' | 'diet' | 'macro' | 'other';
    name: string;
    details: any;
    validFrom?: string;
    validUntil?: string;
  }): Promise<void> {
    try {
      const plansJson = await AsyncStorage.getItem(STORAGE_KEYS.PLANS);
      const plans = plansJson ? JSON.parse(plansJson) : [];

      plans.push({
        ...plan,
        id: `plan_${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdDate: this.getDateString(),
      });

      // Keep last 50 plans
      if (plans.length > 50) {
        plans.splice(0, plans.length - 50);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (error) {
      console.error('[MemoryManager] Error saving plan:', error);
    }
  }

  /**
   * Get active plans
   */
  async getActivePlans(): Promise<any[]> {
    try {
      const plansJson = await AsyncStorage.getItem(STORAGE_KEYS.PLANS);
      const plans = plansJson ? JSON.parse(plansJson) : [];
      const today = this.getDateString();

      // Filter to active plans
      return plans.filter((p: any) => {
        if (p.validUntil && p.validUntil < today) return false;
        if (p.validFrom && p.validFrom > today) return false;
        return true;
      });
    } catch (error) {
      console.error('[MemoryManager] Error loading plans:', error);
      return [];
    }
  }

  /**
   * Get plans by type
   */
  async getPlansByType(type: string): Promise<any[]> {
    const plans = await this.getActivePlans();
    return plans.filter(p => p.type === type);
  }

  // ============================================================================
  // SUMMARIZATION
  // ============================================================================

  /**
   * Generate or get summary for a conversation
   */
  async getSummary(date: string): Promise<ConversationSummary | null> {
    // Check cache
    if (this.summariesCache.has(date)) {
      return this.summariesCache.get(date)!;
    }

    // Generate summary if conversation exists
    const conversation = await this.getConversation(date);
    if (!conversation || conversation.messages.length === 0) {
      return null;
    }

    // Generate summary (in a real implementation, this would use AI)
    const summary = this.generateLocalSummary(conversation);
    
    this.summariesCache.set(date, summary);
    await this.saveSummaries();

    return summary;
  }

  /**
   * Generate a local summary without AI (fallback)
   */
  private generateLocalSummary(conversation: Conversation): ConversationSummary {
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    const topics = conversation.topics;

    // Extract key decisions from assistant messages
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');
    const keyDecisions: string[] = [];
    const plansCreated: string[] = [];

    for (const msg of assistantMessages) {
      // Look for decision indicators
      if (msg.content.includes('recommend') || msg.content.includes('should')) {
        const snippet = msg.content.substring(0, 100);
        keyDecisions.push(snippet);
      }

      // Look for plans
      if (msg.richContent) {
        for (const rc of msg.richContent) {
          if (rc.type === 'plan_card') {
            plansCreated.push((rc.data as any).title);
          }
        }
      }
    }

    return {
      date: conversation.date,
      topics,
      summary: `Discussed ${topics.length} topics including ${topics.slice(0, 3).join(', ')}. ${userMessages.length} questions asked.`,
      keyDecisions: keyDecisions.slice(0, 3),
      plansCreated,
    };
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private async loadConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[MemoryManager] Error loading conversations:', error);
      return [];
    }
  }

  private async saveConversations(): Promise<void> {
    try {
      const conversations = Array.from(this.conversationsCache.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.error('[MemoryManager] Error saving conversations:', error);
    }
  }

  private async loadSummaries(): Promise<ConversationSummary[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUMMARIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[MemoryManager] Error loading summaries:', error);
      return [];
    }
  }

  private async saveSummaries(): Promise<void> {
    try {
      const summaries = Array.from(this.summariesCache.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.SUMMARIES,
        JSON.stringify(summaries)
      );
    } catch (error) {
      console.error('[MemoryManager] Error saving summaries:', error);
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  private async cleanupOldData(): Promise<void> {
    try {
      const lastCleanup = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CLEANUP);
      const today = this.getDateString();

      // Only cleanup once per day
      if (lastCleanup === today) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - MAX_STORED_DAYS);
      const cutoff = cutoffDate.toISOString().split('T')[0];

      // Remove old conversations
      const oldDates: string[] = [];
      this.conversationsCache.forEach((_, date) => {
        if (date < cutoff) {
          oldDates.push(date);
        }
      });

      oldDates.forEach(date => {
        this.conversationsCache.delete(date);
        this.summariesCache.delete(date);
      });

      await this.saveConversations();
      await this.saveSummaries();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, today);

      if (oldDates.length > 0) {
        console.log(`[MemoryManager] Cleaned up ${oldDates.length} old conversations`);
      }
    } catch (error) {
      console.error('[MemoryManager] Cleanup error:', error);
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    const lowerContent = content.toLowerCase();

    // Topic keywords
    const topicKeywords: Record<string, string> = {
      'workout': 'workout',
      'exercise': 'workout',
      'training': 'workout',
      'gym': 'workout',
      'diet': 'diet',
      'calories': 'nutrition',
      'protein': 'nutrition',
      'carbs': 'nutrition',
      'macros': 'nutrition',
      'meal': 'nutrition',
      'food': 'nutrition',
      'weight': 'weight',
      'scale': 'weight',
      'sleep': 'sleep',
      'tired': 'sleep',
      'recovery': 'recovery',
      'stress': 'stress',
      'cycle': 'cycle',
      'period': 'cycle',
      'peptide': 'peptides',
      'supplement': 'supplements',
    };

    for (const [keyword, topic] of Object.entries(topicKeywords)) {
      if (lowerContent.includes(keyword) && !topics.includes(topic)) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Clear all memory (for debugging/testing)
   */
  async clearAllMemory(): Promise<void> {
    this.conversationsCache.clear();
    this.summariesCache.clear();
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CONVERSATIONS,
      STORAGE_KEYS.SUMMARIES,
      STORAGE_KEYS.PLANS,
      STORAGE_KEYS.LAST_CLEANUP,
    ]);
    this.initialized = false;
  }
}

// Export singleton
export const MemoryManager = new MemoryManagerService();
export default MemoryManager;
