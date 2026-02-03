/**
 * Recovery Dashboard - Premium Redesign
 * Beautiful recovery metrics with animated visualizations
 */

import React, { useEffect, useState } from 'react';
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
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { wearableAdapter, NormalizedRecoveryData, RecoveryRecommendation } from '@/src/services/wearables/WearableAdapter';
import { SPACING } from '@/src/design-system/tokens';
import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 220;
const RING_STROKE = 18;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function RecoveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [refreshing, setRefreshing] = useState(false);
  const [recoveryData, setRecoveryData] = useState<NormalizedRecoveryData | null>(null);
  const [recommendation, setRecommendation] = useState<RecoveryRecommendation | null>(null);

  const colors = {
    bg: isDark ? '#0A0A0C' : '#F8F9FA',
    card: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textMuted: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
  };

  // Animation values
  const ringProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  const loadData = async () => {
    const data = await wearableAdapter.fetchRecoveryData('manual', 'current-user');
    if (data) {
      setRecoveryData(data);
      setRecommendation(wearableAdapter.generateRecommendation(data));
      // Animate ring to target value
      ringProgress.value = withSpring(data.recoveryScore / 100, {
        damping: 20,
        stiffness: 90,
      });
    }
  };

  useEffect(() => {
    loadData();

    // Pulse animation for glow
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const recoveryScore = recoveryData?.recoveryScore ?? 85;

  const getScoreColor = (score: number): [string, string] => {
    if (score >= 80) return ['#10B981', '#34D399'];
    if (score >= 60) return ['#F59E0B', '#FBBF24'];
    if (score >= 40) return ['#F97316', '#FB923C'];
    return ['#EF4444', '#F87171'];
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Fully Recovered';
    if (score >= 60) return 'Moderately Recovered';
    if (score >= 40) return 'Partially Recovered';
    return 'Need Rest';
  };

  const scoreColors = getScoreColor(recoveryScore);

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const metrics = [
    {
      label: 'Sleep Quality',
      value: recoveryData?.sleepQuality ?? 88,
      icon: 'moon',
      gradient: ['#6366F1', '#818CF8'],
      description: 'Deep sleep cycles',
    },
    {
      label: 'HRV Status',
      value: recoveryData?.hrvReadiness ?? 72,
      icon: 'pulse',
      gradient: ['#EC4899', '#F472B6'],
      description: 'Heart variability',
    },
    {
      label: 'Strain Level',
      value: recoveryData?.strain ?? 45,
      icon: 'barbell',
      gradient: ['#F59E0B', '#FBBF24'],
      description: 'Physical demand',
    },
  ];

  const actionItems = [
    { icon: 'water', label: 'Hydrate', description: '2L+ water today', color: '#3B82F6' },
    { icon: 'bed', label: 'Sleep Early', description: 'Target 8 hours', color: '#6366F1' },
    { icon: 'leaf', label: 'Light Activity', description: 'Walk or stretch', color: '#10B981' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient */}
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
          <Text style={[styles.title, { color: colors.text }]}>Recovery</Text>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/wearable-sync' as any)}
            style={[styles.headerButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
          }
        >
          {/* Main Score Ring */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.ringSection}>
            <Animated.View style={[styles.ringGlow, pulseStyle]}>
              <Animated.View
                style={[
                  styles.ringGlowInner,
                  glowStyle,
                  { backgroundColor: scoreColors[0] }
                ]}
              />
            </Animated.View>

            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              <Defs>
                <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={scoreColors[0]} />
                  <Stop offset="100%" stopColor={scoreColors[1]} />
                </SvgGradient>
              </Defs>
              {/* Background ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              {/* Progress ring */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="url(#ringGradient)"
                strokeWidth={RING_STROKE}
                strokeDasharray={RING_CIRCUMFERENCE}
                animatedProps={animatedRingProps}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                fill="none"
              />
            </Svg>

            <View style={styles.ringCenter}>
              <Text style={[styles.scoreValue, { color: scoreColors[0] }]}>{recoveryScore}</Text>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                {getScoreLabel(recoveryScore)}
              </Text>
            </View>
          </Animated.View>

          {/* AI Insight */}
          {recommendation && (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={[styles.insightCard, { backgroundColor: `${scoreColors[0]}10`, borderColor: `${scoreColors[0]}20` }]}
            >
              <MyMacroAIAvatar size="small" />
              <View style={styles.insightContent}>
                <Text style={[styles.insightTitle, { color: scoreColors[0] }]}>
                  {recommendation.title ?? recommendation.status}
                </Text>
                <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                  {recommendation.description ?? recommendation.message}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Metrics Grid */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>KEY METRICS</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric, index) => (
                <TouchableOpacity
                  key={metric.label}
                  style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={metric.gradient as [string, string]}
                    style={styles.metricIconBg}
                  >
                    <Ionicons name={metric.icon as any} size={20} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}%</Text>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{metric.label}</Text>
                  <View style={[styles.metricBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <LinearGradient
                      colors={metric.gradient as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.metricBarFill, { width: `${metric.value}%` }]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Recovery Actions */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>RECOVERY ACTIONS</Text>
            <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {actionItems.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.actionItem,
                    index < actionItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
                  ]}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.actionDesc, { color: colors.textMuted }]}>{item.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Data Source */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <TouchableOpacity
              style={[styles.sourceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => router.push('/(modals)/wearable-sync' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.sourceIcon, { backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }]}>
                <Ionicons name="watch-outline" size={22} color="#3B82F6" />
              </View>
              <View style={styles.sourceContent}>
                <Text style={[styles.sourceTitle, { color: colors.text }]}>
                  {recoveryData?.provider === 'manual' ? 'Manual Entry' : recoveryData?.provider?.toUpperCase() ?? 'No Device'}
                </Text>
                <Text style={[styles.sourceText, { color: colors.textMuted }]}>
                  Connect a wearable for real-time data
                </Text>
              </View>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>Connect</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
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
  content: {
    paddingHorizontal: 20,
  },
  ringSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  ringGlow: {
    position: 'absolute',
    width: RING_SIZE + 60,
    height: RING_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGlowInner: {
    width: RING_SIZE + 40,
    height: RING_SIZE + 40,
    borderRadius: (RING_SIZE + 40) / 2,
    opacity: 0.15,
  },
  ringSvg: {
    transform: [{ rotate: '0deg' }],
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  insightCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    gap: 14,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  metricIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
  },
  metricBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceContent: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceText: {
    fontSize: 12,
  },
  sourceBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sourceBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
});
