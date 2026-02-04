/**
 * Feature Voting Service
 * 
 * Handles feature requests, voting, and roadmap management.
 */

import { getSupabase, supabase } from '@/src/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface FeatureRequest {
    id: string;
    author_id: string;
    title: string;
    description: string;
    category: 'feature' | 'improvement' | 'bug' | 'integration';
    status: 'pending' | 'planned' | 'in_progress' | 'completed' | 'rejected';
    dev_notes: string | null;
    upvote_count: number;
    downvote_count: number;
    score: number;
    created_at: string;
    updated_at: string;
    // Joined data
    author?: {
        username: string;
        avatar_url: string | null;
    };
    user_vote?: 'up' | 'down' | null;
}

export type VoteType = 'up' | 'down';

export const FEATURE_CATEGORIES = [
    { id: 'feature', label: '✨ New Feature', color: '#3B82F6' },
    { id: 'improvement', label: '🔧 Improvement', color: '#10B981' },
    { id: 'bug', label: '🐛 Bug Fix', color: '#EF4444' },
    { id: 'integration', label: '🔗 Integration', color: '#8B5CF6' },
] as const;

export const STATUS_LABELS: Record<FeatureRequest['status'], { label: string; color: string }> = {
    pending: { label: 'Under Review', color: '#6B7280' },
    planned: { label: 'Planned', color: '#3B82F6' },
    in_progress: { label: 'In Progress', color: '#F59E0B' },
    completed: { label: 'Completed', color: '#10B981' },
    rejected: { label: 'Declined', color: '#EF4444' },
};

// ============================================================================
// FEATURE REQUESTS
// ============================================================================

export interface CreateRequestInput {
    title: string;
    description: string;
    category: FeatureRequest['category'];
}

export async function createFeatureRequest(
    input: CreateRequestInput
): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { data, error } = await getSupabase()
            .from('feature_requests')
            .insert({
                author_id: user.id,
                title: input.title,
                description: input.description,
                category: input.category,
            })
            .select('id')
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, requestId: data.id };
    } catch (error) {
        return { success: false, error: 'Failed to create request' };
    }
}

export async function getFeatureRequests(
    filter: 'top' | 'new' | 'planned' | 'completed' = 'top',
    page: number = 0,
    pageSize: number = 20
): Promise<FeatureRequest[]> {
    try {
        const { data: { user } } = await getSupabase().auth.getUser();

        let query = getSupabase()
            .from('feature_requests')
            .select(`
                *,
                author:profiles!author_id (
                    username,
                    avatar_url
                )
            `);

        // Apply filters
        switch (filter) {
            case 'top':
                query = query.order('score', { ascending: false });
                break;
            case 'new':
                query = query.order('created_at', { ascending: false });
                break;
            case 'planned':
                query = query.in('status', ['planned', 'in_progress']);
                break;
            case 'completed':
                query = query.eq('status', 'completed');
                break;
        }

        query = query.range(page * pageSize, (page + 1) * pageSize - 1);

        const { data, error } = await query;

        if (error || !data) return [];

        // Get user's votes if logged in
        let userVotes: Record<string, VoteType> = {};
        if (user) {
            const requestIds = data.map((r: FeatureRequest) => r.id);
            const { data: votesData } = await getSupabase()
                .from('feature_votes')
                .select('request_id, vote_type')
                .eq('user_id', user.id)
                .in('request_id', requestIds);

            if (votesData) {
                votesData.forEach((v: { request_id: string; vote_type: VoteType }) => {
                    userVotes[v.request_id] = v.vote_type;
                });
            }
        }

        return data.map((request: FeatureRequest) => ({
            ...request,
            user_vote: userVotes[request.id] || null,
        }));
    } catch (error) {
        console.error('[FeatureVoting] Error:', error);
        return [];
    }
}

export async function getFeatureRequestById(requestId: string): Promise<FeatureRequest | null> {
    try {
        const { data: { user } } = await getSupabase().auth.getUser();

        const { data, error } = await getSupabase()
            .from('feature_requests')
            .select(`
                *,
                author:profiles!author_id (
                    username,
                    avatar_url
                )
            `)
            .eq('id', requestId)
            .single();

        if (error || !data) return null;

        // Get user's vote
        let userVote: VoteType | null = null;
        if (user) {
            const { data: voteData } = await getSupabase()
                .from('feature_votes')
                .select('vote_type')
                .eq('user_id', user.id)
                .eq('request_id', requestId)
                .single();

            if (voteData) {
                userVote = voteData.vote_type as VoteType;
            }
        }

        return {
            ...data,
            user_vote: userVote,
        } as FeatureRequest;
    } catch (error) {
        return null;
    }
}

// ============================================================================
// VOTING
// ============================================================================

export async function voteOnFeature(
    requestId: string,
    voteType: VoteType
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await getSupabase().auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check existing vote
        const { data: existing } = await getSupabase()
            .from('feature_votes')
            .select('id, vote_type')
            .eq('user_id', user.id)
            .eq('request_id', requestId)
            .single();

        if (existing) {
            if (existing.vote_type === voteType) {
                // Same vote - remove it
                await getSupabase().from('feature_votes').delete().eq('id', existing.id);
            } else {
                // Different vote - update it
                await getSupabase()
                    .from('feature_votes')
                    .update({ vote_type: voteType })
                    .eq('id', existing.id);
            }
        } else {
            // No existing vote - create new
            const { error } = await getSupabase()
                .from('feature_votes')
                .insert({
                    user_id: user.id,
                    request_id: requestId,
                    vote_type: voteType,
                });

            if (error) {
                return { success: false, error: error.message };
            }
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to vote' };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const FeatureVotingService = {
    createFeatureRequest,
    getFeatureRequests,
    getFeatureRequestById,
    voteOnFeature,
    FEATURE_CATEGORIES,
    STATUS_LABELS,
};

export default FeatureVotingService;
