/**
 * Email Service - Client-side email trigger service
 *
 * Triggers transactional and marketing emails via Supabase Edge Function
 */

import { getSupabase } from '../../lib/supabase';

export type EmailTemplate =
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

interface SendEmailParams {
    template: EmailTemplate;
    email: string;
    userId?: string;
    data?: Record<string, unknown>;
}

interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
}

class EmailService {
    /**
     * Send an email using the Supabase Edge Function
     */
    async send(params: SendEmailParams): Promise<EmailResult> {
        try {
            const { data, error } = await getSupabase().functions.invoke('send-email', {
                body: params,
            });

            if (error) {
                if (__DEV__) console.error('[EmailService] Error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, id: data?.id };
        } catch (err) {
            const error = err as Error;
            if (__DEV__) console.error('[EmailService] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcome(email: string, userId: string, name?: string): Promise<EmailResult> {
        return this.send({
            template: 'welcome',
            email,
            userId,
            data: { name },
        });
    }

    /**
     * Send trial started notification
     */
    async sendTrialStarted(
        email: string,
        userId: string,
        trialEndDate: string
    ): Promise<EmailResult> {
        return this.send({
            template: 'trial_started',
            email,
            userId,
            data: { trialEndDate },
        });
    }

    /**
     * Send trial ending reminder (3 days before)
     */
    async sendTrialEnding(
        email: string,
        userId: string,
        data: { mealsLogged?: number; aiChats?: number; streak?: number }
    ): Promise<EmailResult> {
        return this.send({
            template: 'trial_ending',
            email,
            userId,
            data,
        });
    }

    /**
     * Send trial expired notification
     */
    async sendTrialExpired(email: string, userId: string): Promise<EmailResult> {
        return this.send({
            template: 'trial_expired',
            email,
            userId,
        });
    }

    /**
     * Send subscription confirmation
     */
    async sendSubscriptionConfirmed(
        email: string,
        userId: string,
        data: { plan: string; amount: string; nextBilling: string }
    ): Promise<EmailResult> {
        return this.send({
            template: 'subscription_confirmed',
            email,
            userId,
            data,
        });
    }

    /**
     * Send subscription cancelled notification
     */
    async sendSubscriptionCancelled(
        email: string,
        userId: string,
        data: { name?: string; accessUntil: string }
    ): Promise<EmailResult> {
        return this.send({
            template: 'subscription_cancelled',
            email,
            userId,
            data,
        });
    }

    /**
     * Send founder welcome email
     */
    async sendFounderWelcome(
        email: string,
        userId: string,
        founderNumber: number
    ): Promise<EmailResult> {
        return this.send({
            template: 'founder_welcome',
            email,
            userId,
            data: { founderNumber },
        });
    }

    /**
     * Send streak milestone celebration
     */
    async sendStreakMilestone(
        email: string,
        userId: string,
        data: {
            name?: string;
            streak: number;
            coinsEarned: number;
            nextMilestone: number;
            nextReward: number;
        }
    ): Promise<EmailResult> {
        return this.send({
            template: 'streak_milestone',
            email,
            userId,
            data,
        });
    }

    /**
     * Send weekly digest
     */
    async sendWeeklyDigest(
        email: string,
        userId: string,
        data: {
            weekOf: string;
            avgCalories: string;
            avgProtein: string;
            mealsLogged: number;
            streak: number;
            aiInsight: string;
            wins: string[];
        }
    ): Promise<EmailResult> {
        return this.send({
            template: 'weekly_digest',
            email,
            userId,
            data,
        });
    }

    /**
     * Send win-back email to churned user
     */
    async sendWinback(email: string, userId: string, name?: string): Promise<EmailResult> {
        return this.send({
            template: 'winback',
            email,
            userId,
            data: { name },
        });
    }
}

export const emailService = new EmailService();
