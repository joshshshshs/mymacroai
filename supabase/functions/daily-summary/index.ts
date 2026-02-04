/**
 * Daily Summary Background Job
 *
 * Runs via pg_cron to send personalized daily nutrition summaries
 * Scheduled to run at 8 PM user's local time (batched by timezone)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserDailySummary {
    user_id: string;
    email: string;
    display_name: string;
    calories_consumed: number;
    calories_goal: number;
    protein_consumed: number;
    protein_goal: number;
    carbs_consumed: number;
    carbs_goal: number;
    fats_consumed: number;
    fats_goal: number;
    streak_days: number;
    timezone: string;
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Verify this is called by pg_cron or admin
        const authHeader = req.headers.get('Authorization');
        const cronSecret = Deno.env.get('CRON_SECRET');

        // Allow service role key or cron secret
        const isAuthorized = authHeader?.includes(SUPABASE_SERVICE_KEY) ||
                            authHeader === `Bearer ${cronSecret}`;

        if (!isAuthorized && cronSecret) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Get target timezone from request body (pg_cron passes this)
        const body = await req.json().catch(() => ({}));
        const targetTimezone = body.timezone || 'UTC';

        // Fetch users who:
        // 1. Have daily_summary_enabled = true
        // 2. Are in the target timezone batch
        // 3. Haven't received a summary today
        const today = new Date().toISOString().split('T')[0];

        const { data: users, error: fetchError } = await supabase
            .from('user_preferences')
            .select(`
                user_id,
                timezone,
                profiles!inner (
                    email,
                    display_name
                )
            `)
            .eq('daily_summary_enabled', true)
            .eq('timezone', targetTimezone);

        if (fetchError) {
            console.error('Error fetching users:', fetchError);
            throw fetchError;
        }

        if (!users || users.length === 0) {
            return new Response(JSON.stringify({
                message: 'No users to process',
                timezone: targetTimezone
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const results = {
            processed: 0,
            sent: 0,
            skipped: 0,
            errors: [] as string[],
        };

        // Process each user
        for (const user of users) {
            results.processed++;

            try {
                // Check if already sent today
                const { data: existingSummary } = await supabase
                    .from('daily_summary_logs')
                    .select('id')
                    .eq('user_id', user.user_id)
                    .eq('date', today)
                    .single();

                if (existingSummary) {
                    results.skipped++;
                    continue;
                }

                // Fetch user's daily intake
                const { data: intake } = await supabase
                    .from('daily_intake')
                    .select('*')
                    .eq('user_id', user.user_id)
                    .eq('date', today)
                    .single();

                // Fetch user's goals
                const { data: goals } = await supabase
                    .from('user_goals')
                    .select('*')
                    .eq('user_id', user.user_id)
                    .single();

                // Fetch streak
                const { data: streak } = await supabase
                    .from('user_streaks')
                    .select('current_streak')
                    .eq('user_id', user.user_id)
                    .single();

                const summary: UserDailySummary = {
                    user_id: user.user_id,
                    email: (user.profiles as any).email,
                    display_name: (user.profiles as any).display_name || 'there',
                    calories_consumed: intake?.calories || 0,
                    calories_goal: goals?.calories_goal || 2000,
                    protein_consumed: intake?.protein || 0,
                    protein_goal: goals?.protein_goal || 150,
                    carbs_consumed: intake?.carbs || 0,
                    carbs_goal: goals?.carbs_goal || 200,
                    fats_consumed: intake?.fats || 0,
                    fats_goal: goals?.fats_goal || 65,
                    streak_days: streak?.current_streak || 0,
                    timezone: user.timezone,
                };

                // Send email via Resend
                const emailSent = await sendDailySummaryEmail(summary);

                if (emailSent) {
                    // Log successful send
                    await supabase.from('daily_summary_logs').insert({
                        user_id: user.user_id,
                        date: today,
                        sent_at: new Date().toISOString(),
                    });
                    results.sent++;
                } else {
                    results.errors.push(`Failed to send to ${user.user_id}`);
                }

            } catch (userError) {
                console.error(`Error processing user ${user.user_id}:`, userError);
                results.errors.push(`${user.user_id}: ${userError}`);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            timezone: targetTimezone,
            ...results,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Daily summary job error:', error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

async function sendDailySummaryEmail(summary: UserDailySummary): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return false;
    }

    const calorieProgress = Math.round((summary.calories_consumed / summary.calories_goal) * 100);
    const proteinProgress = Math.round((summary.protein_consumed / summary.protein_goal) * 100);

    const progressEmoji = calorieProgress >= 90 && calorieProgress <= 110 ? '🎯' :
                         calorieProgress < 70 ? '📈' : '✅';

    const streakText = summary.streak_days > 0
        ? `🔥 ${summary.streak_days} day streak!`
        : 'Start your streak tomorrow!';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #FF5C00; margin: 0; font-size: 28px; }
        .card { background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .macro-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #333; }
        .macro-row:last-child { border-bottom: none; }
        .macro-label { color: #888; }
        .macro-value { font-weight: 600; }
        .progress-bar { background: #333; border-radius: 4px; height: 8px; margin-top: 8px; }
        .progress-fill { background: #FF5C00; height: 100%; border-radius: 4px; }
        .streak { text-align: center; font-size: 24px; margin: 20px 0; }
        .cta { text-align: center; margin-top: 30px; }
        .cta a { background: #FF5C00; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${progressEmoji} Daily Summary</h1>
            <p style="color: #888;">Hey ${summary.display_name}!</p>
        </div>

        <div class="card">
            <div class="macro-row">
                <span class="macro-label">Calories</span>
                <span class="macro-value">${summary.calories_consumed} / ${summary.calories_goal}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(calorieProgress, 100)}%"></div>
            </div>

            <div class="macro-row">
                <span class="macro-label">Protein</span>
                <span class="macro-value">${summary.protein_consumed}g / ${summary.protein_goal}g</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(proteinProgress, 100)}%"></div>
            </div>

            <div class="macro-row">
                <span class="macro-label">Carbs</span>
                <span class="macro-value">${summary.carbs_consumed}g / ${summary.carbs_goal}g</span>
            </div>

            <div class="macro-row">
                <span class="macro-label">Fats</span>
                <span class="macro-value">${summary.fats_consumed}g / ${summary.fats_goal}g</span>
            </div>
        </div>

        <div class="streak">${streakText}</div>

        <div class="cta">
            <a href="https://mymacro.ai/app">Open MyMacro</a>
        </div>

        <div class="footer">
            <p>You're receiving this because you enabled daily summaries.</p>
            <p><a href="https://mymacro.ai/settings" style="color: #FF5C00;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'MyMacro AI <noreply@mymacro.ai>',
                to: summary.email,
                subject: `${progressEmoji} Your Daily Nutrition Summary`,
                html,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Resend API error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}
