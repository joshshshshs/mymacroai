/**
 * ChatContextBuilder - RAG-style context injection for AI prompts
 * Detects recall triggers and injects relevant past messages
 */

import { ChatService, ChatMessage } from './ChatService';

// ============================================================================
// Types
// ============================================================================

export interface PromptPayload {
    systemPrompt: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
    hasRetrievedContext: boolean;
    retrievedMessages: ChatMessage[];
}

// ============================================================================
// Trigger Word Configuration
// ============================================================================

const RECALL_TRIGGERS = {
    memory: ['recall', 'remember', 'you said', 'told me', 'mentioned', 'we discussed'],
    time: ['yesterday', 'last week', 'last time', 'before', 'earlier', 'previous', 'ago'],
    content: ['recipe', 'workout', 'meal plan', 'advice', 'suggestion', 'recommendation'],
    question: ['what was', 'what did', 'how did', 'when did', 'where was'],
};

// ============================================================================
// Context Builder Class
// ============================================================================

class ChatContextBuilderClass {
    private baseSystemPrompt: string = `YOU ARE:
MyMacro AI, a world-class nutrition and performance coach.
You are NOT a virtual assistant. You are a proactive partner.

TONE & STYLE:
- Casual, concise, and authoritative (The "Soft-Spartan" vibe).
- Write like you are texting a friend. Short sentences. No fluff.
- Use emojis sparingly to emphasize wins or warnings (🔥, ⚠️).
- NEVER start with "Hello, how can I help?" or "As an AI...".

CORE BEHAVIORS:
1. IMMEDIATE VALUE: If the user says "I ate a burger", don't ask "What kind?".
   Estimate it and say: "Logged. That hits your protein goal but eats up your fat budget. Keep dinner lean."
2. CONTEXT AWARENESS: Always consider their recent data before replying.
3. PROACTIVE COACHING: Don't wait for questions. Guide them.

VISUAL_PROTOCOL:
When appropriate, you can render native UI widgets by appending JSON at the END of your message.
Use these formats ONLY when the user asks for data visualization or when it would be helpful:

1. MACRO_PIE (For calorie/macro breakdowns):
   {"widget": "MACRO_PIE", "data": {"p": 150, "c": 200, "f": 60}}

2. PROGRESS_BAR (For goals/targets):
   {"widget": "PROGRESS_BAR", "label": "Protein Goal", "current": 120, "target": 180, "unit": "g"}

3. DATA_TABLE (For workouts, meal plans, lists):
   {"widget": "DATA_TABLE", "title": "Push Day", "headers": ["Exercise", "Sets", "Reps"], "rows": [["Bench Press", "3", "8-10"], ["Incline DB", "3", "10-12"]]}

RULES FOR WIDGETS:
- Put the JSON at the VERY END of your message
- Write a brief explanation BEFORE the JSON
- Only use ONE widget per message
- Use MACRO_PIE when showing macro breakdown
- Use PROGRESS_BAR when showing progress toward a goal
- Use DATA_TABLE for workout plans, meal schedules, or any structured data`;

    /**
     * Detect if the message contains recall triggers
     */
    detectRecallTriggers(text: string): { hasRecall: boolean; keywords: string[] } {
        const lowerText = text.toLowerCase();
        const foundKeywords: string[] = [];

        for (const category of Object.values(RECALL_TRIGGERS)) {
            for (const trigger of category) {
                if (lowerText.includes(trigger)) {
                    foundKeywords.push(trigger);
                }
            }
        }

        return {
            hasRecall: foundKeywords.length > 0,
            keywords: foundKeywords,
        };
    }

    /**
     * Extract search keywords from user message
     */
    extractSearchKeywords(text: string): string {
        // Remove common words and recall triggers
        const stopWords = new Set([
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'when', 'where',
            'how', 'do', 'did', 'does', 'can', 'could', 'would', 'should', 'have',
            'has', 'had', 'you', 'me', 'my', 'i', 'we', 'our', 'that', 'this',
            'about', 'for', 'with', 'from', 'to', 'of', 'in', 'on', 'at', 'by',
            'recall', 'remember', 'told', 'said', 'mentioned', 'last', 'before',
        ]);

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 5) // Max 5 keywords
            .join(' ');
    }

    /**
     * Build the complete prompt payload for the AI
     */
    async buildPromptPayload(userMessage: string): Promise<PromptPayload> {
        // Detect recall triggers
        const { hasRecall, keywords } = this.detectRecallTriggers(userMessage);

        let retrievedMessages: ChatMessage[] = [];
        let contextAddition = '';

        // If recall detected, search for relevant past messages
        if (hasRecall) {
            const searchQuery = this.extractSearchKeywords(userMessage);
            if (searchQuery) {
                retrievedMessages = await ChatService.searchHistory(searchQuery, 3);

                if (retrievedMessages.length > 0) {
                    contextAddition = this.formatRetrievedContext(retrievedMessages);
                }
            }
        }

        // Get recent conversation context (last 10 messages)
        const recentMessages = await ChatService.getRecentContext(10);

        // Build system prompt with optional context
        let systemPrompt = this.baseSystemPrompt;
        if (contextAddition) {
            systemPrompt = `${this.baseSystemPrompt}\n\n${contextAddition}`;
        }

        // Format messages for API
        const formattedMessages = recentMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        }));

        // Add current user message
        formattedMessages.push({
            role: 'user',
            content: userMessage,
        });

        return {
            systemPrompt,
            messages: formattedMessages,
            hasRetrievedContext: retrievedMessages.length > 0,
            retrievedMessages,
        };
    }

    /**
     * Format retrieved messages as context for the AI
     */
    private formatRetrievedContext(messages: ChatMessage[]): string {
        const contextParts = messages.map(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString();
            const roleLabel = msg.role === 'user' ? 'User said' : 'You (Coach) said';
            return `[${date}] ${roleLabel}: "${msg.content}"`;
        });

        return `RECALLED CONTEXT (from previous conversations):
${contextParts.join('\n')}
---
Use this context if relevant to the user's question, but don't explicitly mention "I found in our history" unless asked.`;
    }

    /**
     * Set a custom system prompt
     */
    setSystemPrompt(prompt: string): void {
        this.baseSystemPrompt = prompt;
    }

    /**
     * Get the current base system prompt
     */
    getSystemPrompt(): string {
        return this.baseSystemPrompt;
    }
}

// Export singleton instance
export const ChatContextBuilder = new ChatContextBuilderClass();
