import { supabase } from '../../lib/supabase';
import { getUserContextForAI } from '../../store/UserStore';

// Helper Interface for Proxy Response
export interface NLUResult {
    intent: 'log_food' | 'log_workout' | 'query' | 'chat';
    entities?: {
        food?: string;
        calories?: number;
        protein?: number;
        carbs?: number;
        fats?: number;
    };
    response: string;
}

class GeminiService {

    // NLU Processing (Secure Proxy)
    async processNaturalLanguage(input: string): Promise<NLUResult> {
        try {
            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'nlu',
                    payload: input
                }
            });

            if (error) {
                console.error("AI Proxy Error:", error);
                if (error instanceof Error && error.message.includes("429")) {
                    return { intent: 'chat', response: "Daily AI limit reached. Please upgrade to Pro." };
                }
                throw error;
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            if (parsed?.intents && Array.isArray(parsed.intents)) {
                const primary = parsed.intents[0] || { type: 'UNKNOWN', parameters: {} };
                const mappedIntent = this.mapIntentType(primary.type);
                return {
                    intent: mappedIntent,
                    entities: primary.parameters,
                    response: parsed.response || ''
                };
            }

            return parsed;

        } catch (error) {
            console.error("Gemini Service Error:", error);
            // Fallback to Mock
            console.warn("Falling back to offline mock.");
            return this.mockProcess(input);
        }
    }

    // Vision Analysis
    async analyzeVision(base64Image: string | string[]): Promise<any> {
        try {
            const prompt = "Identify this food and estimate calories, protein, carbs, and fat per serving. Return JSON: { name, calories, protein, carbs, fats }";
            const isMulti = Array.isArray(base64Image);

            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'vision',
                    payload: prompt,
                    ...(isMulti ? { images: base64Image } : { image: base64Image })
                }
            });

            if (error) throw error;

            const text = data.candidates[0].content.parts[0].text;
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error("Gemini Vision Error:", error);
            return this.mockVision();
        }
    }

    async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'speech',
                    payload: 'Transcribe the audio verbatim. Return only the transcript text.',
                    audio: base64Audio,
                    audioMimeType: mimeType
                }
            });

            if (error) throw error;

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return text.trim();
        } catch (error) {
            console.error("Gemini Speech Error:", error);
            return '';
        }
    }

    // Context Context - Client Side Logic (Safe)
    generateRecoveryContext(sleepHours: number, strain: number): { status: 'red' | 'yellow' | 'green', message: string } {
        if (sleepHours < 6 || strain > 18) {
            return { status: 'red', message: "High Strain / Low Sleep. Prioritize recovery today." };
        }
        if (sleepHours < 7.5 || strain > 14) {
            return { status: 'yellow', message: "Moderate fatigue. Maintain hydration." };
        }
        return { status: 'green', message: "Recovery Optimal. Ready for peak performance." };
    }

    // Dynamic Context Message (Dashboard)
    getContextMessage(hour: number): string {
        if (hour < 10) return "Morning. Protein intake is low. Suggest: 3 Eggs.";
        if (hour < 14) return "Mid-day check. Hydration levels optimal. Keep it up.";
        if (hour < 18) return "Pre-workout window. Carbs recommended for fuel.";
        return "Evening. Recovery mode active. Sleep goal: 8h.";
    }

    /**
     * Generates contextual AI messages via Supabase proxy
     * @param type - Message type (greeting, insight, recommendation, summary)
     * @param prompt - The full prompt with context
     * @returns AI-generated response string
     */
    async generateContextualMessage(
        type: 'greeting' | 'insight' | 'recommendation' | 'summary',
        prompt: string
    ): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'contextual',
                    messageType: type,
                    payload: prompt
                }
            });

            if (error) {
                console.error("AI Context Error:", error);
                throw error;
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return text.trim();

        } catch (error) {
            console.error("Gemini Contextual Message Error:", error);
            throw error; // Let caller handle fallback
        }
    }

    /**
     * Multi-turn chat with MyMacro AI Coach
     * @param messages - Array of {role, content} messages
     * @param systemPrompt - Optional system instruction
     * @returns AI response string
     */
    async chat(
        messages: { role: 'user' | 'assistant'; content: string }[],
        systemPrompt?: string
    ): Promise<string> {
        try {
            // Inject user context for personalized advice
            const userContext = getUserContextForAI();
            const basePrompt = systemPrompt || `YOU ARE: MyMacro AI, a world-class nutrition and performance coach. Be concise, direct, and proactive. No fluff.`;
            const fullSystemPrompt = `${basePrompt}

--- USER PROFILE (Use this to personalize advice) ---
${userContext}
--- END USER PROFILE ---`;

            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'chat',
                    systemPrompt: fullSystemPrompt,
                    messages: messages
                }
            });

            if (error) {
                console.error("AI Chat Error:", error);
                if (error instanceof Error && error.message.includes("429")) {
                    return "I've reached my daily limit. Please try again tomorrow or upgrade to Pro for unlimited conversations.";
                }
                throw error;
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            return text.trim() || "I'm having trouble responding right now.";

        } catch (error) {
            console.error("Gemini Chat Error:", error);
            return this.mockChatResponse(messages[messages.length - 1]?.content || '');
        }
    }

    /**
     * Mock chat response for offline mode
     */
    private mockChatResponse(lastMessage: string): string {
        const lower = lastMessage.toLowerCase();

        if (lower.includes('calorie') || lower.includes('eat')) {
            return "Based on your profile, you should aim for around 2,100 calories today. Focus on hitting your protein goal first! 💪";
        }
        if (lower.includes('protein')) {
            return "Great question! Try adding Greek yogurt, chicken breast, or a protein shake to boost your intake. Each serving gets you 20-30g closer to your goal.";
        }
        if (lower.includes('workout') || lower.includes('exercise')) {
            return "Your recovery looks good today! A moderate intensity workout would be perfect. Want me to suggest some exercises?";
        }
        if (lower.includes('sleep')) {
            return "Sleep is crucial for recovery. Aim for 7-8 hours tonight. Try winding down 30 minutes before bed with no screens. 😴";
        }

        return "I'm here to help with nutrition, workouts, and health questions! What would you like to know? (Note: I'm in offline mode)";
    }

    // MOCKS
    private mockProcess(input: string): NLUResult {
        const lower = input.toLowerCase();
        if (lower.includes('eat') || lower.includes('ate') || lower.includes('chicken') || lower.includes('rice')) {
            return {
                intent: 'log_food',
                entities: {
                    food: 'Chicken & Rice',
                    calories: 450,
                    protein: 40,
                    carbs: 50,
                    fats: 10
                },
                response: "Logged Chicken & Rice (Mock). Connect API Key for real AI."
            };
        }
        return {
            intent: 'chat',
            response: "I'm analyzing your biometrics. (Mock Mode - API Key Missing)"
        };
    }

    private mockVision() {
        return {
            name: "Grilled Salmon (Mock)",
            calories: 450,
            protein: 35,
            carbs: 0,
            fats: 25
        };
    }

    private mapIntentType(type?: string): NLUResult['intent'] {
        switch ((type || '').toUpperCase()) {
            case 'LOG_FOOD':
                return 'log_food';
            case 'LOG_WORKOUT':
                return 'log_workout';
            case 'QUERY':
                return 'query';
            default:
                return 'chat';
        }
    }
}

export const geminiService = new GeminiService();
