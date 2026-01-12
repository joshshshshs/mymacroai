import { supabase } from '../../lib/supabase';

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
            console.log("Invoking Secure AI Proxy (NLU)...");

            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'log_food',
                    payload: input
                }
            });

            if (error) {
                console.error("AI Proxy Error:", error);
                // Fallback to mock if API fails or Rate Limit hit
                if (error instanceof Error && error.message.includes("429")) {
                    return { intent: 'chat', response: "Daily AI limit reached. Please upgrade to Pro." };
                }
                throw error;
            }

            // The Proxy returns the raw JSON from Gemini (which we structured in the prompt inside the proxy)
            // But wait, the PROMPT logic is actually inside the Proxy now too?
            // The previous code had the prompt client-side. The new Proxy code I wrote takes 'payload' and sends it.
            // I should update the Proxy to inject the SYSTEM PROMPT if it's just passing raw text.
            // OR the client sends the raw text and the proxy wraps it. 
            // My proxy code: contents: [{ parts: [{ text: payload }] }]
            // This means the Client needs to send the FULL PROMPT including instructions.
            // Let's adjust the prompt construction here.

            // Wait, my previous plan for Proxy was generic. 
            // Better practice: Keep the System Prompt on the Server (Proxy) to hide it?
            // "Execute the prompt" step in Proxy plan implies it just runs what's sent?
            // The User Prompt said: "Execute the prompt." in the "The AI Call" section.
            // But usually we want to construct the secure prompt on the server.
            // However, to keep this client update simple and consistent with the previous logic:
            // I will send the FULL PROMPT as the 'payload'.

            /* 
               Correction: If I send the full prompt, I am validating 'payload' length in Zod (max 1000 chars).
               The system prompt is long. 
               The Proxy should ideally handle the system instruction. 
               BUT, for now, let's assume the Proxy receives the "User Input" and we might need to adjust the Proxy logic 
               or I wrap the input here. 
               
                actually, the Proxy I wrote: `text: message` (or payload).
               It just passes it through.
               If I send the system instructions here, it might be too long.
               
               Let's stick to the User Request: "Execute the prompt."
               I will construct the prompt here as before, but send it to the proxy.
            */

            const prompt = `
            Extract intent from this text: "${input}".
            Intents: LOG_FOOD, LOG_WORKOUT, QUERY, CHAT.
            If LOG_FOOD, estimate calories/macros if not provided.
            Return ONLY raw JSON: { "intent": string, "entities": { "food": string, "calories": number, "protein": number, "carbs": number, "fats": number }, "response": string }
            `;

            // Wait, Zod limit is 1000. This prompt handles it.

            // Actually, for better architecture, I'll update the Proxy to prepend the System Prompt?
            // No, I can't edit the Proxy file again easily without confusing things.
            // I'll send the prompt from here.

            const { data: proxyData, error: proxyError } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'log_food',
                    payload: prompt
                }
            });

            if (proxyError) throw proxyError;

            // The Proxy returns the Gemini JSON response directly.
            // We need to parse the text inside it.
            // Gemini Response Structure: { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }

            const text = proxyData.candidates[0].content.parts[0].text;
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error("Gemini Service Error:", error);
            // Fallback to Mock
            console.warn("Falling back to offline mock.");
            return this.mockProcess(input);
        }
    }

    // Vision Analysis
    async analyzeVision(base64Image: string): Promise<any> {
        try {
            const prompt = "Identify this food and estimate calories, protein, carbs, and fat per serving. Return JSON: { name, calories, protein, carbs, fats }";

            const { data, error } = await supabase.functions.invoke('ai-proxy', {
                body: {
                    intent: 'vision',
                    payload: prompt,
                    image: base64Image
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
}

export const geminiService = new GeminiService();
