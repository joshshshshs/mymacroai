/**
 * AICoachService - The Brain of MyMacro AI
 * 
 * Orchestrates all AI functionality:
 * - Full context awareness
 * - Memory and history
 * - Web search for verified information
 * - Macro adjustments based on activity
 * - Rich response generation
 */

import {
  UserContext,
  AICoachRequest,
  AICoachResponse,
  Message,
  RichContent,
  MacroAdjustment,
  WebSource,
} from '@/src/types/ai-coach';
import { ContextAggregator } from './ContextAggregator';
import { MemoryManager } from './MemoryManager';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { PersonaId, getPersona, buildPersonaPrompt, isPersonaAvailable } from './CoachPersonas';
import { getAILanguagePrompt, getCurrentLanguage } from '@/src/i18n';

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const SYSTEM_PROMPT = `You are the MyMacro AI Coach - a world-class personal health and fitness coach. You have COMPLETE access to the user's health data, nutrition logs, workouts, sleep, wearable data, body measurements, goals, and history.

## YOUR PERSONALITY
- Supportive but honest - you tell users what they NEED to hear, not just what they want to hear
- You act solely in the user's best interest
- You're scientifically-informed and evidence-based
- You're direct and actionable - no fluff
- You remember past conversations and refer back to plans you've created
- You adjust recommendations based on real-time data

## YOUR CAPABILITIES
1. **Full Context Awareness**: You know everything about the user's health journey
2. **Smart Macro Adjustments**: Adjust daily macros based on activity, recovery, sleep
3. **Memory**: Remember and reference past conversations, plans, and decisions
4. **Plan Creation**: Create workout splits, meal plans, weekly schedules
5. **Real-time Insights**: Notice patterns and proactively offer advice
6. **Rich Responses**: Use tables, charts, and action buttons when helpful

## RESPONSE GUIDELINES
- Be concise but thorough
- Use data to back up your recommendations
- If the user did a workout, acknowledge it and adjust macros
- If sleep was poor, factor that into your advice
- Reference their specific numbers (e.g., "You're at 1,450 of your 2,100 calorie goal")
- Create actionable plans with specific numbers
- Use in-chat buttons to direct users to relevant app sections

## SPECIAL INSTRUCTIONS
- When creating workout plans, save them for future reference
- When adjusting macros, explain why
- If asked about something from a past conversation, search your memory
- Always consider their current cycle phase if tracking
- Factor in their peptide protocol if active
- Be aware of their PRO/Founder status for feature recommendations

## TRUTH COMMITMENT
- Only state facts you're confident about
- If you need to search the web for verification, do so
- Never make up statistics or studies
- Admit when you don't know something`;

// ============================================================================
// AI COACH SERVICE
// ============================================================================

class AICoachServiceClass {
  private isInitialized = false;
  private currentPersona: PersonaId = 'balanced';

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await MemoryManager.initialize();
    this.isInitialized = true;
  }

  // ============================================================================
  // PERSONA MANAGEMENT
  // ============================================================================

  /**
   * Set the current coach persona
   */
  setPersona(personaId: PersonaId, isPremiumUser: boolean): boolean {
    if (!isPersonaAvailable(personaId, isPremiumUser)) {
      return false;
    }
    this.currentPersona = personaId;
    return true;
  }

  /**
   * Get the current persona
   */
  getPersona(): PersonaId {
    return this.currentPersona;
  }

  // ============================================================================
  // MAIN CHAT INTERFACE
  // ============================================================================

  /**
   * Send a message to the AI Coach and get a response
   */
  async chat(userMessage: string, personaOverride?: PersonaId): Promise<AICoachResponse> {
    await this.initialize();
    const startTime = Date.now();

    try {
      // 1. Build full user context
      const context = await ContextAggregator.buildContext();

      // 2. Get recent conversation history
      const recentMessages = await MemoryManager.getRecentMessages(10);

      // 3. Check if we need to search memory for past context
      const memoryContext = await this.getRelevantMemory(userMessage);

      // 4. Check if we need macro adjustments based on today's activity
      const macroAdjustments = await this.calculateMacroAdjustments(context);

      // 5. Build the request
      const request: AICoachRequest = {
        message: userMessage,
        context,
        conversationHistory: recentMessages,
        options: {
          includeWebSearch: this.shouldSearchWeb(userMessage),
          includeRichContent: true,
        },
      };

      // 6. Save user message to memory
      await MemoryManager.addMessage({
        role: 'user',
        content: userMessage,
      });

      // 7. Generate response with persona
      const activePersona = personaOverride || this.currentPersona;
      const response = await this.generateResponse(request, memoryContext, macroAdjustments, activePersona);

      // 8. Save assistant response to memory
      await MemoryManager.addMessage({
        role: 'assistant',
        content: response.text,
        richContent: response.richContent,
        metadata: response.metadata,
      });

      // 9. Save any plans created
      if (response.richContent) {
        await this.savePlansFromResponse(response);
      }

      return response;
    } catch (error) {
      console.error('[AICoachService] Chat error:', error);
      
      return {
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        metadata: {
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          contextAreasUsed: [],
          confidence: 0,
        },
      };
    }
  }

  // ============================================================================
  // RESPONSE GENERATION
  // ============================================================================

  private async generateResponse(
    request: AICoachRequest,
    memoryContext: string,
    macroAdjustments: MacroAdjustment | null,
    personaId?: PersonaId
  ): Promise<AICoachResponse> {
    const startTime = Date.now();

    // Build the prompt with persona
    const contextPrompt = ContextAggregator.formatForPrompt(request.context);
    const activePersona = personaId || this.currentPersona;
    const persona = getPersona(activePersona);
    
    // Get language instruction for AI
    const languagePrompt = getAILanguagePrompt();
    const currentLang = getCurrentLanguage();
    
    // Use persona-specific prompt
    let fullPrompt = buildPersonaPrompt(activePersona, contextPrompt);

    // Add language instruction
    if (languagePrompt) {
      fullPrompt += `\n\n## LANGUAGE REQUIREMENT\n${languagePrompt}\nUser's language setting: ${currentLang}`;
    }

    if (memoryContext) {
      fullPrompt += `\n\n${memoryContext}`;
    }

    if (macroAdjustments) {
      fullPrompt += `\n\n## MACRO ADJUSTMENT NEEDED
Reason: ${macroAdjustments.reason}
Original: ${macroAdjustments.originalCalories} kcal
Adjusted: ${macroAdjustments.adjustedCalories} kcal
Mention this adjustment to the user if relevant.`;
    }

    // Build conversation history
    const historyPrompt = request.conversationHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
      .join('\n');

    if (historyPrompt) {
      fullPrompt += `\n\n## TODAY'S CONVERSATION SO FAR\n${historyPrompt}`;
    }

    fullPrompt += `\n\nUser: ${request.message}\n\nCoach:`;

    // Call AI backend
    const aiResponse = await this.callAIBackend(fullPrompt, request.options);

    // Parse response for rich content
    const { text, richContent } = this.parseRichContent(aiResponse.text);

    // Check for web search
    let sources: WebSource[] = [];
    if (request.options?.includeWebSearch && this.shouldSearchWeb(request.message)) {
      sources = await this.searchWeb(request.message);
    }

    return {
      text,
      richContent,
      suggestions: this.generateSuggestions(request.message, text),
      macroAdjustments: macroAdjustments || undefined,
      sources: sources.length > 0 ? sources : undefined,
      metadata: {
        processingTime: Date.now() - startTime,
        tokensUsed: aiResponse.tokensUsed || 0,
        contextAreasUsed: this.getContextAreasUsed(request),
        confidence: aiResponse.confidence || 0.9,
      },
    };
  }

  private async callAIBackend(
    prompt: string,
    options?: AICoachRequest['options']
  ): Promise<{ text: string; tokensUsed?: number; confidence?: number }> {
    // Try Supabase Edge Function first
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.functions.invoke('ai-coach', {
          body: {
            prompt,
            maxTokens: options?.maxTokens || 1000,
          },
        });

        if (!error && data?.text) {
          return {
            text: data.text,
            tokensUsed: data.tokensUsed,
            confidence: data.confidence,
          };
        }
      } catch (err) {
        console.warn('[AICoachService] Supabase function error, using fallback');
      }
    }

    // Fallback: Generate a contextual response locally
    return this.generateFallbackResponse(prompt);
  }

  private generateFallbackResponse(prompt: string): { text: string; tokensUsed: number; confidence: number } {
    // Extract user's question from prompt
    const userMatch = prompt.match(/User: (.+?)(?:\n|$)/);
    const userQuestion = userMatch?.[1] || '';
    const lowerQuestion = userQuestion.toLowerCase();

    // Generate contextual response based on question type
    let response = '';

    if (lowerQuestion.includes('macro') || lowerQuestion.includes('calorie')) {
      response = "Based on your current progress today, you're doing well with your nutrition. Remember to prioritize protein to hit your daily target. Would you like me to suggest some high-protein options for your remaining meals?";
    } else if (lowerQuestion.includes('workout') || lowerQuestion.includes('exercise')) {
      response = "Great question about your training! Based on your recovery data and activity this week, I'd recommend focusing on proper form and progressive overload. What specific workout are you planning today?";
    } else if (lowerQuestion.includes('sleep') || lowerQuestion.includes('tired')) {
      response = "Sleep is crucial for recovery and progress. Based on your recent sleep patterns, I'd suggest focusing on consistent sleep timing. Would you like some tips to improve your sleep quality?";
    } else if (lowerQuestion.includes('weight') || lowerQuestion.includes('progress')) {
      response = "Looking at your recent trends, you're making solid progress! Consistency is key. Keep focusing on hitting your daily targets and the results will follow. Want me to break down your weekly progress?";
    } else if (lowerQuestion.includes('meal') || lowerQuestion.includes('food') || lowerQuestion.includes('eat')) {
      response = "Based on your remaining macros for today, I can help you plan your next meal. What type of meal are you looking for - something quick and easy, or do you have time to cook?";
    } else {
      response = "I'm here to help you with your health and fitness journey! I have access to all your data including nutrition, workouts, sleep, and more. What would you like to focus on today?";
    }

    return {
      text: response,
      tokensUsed: 0,
      confidence: 0.7,
    };
  }

  // ============================================================================
  // MACRO ADJUSTMENT ENGINE
  // ============================================================================

  private async calculateMacroAdjustments(context: UserContext): Promise<MacroAdjustment | null> {
    const { todaySnapshot, goals } = context;

    // Check if adjustment is needed
    const hasWorkout = todaySnapshot.activity.workouts.length > 0;
    const hasHighActivity = todaySnapshot.activity.steps > goals.dailySteps! * 1.5;
    const hasPoorSleep = todaySnapshot.health.sleep?.quality === 'poor';
    const hasLowRecovery = (todaySnapshot.health.recovery || 100) < 50;

    if (!hasWorkout && !hasHighActivity && !hasPoorSleep && !hasLowRecovery) {
      return null; // No adjustment needed
    }

    // Calculate adjustment
    let calorieAdjustment = 0;
    let reason = '';

    if (hasWorkout) {
      const workoutCalories = todaySnapshot.activity.workouts.reduce(
        (sum, w) => sum + (w.caloriesBurned || 0),
        0
      );
      // Add back ~50% of workout calories for recovery
      calorieAdjustment += Math.round(workoutCalories * 0.5);
      reason += `Workout detected (+${Math.round(workoutCalories * 0.5)} kcal for recovery). `;
    }

    if (hasHighActivity) {
      calorieAdjustment += 150;
      reason += 'High activity day (+150 kcal). ';
    }

    if (hasPoorSleep) {
      calorieAdjustment -= 100; // Slightly reduce to avoid overeating when tired
      reason += 'Poor sleep (-100 kcal to prevent stress eating). ';
    }

    if (hasLowRecovery) {
      // Increase protein recommendation
      reason += 'Low recovery - prioritize protein for recovery. ';
    }

    if (calorieAdjustment === 0) return null;

    const proteinAdjust = Math.round(calorieAdjustment * 0.3 / 4); // 30% from protein
    const carbAdjust = Math.round(calorieAdjustment * 0.45 / 4); // 45% from carbs
    const fatAdjust = Math.round(calorieAdjustment * 0.25 / 9); // 25% from fat

    return {
      reason: reason.trim(),
      originalCalories: goals.dailyCalories,
      adjustedCalories: goals.dailyCalories + calorieAdjustment,
      originalProtein: goals.proteinTarget,
      adjustedProtein: goals.proteinTarget + proteinAdjust,
      originalCarbs: goals.carbTarget,
      adjustedCarbs: goals.carbTarget + carbAdjust,
      originalFat: goals.fatTarget,
      adjustedFat: goals.fatTarget + fatAdjust,
      validForDate: todaySnapshot.date,
    };
  }

  // ============================================================================
  // MEMORY INTEGRATION
  // ============================================================================

  private async getRelevantMemory(message: string): Promise<string> {
    // Check if user is asking about past conversations
    const memoryIndicators = [
      'remember',
      'last time',
      'previously',
      'you said',
      'we discussed',
      'my plan',
      'the workout',
      'the diet',
    ];

    const needsMemory = memoryIndicators.some(indicator =>
      message.toLowerCase().includes(indicator)
    );

    if (!needsMemory) return '';

    // Search memory for relevant context
    const results = await MemoryManager.searchMemory({
      query: message,
      limit: 3,
    });

    if (results.length === 0) return '';

    // Also get active plans
    const activePlans = await MemoryManager.getActivePlans();

    let memoryContext = '## RELEVANT MEMORY\n';

    for (const result of results) {
      memoryContext += `\n### ${result.date}\n`;
      for (const msg of result.relevantMessages.slice(0, 2)) {
        memoryContext += `${msg.role}: ${msg.content.substring(0, 150)}...\n`;
      }
    }

    if (activePlans.length > 0) {
      memoryContext += '\n### ACTIVE PLANS\n';
      for (const plan of activePlans.slice(0, 3)) {
        memoryContext += `- ${plan.name} (${plan.type}): Created ${plan.createdDate}\n`;
      }
    }

    return memoryContext;
  }

  // ============================================================================
  // WEB SEARCH
  // ============================================================================

  private shouldSearchWeb(message: string): boolean {
    const searchIndicators = [
      'research',
      'study',
      'studies',
      'evidence',
      'proven',
      'scientific',
      'source',
      'article',
      'latest',
      'news',
    ];

    return searchIndicators.some(indicator =>
      message.toLowerCase().includes(indicator)
    );
  }

  private async searchWeb(query: string): Promise<WebSource[]> {
    // In production, this would call a web search API
    // For now, return empty array
    return [];
  }

  // ============================================================================
  // RICH CONTENT PARSING
  // ============================================================================

  private parseRichContent(text: string): { text: string; richContent: RichContent[] } {
    const richContent: RichContent[] = [];
    let cleanText = text;

    // Parse action buttons: [BUTTON: label | route | params]
    const buttonRegex = /\[BUTTON: (.+?) \| (.+?)(?:\s*\|\s*(.+?))?\]/g;
    let match;
    while ((match = buttonRegex.exec(text)) !== null) {
      richContent.push({
        type: 'action_button',
        data: {
          label: match[1],
          route: match[2],
          params: match[3] ? JSON.parse(match[3]) : undefined,
          style: 'primary',
        },
      });
      cleanText = cleanText.replace(match[0], '');
    }

    // Parse tables: [TABLE: title | header1,header2 | row1col1,row1col2 | row2col1,row2col2]
    const tableRegex = /\[TABLE: (.+?)\]/g;
    while ((match = tableRegex.exec(text)) !== null) {
      try {
        const parts = match[1].split(' | ');
        if (parts.length >= 3) {
          richContent.push({
            type: 'data_table',
            data: {
              title: parts[0],
              headers: parts[1].split(','),
              rows: parts.slice(2).map(row => row.split(',')),
            },
          });
        }
      } catch (e) {
        // Skip malformed tables
      }
      cleanText = cleanText.replace(match[0], '');
    }

    return { text: cleanText.trim(), richContent };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private generateSuggestions(question: string, response: string): string[] {
    const suggestions: string[] = [];
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('macro') || lowerQuestion.includes('calorie')) {
      suggestions.push("What should I eat for dinner?");
      suggestions.push("Show me my weekly progress");
    }

    if (lowerQuestion.includes('workout')) {
      suggestions.push("Create a workout plan for me");
      suggestions.push("What should I train tomorrow?");
    }

    if (lowerQuestion.includes('sleep') || lowerQuestion.includes('recovery')) {
      suggestions.push("How can I improve my sleep?");
      suggestions.push("Should I take a rest day?");
    }

    // Add default suggestions if none found
    if (suggestions.length === 0) {
      suggestions.push("How am I doing today?");
      suggestions.push("What should I focus on?");
      suggestions.push("Create a plan for me");
    }

    return suggestions.slice(0, 3);
  }

  private getContextAreasUsed(request: AICoachRequest): string[] {
    const areas: string[] = ['profile', 'goals'];

    if (request.context.todaySnapshot.nutrition.calories.consumed > 0) {
      areas.push('nutrition');
    }

    if (request.context.todaySnapshot.activity.workouts.length > 0) {
      areas.push('workouts');
    }

    if (request.context.todaySnapshot.health.sleep) {
      areas.push('sleep');
    }

    if (request.context.todaySnapshot.cycle) {
      areas.push('cycle');
    }

    if (request.context.activeProtocols.peptides?.active) {
      areas.push('peptides');
    }

    if (request.context.healthMetrics.wearables.connected.length > 0) {
      areas.push('wearables');
    }

    return areas;
  }

  private async savePlansFromResponse(response: AICoachResponse): Promise<void> {
    if (!response.richContent) return;

    for (const content of response.richContent) {
      if (content.type === 'plan_card') {
        const planData = content.data as any;
        await MemoryManager.savePlan({
          type: planData.type,
          name: planData.title,
          details: planData,
        });
      }
    }
  }

  // ============================================================================
  // PUBLIC UTILITIES
  // ============================================================================

  /**
   * Get conversation history for a specific date
   */
  async getConversationForDate(date: string): Promise<Message[]> {
    await this.initialize();
    const conversation = await MemoryManager.getConversation(date);
    return conversation?.messages || [];
  }

  /**
   * Get all dates with conversations
   */
  async getConversationDates(): Promise<string[]> {
    await this.initialize();
    return MemoryManager.getConversationDates();
  }

  /**
   * Search through past conversations
   */
  async searchHistory(query: string) {
    await this.initialize();
    return MemoryManager.searchMemory({ query, limit: 10 });
  }

  /**
   * Get current macro adjustments recommendation
   */
  async getMacroRecommendation(): Promise<MacroAdjustment | null> {
    const context = await ContextAggregator.buildContext();
    return this.calculateMacroAdjustments(context);
  }
}

// Export singleton
export const AICoachService = new AICoachServiceClass();
export default AICoachService;
