// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Production origins only
const PROD_ORIGINS = [
    'https://mymacro.ai',
    'https://www.mymacro.ai',
];

// Development origins (only used when ENVIRONMENT=development)
const DEV_ORIGINS = [
    'exp://localhost:19000',
    'exp://127.0.0.1:19000',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://127.0.0.1:8081',
];

// Check if running in development mode
const IS_DEV = Deno.env.get('ENVIRONMENT') === 'development';

// Combine origins based on environment
const ALLOWED_ORIGINS = IS_DEV ? [...PROD_ORIGINS, ...DEV_ORIGINS] : PROD_ORIGINS;

// Get CORS headers with strict origin validation
const getCorsHeaders = (origin: string | null) => {
    // Strict matching - no wildcards
    const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
    const allowedOrigin = isAllowed ? origin : PROD_ORIGINS[0];

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };
};

// Input Schema Definition
const RequestSchema = z.object({
    intent: z.enum(['nlu', 'vision', 'speech', 'log_food']),
    payload: z.string().trim().min(1).max(2000),
    image: z.string().optional(), // Base64 string for vision
    images: z.array(z.string().min(1)).max(3).optional(),
    audio: z.string().optional(), // Base64 string for speech
    audioMimeType: z.string().optional(),
});

serve(async (req) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    // 1. Handle CORS Preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 2. Initialize Supabase Client (Admin Context for DB checks, Auth Context for User)
        // We use the Authorization header from the client to create a scoped client
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
        );

        // 3. Authentication Check
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized: User not logged in.");
        }

        // 4. Rate Limiting Check (Tier-Based)
        // Service Role client for secure DB operations
        const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get user's subscription tier
        const { data: subscription } = await serviceClient
            .from('user_subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .single();

        const userTier = subscription?.tier || 'free';

        // Tier-based limits
        const TIER_LIMITS = {
            free: 20,      // Free users: 20 AI requests/day
            pro: 500,      // Pro users: 500 AI requests/day
            founder: -1,   // Founders: Unlimited (-1)
        };

        const dailyLimit = TIER_LIMITS[userTier] || TIER_LIMITS.free;

        // Skip rate limit check for unlimited tiers
        if (dailyLimit !== -1) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count, error: countError } = await serviceClient
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', today.toISOString());

            if (countError) {
                console.error("Rate Limit Check Error:", countError);
                // Fail closed - deny request on DB error for security
                return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again." }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 503,
                });
            }

            if (count !== null && count >= dailyLimit) {
                const upgradeMessage = userTier === 'free'
                    ? "Upgrade to Pro for 500 daily requests!"
                    : "You've reached your daily limit.";

                return new Response(JSON.stringify({
                    error: `Daily limit reached (${dailyLimit} requests/day). ${upgradeMessage}`,
                    limit: dailyLimit,
                    used: count,
                    tier: userTier,
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 429,
                });
            }
        }

        // 5. Input Validation
        const body = await req.json();
        const validation = RequestSchema.safeParse(body);

        if (!validation.success) {
            return new Response(JSON.stringify({ error: "Invalid input", details: validation.error }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        const { intent, payload, image, images, audio, audioMimeType } = validation.data;
        const normalizedIntent = intent === 'log_food' ? 'nlu' : intent;

        // 6. Call Gemini API
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) throw new Error("Server Misconfiguration: Missing Gemini Key");

        const modelName = "gemini-2.5-flash";
        // Use header instead of query param for API key (more secure - not logged in URLs)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

        const nluPrompt = `You are a health assistant. Extract structured intents from the user input.

User input: "${payload}"

Supported intents:
1. LOG_FOOD - log food intake
2. LOG_WORKOUT - log workout/activity
3. LOG_WEIGHT - log body weight
4. LOG_CYCLE - log cycle phase
5. ADD_PANTRY - add pantry item

Return only JSON in this shape:
{
  "intents": [
    {
      "type": "LOG_FOOD",
      "confidence": 0.92,
      "parameters": {
        "foodItems": ["eggs"],
        "mealType": "breakfast",
        "quantity": "2 eggs"
      }
    }
  ]
}`;

        const speechPrompt = payload || "Transcribe the audio verbatim. Return only the transcript text.";
        const visionPrompt = payload || "Identify the food items and estimate calories, protein, carbs, and fats. Return JSON: { name, calories, protein, carbs, fats }";

        // Construct Gemini Prompt
        let apiBody;
        if (normalizedIntent === 'vision') {
            const visionImages = images && images.length > 0 ? images : image ? [image] : [];
            if (visionImages.length === 0) {
                return new Response(JSON.stringify({ error: "Missing image data for vision request." }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 400,
                });
            }

            apiBody = {
                contents: [{
                    parts: [
                        { text: visionPrompt },
                        ...visionImages.map((data) => ({
                            inline_data: { mime_type: "image/jpeg", data }
                        }))
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 512,
                },
            };
        } else if (normalizedIntent === 'speech') {
            if (!audio) {
                return new Response(JSON.stringify({ error: "Missing audio data for speech request." }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 400,
                });
            }

            apiBody = {
                contents: [{
                    parts: [
                        { text: speechPrompt },
                        {
                            inline_data: {
                                mime_type: audioMimeType || "audio/m4a",
                                data: audio,
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 512,
                },
            };
        } else {
            // NLU/Text Payload
            apiBody = {
                contents: [{ parts: [{ text: nluPrompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 512,
                },
            };
        }

        const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiKey,
            },
            body: JSON.stringify(apiBody)
        });

        const geminiData = await geminiRes.json();

        if (!geminiRes.ok) {
            throw new Error(geminiData.error?.message || "Gemini API Error");
        }

        // 7. Log Usage (Async - fire and forget to not block response? Deno Edge might kill it, so await is safer)
        await serviceClient.from('usage_logs').insert({
            user_id: user.id,
            tokens_used: 1 // Simplified; could parse token count from Gemini response if needed
        });

        // 8. Return Success
        return new Response(JSON.stringify(geminiData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error.message.includes("Unauthorized") ? 401 : 500,
        });
    }
});
