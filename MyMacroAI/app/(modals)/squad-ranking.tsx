/**
 * Squad Ranking - Consistency leaderboard for squad members
 * Shows consistency scores and achievements
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { socialConstraints, ConsistencyMetrics } from '@/src/services/social/SocialConstraints';

interface RankedMember {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  metrics: ConsistencyMetrics;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

// Mock data - in production, fetched from socialConstraints service
const MOCK_RANKINGS: RankedMember[] = [
  {
    id: '1',
    username: 'FitWarrior',
    score: 94,
    rank: 1,
    trend: 'same',
    metrics: {
      consistencyScore: 94,
      currentStreak: 21,
      longestStreak: 45,
      logsThisWeek: 7,
      totalLogs: 312,
      logFrequency: 0.95,
    },
  },
  {
    id: '2',
    username: 'MacroMaster',
    score: 89,
    rank: 2,
    trend: 'up',
    metrics: {
      consistencyScore: 89,
      currentStreak: 14,
      longestStreak: 30,
      logsThisWeek: 7,
      totalLogs: 245,
      logFrequency: 0.88,
    },
  },
  {
    id: '3',
    username: 'HealthHero',
    score: 82,
    rank: 3,
    trend: 'down',
    metrics: {
      consistencyScore: 82,
      currentStreak: 8,
      longestStreak: 22,
      logsThisWeek: 5,
      totalLogs: 189,
      logFrequency: 0.72,
    },
  },
  {
    id: '4',
    username: 'NutritionNinja',
    score: 76,
    rank: 4,
    trend: 'up',
    metrics: {
      consistencyScore: 76,
      currentStreak: 5,
      longestStreak: 18,
      logsThisWeek: 6,
      totalLogs: 156,
      logFrequency: 0.65,
    },
  },
  {
    id: 'current',
    username: 'You',
    score: 71,
    rank: 5,
    trend: 'up',
    metrics: {
      consistencyScore: 71,
      currentStreak: 7,
      longestStreak: 14,
      logsThisWeek: 5,
      totalLogs: 98,
      logFrequency: 0.60,
    },
  },
];

export default function SquadRankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [rankings, setRankings] = useState<RankedMember[]>(MOCK_RANKINGS);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In production, fetch real rankings from socialConstraints
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleMemberPress = useCallback((memberId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMember(selectedMember === memberId ? null : memberId);
  }, [selectedMember]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { emoji: '🥇', color: '#FFD700' };
      case 2: return { emoji: '🥈', color: '#C0C0C0' };
      case 3: return { emoji: '🥉', color: '#CD7F32' };
      default: return { emoji: `#${rank}`, color: 'rgba(255,255,255,0.3)' };
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return { icon: 'arrow-up', color: '#10B981' };
      case 'down': return { icon: 'arrow-down', color: '#EF4444' };
      default: return { icon: 'remove', color: 'rgba(255,255,255,0.3)' };
    }
  };

  const currentUser = rankings.find(r => r.id === 'current');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Squad Ranking</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
          }
        >
          {currentUser && (
            <View style={styles.yourRankCard}>
              <View style={styles.yourRankLeft}>
                <Text style={styles.yourRankLabel}>Your Ranking</Text>
                <View style={styles.yourRankRow}>
                  <Text style={styles.yourRankNumber}>#{currentUser.rank}</Text>
                  <View style={[
                    styles.trendBadge,
                    { backgroundColor: `${getTrendIcon(currentUser.trend).color}20` }
                  ]}>
                    <Ionicons
                      name={getTrendIcon(currentUser.trend).icon as any}
                      size={12}
                      color={getTrendIcon(currentUser.trend).color}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.yourScoreCircle}>
                <Text style={styles.yourScore}>{currentUser.score}</Text>
                <Text style={styles.yourScoreLabel}>Score</Text>
              </View>
            </View>
          )}

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Consistency Score Formula</Text>
            <View style={styles.formulaRow}>
              <View style={styles.formulaItem}>
                <Text style={styles.formulaWeight}>40%</Text>
                <Text style={styles.formulaLabel}>Streak</Text>
              </View>
              <View style={styles.formulaItem}>
                <Text style={styles.formulaWeight}>30%</Text>
                <Text style={styles.formulaLabel}>Weekly</Text>
              </View>
              <View style={styles.formulaItem}>
                <Text style={styles.formulaWeight}>20%</Text>
                <Text style={styles.formulaLabel}>Frequency</Text>
              </View>
              <View style={styles.formulaItem}>
                <Text style={styles.formulaWeight}>10%</Text>
                <Text style={styles.formulaLabel}>Best</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Leaderboard</Text>

          <View style={styles.rankingList}>
            {rankings.map((member) => {
              const badge = getRankBadge(member.rank);
              const trend = getTrendIcon(member.trend);
              const isExpanded = selectedMember === member.id;
              const isYou = member.id === 'current';

              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberCard,
                    isYou && styles.memberCardYou,
                    isExpanded && styles.memberCardExpanded,
                  ]}
                  onPress={() => handleMemberPress(member.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberRow}>
                    <View style={[styles.rankBadge, { backgroundColor: `${badge.color}20` }]}>
                      <Text style={[styles.rankText, { color: badge.color }]}>
                        {badge.emoji}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, isYou && styles.memberNameYou]}>
                        {member.username}
                      </Text>
                      <Text style={styles.memberStreak}>
                        🔥 {member.metrics.currentStreak} day streak
                      </Text>
                    </View>

                    <View style={styles.memberScore}>
                      <Text style={styles.scoreValue}>{member.score}</Text>
                      <View style={[styles.trendIcon, { backgroundColor: `${trend.color}15` }]}>
                        <Ionicons name={trend.icon as any} size={12} color={trend.color} />
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Logs This Week</Text>
                        <Text style={styles.statValue}>{member.metrics.logsThisWeek}/7</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Logs</Text>
                        <Text style={styles.statValue}>{member.metrics.totalLogs}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Best Streak</Text>
                        <Text style={styles.statValue}>{member.metrics.longestStreak} days</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Frequency</Text>
                        <Text style={styles.statValue}>
                          {Math.round(member.metrics.logFrequency * 100)}%
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Rankings update daily. Keep logging consistently to climb the leaderboard!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  yourRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 69, 0, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  yourRankLeft: {},
  yourRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 4,
  },
  yourRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yourRankNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF4500',
  },
  trendBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourScoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4500',
  },
  yourScoreLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  formulaCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  formulaTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  formulaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  formulaItem: {
    alignItems: 'center',
  },
  formulaWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  formulaLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  rankingList: {
    gap: 12,
    marginBottom: 24,
  },
  memberCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  memberCardYou: {
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  memberCardExpanded: {
    paddingBottom: 20,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  memberNameYou: {
    color: '#FF4500',
  },
  memberStreak: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  memberScore: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  trendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  statItem: {
    width: '45%',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
});
