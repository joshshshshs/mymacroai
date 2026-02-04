/**
 * Squad Ranking - Premium Leaderboard Redesign
 * Global & Friends tabs with animated podium and modern design
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';
import { socialConstraints, ConsistencyMetrics } from '@/src/services/social/SocialConstraints';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RankedMember {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  metrics: ConsistencyMetrics;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

type TabType = 'global' | 'friends';

export default function SquadRankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [refreshing, setRefreshing] = useState(false);
  const [rankings, setRankings] = useState<RankedMember[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('global');

  const colors = {
    bg: isDark ? '#0A0A0C' : '#F8F9FA',
    card: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textMuted: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
    tabActive: '#FF5C00',
    tabInactive: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { gradient: ['#FFD700', '#FFA500'], icon: 'trophy', size: 'large' };
      case 2: return { gradient: ['#C0C0C0', '#A8A8A8'], icon: 'medal', size: 'medium' };
      case 3: return { gradient: ['#CD7F32', '#A0522D'], icon: 'ribbon', size: 'small' };
      default: return { gradient: ['#6B7280', '#4B5563'], icon: null, size: 'normal' };
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return { icon: 'caret-up', color: '#10B981' };
      case 'down': return { icon: 'caret-down', color: '#EF4444' };
      default: return { icon: 'remove', color: colors.textMuted };
    }
  };

  // Top 3 for podium
  const topThree = rankings.slice(0, 3);
  const restOfRankings = rankings.slice(3);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#0A0A0C', '#141418', '#0A0A0C'] : ['#F8F9FA', '#FFFFFF', '#F8F9FA']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/add-friend' as any)}
            style={[styles.headerButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={[styles.tabBackground, { backgroundColor: colors.tabInactive }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'global' && { backgroundColor: colors.tabActive }
              ]}
              onPress={() => handleTabChange('global')}
            >
              <Ionicons
                name="globe-outline"
                size={16}
                color={activeTab === 'global' ? '#FFF' : colors.textMuted}
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'global' ? '#FFF' : colors.textMuted }
              ]}>Global</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'friends' && { backgroundColor: colors.tabActive }
              ]}
              onPress={() => handleTabChange('friends')}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={activeTab === 'friends' ? '#FFF' : colors.textMuted}
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'friends' ? '#FFF' : colors.textMuted }
              ]}>Friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
          }
        >
          {rankings.length === 0 ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
                <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeTab === 'global' ? 'No Global Rankings Yet' : 'No Friends Added'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeTab === 'global'
                  ? 'Start logging consistently to appear on the leaderboard'
                  : 'Add friends to compete on the leaderboard'}
              </Text>
              {activeTab === 'friends' && (
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={() => router.push('/(modals)/add-friend' as any)}
                >
                  <LinearGradient
                    colors={['#FF5C00', '#FF8A50']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addFriendGradient}
                  >
                    <Ionicons name="person-add" size={18} color="#FFF" />
                    <Text style={styles.addFriendText}>Add Friends</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            <>
              {/* Podium for Top 3 */}
              {topThree.length >= 3 && (
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.podiumContainer}>
                  {/* 2nd Place */}
                  <View style={styles.podiumItem}>
                    <View style={[styles.podiumAvatar, styles.podiumSecond, { borderColor: '#C0C0C0' }]}>
                      <Text style={styles.podiumInitial}>{topThree[1].username.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                      {topThree[1].username}
                    </Text>
                    <Text style={[styles.podiumScore, { color: '#C0C0C0' }]}>{topThree[1].score}</Text>
                    <View style={[styles.podiumBase, styles.podiumBaseSecond, { backgroundColor: colors.card }]}>
                      <Text style={[styles.podiumRank, { color: '#C0C0C0' }]}>2</Text>
                    </View>
                  </View>

                  {/* 1st Place */}
                  <View style={styles.podiumItem}>
                    <View style={[styles.podiumCrown]}>
                      <Ionicons name="trophy" size={24} color="#FFD700" />
                    </View>
                    <View style={[styles.podiumAvatar, styles.podiumFirst, { borderColor: '#FFD700' }]}>
                      <Text style={[styles.podiumInitial, styles.podiumInitialFirst]}>
                        {topThree[0].username.charAt(0)}
                      </Text>
                    </View>
                    <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                      {topThree[0].username}
                    </Text>
                    <Text style={[styles.podiumScore, { color: '#FFD700' }]}>{topThree[0].score}</Text>
                    <View style={[styles.podiumBase, styles.podiumBaseFirst]}>
                      <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={[styles.podiumRank, { color: '#FFF' }]}>1</Text>
                    </View>
                  </View>

                  {/* 3rd Place */}
                  <View style={styles.podiumItem}>
                    <View style={[styles.podiumAvatar, styles.podiumThird, { borderColor: '#CD7F32' }]}>
                      <Text style={styles.podiumInitial}>{topThree[2].username.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                      {topThree[2].username}
                    </Text>
                    <Text style={[styles.podiumScore, { color: '#CD7F32' }]}>{topThree[2].score}</Text>
                    <View style={[styles.podiumBase, styles.podiumBaseThird, { backgroundColor: colors.card }]}>
                      <Text style={[styles.podiumRank, { color: '#CD7F32' }]}>3</Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Rest of Rankings */}
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>FULL RANKINGS</Text>
                {rankings.map((member, index) => {
                  const trend = getTrendIcon(member.trend);
                  const isTopThree = member.rank <= 3;

                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[styles.rankCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                      activeOpacity={0.8}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <View style={[
                        styles.rankNumber,
                        isTopThree && { backgroundColor: `${getRankStyle(member.rank).gradient[0]}20` }
                      ]}>
                        <Text style={[
                          styles.rankText,
                          { color: isTopThree ? getRankStyle(member.rank).gradient[0] : colors.textSecondary }
                        ]}>
                          {member.rank}
                        </Text>
                      </View>

                      <View style={styles.rankAvatar}>
                        <Text style={[styles.rankInitial, { color: colors.text }]}>
                          {member.username.charAt(0)}
                        </Text>
                      </View>

                      <View style={styles.rankInfo}>
                        <Text style={[styles.rankName, { color: colors.text }]}>{member.username}</Text>
                        <View style={styles.rankStreak}>
                          <Ionicons name="flame" size={12} color="#FF5C00" />
                          <Text style={[styles.rankStreakText, { color: colors.textMuted }]}>
                            {member.metrics.currentStreak} day streak
                          </Text>
                        </View>
                      </View>

                      <View style={styles.rankScore}>
                        <Text style={[styles.scoreValue, { color: colors.text }]}>{member.score}</Text>
                        <View style={[styles.trendBadge, { backgroundColor: `${trend.color}15` }]}>
                          <Ionicons name={trend.icon as any} size={12} color={trend.color} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>

              {/* How Scoring Works */}
              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <TouchableOpacity
                  style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.infoIcon, { backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }]}>
                    <Ionicons name="help-circle" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoTitle, { color: colors.text }]}>How Scoring Works</Text>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      40% Streak + 30% Weekly logs + 20% Frequency + 10% Best streak
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabBackground: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addFriendButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addFriendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  addFriendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingTop: 40,
  },
  podiumItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40) / 3,
  },
  podiumCrown: {
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 8,
  },
  podiumFirst: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  podiumSecond: {},
  podiumThird: {},
  podiumInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  podiumInitialFirst: {
    fontSize: 28,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    maxWidth: 80,
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  podiumBase: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  podiumBaseFirst: {
    height: 80,
  },
  podiumBaseSecond: {
    height: 60,
  },
  podiumBaseThird: {
    height: 45,
  },
  podiumRank: {
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginLeft: 4,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  rankAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 92, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rankStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankStreakText: {
    fontSize: 12,
  },
  rankScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
