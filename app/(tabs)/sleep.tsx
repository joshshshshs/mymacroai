/**
 * Sleep Analytics Screen - Biological Restoration Report
 * Premium sleep analysis with educational phase cards and AI insights
 * Features: Dark mode support, Unwind/DND settings, AI insights at top
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import {
  SleepScoreGauge,
  SleepPhaseCard,
  VitalsStrip,
  SleepAIInsight
} from '@/src/components/sleep';
import { SunriseRecovery } from '@/src/components/animations';
import { useUserStore } from '@/src/store/UserStore';
import { SPACING } from '@/src/design-system/tokens';
import { GradientMeshBackground } from '@/src/components/ui/GradientMeshBackground';
import { useTabBarStore } from '@/src/store/tabBarStore';

export default function SleepScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const healthMetrics = useUserStore(state => state.healthMetrics);

  // Theme colors
  const colors = {
    bg: isDark ? '#121214' : '#F2F4F6',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    card: isDark ? 'rgba(30,30,34,0.8)' : 'rgba(255,255,255,0.9)',
    cardAlt: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
    blobPrimary: isDark ? 'rgba(79, 70, 229, 0.2)' : '#C7D2FE',
    blobSecondary: isDark ? 'rgba(147, 51, 234, 0.15)' : '#E0E7FF',
    accent: '#4F46E5',
  };

  // Calculate sleep metrics
  const sleepMinutes = healthMetrics.sleepMinutes || 480; // Default 8 hours
  const sleepQuality = healthMetrics.sleepQuality || 88;

  // Calculate sleep phases (mock data - would come from HealthKit/wearables)
  const deepSleepMinutes = Math.floor(sleepMinutes * 0.22); // ~22% deep sleep
  const remSleepMinutes = Math.floor(sleepMinutes * 0.27); // ~27% REM sleep
  const lightSleepMinutes = Math.floor(sleepMinutes * 0.51); // ~51% light sleep
  const latencyMinutes = 12;

  // Format durations
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  // Determine statuses based on percentages
  const getDeepStatus = () => {
    const percent = (deepSleepMinutes / sleepMinutes) * 100;
    if (percent >= 20) return 'excellent';
    if (percent >= 15) return 'optimal';
    return 'low';
  };

  const getRemStatus = () => {
    const percent = (remSleepMinutes / sleepMinutes) * 100;
    if (percent >= 25) return 'optimal';
    if (percent >= 20) return 'optimal';
    return 'low';
  };

  // Format date
  const formatDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleMoonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/unwind-dnd' as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Gradient Mesh Background */}
      <GradientMeshBackground variant="health" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header: Date Navigator */}
          <View style={styles.header}>
            <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.cardAlt }]} onPress={handleBack}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerDate, { color: colors.text }]}>Last Night, {formatDate().split(', ')[1]}</Text>
            </View>
            <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.cardAlt }]} onPress={handleMoonPress}>
              <Ionicons name="moon" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* AI Coach Insight - MOVED TO TOP */}
          <SleepAIInsight
            remHigh={remSleepMinutes > sleepMinutes * 0.25}
            deepLow={deepSleepMinutes < sleepMinutes * 0.18}
          />

          {/* Hero: Sunrise Recovery Visualization */}
          <View style={styles.heroCard}>
            <SunriseRecovery
              sleepScore={sleepQuality}
              sleepHours={sleepMinutes / 60}
              sleepQuality={sleepQuality >= 85 ? 'excellent' : sleepQuality >= 70 ? 'good' : sleepQuality >= 50 ? 'fair' : 'poor'}
            />
          </View>

          {/* Hypnogram: Sleep Cycles */}
          <View style={styles.cyclesCard}>
            <LinearGradient
              colors={isDark ? ['rgba(30,30,34,0.9)', 'rgba(30,30,34,0.7)'] : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassCard}
            >
              <View style={styles.cyclesHeader}>
                <Text style={[styles.cyclesTitle, { color: colors.text }]}>Sleep Architecture</Text>
                <View style={styles.cyclesLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
                    <Text style={styles.legendText}>Deep</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#9333EA' }]} />
                    <Text style={styles.legendText}>REM</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#06B6D4' }]} />
                    <Text style={styles.legendText}>Light</Text>
                  </View>
                </View>
              </View>

              {/* Wave Visualization */}
              <View style={styles.waveContainer}>
                <View style={styles.gridLines}>
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>

                <Svg width="100%" height={100} viewBox="0 0 300 80" preserveAspectRatio="none">
                  <Defs>
                    <SvgLinearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#06B6D4" />
                      <Stop offset="25%" stopColor="#4F46E5" />
                      <Stop offset="50%" stopColor="#9333EA" />
                      <Stop offset="75%" stopColor="#4F46E5" />
                      <Stop offset="100%" stopColor="#06B6D4" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path
                    d="M0,20 C15,20 20,60 40,60 C60,60 65,20 85,20 C105,20 110,40 130,40 C150,40 155,70 175,70 C195,70 200,30 220,30 C240,30 245,50 265,50 C285,50 290,20 300,20"
                    fill="none"
                    stroke="url(#sleepGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </Svg>

                <View style={styles.timeLabels}>
                  <Text style={styles.timeLabel}>11 PM</Text>
                  <Text style={styles.timeLabel}>1 AM</Text>
                  <Text style={styles.timeLabel}>3 AM</Text>
                  <Text style={styles.timeLabel}>5 AM</Text>
                  <Text style={styles.timeLabel}>7 AM</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Phase Cards Grid */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SLEEP PHASES</Text>
          <View style={styles.phaseGrid}>
            <SleepPhaseCard
              phase="deep"
              duration={formatDuration(deepSleepMinutes)}
              percentage={Math.round((deepSleepMinutes / sleepMinutes) * 100)}
              status={getDeepStatus()}
            />
            <SleepPhaseCard
              phase="rem"
              duration={formatDuration(remSleepMinutes)}
              percentage={Math.round((remSleepMinutes / sleepMinutes) * 100)}
              status={getRemStatus()}
            />
          </View>
          <View style={styles.phaseRow}>
            <SleepPhaseCard
              phase="latency"
              duration={formatDuration(latencyMinutes)}
              status={latencyMinutes <= 15 ? 'optimal' : 'high'}
              compact
            />
          </View>

          {/* Vitals Strip */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>OVERNIGHT VITALS</Text>
          <VitalsStrip
            rhr={42}
            hrv={115}
            respRate={14}
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.35,
  },
  blobTopRight: {
    top: '-15%',
    right: '-15%',
    width: 500,
    height: 500,
  },
  blobBottomLeft: {
    bottom: '-10%',
    left: '-15%',
    width: 400,
    height: 400,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroCard: {
    marginTop: 8,
  },
  glassCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cyclesCard: {
    marginTop: 0,
  },
  cyclesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cyclesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  cyclesLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  waveContainer: {
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  phaseGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  phaseRow: {
    marginTop: 12,
  },
});