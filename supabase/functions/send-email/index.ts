/**
 * Email Service - Transactional & Marketing Emails via Resend
 *
 * Handles: Welcome, Trial, Subscription, Founder, Streak, Weekly Digest emails
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

// Email templates
type EmailTemplate =
    | 'welcome'
    | 'trial_started'
    | 'trial_ending'
    | 'trial_expired'
    | 'subscription_confirmed'
    | 'subscription_cancelled'
    | 'founder_welcome'
    | 'streak_milestone'
    | 'weekly_digest'
    | 'winback';

interface EmailPayload {
    template: EmailTemplate;
    email: string;
    userId?: string;
    data?: Record<string, unknown>;
}

// HTML Templates
const templates: Record<EmailTemplate, (data: Record<string, unknown>) => { subject: string; html: string }> = {
    welcome: (data) => ({
        subject: 'Welcome to MyMacro AI! 🎯',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .cta { display: inline-block; background: linear-gradient(135deg, #FF5C00, #FF8C00); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .feature { background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 10px 0; }
        .feature h3 { margin: 0 0 8px 0; font-size: 16px; }
        .feature p { margin: 0; font-size: 14px; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <h1>Welcome, ${data.name || 'Champion'}! 👋</h1>
        <p>You've just unlocked the most advanced nutrition AI on the planet. We're here to help you crush your fitness goals with precision and zero guesswork.</p>

        <div class="feature">
            <h3>🎯 Log meals in seconds</h3>
            <p>Voice, photo, or barcode - your choice. Our AI handles the rest.</p>
        </div>
        <div class="feature">
            <h3>🧠 Personalized coaching</h3>
            <p>AI-powered insights tailored to YOUR body and goals.</p>
        </div>
        <div class="feature">
            <h3>📊 Track everything</h3>
            <p>Macros, sleep, recovery, stress - all in one place.</p>
        </div>

        <center><a href="https://mymacro.ai/app" class="cta">Open MyMacro AI</a></center>

        <p>Your first week is on us. Start logging and see the magic happen.</p>

        <p>Let's get after it! 💪<br><strong>— The MyMacro AI Team</strong></p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    trial_started: (data) => ({
        subject: 'Your Pro Trial Has Started! 🚀',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .badge { display: inline-block; background: linear-gradient(135deg, #FF5C00, #FF8C00); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
        .feature { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #222; }
        .feature:last-child { border: none; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <span class="badge">PRO TRIAL ACTIVE</span>
        <h1>7 Days of Unlimited Power 🔥</h1>
        <p>Your Pro trial is now active! Here's what you've unlocked:</p>

        <div class="feature">✅ Unlimited AI photo logging</div>
        <div class="feature">✅ Unlimited voice commands</div>
        <div class="feature">✅ Advanced HRV & stress analysis</div>
        <div class="feature">✅ Cycle tracking with macro adjustments</div>
        <div class="feature">✅ Body composition AI analysis</div>
        <div class="feature">✅ Priority AI responses</div>

        <p><strong>Trial ends: ${data.trialEndDate || '7 days from now'}</strong></p>

        <p>Make the most of it - log everything, ask questions, and watch your progress accelerate.</p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    trial_ending: (data) => ({
        subject: '⏰ Your Pro Trial Ends in 3 Days',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .cta { display: inline-block; background: linear-gradient(135deg, #FF5C00, #FF8C00); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .stats { background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333; }
        .stat:last-child { border: none; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <h1>Don't Lose Your Progress 📊</h1>
        <p>Your Pro trial ends in <strong>3 days</strong>. Here's what you've accomplished:</p>

        <div class="stats">
            <div class="stat"><span>Meals logged</span><strong>${data.mealsLogged || '47'}</strong></div>
            <div class="stat"><span>AI conversations</span><strong>${data.aiChats || '23'}</strong></div>
            <div class="stat"><span>Current streak</span><strong>${data.streak || '6'} days 🔥</strong></div>
        </div>

        <p>Keep the momentum going. Pro members see <strong>3x faster results</strong> on average.</p>

        <center><a href="https://mymacro.ai/subscribe" class="cta">Continue with Pro - $9.99/mo</a></center>

        <p style="font-size: 14px;">Or save 33% with yearly billing ($79.99/year)</p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    trial_expired: (data) => ({
        subject: 'Your Pro Trial Has Ended',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .cta { display: inline-block; background: linear-gradient(135deg, #FF5C00, #FF8C00); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .limited { background: #2a1a1a; border: 1px solid #FF5C00; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <h1>We'll Miss You at Pro Level 😢</h1>
        <p>Your Pro trial has ended, but you can still use MyMacro AI with our free tier.</p>

        <p>What you'll lose access to:</p>
        <ul style="color: #b0b0b0;">
            <li>Unlimited AI logging (now 3/day)</li>
            <li>Advanced health insights</li>
            <li>Body composition analysis</li>
            <li>Priority AI responses</li>
        </ul>

        <div class="limited">
            <p style="margin: 0; color: #FF5C00; font-weight: 600;">🎁 SPECIAL OFFER</p>
            <p style="margin: 10px 0 0 0; color: #fff;">Come back within 7 days and get <strong>50% off</strong> your first month!</p>
        </div>

        <center><a href="https://mymacro.ai/subscribe?offer=comeback50" class="cta">Reactivate Pro - 50% Off</a></center>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    subscription_confirmed: (data) => ({
        subject: 'Welcome to Pro! 🏆',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .badge { display: inline-block; background: linear-gradient(135deg, #FFD700, #FFA500); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #000; margin-bottom: 20px; }
        .receipt { background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <span class="badge">⭐ PRO MEMBER</span>
        <h1>You're Now a Pro! 🎉</h1>
        <p>Thank you for subscribing. You now have unlimited access to all premium features.</p>

        <div class="receipt">
            <p style="margin: 0; color: #666;">Receipt</p>
            <p style="margin: 10px 0; font-size: 14px;">
                <strong>Plan:</strong> ${data.plan || 'Pro Monthly'}<br>
                <strong>Amount:</strong> ${data.amount || '$9.99'}<br>
                <strong>Next billing:</strong> ${data.nextBilling || 'In 30 days'}
            </p>
        </div>

        <p>Pro tips to maximize your subscription:</p>
        <ul style="color: #b0b0b0;">
            <li>Try voice logging - it's addictively fast</li>
            <li>Check your HRV trends every morning</li>
            <li>Use body scans monthly to track progress</li>
            <li>Ask the AI anything - it knows your data</li>
        </ul>

        <p>Questions? Reply to this email anytime.</p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    subscription_cancelled: (data) => ({
        subject: "We're sorry to see you go 💔",
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .cta { display: inline-block; background: linear-gradient(135deg, #FF5C00, #FF8C00); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <h1>Your Subscription is Cancelled</h1>
        <p>We're sad to see you go, ${data.name || 'friend'}. Your Pro access will remain active until <strong>${data.accessUntil || 'the end of your billing period'}</strong>.</p>

        <p>You can still use the free version of MyMacro AI with limited features.</p>

        <p>Changed your mind? You can resubscribe anytime:</p>
        <center><a href="https://mymacro.ai/subscribe" class="cta">Reactivate Pro</a></center>

        <p style="font-size: 14px;">We'd love to hear why you cancelled. <a href="https://mymacro.ai/feedback" style="color: #FF5C00;">Share feedback</a></p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    founder_welcome: (data) => ({
        subject: '🏆 Welcome to the Founder Circle, #' + (data.founderNumber || '???'),
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .founder-badge { background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 30px; border-radius: 16px; text-align: center; margin: 30px 0; }
        .founder-badge h2 { margin: 0; font-size: 24px; }
        .founder-badge p { margin: 10px 0 0 0; color: #333; }
        .perk { background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>FOUNDER</span></div>

        <div class="founder-badge">
            <h2>Founder #${data.founderNumber || '???'}</h2>
            <p>1 of only 500 worldwide</p>
        </div>

        <h1>You're Part of History 🚀</h1>
        <p>You're not just a user - you're a founder. You believed in us early, and we won't forget that.</p>

        <p><strong>Your Lifetime Perks:</strong></p>

        <div class="perk">🔓 <strong>Lifetime Pro Access</strong> - Forever, no renewals</div>
        <div class="perk">⭐ <strong>Founder Badge</strong> - Visible on your profile</div>
        <div class="perk">🎨 <strong>Exclusive Themes</strong> - Founder-only cosmetics</div>
        <div class="perk">🚀 <strong>Early Access</strong> - Test features before everyone</div>
        <div class="perk">💬 <strong>Direct Line</strong> - Priority support channel</div>
        <div class="perk">💰 <strong>2x MacroCoins</strong> - Double earning rate forever</div>

        <p>Your name will be added to the Founder Wall in the app. Welcome to the inner circle.</p>

        <p>With gratitude,<br><strong>— The MyMacro AI Team</strong></p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    streak_milestone: (data) => ({
        subject: `🔥 ${data.streak || 7} Day Streak! You're on Fire!`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .streak { font-size: 72px; text-align: center; margin: 30px 0; }
        .reward { background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>

        <div class="streak">🔥 ${data.streak || 7}</div>

        <h1>${data.streak || 7} Day Streak!</h1>
        <p>Incredible consistency, ${data.name || 'Champion'}! You've logged your nutrition for ${data.streak || 7} days straight.</p>

        <div class="reward">
            <p style="margin: 0; color: #FFD700; font-weight: 600;">🪙 REWARD EARNED</p>
            <p style="margin: 10px 0 0 0; color: #fff; font-size: 24px;"><strong>+${data.coinsEarned || 100} MacroCoins</strong></p>
        </div>

        <p>Next milestone: <strong>${data.nextMilestone || 14} days</strong> (+${data.nextReward || 250} coins)</p>

        <p>Keep going! 💪</p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    weekly_digest: (data) => ({
        subject: `📊 Your Week in Review - ${data.weekOf || 'This Week'}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
        .stat { background: #1a1a1a; padding: 20px; border-radius: 12px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: 700; color: #FF5C00; }
        .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
        .insight { background: linear-gradient(135deg, #1a1a2e, #1a1a1a); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 3px solid #FF5C00; }
        .cta { display: inline-block; background: linear-gradient(135deg, #FF5C00, #FF8C00); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <h1>Your Week in Review 📈</h1>

        <div class="stats">
            <div class="stat">
                <div class="stat-value">${data.avgCalories || '2,100'}</div>
                <div class="stat-label">Avg Calories/Day</div>
            </div>
            <div class="stat">
                <div class="stat-value">${data.avgProtein || '145'}g</div>
                <div class="stat-label">Avg Protein/Day</div>
            </div>
            <div class="stat">
                <div class="stat-value">${data.mealsLogged || '21'}</div>
                <div class="stat-label">Meals Logged</div>
            </div>
            <div class="stat">
                <div class="stat-value">${data.streak || '7'} 🔥</div>
                <div class="stat-label">Current Streak</div>
            </div>
        </div>

        <div class="insight">
            <p style="margin: 0; color: #FF5C00; font-weight: 600;">💡 AI INSIGHT</p>
            <p style="margin: 10px 0 0 0; color: #fff;">${data.aiInsight || 'Your protein intake was 12% higher than last week. Great progress toward your muscle gain goal!'}</p>
        </div>

        <p><strong>This week's wins:</strong></p>
        <ul style="color: #b0b0b0;">
            ${(data.wins || ['Hit protein goal 5/7 days', 'Logged every meal']).map((w: string) => `<li>${w}</li>`).join('')}
        </ul>

        <center><a href="https://mymacro.ai/app" class="cta">View Full Report</a></center>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),

    winback: (data) => ({
        subject: "We miss you! Here's 50% off to come back 🎁",
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo span { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #FF5C00, #FF8C00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        h1 { font-size: 28px; margin-bottom: 20px; }
        p { font-size: 16px; line-height: 1.6; color: #b0b0b0; }
        .offer { background: linear-gradient(135deg, #FF5C00, #FF8C00); padding: 30px; border-radius: 16px; text-align: center; margin: 30px 0; }
        .offer h2 { margin: 0; font-size: 36px; color: #fff; }
        .offer p { margin: 10px 0 0 0; color: #fff; }
        .cta { display: inline-block; background: #fff; color: #FF5C00; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><span>MyMacro AI</span></div>
        <h1>It's Been a While, ${data.name || 'Friend'} 👋</h1>
        <p>We noticed you haven't been tracking lately. Your health journey is important, and we want to help you get back on track.</p>

        <div class="offer">
            <h2>50% OFF</h2>
            <p>Your first month of Pro</p>
        </div>

        <p>That's just <strong>$4.99</strong> for 30 days of:</p>
        <ul style="color: #b0b0b0;">
            <li>Unlimited AI logging</li>
            <li>Advanced health insights</li>
            <li>Body composition analysis</li>
            <li>Priority AI coach access</li>
        </ul>

        <center><a href="https://mymacro.ai/subscribe?offer=winback50" class="cta">Claim 50% Off</a></center>

        <p style="font-size: 12px; color: #666;">Offer expires in 7 days. One-time use.</p>

        <div class="footer">
            <p>MyMacro AI Inc. | <a href="https://mymacro.ai/unsubscribe" style="color: #666;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
        `,
    }),
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload: EmailPayload = await req.json();
        const { template, email, userId, data = {} } = payload;

        // Validate template
        if (!template || !templates[template]) {
            return new Response(
                JSON.stringify({ error: 'Invalid template' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate email
        if (!email || !email.includes('@')) {
            return new Response(
                JSON.stringify({ error: 'Invalid email' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Generate email content
        const { subject, html } = templates[template](data);

        // Send via Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'MyMacro AI <hello@mymacro.ai>',
                to: email,
                subject,
                html,
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            throw new Error(resendData.message || 'Resend API error');
        }

        // Log email send to Supabase
        if (userId) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            await supabase.from('email_sends').insert({
                user_id: userId,
                email,
                template,
                resend_id: resendData.id,
                status: 'sent',
            });
        }

        return new Response(
            JSON.stringify({ success: true, id: resendData.id }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[send-email] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
