/**
 * Soft Squad Component
 * Ultra-soft glassmorphic design for leaderboard and squad members
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { PASTEL_COLORS, SOFT_RADIUS } from '../../../design-system/aesthetics';
import { SPACING } from '../../../design-system/tokens';

interface SquadMember {
  id: string;
  name: string;
  rank: number;
  score: number;
  streak: number;
  avatar?: string;
}

export const SoftSquad: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';

  // Mock leaderboard data
  const leaderboard: SquadMember[] = [
    { id: '1', name: 'You (Joshua)', rank: 1, score: 985, streak: 14 },
    { id: '2', name: 'Alex Chen', rank: 2, score: 942, streak: 12 },
    { id: '3', name: 'Sarah Kim', rank: 3, score: 891, streak: 10 },
    { id: '4', name: 'Mike Torres', rank: 4, score: 847, streak: 8 },
    { id: '5', name: 'Emma Davis', rank: 5, score: 803, streak: 7 },
  ];

  const stats = {
    members: 5,
    topScore: 985,
    longestStreak: 14,
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return PASTEL_COLORS.accents.softOrange; // Gold
    if (rank === 2) return '#CBD5E1'; // Silver
    if (rank === 3) return PASTEL_COLORS.accents.softPink; // Bronze
    return secondaryTextColor;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return 'person';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Squad Stats */}
      <SoftGlassCard variant="prominent" gradient="purpleDream" style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>{stats.members}</Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Members</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>{stats.topScore}</Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Top Score</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>{stats.longestStreak}</Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Best Streak</Text>
          </View>
        </View>
      </SoftGlassCard>

      {/* Leaderboard Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Weekly League</Text>
        <Text style={[styles.sectionSubtitle, { color: secondaryTextColor }]}>
          Resets Sunday
        </Text>
      </View>

      {/* Leaderboard */}
      <View style={styles.leaderboard}>
        {leaderboard.map((member, index) => (
          <SoftGlassCard
            key={member.id}
            variant={member.rank === 1 ? 'prominent' : 'soft'}
            gradient={member.rank === 1 ? 'lavenderFog' : undefined}
            glowColor={member.rank === 1 ? PASTEL_COLORS.accents.softOrange : undefined}
            style={styles.memberCard}
          >
            <View style={styles.memberRow}>
              {/* Rank */}
              <View style={styles.rankContainer}>
                <Ionicons
                  name={getRankIcon(member.rank)}
                  size={24}
                  color={getRankColor(member.rank)}
                />
                {member.rank > 3 && (
                  <Text style={[styles.rankNumber, { color: secondaryTextColor }]}>
                    {member.rank}
                  </Text>
                )}
              </View>

              {/* Avatar Placeholder */}
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              >
                <Ionicons name="person" size={20} color={textColor} />
              </View>

              {/* Info */}
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: textColor }]}>{member.name}</Text>
                <View style={styles.memberStats}>
                  <Text style={[styles.memberScore, { color: secondaryTextColor }]}>
                    {member.score} pts
                  </Text>
                  <Text style={[styles.memberDot, { color: secondaryTextColor }]}> • </Text>
                  <Ionicons name="flame" size={12} color={PASTEL_COLORS.accents.softOrange} />
                  <Text style={[styles.memberStreak, { color: secondaryTextColor }]}>
                    {member.streak}
                  </Text>
                </View>
              </View>

              {/* Reaction Button */}
              <TouchableOpacity style={styles.reactionButton}>
                <Text style={styles.reactionIcon}>👋</Text>
              </TouchableOpacity>
            </View>
          </SoftGlassCard>
        ))}
      </View>

      {/* Reactions Dock */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Reactions</Text>

      <SoftGlassCard variant="soft" gradient="blueMist" style={styles.reactionsDock}>
        <View style={styles.reactionsRow}>
          <TouchableOpacity style={styles.reactionTile}>
            <Text style={styles.reactionTileIcon}>🔥</Text>
            <Text style={[styles.reactionTileLabel, { color: textColor }]}>Streak</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reactionTile}>
            <Text style={styles.reactionTileIcon}>💪</Text>
            <Text style={[styles.reactionTileLabel, { color: textColor }]}>Gains</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reactionTile}>
            <Text style={styles.reactionTileIcon}>👉</Text>
            <Text style={[styles.reactionTileLabel, { color: textColor }]}>Nudge</Text>
          </TouchableOpacity>
        </View>
      </SoftGlassCard>

      {/* Invite Friends */}
      <TouchableOpacity>
        <SoftGlassCard variant="soft" gradient="pinkSunset" style={styles.inviteCard}>
          <Ionicons name="person-add-outline" size={24} color={PASTEL_COLORS.accents.softPurple} />
          <Text style={[styles.inviteText, { color: textColor }]}>Invite Friends</Text>
        </SoftGlassCard>
      </TouchableOpacity>

      {/* Bottom Spacer */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  statsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '300',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '300',
  },
  leaderboard: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  memberCard: {
    padding: SPACING.lg,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberScore: {
    fontSize: 13,
    fontWeight: '300',
  },
  memberDot: {
    fontSize: 13,
  },
  memberStreak: {
    fontSize: 13,
    marginLeft: 2,
    fontWeight: '300',
  },
  reactionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionIcon: {
    fontSize: 20,
  },
  reactionsDock: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reactionTile: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reactionTileIcon: {
    fontSize: 32,
  },
  reactionTileLabel: {
    fontSize: 12,
    fontWeight: '300',
  },
  inviteCard: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  inviteText: {
    fontSize: 15,
    fontWeight: '400',
  },
});
