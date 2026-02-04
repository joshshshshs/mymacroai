/**
 * ReferralService - Handles referral codes, verification, and friend management
 * Features:
 * - Generate unique referral codes
 * - Verify referral codes (one-time use per friend)
 * - Track pending/verified referrals
 * - Apply $5 credits
 */

import { supabase } from '@/src/lib/supabase';
import { storage } from '@/src/store/UserStore';

// ============================================================================
// Types
// ============================================================================

export type ReferralStatus = 'pending' | 'verified' | 'expired' | 'invalid';

export interface Referral {
    id: string;
    referrerId: string;
    referrerCode: string;
    referredEmail?: string;
    referredName?: string;
    referredUserId?: string;
    status: ReferralStatus;
    createdAt: string;
    verifiedAt?: string;
    creditApplied: boolean;
    nudgeCount: number;
    lastNudgeAt?: string;
}

export interface ReferralCode {
    code: string;
    userId: string;
    shareLink: string;
    totalReferrals: number;
    successfulReferrals: number;
    totalCreditsEarned: number;
}

export interface Friend {
    id: string;
    userId: string;
    name: string;
    avatar?: string;
    score: number;
    streak: number;
    addedAt: string;
    status: 'active' | 'pending';
}

// ============================================================================
// Constants
// ============================================================================

const REFERRAL_CODE_KEY = 'referral_code';
const PENDING_REFERRALS_KEY = 'pending_referrals';
const VERIFIED_REFERRALS_KEY = 'verified_referrals';
const FRIENDS_KEY = 'friends_list';
const USED_REFERRAL_CODES_KEY = 'used_referral_codes';
const CREDIT_AMOUNT = 5; // $5 per successful referral
const BASE_SHARE_URL = 'https://mymacro.ai/u/';

// ============================================================================
// Service
// ============================================================================

class ReferralService {
    /**
     * Generates a unique referral code for a user
     * Format: USERNAME-XXXX (e.g., joshua-A7K2)
     */
    generateReferralCode(userName: string, userId: string): ReferralCode {
        const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${cleanName}-${randomSuffix}`;

        const referralCode: ReferralCode = {
            code,
            userId,
            shareLink: `${BASE_SHARE_URL}${cleanName}?ref=${code}`,
            totalReferrals: 0,
            successfulReferrals: 0,
            totalCreditsEarned: 0,
        };

        // Cache locally
        storage.set(REFERRAL_CODE_KEY, JSON.stringify(referralCode));

        return referralCode;
    }

    /**
     * Gets the user's referral code or generates one
     */
    getReferralCode(userName: string, userId: string): ReferralCode {
        const cached = storage.getString(REFERRAL_CODE_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                // Generate new if corrupted
            }
        }
        return this.generateReferralCode(userName, userId);
    }

    /**
     * Validates a referral code
     * Checks format, existence, and if already used by this user
     */
    async validateReferralCode(code: string, currentUserId: string): Promise<{
        valid: boolean;
        reason?: string;
        referrerId?: string;
    }> {
        // Check format (username-XXXX)
        const codeRegex = /^[a-z0-9]+-[A-Z0-9]{4}$/i;
        if (!codeRegex.test(code)) {
            return { valid: false, reason: 'Invalid code format' };
        }

        // Check if already used by this user
        const usedCodes = this.getUsedCodes();
        if (usedCodes.includes(code.toLowerCase())) {
            return { valid: false, reason: 'Code already used' };
        }

        // Check if trying to use own code
        const ownCode = storage.getString(REFERRAL_CODE_KEY);
        if (ownCode) {
            try {
                const parsed = JSON.parse(ownCode);
                if (parsed.code.toLowerCase() === code.toLowerCase()) {
                    return { valid: false, reason: 'Cannot use your own code' };
                }
            } catch { }
        }

        // In production, would verify with Supabase
        // For now, simulate verification
        try {
            // Mock: Extract referrer from code
            const referrerName = code.split('-')[0];

            // Simulate network verification delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                valid: true,
                referrerId: `user_${referrerName}`,
            };
        } catch (error) {
            console.error('Referral validation error:', error);
            return { valid: false, reason: 'Verification failed' };
        }
    }

    /**
     * Applies a referral code and marks it as used
     */
    async applyReferralCode(code: string, currentUserId: string): Promise<{
        success: boolean;
        creditAmount?: number;
        error?: string;
    }> {
        const validation = await this.validateReferralCode(code, currentUserId);

        if (!validation.valid) {
            return { success: false, error: validation.reason };
        }

        // Mark code as used
        const usedCodes = this.getUsedCodes();
        usedCodes.push(code.toLowerCase());
        storage.set(USED_REFERRAL_CODES_KEY, JSON.stringify(usedCodes));

        // In production, would update Supabase and apply credit
        // For now, log and return success
        if (__DEV__) console.log(`Referral code ${code} applied by user ${currentUserId}`);

        return {
            success: true,
            creditAmount: CREDIT_AMOUNT,
        };
    }

    /**
     * Gets list of codes already used by this user
     */
    private getUsedCodes(): string[] {
        const cached = storage.getString(USED_REFERRAL_CODES_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch { }
        }
        return [];
    }

    // ==========================================================================
    // Referral Tracking
    // ==========================================================================

    /**
     * Creates a pending referral when user shares their code
     */
    createPendingReferral(referredName: string, referredEmail?: string): Referral {
        const ownCode = this.getReferralCode('user', 'current');

        const referral: Referral = {
            id: `ref_${Date.now()}`,
            referrerId: ownCode.userId,
            referrerCode: ownCode.code,
            referredName,
            referredEmail,
            status: 'pending',
            createdAt: new Date().toISOString(),
            creditApplied: false,
            nudgeCount: 0,
        };

        const pending = this.getPendingReferrals();
        pending.push(referral);
        storage.set(PENDING_REFERRALS_KEY, JSON.stringify(pending));

        return referral;
    }

    /**
     * Gets all pending referrals
     */
    getPendingReferrals(): Referral[] {
        const cached = storage.getString(PENDING_REFERRALS_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch { }
        }
        return [];
    }

    /**
     * Gets all verified referrals
     */
    getVerifiedReferrals(): Referral[] {
        const cached = storage.getString(VERIFIED_REFERRALS_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch { }
        }
        return [];
    }

    /**
     * Nudge a pending referral (send reminder)
     */
    async nudgeReferral(referralId: string): Promise<boolean> {
        const pending = this.getPendingReferrals();
        const index = pending.findIndex(r => r.id === referralId);

        if (index === -1) return false;

        pending[index].nudgeCount += 1;
        pending[index].lastNudgeAt = new Date().toISOString();
        storage.set(PENDING_REFERRALS_KEY, JSON.stringify(pending));

        // In production, would send push notification or email
        if (__DEV__) console.log(`Nudged referral ${referralId}`);
        return true;
    }

    /**
     * Mark a referral as verified (called when friend signs up)
     */
    verifyReferral(referralId: string): Referral | null {
        const pending = this.getPendingReferrals();
        const index = pending.findIndex(r => r.id === referralId);

        if (index === -1) return null;

        const referral = pending[index];
        referral.status = 'verified';
        referral.verifiedAt = new Date().toISOString();
        referral.creditApplied = true;

        // Move to verified
        pending.splice(index, 1);
        storage.set(PENDING_REFERRALS_KEY, JSON.stringify(pending));

        const verified = this.getVerifiedReferrals();
        verified.push(referral);
        storage.set(VERIFIED_REFERRALS_KEY, JSON.stringify(verified));

        return referral;
    }

    // ==========================================================================
    // Friends Management
    // ==========================================================================

    /**
     * Gets all friends
     */
    getFriends(): Friend[] {
        const cached = storage.getString(FRIENDS_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch { }
        }
        return [];
    }

    /**
     * Add a friend by their code or ID
     */
    async addFriend(friendCode: string): Promise<{
        success: boolean;
        friend?: Friend;
        error?: string;
    }> {
        // Validate the friend code
        const validation = await this.validateReferralCode(friendCode, 'current');

        if (!validation.valid) {
            return { success: false, error: validation.reason };
        }

        const friendName = friendCode.split('-')[0];
        const friend: Friend = {
            id: `friend_${Date.now()}`,
            userId: validation.referrerId || `user_${friendName}`,
            name: friendName.charAt(0).toUpperCase() + friendName.slice(1),
            score: Math.floor(Math.random() * 5000) + 1000,
            streak: Math.floor(Math.random() * 30),
            addedAt: new Date().toISOString(),
            status: 'active',
        };

        const friends = this.getFriends();
        friends.push(friend);
        storage.set(FRIENDS_KEY, JSON.stringify(friends));

        return { success: true, friend };
    }

    /**
     * Remove a friend
     */
    removeFriend(friendId: string): boolean {
        const friends = this.getFriends();
        const index = friends.findIndex(f => f.id === friendId);

        if (index === -1) return false;

        friends.splice(index, 1);
        storage.set(FRIENDS_KEY, JSON.stringify(friends));
        return true;
    }

    // ==========================================================================
    // Share Functionality
    // ==========================================================================

    /**
     * Gets the share message for referral
     */
    getShareMessage(code: string, userName: string): string {
        return `Join me on MyMacro AI and get $5 off! Use my code: ${code}\n\n${BASE_SHARE_URL}${userName.toLowerCase()}?ref=${code}`;
    }

    /**
     * Gets stats for the referral dashboard
     */
    getReferralStats(): {
        pending: number;
        verified: number;
        totalCredits: number;
        friends: number;
    } {
        return {
            pending: this.getPendingReferrals().length,
            verified: this.getVerifiedReferrals().length,
            totalCredits: this.getVerifiedReferrals().length * CREDIT_AMOUNT,
            friends: this.getFriends().length,
        };
    }
}

export const referralService = new ReferralService();
