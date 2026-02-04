// @ts-nocheck
// Supabase Edge Function - Deno runtime (excluded from main TypeScript check)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email validation schema
const EmailSchema = z.object({
    email: z.string().email().max(254),
});

const handler = async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await request.json();

        // Validate email format
        const validation = EmailSchema.safeParse(body);
        if (!validation.success) {
            return new Response(JSON.stringify({ error: "Invalid email format" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        }

        const { email } = validation.data;

        // Rate limiting: Check if email was sent recently (1 per hour)
        const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await serviceClient
            .from('founder_emails')
            .select('*', { count: 'exact', head: true })
            .eq('email', email)
            .gte('created_at', oneHourAgo);

        if (!countError && count && count > 0) {
            return new Response(JSON.stringify({ error: "Please wait before requesting another email" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 429,
            });
        }

        // Log the email attempt (create table if doesn't exist - will silently fail)
        await serviceClient.from('founder_emails').insert({ email }).catch(() => { });

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "MyMacro AI <support@mymacro.app>",
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
};

serve(handler);

