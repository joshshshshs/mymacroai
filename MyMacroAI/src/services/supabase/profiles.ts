/**
 * Profiles Service - Community Kitchen
 * 
 * Handles public profiles, follows, and user discovery.
 */

import { supabase } from '../lib/supabase';
import { StorageService } from './supabase/storage';

// ============================================================================
// TYPES
// ============================================================================

export interface PublicProfile {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    instagram_handle: string | null;
    tiktok_handle: string | null;
    personal_link: string | null;
    show_goals: boolean;
    show_weight: boolean;
    follower_count: number;
    following_count: number;
    recipe_count: number;
    is_verified: boolean;
    created_at: string;
}

export interface ProfileUpdateInput {
    username?: string;
    display_name?: string;
    bio?: string;
    instagram_handle?: string;
    tiktok_handle?: string;
    personal_link?: string;
    show_goals?: boolean;
    show_weight?: boolean;
}

// ============================================================================
// PROFILE CRUD
// ============================================================================

/**
 * Get the current user's profile
 */
export async function getCurrentProfile(): Promise<PublicProfile | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        return getProfileById(user.id);
    } catch (error) {
        console.error('[ProfilesService] Get current profile error:', error);
        return null;
    }
}

/**
 * Get a profile by user ID
 */
export async function getProfileById(userId: string): Promise<PublicProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[ProfilesService] Get profile error:', error);
            return null;
        }

        return data as PublicProfile;
    } catch (error) {
        console.error('[ProfilesService] Get profile exception:', error);
        return null;
    }
}

/**
 * Get a profile by username
 */
export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (error) return null;
        return data as PublicProfile;
    } catch (error) {
        return null;
    }
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
    input: ProfileUpdateInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                ...input,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update profile' };
    }
}

/**
 * Update avatar
 */
export async function updateAvatar(
    imageUri: string
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Upload new avatar
        const uploadResult = await StorageService.uploadAvatar(imageUri, user.id);
        if (!uploadResult.success || !uploadResult.url) {
            return { success: false, error: uploadResult.error };
        }

        // Update profile
        const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: uploadResult.url })
            .eq('id', user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, avatarUrl: uploadResult.url };
    } catch (error) {
        return { success: false, error: 'Failed to update avatar' };
    }
}

// ============================================================================
// FOLLOWS
// ============================================================================

/**
 * Check if current user follows a user
 */
export async function isFollowing(targetUserId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId)
            .single();

        return !!data;
    } catch (error) {
        return false;
    }
}

/**
 * Follow a user
 */
export async function followUser(
    targetUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        if (user.id === targetUserId) {
            return { success: false, error: 'Cannot follow yourself' };
        }

        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: user.id,
                following_id: targetUserId,
            });

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Already following' };
            }
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to follow' };
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
    targetUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to unfollow' };
    }
}

/**
 * Get followers of a user
 */
export async function getFollowers(
    userId: string,
    page: number = 0,
    pageSize: number = 20
): Promise<PublicProfile[]> {
    try {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                follower:profiles!follower_id (*)
            `)
            .eq('following_id', userId)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data) return [];

        return data.map((item: any) => item.follower) as PublicProfile[];
    } catch (error) {
        return [];
    }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
    userId: string,
    page: number = 0,
    pageSize: number = 20
): Promise<PublicProfile[]> {
    try {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                following:profiles!following_id (*)
            `)
            .eq('follower_id', userId)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data) return [];

        return data.map((item: any) => item.following) as PublicProfile[];
    } catch (error) {
        return [];
    }
}

// ============================================================================
// DISCOVERY
// ============================================================================

/**
 * Get suggested profiles to follow
 */
export async function getSuggestedProfiles(limit: number = 10): Promise<PublicProfile[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from('profiles')
            .select('*')
            .order('follower_count', { ascending: false })
            .limit(limit);

        // Exclude current user
        if (user) {
            query = query.neq('id', user.id);
        }

        const { data, error } = await query;

        if (error || !data) return [];

        return data as PublicProfile[];
    } catch (error) {
        return [];
    }
}

/**
 * Search profiles by username or display name
 */
export async function searchProfiles(
    query: string,
    limit: number = 20
): Promise<PublicProfile[]> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
            .limit(limit);

        if (error || !data) return [];

        return data as PublicProfile[];
    } catch (error) {
        return [];
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ProfilesService = {
    getCurrentProfile,
    getProfileById,
    getProfileByUsername,
    updateProfile,
    updateAvatar,
    isFollowing,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getSuggestedProfiles,
    searchProfiles,
};

export default ProfilesService;
