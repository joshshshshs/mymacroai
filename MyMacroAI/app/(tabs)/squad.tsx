/**
 * Social Hub Page - Complete Revamp
 * Leaderboard with podium, Feed with AI milestones
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useUserStore } from '@/src/store/UserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock leaderboard data
const GLOBAL_LEADERBOARD = [
  { id: '1', name: 'Mike R.', score: 10450, avatar: null, rank: 1 },
  { id: '2', name: 'Sarah K.', score: 9820, avatar: null, rank: 2 },
  { id: '3', name: 'Elena B.', score: 9105, avatar: null, rank: 3 },
  { id: '4', name: 'Alex M.', score: 8950, avatar: null, rank: 4 },
  { id: '5', name: 'Jordan T.', score: 8720, avatar: null, rank: 5 },
  { id: '6', name: 'Priya S.', score: 8540, avatar: null, rank: 6 },
  { id: '7', name: 'Liam O.', score: 8300, avatar: null, rank: 7 },
];

const FRIENDS_LEADERBOARD = [
  { id: '1', name: 'You', score: 2340, avatar: null, rank: 1, isUser: true },
  { id: '2', name: 'Jake W.', score: 2120, avatar: null, rank: 2 },
  { id: '3', name: 'Lily M.', score: 1980, avatar: null, rank: 3 },
  { id: '4', name: 'Ryan P.', score: 1650, avatar: null, rank: 4 },
];

// Mock AI milestone feed data
const MILESTONES = [
  {
    id: '1',
    user: 'Sarah K.',
    message: 'Hit 100 day streak! 🔥',
    time: '2h ago',
    reactions: 12,
    type: 'streak',
  },
  {
    id: '2',
    user: 'Mike R.',
    message: 'Reached protein goal 7 days straight 💪',
    time: '4h ago',
    reactions: 8,
    type: 'protein',
  },
  {
    id: '3',
    user: 'Elena B.',
    message: 'Lost 5kg this month! 🎉',
    time: '6h ago',
    reactions: 24,
    type: 'weight',
  },
  {
    id: '4',
    user: 'Alex M.',
    message: 'Completed 30 day challenge 🏆',
    time: '1d ago',
    reactions: 15,
    type: 'challenge',
  },
];

type MainTab = 'leaderboard' | 'feed';
type LeaderboardFilter = 'global' | 'friends';

export default function SocialHubScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { light } = useHaptics();
  const user = useUserStore((state) => state.user);
  const preferences = useUserStore((state) => state.preferences);

  const [mainTab, setMainTab] = useState<MainTab>('leaderboard');
  const [leaderboardFilter, setLeaderboardFilter] = useState<LeaderboardFilter>('global');

  // Custom reaction emojis from preferences with fallback defaults
  const reactionEmojis = preferences?.customReactionEmojis?.length
    ? preferences.customReactionEmojis
    : ['🔥', '💪', '👏', '❤️'];

  // Colors
  const colors = {
    bg: isDark ? '#121214' : '#F2F2F4',
    card: isDark ? '#1E1E20' : '#FFFFFF',
    cardAlt: isDark ? '#2C2C2E' : '#E8E8EA',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    accent: '#FF5C00', // Vitamin Orange - consistent with app design
    gold: '#FFC107',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  };

  const leaderboardData = leaderboardFilter === 'global' ? GLOBAL_LEADERBOARD : FRIENDS_LEADERBOARD;
  const podiumData = leaderboardData.slice(0, 3);
  const runnersUp = leaderboardData.slice(3);

  const getRankBorderColor = (rank: number) => {
    if (rank === 1) return colors.gold;
    if (rank === 2) return colors.silver;
    if (rank === 3) return colors.bronze;
    return colors.border;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'streak': return 'flame';
      case 'protein': return 'barbell';
      case 'weight': return 'scale';
      case 'challenge': return 'trophy';
      default: return 'star';
    }
  };

  // User's global rank (mock)
  const userRank = 4021;
  const userScore = 2340;
  const userPercentile = 45;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => { light(); router.push('/(modals)/add-friend' as any); }}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Social Hub</Text>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => { light(); router.push('/(modals)/referrals' as any); }}
          >
            <Ionicons name="gift-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Main Tab Selector */}
        <View style={[styles.mainTabContainer, { backgroundColor: colors.cardAlt }]}>
          <TouchableOpacity
            style={[
              styles.mainTab,
              mainTab === 'leaderboard' && [styles.mainTabActive, { backgroundColor: colors.card }],
            ]}
            onPress={() => { light(); setMainTab('leaderboard'); }}
          >
            <Text style={[
              styles.mainTabText,
              { color: mainTab === 'leaderboard' ? colors.text : colors.textSecondary },
              mainTab === 'leaderboard' && styles.mainTabTextActive,
            ]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mainTab,
              mainTab === 'feed' && [styles.mainTabActive, { backgroundColor: colors.card }],
            ]}
            onPress={() => { light(); setMainTab('feed'); }}
          >
            <Text style={[
              styles.mainTabText,
              { color: mainTab === 'feed' ? colors.text : colors.textSecondary },
              mainTab === 'feed' && styles.mainTabTextActive,
            ]}>
              Feed
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {mainTab === 'leaderboard' ? (
            <>
              {/* Global / Friends Filter */}
              <View style={styles.filterContainer}>
                <View style={[styles.filterPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      leaderboardFilter === 'global' && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => { light(); setLeaderboardFilter('global'); }}
                  >
                    <Text style={[
                      styles.filterText,
                      { color: leaderboardFilter === 'global' ? '#FFFFFF' : colors.textSecondary },
                    ]}>
                      Global
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      leaderboardFilter === 'friends' && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => { light(); setLeaderboardFilter('friends'); }}
                  >
                    <Text style={[
                      styles.filterText,
                      { color: leaderboardFilter === 'friends' ? '#FFFFFF' : colors.textSecondary },
                    ]}>
                      Friends
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Podium */}
              <View style={styles.podiumContainer}>
                {/* 2nd Place */}
                <View style={styles.podiumSlot}>
                  <View style={[styles.podiumAvatar, styles.podiumAvatarSmall, { borderColor: colors.silver }]}>
                    <LinearGradient
                      colors={isDark ? ['#3A3A3C', '#2C2C2E'] : ['#E5E7EB', '#D1D5DB']}
                      style={styles.avatarGradient}
                    >
                      <Text style={[styles.avatarInitials, { color: colors.textSecondary }]}>
                        {getInitials(podiumData[1]?.name || 'UK')}
                      </Text>
                    </LinearGradient>
                    <View style={[styles.rankBadge, { backgroundColor: colors.silver }]}>
                      <Text style={styles.rankBadgeText}>#2</Text>
                    </View>
                  </View>
                  <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                    {podiumData[1]?.name || 'Unknown'}
                  </Text>
                  <Text style={[styles.podiumScore, { color: colors.textSecondary }]}>
                    {podiumData[1]?.score?.toLocaleString() || 0}
                  </Text>
                </View>

                {/* 1st Place */}
                <View style={[styles.podiumSlot, styles.podiumSlotFirst]}>
                  <Ionicons name="trophy" size={28} color={colors.gold} style={styles.trophyIcon} />
                  <View style={[styles.podiumAvatar, styles.podiumAvatarLarge, { borderColor: colors.gold }]}>
                    <LinearGradient
                      colors={['#FEF3C7', '#FCD34D']}
                      style={styles.avatarGradient}
                    >
                      <Text style={[styles.avatarInitialsLarge, { color: '#92400E' }]}>
                        {getInitials(podiumData[0]?.name || 'UK')}
                      </Text>
                    </LinearGradient>
                    <View style={[styles.rankBadgeLarge, { backgroundColor: colors.gold }]}>
                      <Text style={styles.rankBadgeTextLarge}>#1</Text>
                    </View>
                  </View>
                  <Text style={[styles.podiumNameFirst, { color: colors.text }]} numberOfLines={1}>
                    {podiumData[0]?.name || 'Unknown'}
                  </Text>
                  <Text style={[styles.podiumScoreFirst, { color: colors.accent }]}>
                    {podiumData[0]?.score?.toLocaleString() || 0}
                  </Text>
                </View>

                {/* 3rd Place */}
                <View style={styles.podiumSlot}>
                  <View style={[styles.podiumAvatar, styles.podiumAvatarSmall, { borderColor: colors.bronze }]}>
                    <LinearGradient
                      colors={['#D6BCAB', '#B08968']}
                      style={styles.avatarGradient}
                    >
                      <Text style={[styles.avatarInitials, { color: '#5C4033' }]}>
                        {getInitials(podiumData[2]?.name || 'UK')}
                      </Text>
                    </LinearGradient>
                    <View style={[styles.rankBadge, { backgroundColor: colors.bronze }]}>
                      <Text style={styles.rankBadgeText}>#3</Text>
                    </View>
                  </View>
                  <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                    {podiumData[2]?.name || 'Unknown'}
                  </Text>
                  <Text style={[styles.podiumScore, { color: colors.textSecondary }]}>
                    {podiumData[2]?.score?.toLocaleString() || 0}
                  </Text>
                </View>
              </View>

              {/* Your Rank Card */}
              {leaderboardFilter === 'global' && (
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                  <View style={[styles.userRankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <LinearGradient
                      colors={[isDark ? 'rgba(234,104,66,0.1)' : 'rgba(234,104,66,0.05)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.userRankLeft}>
                      <View style={styles.rankLabel}>
                        <Text style={[styles.rankLabelText, { color: colors.textSecondary }]}>RANK</Text>
                        <Text style={[styles.rankValue, { color: colors.accent }]}>#{userRank.toLocaleString()}</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.userInfo}>
                        <View style={[styles.userAvatar, { backgroundColor: `${colors.accent}20`, borderColor: `${colors.accent}30` }]}>
                          <Ionicons name="person" size={20} color={colors.accent} />
                        </View>
                        <View>
                          <Text style={[styles.userName, { color: colors.text }]}>You</Text>
                          <Text style={[styles.userPercentile, { color: colors.textSecondary }]}>Top {userPercentile}%</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.userRankRight}>
                      <Text style={[styles.userScore, { color: colors.text }]}>{userScore.toLocaleString()}</Text>
                      <Text style={[styles.userScoreLabel, { color: colors.textSecondary }]}>pts</Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Runners Up */}
              {runnersUp.length > 0 && (
                <View style={styles.runnersUpSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TOP RUNNERS UP</Text>
                  {runnersUp.map((player, index) => (
                    <Animated.View
                      key={player.id}
                      entering={FadeInDown.delay(150 + index * 50).duration(400)}
                    >
                      <View style={[styles.runnerCard, { backgroundColor: colors.card }]}>
                        <View style={styles.runnerLeft}>
                          <Text style={[styles.runnerRank, { color: colors.textSecondary }]}>{player.rank}</Text>
                          <View style={[styles.runnerAvatar, { backgroundColor: colors.cardAlt }]}>
                            <Text style={[styles.runnerInitials, { color: colors.textSecondary }]}>
                              {getInitials(player.name)}
                            </Text>
                          </View>
                          <Text style={[styles.runnerName, { color: colors.text }]}>{player.name}</Text>
                        </View>
                        <Text style={[styles.runnerScore, { color: colors.text }]}>
                          {player.score.toLocaleString()}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              )}
            </>
          ) : (
            /* Feed Tab */
            <View style={styles.feedSection}>
              <Text style={[styles.feedHeader, { color: colors.textSecondary }]}>
                AI MILESTONE SUMMARIES
              </Text>
              {MILESTONES.map((milestone, index) => (
                <Animated.View
                  key={milestone.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                >
                  <TouchableOpacity
                    style={[styles.milestoneCard, { backgroundColor: colors.card }]}
                    onPress={() => { light(); /* Navigate to friend profile */ }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.milestoneHeader}>
                      <View style={[styles.milestoneAvatar, { backgroundColor: `${colors.accent}15` }]}>
                        <Ionicons name={getMilestoneIcon(milestone.type) as any} size={18} color={colors.accent} />
                      </View>
                      <View style={styles.milestoneInfo}>
                        <Text style={[styles.milestoneName, { color: colors.text }]}>{milestone.user}</Text>
                        <Text style={[styles.milestoneTime, { color: colors.textSecondary }]}>{milestone.time}</Text>
                      </View>
                    </View>
                    <Text style={[styles.milestoneMessage, { color: colors.text }]}>
                      {milestone.message}
                    </Text>
                    <View style={styles.milestoneActions}>
                      {reactionEmojis.map((emoji, emojiIndex) => (
                        <TouchableOpacity
                          key={emojiIndex}
                          style={[styles.reactionButton, { backgroundColor: colors.cardAlt }]}
                          onPress={() => light()}
                        >
                          <Text style={styles.reactionEmoji}>{emoji}</Text>
                          {emojiIndex === 0 && (
                            <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
                              {milestone.reactions}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* Bottom spacing for nav bar */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  mainTabContainer: {
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  mainTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mainTabTextActive: {
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  filterContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  filterPill: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
  },
  filterOption: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    paddingTop: 20,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  podiumSlotFirst: {
    marginTop: -20,
  },
  trophyIcon: {
    marginBottom: 4,
  },
  podiumAvatar: {
    borderWidth: 4,
    borderRadius: 100,
    padding: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  podiumAvatarSmall: {
    width: 72,
    height: 72,
  },
  podiumAvatarLarge: {
    width: 88,
    height: 88,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
  },
  avatarInitialsLarge: {
    fontSize: 26,
    fontWeight: '700',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -14 }],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rankBadgeLarge: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: [{ translateX: -16 }],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  rankBadgeTextLarge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  podiumNameFirst: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: '500',
  },
  podiumScoreFirst: {
    fontSize: 13,
    fontWeight: '700',
  },
  userRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankLabel: {
    alignItems: 'center',
    minWidth: 60,
  },
  rankLabelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  rankValue: {
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userPercentile: {
    fontSize: 12,
  },
  userRankRight: {
    alignItems: 'flex-end',
  },
  userScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  userScoreLabel: {
    fontSize: 10,
  },
  runnersUpSection: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    paddingLeft: 4,
  },
  runnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  runnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  runnerRank: {
    fontSize: 14,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  runnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runnerInitials: {
    fontSize: 14,
    fontWeight: '600',
  },
  runnerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  runnerScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  feedSection: {
    marginTop: SPACING.md,
  },
  feedHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    paddingLeft: 4,
  },
  milestoneCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  milestoneAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '600',
  },
  milestoneTime: {
    fontSize: 12,
  },
  milestoneMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  milestoneActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
