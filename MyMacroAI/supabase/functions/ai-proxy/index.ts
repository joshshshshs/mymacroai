// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS Headers for client-side access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input Schema Definition
const RequestSchema = z.object({
    intent: z.enum(['log_food', 'vision']),
    payload: z.string().trim().min(1).max(1000), // Increased to 1000 for longer descriptions
    image: z.string().optional(), // Base64 string for vision
});

serve(async (req) => {
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

        // 4. Rate Limiting Check
        // "Service Role" client needed to query usage_logs if RLS is strict, or we can use the user client if they have read access.
        // For security, usually efficient to use a Service Role client to write/check logs authoritatively.
        const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error: countError } = await serviceClient
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString());

        if (countError) {
            console.error("Rate Limit Check Error:", countError);
            // Fail open or closed? Let's fail open but log error for now to avoid blocking users on DB glitch
        } else if (count !== null && count >= 50) {
            return new Response(JSON.stringify({ error: "Daily limit reached (50 requests/day)." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 429,
            });
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

        const { intent, payload, image } = validation.data;

        // 6. Call Gemini API
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) throw new Error("Server Misconfiguration: Missing Gemini Key");

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro${intent === 'vision' ? '-vision' : ''}:generateContent?key=${geminiKey}`;

        // Construct Gemini Prompt
        let apiBody;
        if (intent === 'vision' && image) {
            // Vision Payload
            apiBody = {
                contents: [{
                    parts: [
                        { text: payload }, // e.g., "Analyze this food"
                        { inline_data: { mime_type: "image/jpeg", data: image } }
                    ]
                }]
            };
        } else {
            // Text Payload
            apiBody = { contents: [{ parts: [{ text: payload }] }] };
        }

        const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
