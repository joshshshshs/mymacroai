// Follows Deno/Supabase Edge Function syntax

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email } = await request.json();

        if (!email) {
            throw new Error("Email is required");
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "MyMacro AI <founder@mymacro.ai>",
                to: [email],
                subject: "Welcome to the Inner Circle",
                html: `
          <div style="font-family: monospace; background: #000; color: #fff; padding: 40px;">
            <h1 style="color: #06B6D4;">WELCOME_FOUNDER</h1>
            <p>You have secured your spot in the history of MyMacro AI.</p>
            <p>Your legacy status grants you early access to new features and a direct line to the core team.</p>
            <br/>
            <div style="border: 1px solid #334155; padding: 20px; border-radius: 8px;">
                <strong>STATUS: CONFIRMED</strong><br/>
                <strong>ACCESSING: NEURAL_LAYER...</strong>
            </div>
            <br/>
            <p>Stay hungry.</p>
            <p>- The Architect</p>
          </div>
        `,
            }),
        });

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
};

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(handler);
