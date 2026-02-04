/**
 * CoachService - AI Neural Bridge with Tool-Use Loop
 * 
 * This service implements the intelligent coaching system that:
 * 1. Injects user context into every conversation
 * 2. Handles function calling for database queries
 * 3. Executes tools and feeds results back to AI
 * 4. Generates personalized, data-driven responses
 */

import { supabase } from '../../lib/supabase';
import { AI_TOOLS, AIToolName } from './tools/definitions';
import { generateMasterPrompt, UserContext } from './prompts/masterPrompt';
import { executeTool, getUserStatus } from './toolExecutor';
import { useUserStore } from '../../store/UserStore';

// ============================================================================
// TYPES
// ============================================================================

interface FoodSuggestion {
    id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    source?: string;
}

interface FunctionCallArgs {
    [key: string]: string | number | boolean | undefined;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'function';
    content: string;
    functionCall?: {
        name: string;
        arguments: FunctionCallArgs;
    };
    functionResponse?: {
        name: string;
        response: Record<string, unknown>;
    };
}

interface AIProxyResponse {
    text?: string;
    response?: string;
    functionCall?: {
        name: string;
        arguments: FunctionCallArgs;
    };
}

interface GeminiMessage {
    role: 'user' | 'model' | 'assistant' | 'function';
    parts?: Array<{ text: string }>;
    content?: string;
    name?: string;
    functionCall?: { name: string; arguments: FunctionCallArgs };
}

interface ToolResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
}

interface CoachResponse {
    text: string;
    toolsUsed?: string[];
    foodsSuggested?: FoodSuggestion[];
}

// ============================================================================
// COACH SERVICE CLASS
// ============================================================================

class CoachService {
    private maxToolCalls = 3; // Prevent infinite loops

    /**
     * Build user context from current store state
     */
    private buildUserContext(): UserContext {
        const result = getUserStatus();
        if (!result.success) {
            // Return defaults if store access fails
            return {
                caloriesRemaining: 2000,
                proteinRemaining: 150,
                carbsRemaining: 200,
                fatsRemaining: 70,
                currentStreak: 0,
                todayProgress: 0,
                timeOfDay: 'afternoon',
            };
        }

        const data = result.data;
        return {
            caloriesRemaining: data.caloriesRemaining,
            proteinRemaining: data.proteinRemaining,
            carbsRemaining: data.carbsRemaining,
            fatsRemaining: data.fatsRemaining,
            currentStreak: data.currentStreak,
            todayProgress: data.todayProgress,
            timeOfDay: data.timeOfDay,
        };
    }

    /**
     * Main chat method with tool-use loop
     */
    async chat(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<CoachResponse> {
        const context = this.buildUserContext();
        const systemPrompt = generateMasterPrompt(context);
        const toolsUsed: string[] = [];
        let foodsSuggested: FoodSuggestion[] = [];

        // Build messages array
        const messages = [
            ...conversationHistory.map(m => ({
                role: m.role as 'user' | 'model',
                parts: [{ text: m.content }],
            })),
            {
                role: 'user' as const,
                parts: [{ text: userMessage }],
            },
        ];

        try {
            // Call Supabase Edge Function with tools
            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    action: 'chat_with_tools',
                    systemPrompt,
                    messages: messages.map(m => ({
                        role: m.role === 'model' ? 'assistant' : m.role,
                        content: m.parts[0].text,
                    })),
                    tools: AI_TOOLS.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters,
                    })),
                },
            });

            if (error) {
                if (__DEV__) console.error('[CoachService] AI Proxy error:', error);
                return this.generateFallbackResponse(userMessage, context);
            }

            // Check if AI wants to use a tool
            if (data.functionCall) {
                return this.handleToolCall(data, userMessage, systemPrompt, messages, toolsUsed, 0);
            }

            // Return direct response
            return {
                text: data.text || data.response || 'I apologize, I encountered an issue. Please try again.',
                toolsUsed,
                foodsSuggested,
            };
        } catch (err) {
            if (__DEV__) console.error('[CoachService] Error:', err);
            return this.generateFallbackResponse(userMessage, context);
        }
    }

    /**
     * Handle tool call recursively
     */
    private async handleToolCall(
        aiResponse: AIProxyResponse,
        originalMessage: string,
        systemPrompt: string,
        messages: GeminiMessage[],
        toolsUsed: string[],
        depth: number
    ): Promise<CoachResponse> {
        if (depth >= this.maxToolCalls) {
            return {
                text: 'I found some information for you but need to summarize. Please try a more specific question.',
                toolsUsed,
            };
        }

        const { name, arguments: args } = aiResponse.functionCall;
        toolsUsed.push(name);

        // Execute the tool (async for Hybrid Food Engine)
        const toolResult = await executeTool(name as AIToolName, args || {});

        // Track suggested foods
        let foodsSuggested: FoodSuggestion[] = [];
        if (name === 'search_food_database' && toolResult.success && toolResult.data) {
            const foods = toolResult.data.foods as FoodSuggestion[] | undefined;
            foodsSuggested = foods || [];
        }

        // Send result back to AI
        try {
            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    action: 'chat_with_tool_result',
                    systemPrompt,
                    messages: [
                        ...messages,
                        {
                            role: 'assistant',
                            content: '',
                            functionCall: { name, arguments: args },
                        },
                        {
                            role: 'function',
                            name,
                            content: JSON.stringify(toolResult),
                        },
                    ],
                    tools: AI_TOOLS.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters,
                    })),
                },
            });

            if (error) {
                // Return with tool result summary
                return this.summarizeToolResult(name, toolResult, toolsUsed);
            }

            // Check for another tool call
            if (data.functionCall) {
                const recursiveResult = await this.handleToolCall(
                    data,
                    originalMessage,
                    systemPrompt,
                    messages,
                    toolsUsed,
                    depth + 1
                );
                return {
                    ...recursiveResult,
                    foodsSuggested: [...foodsSuggested, ...(recursiveResult.foodsSuggested || [])],
                };
            }

            return {
                text: data.text || data.response || this.summarizeToolResult(name, toolResult, toolsUsed).text,
                toolsUsed,
                foodsSuggested,
            };
        } catch (err) {
            return this.summarizeToolResult(name, toolResult, toolsUsed);
        }
    }

    /**
     * Generate a fallback response when AI is unavailable
     */
    private generateFallbackResponse(userMessage: string, context: UserContext): CoachResponse {
        const lowerMessage = userMessage.toLowerCase();

        // Check for food suggestion intent (sync fallback - uses local data only)
        if (lowerMessage.includes('hungry') || lowerMessage.includes('eat') || lowerMessage.includes('snack')) {
            // For fallback, we use a simplified sync approach
            // The full async search is used in the main flow
            return {
                text: `You have ${context.caloriesRemaining} calories remaining. I recommend checking our food database for high-protein options. What are you in the mood for?`,
                toolsUsed: [],
            };
        }

        // Check for status intent
        if (lowerMessage.includes('progress') || lowerMessage.includes('left') || lowerMessage.includes('remaining')) {
            return {
                text: `You're at ${context.todayProgress}% of your daily goal. You have **${context.caloriesRemaining} calories** remaining (P: ${context.proteinRemaining}g, C: ${context.carbsRemaining}g, F: ${context.fatsRemaining}g). Your streak is at **${context.currentStreak} days**. Keep pushing!`,
                toolsUsed: ['get_user_status'],
            };
        }

        // Default response
        return {
            text: `I'm here to help you hit your macros. You have **${context.caloriesRemaining} cal** and **${context.proteinRemaining}g protein** remaining. Want me to suggest some high-protein options?`,
            toolsUsed: [],
        };
    }

    /**
     * Summarize tool result when AI can't respond
     */
    private summarizeToolResult(toolName: string, result: ToolResult, toolsUsed: string[]): CoachResponse {
        if (!result.success) {
            return {
                text: `I tried to help but encountered an issue: ${result.error}. Please try again.`,
                toolsUsed,
            };
        }

        switch (toolName) {
            case 'search_food_database':
                const foodsData = result.data?.foods as FoodSuggestion[] | undefined;
                if (!foodsData || foodsData.length === 0) {
                    return {
                        text: 'I searched the database but couldn\'t find foods matching those criteria. Try adjusting your filters.',
                        toolsUsed,
                    };
                }
                const foods = foodsData.slice(0, 3);
                const suggestions = foods.map((f: FoodSuggestion) =>
                    `• **${f.name}** - ${f.calories} cal (P: ${f.protein}g)`
                ).join('\n');
                return {
                    text: `Here are the best options I found:\n\n${suggestions}\n\nWant me to log one of these?`,
                    toolsUsed,
                    foodsSuggested: foods,
                };

            case 'get_user_status':
                const s = result.data;
                return {
                    text: `**Your Status:**\n• ${s.caloriesRemaining} cal remaining\n• ${s.proteinRemaining}g protein to go\n• Streak: ${s.currentStreak} days\n• Progress: ${s.todayProgress}%`,
                    toolsUsed,
                };

            case 'log_verified_food':
                const l = result.data;
                return {
                    text: `✅ Logged **${l.food}** (${l.portion}): ${l.nutrition.calories} cal, ${l.nutrition.protein}g protein.`,
                    toolsUsed,
                };

            case 'get_food_details':
                const f = result.data;
                return {
                    text: `**${f.name}** (per ${f.servingSize}):\n• Calories: ${f.macros.calories}\n• Protein: ${f.macros.protein}g\n• Carbs: ${f.macros.carbs}g\n• Fat: ${f.macros.fat}g`,
                    toolsUsed,
                };

            default:
                return {
                    text: 'I found some information. How can I help you further?',
                    toolsUsed,
                };
        }
    }

    /**
     * Quick suggestion without full AI call
     * Uses the Hybrid Food Engine for comprehensive search
     */
    async quickSuggest(params: { maxCalories?: number; minProtein?: number; category?: string }): Promise<FoodSuggestion[]> {
        const result = await executeTool('search_food_database', {
            ...params,
            verifiedOnly: false, // Include OpenFoodFacts for wider coverage
        });

        return result.success && result.data ? (result.data.foods as FoodSuggestion[]) || [] : [];
    }
}

export const coachService = new CoachService();
