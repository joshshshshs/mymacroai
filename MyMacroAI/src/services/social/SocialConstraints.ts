/**
 * Social Constraints Service
 * Enforces social rules: max squad size 5, reaction-only mode, consistency score ranking
 */

import { logger } from '../../../utils/logger';
import { supabase } from '../../lib/supabase';

export const MAX_SQUAD_SIZE = 5;

export type ReactionType = '🔥' | '💪' | '👏' | '⚡' | '🎯' | '👀';

export interface SquadMember {
  userId: string;
  username: string;
  avatarUrl?: string;
  consistencyScore: number; // 0-100
  streak: number; // Days
  joinedAt: string;
}

export interface Squad {
  id: string;
  ownerId: string;
  members: SquadMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  userId: string;
  targetUserId: string;
  type: ReactionType;
  context: 'log' | 'workout' | 'photo' | 'streak'; // What they're reacting to
  targetId: string; // ID of the log/workout/photo
  timestamp: string;
}

export interface ConsistencyMetrics {
  userId: string;
  logsThisWeek: number;
  logsLastWeek: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number; // 0-100, weighted formula
  rank?: number; // Rank within squad
}

class SocialConstraintsService {
  /**
   * Check if user can join a squad
   */
  canJoinSquad(squad: Squad, userId: string): { allowed: boolean; reason?: string } {
    // Check if already in squad
    if (squad.members.some((m) => m.userId === userId)) {
      return { allowed: false, reason: 'Already in this squad' };
    }

    // Check squad size limit
    if (squad.members.length >= MAX_SQUAD_SIZE) {
      return { allowed: false, reason: `Squad is full (max ${MAX_SQUAD_SIZE} members)` };
    }

    return { allowed: true };
  }

  /**
   * Add member to squad (enforces max 5 constraint)
   */
  async addSquadMember(
    squadId: string,
    userId: string,
    username: string,
    avatarUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Fetch current squad
      const { data: squad, error: fetchError } = await supabase
        .from('squads')
        .select('*, squad_members(*)')
        .eq('id', squadId)
        .single();

      if (fetchError || !squad) {
        return { success: false, error: 'Squad not found' };
      }

      // Check constraints
      const memberCount = squad.squad_members?.length || 0;
      if (memberCount >= MAX_SQUAD_SIZE) {
        return { success: false, error: `Squad is full (max ${MAX_SQUAD_SIZE} members)` };
      }

      // Check if already member
      const isAlreadyMember = squad.squad_members?.some((m: any) => m.user_id === userId);
      if (isAlreadyMember) {
        return { success: false, error: 'Already a member of this squad' };
      }

      // Calculate initial consistency score
      const consistencyScore = await this.calculateConsistencyScore(userId);

      // Add member
      const { error: insertError } = await supabase.from('squad_members').insert({
        squad_id: squadId,
        user_id: userId,
        username,
        avatar_url: avatarUrl,
        consistency_score: consistencyScore.consistencyScore,
        streak: consistencyScore.currentStreak,
        joined_at: new Date().toISOString(),
      });

      if (insertError) {
        logger.error('Failed to add squad member:', insertError);
        return { success: false, error: 'Failed to join squad' };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error adding squad member:', error);
      return { success: false, error: 'Unexpected error' };
    }
  }

  /**
   * Remove member from squad
   */
  async removeSquadMember(
    squadId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('squad_members')
        .delete()
        .eq('squad_id', squadId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to remove squad member:', error);
        return { success: false, error: 'Failed to leave squad' };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error removing squad member:', error);
      return { success: false, error: 'Unexpected error' };
    }
  }

  /**
   * Get squad members with consistency ranking
   */
  async getSquadMembersRanked(squadId: string): Promise<SquadMember[]> {
    try {
      const { data, error } = await supabase
        .from('squad_members')
        .select('*')
        .eq('squad_id', squadId)
        .order('consistency_score', { ascending: false });

      if (error || !data) {
        logger.error('Failed to fetch squad members:', error);
        return [];
      }

      return data.map((member) => ({
        userId: member.user_id,
        username: member.username,
        avatarUrl: member.avatar_url,
        consistencyScore: member.consistency_score,
        streak: member.streak,
        joinedAt: member.joined_at,
      }));
    } catch (error) {
      logger.error('Error fetching squad members:', error);
      return [];
    }
  }

  /**
   * Calculate consistency score (0-100)
   * Formula:
   * - 40% current streak (capped at 30 days)
   * - 30% logs this week
   * - 20% log frequency (logs per day over last 30 days)
   * - 10% longest streak bonus
   */
  async calculateConsistencyScore(userId: string): Promise<ConsistencyMetrics> {
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch logs for last 30 days
      const { data: logs, error } = await supabase
        .from('nutrition_logs')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch logs for consistency:', error);
        return this.getDefaultMetrics(userId);
      }

      if (!logs || logs.length === 0) {
        return this.getDefaultMetrics(userId);
      }

      // Calculate metrics
      const logsThisWeek = logs.filter(
        (log) => new Date(log.created_at) >= oneWeekAgo
      ).length;
      const logsLastWeek = logs.filter(
        (log) =>
          new Date(log.created_at) >= twoWeeksAgo &&
          new Date(log.created_at) < oneWeekAgo
      ).length;

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(
        logs.map((log) => log.created_at)
      );

      // Calculate score components
      const streakScore = Math.min((currentStreak / 30) * 40, 40); // 40% max, capped at 30 days
      const weeklyScore = Math.min((logsThisWeek / 7) * 30, 30); // 30% max, 1 log per day ideal
      const frequencyScore = Math.min((logs.length / 30) * 20, 20); // 20% max, 1 log per day
      const longestStreakBonus = Math.min((longestStreak / 50) * 10, 10); // 10% max

      const consistencyScore = Math.round(
        streakScore + weeklyScore + frequencyScore + longestStreakBonus
      );

      return {
        userId,
        logsThisWeek,
        logsLastWeek,
        currentStreak,
        longestStreak,
        consistencyScore: Math.min(100, consistencyScore),
      };
    } catch (error) {
      logger.error('Error calculating consistency score:', error);
      return this.getDefaultMetrics(userId);
    }
  }

  /**
   * Calculate current and longest streaks
   */
  private calculateStreaks(
    timestamps: string[]
  ): { currentStreak: number; longestStreak: number } {
    if (timestamps.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort timestamps descending
    const sorted = timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    let lastDate = new Date(sorted[0]);
    lastDate.setHours(0, 0, 0, 0);

    // Check if today or yesterday
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      currentStreak = 1;

      for (let i = 1; i < sorted.length; i++) {
        const currentDate = new Date(sorted[i]);
        currentDate.setHours(0, 0, 0, 0);

        const diff = Math.floor(
          (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) {
          currentStreak++;
          lastDate = currentDate;
        } else if (diff === 0) {
          // Same day, continue
          continue;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    lastDate = new Date(sorted[0]);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i]);
      currentDate.setHours(0, 0, 0, 0);

      const diff = Math.floor(
        (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 1) {
        tempStreak++;
        lastDate = currentDate;
      } else if (diff === 0) {
        continue; // Same day
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        lastDate = currentDate;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private getDefaultMetrics(userId: string): ConsistencyMetrics {
    return {
      userId,
      logsThisWeek: 0,
      logsLastWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      consistencyScore: 0,
    };
  }

  /**
   * Add reaction (reaction-only social interaction)
   */
  async addReaction(
    userId: string,
    targetUserId: string,
    targetId: string,
    type: ReactionType,
    context: Reaction['context']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user is in same squad as target
      const inSameSquad = await this.areInSameSquad(userId, targetUserId);
      if (!inSameSquad) {
        return { success: false, error: 'Can only react to squad members' };
      }

      // Check if reaction already exists (prevent spam)
      const { data: existing } = await supabase
        .from('reactions')
        .select('id')
        .eq('user_id', userId)
        .eq('target_id', targetId)
        .single();

      if (existing) {
        return { success: false, error: 'Already reacted to this' };
      }

      // Add reaction
      const { error } = await supabase.from('reactions').insert({
        user_id: userId,
        target_user_id: targetUserId,
        target_id: targetId,
        type,
        context,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to add reaction:', error);
        return { success: false, error: 'Failed to add reaction' };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error adding reaction:', error);
      return { success: false, error: 'Unexpected error' };
    }
  }

  /**
   * Get reactions for a target
   */
  async getReactions(targetId: string): Promise<Reaction[]> {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('target_id', targetId)
        .order('timestamp', { ascending: false });

      if (error || !data) {
        logger.error('Failed to fetch reactions:', error);
        return [];
      }

      return data.map((r) => ({
        id: r.id,
        userId: r.user_id,
        targetUserId: r.target_user_id,
        type: r.type,
        context: r.context,
        targetId: r.target_id,
        timestamp: r.timestamp,
      }));
    } catch (error) {
      logger.error('Error fetching reactions:', error);
      return [];
    }
  }

  /**
   * Check if two users are in the same squad
   */
  async areInSameSquad(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data: squads1 } = await supabase
        .from('squad_members')
        .select('squad_id')
        .eq('user_id', userId1);

      const { data: squads2 } = await supabase
        .from('squad_members')
        .select('squad_id')
        .eq('user_id', userId2);

      if (!squads1 || !squads2) return false;

      const squadIds1 = squads1.map((s) => s.squad_id);
      const squadIds2 = squads2.map((s) => s.squad_id);

      return squadIds1.some((id) => squadIds2.includes(id));
    } catch (error) {
      logger.error('Error checking squad membership:', error);
      return false;
    }
  }

  /**
   * Update consistency scores for all squad members
   * Should be run daily or on-demand
   */
  async updateSquadConsistencyScores(squadId: string): Promise<void> {
    try {
      const members = await this.getSquadMembersRanked(squadId);

      for (const member of members) {
        const metrics = await this.calculateConsistencyScore(member.userId);

        await supabase
          .from('squad_members')
          .update({
            consistency_score: metrics.consistencyScore,
            streak: metrics.currentStreak,
          })
          .eq('squad_id', squadId)
          .eq('user_id', member.userId);
      }

      logger.info(`Updated consistency scores for squad ${squadId}`);
    } catch (error) {
      logger.error('Error updating squad consistency scores:', error);
    }
  }

  /**
   * Get user's rank within their squad
   */
  async getUserSquadRank(userId: string, squadId: string): Promise<number | null> {
    try {
      const members = await this.getSquadMembersRanked(squadId);
      const rank = members.findIndex((m) => m.userId === userId);
      return rank === -1 ? null : rank + 1;
    } catch (error) {
      logger.error('Error getting user squad rank:', error);
      return null;
    }
  }
}

// Singleton instance
export const socialConstraints = new SocialConstraintsService();
export default socialConstraints;
