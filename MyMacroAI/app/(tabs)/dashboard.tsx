/**
 * Dashboard Page - Soft Spartan Redesign
 * Glass cards, bold hero ring, and compact daily summary.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';

import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING } from '@/src/design-system/tokens';
import { UpgradeHeaderButton } from '@/src/components/ui/UpgradeBanner';
import { MacroCoinIcon } from '@/src/components/ui/MacroCoinIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PADDING = SPACING.lg;
const CARD_GAP = SPACING.md;
const CARD_WIDTH = Math.max(0, (SCREEN_WIDTH - CONTENT_PADDING * 2 - CARD_GAP) / 2);

type GreetingTone =
  | 'welcome'
  | 'starter'
  | 'steady'
  | 'focused'
  | 'push'
  | 'congrats'
  | 'strict'
  | 'worried';

type GreetingCopy = {
  lead: string;
  emphasis: string;
};

type GreetingContext = {
  name: string;
  progress: number;
  progressPercent: number;
  remainingText: string;
  streak: number;
  logCount: number;
  hour: number;
  dayKey: string;
};

type GreetingTemplate = (context: GreetingContext) => GreetingCopy;

const nameSuffix = (name: string) => (name ? `, ${name}` : '');

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const GREETING_VARIANTS: Record<GreetingTone, GreetingTemplate[]> = {
  welcome: [
    () => ({
      lead: 'Welcome!',
      emphasis: 'Ready to transform.',
    }),
  ],
  starter: [
    (context) => ({
      lead: `Nice start${nameSuffix(context.name)}`,
      emphasis: 'Build momentum.',
    }),
    () => ({
      lead: 'First steps down',
      emphasis: 'Keep logging.',
    }),
    () => ({
      lead: 'You are moving',
      emphasis: 'Stay consistent.',
    }),
  ],
  steady: [
    (context) => ({
      lead: `Solid pace${nameSuffix(context.name)}`,
      emphasis: 'Keep it clean.',
    }),
    () => ({
      lead: 'Midday rhythm',
      emphasis: 'Do not drift.',
    }),
    () => ({
      lead: 'Progress is real',
      emphasis: 'Stack another win.',
    }),
  ],
  focused: [
    (context) => ({
      lead: `Strong progress${nameSuffix(context.name)}`,
      emphasis: `${context.remainingText} kcal to goal.`,
    }),
    () => ({
      lead: 'On track',
      emphasis: 'Finish with intent.',
    }),
    () => ({
      lead: 'Stay locked in',
      emphasis: 'Close it out.',
    }),
  ],
  push: [
    (context) => ({
      lead: `So close${nameSuffix(context.name)}`,
      emphasis: 'Close it out.',
    }),
    (context) => ({
      lead: 'Final stretch',
      emphasis: `${context.remainingText} kcal left.`,
    }),
    () => ({
      lead: 'Goal in reach',
      emphasis: 'One more entry.',
    }),
  ],
  congrats: [
    (context) => ({
      lead: `Goal achieved${nameSuffix(context.name)}`,
      emphasis: context.streak >= 3 ? `Streak ${context.streak} days strong.` : 'Hold the line.',
    }),
    (context) => ({
      lead: `You did it${nameSuffix(context.name)}`,
      emphasis: 'Recover and repeat.',
    }),
    () => ({
      lead: 'Daily goal crushed',
      emphasis: 'Keep that standard.',
    }),
  ],
  strict: [
    (context) => ({
      lead: `We are behind${nameSuffix(context.name)}`,
      emphasis: 'Log something now.',
    }),
    () => ({
      lead: 'This pace is low',
      emphasis: 'Reset with a clean log.',
    }),
    () => ({
      lead: 'Do not slip today',
      emphasis: 'Take control.',
    }),
  ],
  worried: [
    (context) => ({
      lead: `Time is running${nameSuffix(context.name)}`,
      emphasis: 'Get a quick log in.',
    }),
    () => ({
      lead: 'Not enough logged',
      emphasis: 'Stabilize tonight.',
    }),
  ],
};

const getGreetingTone = (context: GreetingContext): GreetingTone => {
  if (context.progress < 0.2 && context.hour >= 20) return 'worried';
  if (context.progress < 0.2 && context.hour >= 16) return 'strict';
  if (context.progress >= 1) return 'congrats';
  if (context.progress >= 0.85) return 'push';
  if (context.progress >= 0.6) return 'focused';
  if (context.progress >= 0.35) return 'steady';
  if (context.progress > 0) return 'starter';
  return 'welcome';
};

const getAdaptiveGreeting = (context: GreetingContext): GreetingCopy => {
  const tone = getGreetingTone(context);
  const variants = GREETING_VARIANTS[tone];
  const seed = `${tone}-${context.dayKey}-${context.name}-${context.progressPercent}-${context.logCount}`;
  const index = hashString(seed) % variants.length;
  return variants[index](context);
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { light } = useHaptics();
  const { currentIntake, dailyTarget, economy, streak, dailyLog, user } = useUserStore();

  const palette = {
    bg: isDark ? '#0F1115' : '#F5F5F7',
    card: isDark ? 'rgba(23, 23, 28, 0.88)' : 'rgba(255, 255, 255, 0.85)',
    cardSolid: isDark ? '#1C1C20' : '#FFFFFF',
    text: isDark ? '#F5F5F7' : '#1C1C1E',
    muted: isDark ? 'rgba(255, 255, 255, 0.6)' : '#8E8E93',
    accent: '#FF4500',
    accentSoft: isDark ? 'rgba(255, 69, 0, 0.22)' : 'rgba(255, 69, 0, 0.12)',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)',
    track: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    coolGlow: isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(59, 130, 246, 0.12)',
  };

  const calories = currentIntake.calories;
  const target = dailyTarget.calories;
  const goalPercentRaw = target > 0 ? Math.round((calories / target) * 100) : 0;
  const goalPercent = Math.min(goalPercentRaw, 100);
  const progress = target > 0 ? calories / target : 0;
  const remaining = Math.max(0, target - calories);

  const ringSize = Math.min(240, SCREEN_WIDTH - CONTENT_PADDING * 2);
  const ringStroke = 16;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (goalPercent / 100) * ringCircumference;

  const steps = 6540;
  const stepGoal = 8000;
  const stepPercent = Math.min(100, Math.round((steps / stepGoal) * 100));
  const miniRingSize = 40;
  const miniRingStroke = 4;
  const miniRingRadius = (miniRingSize - miniRingStroke) / 2;
  const miniRingCircumference = 2 * Math.PI * miniRingRadius;
  const miniRingOffset = miniRingCircumference - (stepPercent / 100) * miniRingCircumference;

  const distanceKm = 3.4;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const logCountToday = dailyLog.history.filter((log) => {
    const timestamp = Number.isFinite(log.timestamp)
      ? log.timestamp
      : Date.parse(log.date || log.createdAt || '');
    return timestamp >= todayStart.getTime();
  }).length;

  const now = new Date();
  const greeting = getAdaptiveGreeting({
    name: user?.name?.split(' ')[0] ?? '',
    progress,
    progressPercent: Math.round(progress * 100),
    remainingText: remaining.toLocaleString(),
    streak,
    logCount: logCountToday,
    hour: now.getHours(),
    dayKey: now.toISOString().slice(0, 10),
  });

  const quickActions = [
    { id: 'workout', icon: 'barbell-outline', label: 'Workout', color: palette.accent },
    { id: 'meal', icon: 'restaurant-outline', label: 'Meal', color: '#F59E0B' },
    { id: 'water', icon: 'water-outline', label: 'Water', color: '#3B82F6' },
    { id: 'voice', icon: 'mic-outline', label: 'Voice Log', color: palette.accent },
  ];

  const handleQuickAction = (id: string) => {
    light();
    if (id === 'workout') router.push('/(modals)/import' as any);
    if (id === 'meal') router.push('/(tabs)/nutrition');
    if (id === 'water') router.push('/(tabs)/health');
    if (id === 'voice') router.push('/(modals)/scan' as any);
  };

  const GlassCard = ({
    children,
    style,
    intensity = 45,
  }: {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
  }) => (
    <View style={[styles.glassCard, { borderColor: palette.border }, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: palette.card }]}
      />
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View pointerEvents="none" style={styles.background}>
        <View style={[styles.bgGlow, styles.bgGlowTop, { backgroundColor: palette.accentSoft }]} />
        <View style={[styles.bgGlow, styles.bgGlowBottom, { backgroundColor: palette.coolGlow }]} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: palette.text }]}>
                {greeting.lead}{'\n'}
                <Text style={{ color: palette.accent }}>{greeting.emphasis}</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/profile' as any)}
              style={[styles.avatar, { backgroundColor: palette.cardSolid, borderColor: palette.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="person" size={22} color={palette.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerChips}>
            <TouchableOpacity
              style={[styles.headerChip, { backgroundColor: palette.cardSolid, borderColor: palette.border }]}
              onPress={() => { light(); router.push('/(modals)/streak' as any); }}
              activeOpacity={0.7}
            >
              <Ionicons name="flame" size={14} color={palette.accent} />
              <Text style={[styles.headerChipText, { color: palette.text }]}>{streak}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerChip, { backgroundColor: palette.cardSolid, borderColor: palette.border }]}
              onPress={() => { light(); router.push('/(modals)/shop' as any); }}
              activeOpacity={0.7}
            >
              <MacroCoinIcon size={16} />
              <Text style={[styles.headerChipText, { color: palette.text }]}>
                {economy.macroCoins.toLocaleString()}
              </Text>
            </TouchableOpacity>
            <UpgradeHeaderButton />
          </View>

          <GlassCard style={styles.goalCard} intensity={70}>
            <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
              <View
                style={[
                  styles.ringGlow,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                    backgroundColor: palette.accentSoft,
                  },
                ]}
              />
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={palette.track}
                  strokeWidth={ringStroke}
                  fill="none"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={palette.accent}
                  strokeWidth={ringStroke}
                  strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${ringSize / 2}, ${ringSize / 2}`}
                  fill="none"
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={[styles.ringPercent, { color: palette.text }]}>{goalPercent}%</Text>
                <Text style={[styles.ringLabel, { color: palette.muted }]}>To Daily Goal</Text>
              </View>
            </View>

            <View style={[styles.goalPill, { backgroundColor: palette.cardSolid, borderColor: palette.border }]}>
              <Ionicons name="flame" size={16} color={palette.accent} />
              <Text style={[styles.goalPillText, { color: palette.text }]}>
                {calories.toLocaleString()} <Text style={{ color: palette.muted }}>/</Text>{' '}
                {target.toLocaleString()}
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.aiCard} intensity={55}>
            <View style={styles.aiHeader}>
              <View style={[styles.aiIcon, { backgroundColor: palette.accentSoft }]}>
                <Ionicons name="sparkles" size={18} color={palette.accent} />
              </View>
              <Text style={[styles.aiTitle, { color: palette.text }]}>AI Summary</Text>
            </View>
            <Text style={[styles.aiSummaryText, { color: palette.muted }]}>
              {progress >= 1
                ? 'Goal hit. Prioritize recovery and hydration.'
                : progress > 0
                  ? `${remaining.toLocaleString()} kcal left. Keep logging to stay on pace.`
                  : 'Start logging to unlock personalized insights.'}
            </Text>
            <TouchableOpacity
              style={[styles.aiInput, { backgroundColor: palette.cardSolid, borderColor: palette.border }]}
              onPress={() => handleQuickAction('voice')}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={18} color={palette.accent} />
              <Text style={[styles.aiInputText, { color: palette.muted }]}>Tap to voice log</Text>
            </TouchableOpacity>
          </GlassCard>

          <View style={styles.actionStrip}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={() => handleQuickAction(action.id)}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.actionCircle} intensity={35}>
                  <Ionicons name={action.icon as any} size={26} color={action.color} />
                </GlassCard>
                <Text style={[styles.actionLabel, { color: palette.muted }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: palette.text }]}>Daily Summary</Text>
            <View style={[styles.summaryDot, { backgroundColor: palette.accent }]} />
          </View>

          <View style={styles.summaryGrid}>
            <GlassCard style={[styles.summaryCard, { width: CARD_WIDTH }]}>
              <View style={styles.summaryCardHeader}>
                <View>
                  <Text style={[styles.cardKicker, { color: palette.muted }]}>Steps</Text>
                  <Text style={[styles.cardValue, { color: palette.text }]}>
                    {steps.toLocaleString()}
                  </Text>
                </View>
                <Svg width={miniRingSize} height={miniRingSize}>
                  <Circle
                    cx={miniRingSize / 2}
                    cy={miniRingSize / 2}
                    r={miniRingRadius}
                    stroke={palette.track}
                    strokeWidth={miniRingStroke}
                    fill="none"
                  />
                  <Circle
                    cx={miniRingSize / 2}
                    cy={miniRingSize / 2}
                    r={miniRingRadius}
                    stroke={palette.accent}
                    strokeWidth={miniRingStroke}
                    strokeDasharray={`${miniRingCircumference} ${miniRingCircumference}`}
                    strokeDashoffset={miniRingOffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${miniRingSize / 2}, ${miniRingSize / 2}`}
                    fill="none"
                  />
                </Svg>
              </View>
              <View style={styles.stepsBars}>
                {[0.3, 0.5, 0.8, 0.4, 0.6, 0.3].map((bar, index) => (
                  <View
                    key={`${bar}-${index}`}
                    style={[
                      styles.stepBar,
                      {
                        height: 36 * bar,
                        backgroundColor: index === 2 ? palette.accent : palette.track,
                      },
                    ]}
                  />
                ))}
              </View>
            </GlassCard>

            <GlassCard style={[styles.summaryCard, { width: CARD_WIDTH }]}>
              <View style={styles.calorieHeader}>
                <Text style={[styles.cardKicker, { color: palette.muted }]}>Calories</Text>
                <View style={styles.valueRow}>
                  <Text style={[styles.cardValue, { color: palette.text }]}>
                    {calories.toLocaleString()}
                  </Text>
                  <Text style={[styles.cardUnit, { color: palette.muted }]}>kcal</Text>
                </View>
              </View>
              <View style={styles.calorieChart}>
                <Svg width="100%" height="100%" viewBox="0 0 120 50" preserveAspectRatio="none">
                  <Defs>
                    <SvgLinearGradient id="calorieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={palette.accent} stopOpacity="0.25" />
                      <Stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path
                    d="M0,35 C10,35 20,15 35,25 S60,5 75,15 S100,5 110,0"
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M0,35 C10,35 20,15 35,25 S60,5 75,15 S100,5 110,0 V50 H0 Z"
                    fill="url(#calorieGrad)"
                    stroke="none"
                  />
                </Svg>
              </View>
            </GlassCard>

            <GlassCard style={[styles.summaryCard, styles.summaryWide]}>
              <View style={styles.distanceRow}>
                <View>
                  <Text style={[styles.cardKicker, { color: palette.muted }]}>Distance</Text>
                  <View style={styles.valueRow}>
                    <Text style={[styles.distanceValue, { color: palette.text }]}>{distanceKm.toFixed(1)}</Text>
                    <Text style={[styles.cardUnit, { color: palette.muted }]}>km</Text>
                  </View>
                </View>
                <View style={styles.distanceChart}>
                  <Svg width="100%" height="100%" viewBox="0 0 100 40">
                    <Path
                      d="M5,35 Q25,35 35,20 T65,20 T95,10"
                      fill="none"
                      stroke={palette.accent}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    <Circle cx="95" cy="10" r="4" fill={palette.accent} />
                  </Svg>
                </View>
              </View>
            </GlassCard>
          </View>
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
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  bgGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.7,
  },
  bgGlowTop: {
    width: 520,
    height: 520,
    top: -160,
    right: -160,
  },
  bgGlowBottom: {
    width: 420,
    height: 420,
    bottom: -140,
    left: -180,
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerText: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerChips: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  headerChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  goalCard: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  ringGlow: {
    position: 'absolute',
    opacity: 0.6,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  ringLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  goalPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
  aiCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  aiSummaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  aiInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  aiInputText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryWide: {
    width: '100%',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  stepsBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 36,
  },
  stepBar: {
    width: 4,
    borderRadius: 2,
  },
  calorieHeader: {
    marginBottom: SPACING.sm,
  },
  calorieChart: {
    height: 48,
    width: '100%',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceValue: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  distanceChart: {
    width: 120,
    height: 48,
  },
});
