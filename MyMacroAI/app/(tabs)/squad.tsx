/**
 * Social Hub Page - Premium Redesign with Global/Friends Toggle
 * 
 * Features:
 * - Light and Dark mode support with gradient mesh
 * - Global vs Friends leaderboard toggle
 * - Stories carousel for recent activity
 * - Premium glassmorphism cards
 * - Animated podium with rankings
 * - Enhanced feed with milestone cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { GradientMeshBackground } from '@/src/components/ui/GradientMeshBackground';
import { SPACING } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// THEME COLORS
// ============================================================================

const getColors = (isDark: boolean) => ({
  // Backgrounds
  bg: isDark ? '#0A0A0C' : '#F8F9FA',
  bgSecondary: isDark ? '#141418' : '#FFFFFF',

  // Surfaces
  surface: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  surfaceElevated: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
  card: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',

  // Accent
  accent: '#FF5C00',
  accentLight: '#FF8A50',
  accentBg: isDark ? 'rgba(255, 92, 0, 0.12)' : 'rgba(255, 92, 0, 0.08)',

  // Text
  text: isDark ? '#FFFFFF' : '#1A1A1A',
  textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
  textMuted: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',

  // Borders
  border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',

  // Status & Medals
  gold: '#FFD700',
  goldBg: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.2)',
  silver: '#C0C0C0',
  silverBg: isDark ? 'rgba(192, 192, 192, 0.15)' : 'rgba(192, 192, 192, 0.2)',
  bronze: '#CD7F32',
  bronzeBg: isDark ? 'rgba(205, 127, 50, 0.15)' : 'rgba(205, 127, 50, 0.2)',
  success: '#22C55E',

  // Blur
  blurIntensity: isDark ? 20 : 50,
  blurTint: isDark ? 'dark' : 'light' as 'dark' | 'light',
});

const ACHIEVEMENT_COLORS: Record<string, [string, string]> = {
  streak: ['#FF5C00', '#FF8A50'],
  protein: ['#10B981', '#34D399'],
  weight: ['#A855F7', '#C084FC'],
  challenge: ['#F59E0B', '#FBBF24'],
};

// Stories data
const STORIES = [
  { id: 'add', type: 'add' as const, name: 'Share', hasNew: false, color: '#FF5C00' },
  { id: '1', type: 'user' as const, name: 'Sarah', hasNew: true, color: '#FF5C00' },
  { id: '2', type: 'user' as const, name: 'Mike', hasNew: true, color: '#A855F7' },
  { id: '3', type: 'user' as const, name: 'Elena', hasNew: false, color: '#3B82F6' },
  { id: '4', type: 'user' as const, name: 'Jake', hasNew: true, color: '#22C55E' },
  { id: '5', type: 'user' as const, name: 'Lily', hasNew: false, color: '#EC4899' },
];

// Milestone data
const MILESTONES = [
  {
    id: '1',
    user: 'Sarah K.',
    message: 'Just hit 100 day streak! 🔥',
    description: 'Logged meals consistently for 100 days',
    time: '2h ago',
    totalReactions: 24,
    type: 'streak',
    badge: '💯',
    isVerified: true,
  },
  {
    id: '2',
    user: 'Mike R.',
    message: 'Reached protein goal 7 days straight 💪',
    description: 'Hit 180g protein every day this week',
    time: '4h ago',
    totalReactions: 16,
    type: 'protein',
    badge: '🏆',
    isVerified: true,
  },
  {
    id: '3',
    user: 'Elena B.',
    message: 'Lost 5kg this month! 🎉',
    description: 'Steady progress with disciplined tracking',
    time: '6h ago',
    totalReactions: 45,
    type: 'weight',
    badge: '⭐',
    isVerified: false,
  },
];

// Leaderboard data
const GLOBAL_LEADERBOARD = [
  { id: '1', name: 'Mike R.', score: 10450, rank: 1, streak: 142, trend: 'up' },
  { id: '2', name: 'Sarah K.', score: 9820, rank: 2, streak: 89, trend: 'up' },
  { id: '3', name: 'Elena B.', score: 9105, rank: 3, streak: 67, trend: 'down' },
  { id: '4', name: 'Alex M.', score: 8950, rank: 4, streak: 54, trend: 'up' },
  { id: '5', name: 'Jordan T.', score: 8720, rank: 5, streak: 48, trend: 'same' },
  { id: '6', name: 'Casey L.', score: 8540, rank: 6, streak: 42, trend: 'up' },
];

const FRIENDS_LEADERBOARD = [
  { id: '1', name: 'Sarah K.', score: 9820, rank: 1, streak: 89, trend: 'up' },
  { id: '2', name: 'Alex M.', score: 8950, rank: 2, streak: 54, trend: 'up' },
  { id: '3', name: 'You', score: 7250, rank: 3, streak: 32, trend: 'up', isYou: true },
  { id: '4', name: 'Jordan T.', score: 6720, rank: 4, streak: 28, trend: 'down' },
];

type MainTab = 'feed' | 'leaderboard';
type LeaderboardScope = 'global' | 'friends';

// ============================================================================
// COMPONENTS
// ============================================================================

const PulsingDot: React.FC<{ color: string }> = ({ color }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, dotStyle]} />
  );
};

const StoryBubble: React.FC<{
  story: typeof STORIES[0];
  index: number;
  colors: ReturnType<typeof getColors>;
}> = ({ story, index, colors }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  if (story.type === 'add') {
    return (
      <Animated.View entering={SlideInRight.delay(index * 50).duration(300)}>
        <TouchableOpacity
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          onPressIn={() => { scale.value = 0.95; }}
          onPressOut={() => { scale.value = 1; }}
          style={styles.storyContainer}
        >
          <Animated.View style={animatedStyle}>
            <LinearGradient
              colors={[colors.accent, colors.accentLight]}
              style={styles.addStoryButton}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.storyName, { color: colors.textSecondary }]}>{story.name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={SlideInRight.delay(index * 50).duration(300)}>
      <TouchableOpacity
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        onPressIn={() => { scale.value = 0.95; }}
        onPressOut={() => { scale.value = 1; }}
        style={styles.storyContainer}
      >
        <Animated.View style={animatedStyle}>
          <View style={[styles.storyRing, story.hasNew ? { borderColor: story.color } : { borderColor: colors.border }]}>
            <View style={[styles.storyAvatar, { backgroundColor: `${story.color}25` }]}>
              <Text style={[styles.storyInitial, { color: story.color }]}>
                {story.name?.[0] || '?'}
              </Text>
            </View>
          </View>
        </Animated.View>
        <Text style={[styles.storyName, { color: colors.textSecondary }]} numberOfLines={1}>{story.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MilestoneCard: React.FC<{
  milestone: typeof MILESTONES[0];
  index: number;
  colors: ReturnType<typeof getColors>;
}> = ({ milestone, index, colors }) => {
  const [liked, setLiked] = useState(false);
  const likeScale = useSharedValue(1);
  const gradientColors = ACHIEVEMENT_COLORS[milestone.type] || ACHIEVEMENT_COLORS.streak;

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked(!liked);
    likeScale.value = withSequence(withSpring(1.4), withSpring(1));
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <View style={[styles.milestoneCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        {/* Accent bar */}
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.milestoneAccent} />

        {/* Header */}
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneUserInfo}>
            <LinearGradient colors={gradientColors} style={styles.milestoneAvatar}>
              <Text style={styles.milestoneAvatarText}>{getInitials(milestone.user)}</Text>
            </LinearGradient>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.milestoneName, { color: colors.text }]}>{milestone.user}</Text>
                {milestone.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
                )}
              </View>
              <Text style={[styles.milestoneTime, { color: colors.textMuted }]}>{milestone.time}</Text>
            </View>
          </View>
          <View style={[styles.milestoneBadge, { backgroundColor: `${gradientColors[0]}15` }]}>
            <Text style={styles.milestoneBadgeEmoji}>{milestone.badge}</Text>
          </View>
        </View>

        {/* Content */}
        <Text style={[styles.milestoneMessage, { color: colors.text }]}>{milestone.message}</Text>
        <Text style={[styles.milestoneDescription, { color: colors.textSecondary }]}>{milestone.description}</Text>

        {/* Actions */}
        <View style={[styles.milestoneActions, { borderTopColor: colors.border }]}>
          <View style={styles.reactionButtons}>
            <TouchableOpacity
              style={[styles.reactionBtn, { backgroundColor: colors.surface }, liked && { backgroundColor: colors.accentBg }]}
              onPress={handleLike}
            >
              <Animated.View style={likeAnimatedStyle}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.accent : colors.textSecondary} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.reactionBtn, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.reactionBtn, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 16 }}>💪</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.reactionCount}>
            <Ionicons name="heart" size={12} color={colors.accent} />
            <Text style={[styles.reactionCountText, { color: colors.textSecondary }]}>{milestone.totalReactions + (liked ? 1 : 0)}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const PodiumPlayer: React.FC<{
  player: typeof GLOBAL_LEADERBOARD[0];
  position: 'first' | 'second' | 'third';
  colors: ReturnType<typeof getColors>;
}> = ({ player, position, colors }) => {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const config = {
    first: {
      size: 72,
      marginTop: 0,
      ringColor: colors.gold,
      bgColor: colors.goldBg,
      gradientColors: ['#FFE066', '#FFD700', '#FFC107'] as [string, string, string],
      textColor: '#8B6914',
      emoji: '👑',
    },
    second: {
      size: 56,
      marginTop: 24,
      ringColor: colors.silver,
      bgColor: colors.silverBg,
      gradientColors: ['#E8E8E8', '#C0C0C0', '#A8A8A8'] as [string, string, string],
      textColor: '#5A5A5A',
      rank: '2',
    },
    third: {
      size: 56,
      marginTop: 24,
      ringColor: colors.bronze,
      bgColor: colors.bronzeBg,
      gradientColors: ['#D6A56A', '#CD7F32', '#B87333'] as [string, string, string],
      textColor: '#5C4033',
      rank: '3',
    },
  };

  const c = config[position];

  return (
    <View style={[styles.podiumSlot, { marginTop: c.marginTop }]}>
      {position === 'first' && (
        <Text style={styles.crownEmoji}>👑</Text>
      )}
      <View style={[styles.podiumAvatarRing, { width: c.size + 8, height: c.size + 8, borderColor: c.ringColor }]}>
        <LinearGradient colors={c.gradientColors} style={[styles.podiumAvatar, { width: c.size, height: c.size }]}>
          <Text style={[styles.podiumAvatarText, { color: c.textColor, fontSize: position === 'first' ? 22 : 18 }]}>
            {getInitials(player.name)}
          </Text>
        </LinearGradient>
        <View style={[styles.podiumRankBadge, { backgroundColor: c.ringColor }]}>
          <Text style={styles.podiumRankText}>{position === 'first' ? '1' : c.rank}</Text>
        </View>
      </View>
      <Text style={[styles.podiumPlayerName, { color: colors.text }]} numberOfLines={1}>{player.name}</Text>
      <Text style={[styles.podiumScore, { color: position === 'first' ? colors.accent : colors.textSecondary }]}>
        {player.score.toLocaleString()}
      </Text>
      {position === 'first' && (
        <View style={[styles.streakBadge, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="flame" size={12} color={colors.accent} />
          <Text style={styles.streakText}>{player.streak}d</Text>
        </View>
      )}
    </View>
  );
};

const LeaderboardRow: React.FC<{
  player: typeof GLOBAL_LEADERBOARD[0] & { isYou?: boolean };
  index: number;
  colors: ReturnType<typeof getColors>;
}> = ({ player, index, colors }) => {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');
  const trendIcon = player.trend === 'up' ? 'arrow-up' : player.trend === 'down' ? 'arrow-down' : 'remove';
  const trendColor = player.trend === 'up' ? colors.success : player.trend === 'down' ? '#EF4444' : colors.textMuted;

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 60).duration(400)}>
      <View style={[
        styles.leaderRow,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        player.isYou && { borderColor: colors.accent, borderWidth: 1.5 }
      ]}>
        <View style={styles.leaderLeft}>
          <View style={[styles.leaderRankBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.leaderRankNum, { color: colors.text }]}>{player.rank}</Text>
          </View>
          <View style={[styles.leaderAvatar, { backgroundColor: colors.surface }]}>
            <Text style={[styles.leaderAvatarText, { color: colors.textSecondary }]}>{getInitials(player.name)}</Text>
          </View>
          <View>
            <Text style={[styles.leaderName, { color: colors.text }]}>
              {player.name}
              {player.isYou && <Text style={{ color: colors.accent }}> (You)</Text>}
            </Text>
            <View style={styles.leaderMeta}>
              <Ionicons name="flame" size={12} color={colors.accent} />
              <Text style={[styles.leaderStreakText, { color: colors.textSecondary }]}>{player.streak}d streak</Text>
            </View>
          </View>
        </View>
        <View style={styles.leaderRight}>
          <Text style={[styles.leaderScore, { color: colors.text }]}>{player.score.toLocaleString()}</Text>
          <Ionicons name={trendIcon as any} size={14} color={trendColor} />
        </View>
      </View>
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SocialHubScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const router = useRouter();

  const [mainTab, setMainTab] = useState<MainTab>('feed');
  const [leaderboardScope, setLeaderboardScope] = useState<LeaderboardScope>('global');

  const leaderboardData = leaderboardScope === 'global' ? GLOBAL_LEADERBOARD : FRIENDS_LEADERBOARD;
  const topThree = leaderboardData.slice(0, 3);
  const restOfList = leaderboardData.slice(3);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background */}
      <GradientMeshBackground variant="social" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/(modals)/add-friend' as any);
            }}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Social</Text>
            <View style={styles.liveBadge}>
              <PulsingDot color={colors.success} />
              <Text style={[styles.liveText, { color: colors.success }]}>LIVE</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.accentBg }]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/(modals)/referrals' as any);
            }}
          >
            <Ionicons name="gift-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </Animated.View>

        {/* Tab Selector */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tabWrapper}>
          <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(['feed', 'leaderboard'] as MainTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, mainTab === tab && [styles.tabActive, { backgroundColor: colors.surfaceElevated }]]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMainTab(tab);
                }}
              >
                <Ionicons
                  name={tab === 'feed' ? 'newspaper-outline' : 'podium-outline'}
                  size={16}
                  color={mainTab === tab ? colors.accent : colors.textSecondary}
                />
                <Text style={[styles.tabText, { color: mainTab === tab ? colors.text : colors.textSecondary }]}>
                  {tab === 'feed' ? 'Feed' : 'Leaderboard'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {mainTab === 'feed' ? (
            <>
              {/* Stories */}
              <View style={styles.storiesSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.storiesScroll}
                >
                  {STORIES.map((story, index) => (
                    <StoryBubble
                      key={story.id}
                      story={story}
                      index={index}
                      colors={colors}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Milestones */}
              <View style={styles.milestonesSection}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MILESTONES</Text>
                {MILESTONES.map((milestone, index) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                    colors={colors}
                  />
                ))}
              </View>
            </>
          ) : (
            /* Leaderboard */
            <View style={styles.leaderboardSection}>
              {/* Global / Friends Toggle */}
              <Animated.View entering={FadeIn.duration(400)} style={styles.scopeToggleWrapper}>
                <View style={[styles.scopeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {(['global', 'friends'] as LeaderboardScope[]).map((scope) => (
                    <TouchableOpacity
                      key={scope}
                      style={[
                        styles.scopeOption,
                        leaderboardScope === scope && [styles.scopeOptionActive, { backgroundColor: colors.surfaceElevated }]
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setLeaderboardScope(scope);
                      }}
                    >
                      <Ionicons
                        name={scope === 'global' ? 'globe-outline' : 'people-outline'}
                        size={16}
                        color={leaderboardScope === scope ? colors.accent : colors.textSecondary}
                      />
                      <Text style={[
                        styles.scopeText,
                        { color: leaderboardScope === scope ? colors.text : colors.textSecondary }
                      ]}>
                        {scope === 'global' ? 'Global' : 'Friends'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              {/* Podium */}
              <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.podiumSection}>
                <View style={[styles.podiumGlow, { backgroundColor: colors.accentBg }]} />
                <View style={styles.podiumContainer}>
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <PodiumPlayer player={topThree[1]} position="second" colors={colors} />
                  )}
                  {/* 1st Place */}
                  {topThree[0] && (
                    <PodiumPlayer player={topThree[0]} position="first" colors={colors} />
                  )}
                  {/* 3rd Place */}
                  {topThree[2] && (
                    <PodiumPlayer player={topThree[2]} position="third" colors={colors} />
                  )}
                </View>
              </Animated.View>

              {/* Rankings List */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>RANKINGS</Text>
              {restOfList.map((player, index) => (
                <LeaderboardRow key={player.id} player={player} index={index} colors={colors} />
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  liveText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // Tabs
  tabWrapper: { paddingHorizontal: SPACING.lg },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '600' },

  content: { paddingTop: SPACING.lg },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  // Stories
  storiesSection: { marginBottom: SPACING.md },
  storiesScroll: { paddingHorizontal: SPACING.lg, gap: 14 },
  storyContainer: { alignItems: 'center', width: 64 },
  addStoryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    padding: 3,
  },
  storyAvatar: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitial: { fontSize: 20, fontWeight: '700' },
  storyName: { fontSize: 11, marginTop: 6 },

  // Milestones
  milestonesSection: { paddingHorizontal: SPACING.lg },
  milestoneCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    padding: SPACING.md,
  },
  milestoneAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  milestoneUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  milestoneAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneAvatarText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  milestoneName: { fontSize: 15, fontWeight: '600' },
  milestoneTime: { fontSize: 12, marginTop: 2 },
  milestoneBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneBadgeEmoji: { fontSize: 18 },
  milestoneMessage: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: 4 },
  milestoneDescription: { fontSize: 14, marginBottom: SPACING.sm },
  milestoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  reactionButtons: { flexDirection: 'row', gap: 8 },
  reactionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactionCountText: { fontSize: 13, fontWeight: '600' },

  // Scope Toggle
  scopeToggleWrapper: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  scopeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  scopeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scopeOptionActive: {},
  scopeText: { fontSize: 13, fontWeight: '600' },

  // Leaderboard
  leaderboardSection: {},
  podiumSection: { marginBottom: SPACING.lg, position: 'relative' },
  podiumGlow: {
    position: 'absolute',
    top: '35%',
    left: '20%',
    width: '60%',
    height: 80,
    borderRadius: 40,
    opacity: 0.6,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 30,
    paddingHorizontal: SPACING.lg,
  },
  podiumSlot: { flex: 1, alignItems: 'center' },
  crownEmoji: { fontSize: 28, marginBottom: 4 },
  podiumAvatarRing: {
    borderWidth: 3,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  podiumAvatar: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarText: { fontWeight: '800' },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRankText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  podiumPlayerName: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  podiumScore: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: { fontSize: 11, fontWeight: '700', color: '#FF5C00' },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  leaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leaderRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderRankNum: { fontSize: 13, fontWeight: '700' },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderAvatarText: { fontSize: 14, fontWeight: '600' },
  leaderName: { fontSize: 15, fontWeight: '600' },
  leaderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  leaderStreakText: { fontSize: 11 },
  leaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaderScore: { fontSize: 16, fontWeight: '700' },
});
