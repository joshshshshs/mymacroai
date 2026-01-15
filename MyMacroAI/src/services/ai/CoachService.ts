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

interface ChatMessage {
    role: 'user' | 'assistant' | 'function';
    content: string;
    functionCall?: {
        name: string;
        arguments: any;
    };
    functionResponse?: {
        name: string;
        response: any;
    };
}

interface CoachResponse {
    text: string;
    toolsUsed?: string[];
    foodsSuggested?: any[];
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
        let foodsSuggested: any[] = [];

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
                console.error('AI Proxy error:', error);
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
            console.error('CoachService error:', err);
            return this.generateFallbackResponse(userMessage, context);
        }
    }

    /**
     * Handle tool call recursively
     */
    private async handleToolCall(
        aiResponse: any,
        originalMessage: string,
        systemPrompt: string,
        messages: any[],
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

        // Execute the tool
        const toolResult = executeTool(name as AIToolName, args || {});

        // Track suggested foods
        let foodsSuggested: any[] = [];
        if (name === 'search_food_database' && toolResult.success) {
            foodsSuggested = toolResult.data.foods || [];
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

        // Check for food suggestion intent
        if (lowerMessage.includes('hungry') || lowerMessage.includes('eat') || lowerMessage.includes('snack')) {
            const searchResult = executeTool('search_food_database', {
                maxCalories: context.caloriesRemaining,
                minProtein: 10,
                verifiedOnly: true,
            });

            if (searchResult.success && searchResult.data.foods.length > 0) {
                const food = searchResult.data.foods[0];
                return {
                    text: `Based on your remaining ${context.caloriesRemaining} calories, I recommend **${food.name}** (P: ${food.protein}g, C: ${food.carbs}g, F: ${food.fat}g, ${food.calories} cal). It has excellent protein density. Want me to log it?`,
                    toolsUsed: ['search_food_database'],
                    foodsSuggested: searchResult.data.foods,
                };
            }
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
    private summarizeToolResult(toolName: string, result: any, toolsUsed: string[]): CoachResponse {
        if (!result.success) {
            return {
                text: `I tried to help but encountered an issue: ${result.error}. Please try again.`,
                toolsUsed,
            };
        }

        switch (toolName) {
            case 'search_food_database':
                if (result.data.foods.length === 0) {
                    return {
                        text: 'I searched the database but couldn\'t find foods matching those criteria. Try adjusting your filters.',
                        toolsUsed,
                    };
                }
                const foods = result.data.foods.slice(0, 3);
                const suggestions = foods.map((f: any) =>
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
     */
    async quickSuggest(params: { maxCalories?: number; minProtein?: number; category?: string }): Promise<any[]> {
        const result = executeTool('search_food_database', {
            ...params,
            verifiedOnly: true,
        });

        return result.success ? result.data.foods : [];
    }
}

export const coachService = new CoachService();
