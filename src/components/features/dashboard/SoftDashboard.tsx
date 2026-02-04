/**
 * Soft Dashboard - Ultra-soft glassmorphic design
 * Inspired by modern health app aesthetics
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { PASTEL_COLORS, SOFT_TYPOGRAPHY, SOFT_RADIUS } from '../../../design-system/aesthetics';
import { SPACING } from '../../../design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - (SPACING.lg * 2) - SPACING.md) / 2;

export const SoftDashboard: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={[styles.greetingText, { color: secondaryTextColor }, SOFT_TYPOGRAPHY.body]}>
          Good Morning,
        </Text>
        <Text style={[styles.userName, { color: textColor }, SOFT_TYPOGRAPHY.heading]}>
          Joshua
        </Text>
      </View>

      {/* Hero Card - Steps */}
      <SoftGlassCard
        variant="prominent"
        gradient="purpleDream"
        style={styles.heroCard}
      >
        <Text style={[styles.heroLabel, { color: secondaryTextColor }]}>STEPS</Text>
        <View style={styles.heroValueRow}>
          <Text style={[styles.heroValue, { color: textColor }]}>1265</Text>
          <Text style={[styles.heroTarget, { color: secondaryTextColor }]}>/10000</Text>
        </View>

        {/* Mini metrics */}
        <View style={styles.miniMetricsRow}>
          <View style={styles.miniMetric}>
            <Ionicons name="flame" size={16} color={PASTEL_COLORS.accents.softOrange} />
            <Text style={[styles.miniMetricLabel, { color: secondaryTextColor }]}>Calories</Text>
            <Text style={[styles.miniMetricValue, { color: textColor }]}>61 kcal</Text>
          </View>

          <View style={styles.miniMetric}>
            <Ionicons name="heart" size={16} color={PASTEL_COLORS.accents.softPink} />
            <Text style={[styles.miniMetricLabel, { color: secondaryTextColor }]}>Heart</Text>
            <Text style={[styles.miniMetricValue, { color: textColor }]}>103 bpm</Text>
          </View>

          <View style={styles.miniMetric}>
            <Ionicons name="moon" size={16} color={PASTEL_COLORS.accents.softPurple} />
            <Text style={[styles.miniMetricLabel, { color: secondaryTextColor }]}>Sleeping</Text>
            <Text style={[styles.miniMetricValue, { color: textColor }]}>08:32</Text>
          </View>
        </View>
      </SoftGlassCard>

      {/* Metrics Grid - 2x2 */}
      <View style={styles.metricsGrid}>
        {/* Recovery */}
        <SoftGlassCard
          variant="soft"
          gradient="lavenderFog"
          glowColor={PASTEL_COLORS.accents.softPurple}
          style={[styles.metricCard, { width: CARD_WIDTH }]}
        >
          <Ionicons name="heart-circle" size={32} color={PASTEL_COLORS.accents.softPink} />
          <Text style={[styles.metricValue, { color: textColor }]}>78</Text>
          <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>Recovery</Text>
          <Text style={[styles.metricStatus, { color: PASTEL_COLORS.accents.softGreen }]}>Ready</Text>
        </SoftGlassCard>

        {/* Sleep */}
        <SoftGlassCard
          variant="soft"
          gradient="pinkSunset"
          glowColor={PASTEL_COLORS.accents.softPurple}
          style={[styles.metricCard, { width: CARD_WIDTH }]}
        >
          <Ionicons name="moon" size={32} color={PASTEL_COLORS.accents.softPurple} />
          <Text style={[styles.metricValue, { color: textColor }]}>7.5</Text>
          <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>Sleep</Text>
          <Text style={[styles.metricStatus, { color: secondaryTextColor }]}>-0.5 hrs</Text>
        </SoftGlassCard>

        {/* Hydration */}
        <SoftGlassCard
          variant="soft"
          gradient="blueMist"
          glowColor={PASTEL_COLORS.accents.softBlue}
          style={[styles.metricCard, { width: CARD_WIDTH }]}
        >
          <Ionicons name="water" size={32} color={PASTEL_COLORS.accents.softBlue} />
          <Text style={[styles.metricValue, { color: textColor }]}>2.1L</Text>
          <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>Water</Text>
          <Text style={[styles.metricStatus, { color: secondaryTextColor }]}>70% goal</Text>
        </SoftGlassCard>

        {/* Calories */}
        <SoftGlassCard
          variant="soft"
          gradient="peachGlow"
          glowColor={PASTEL_COLORS.accents.softOrange}
          style={[styles.metricCard, { width: CARD_WIDTH }]}
        >
          <Ionicons name="nutrition" size={32} color={PASTEL_COLORS.accents.softOrange} />
          <Text style={[styles.metricValue, { color: textColor }]}>1650</Text>
          <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>Calories</Text>
          <Text style={[styles.metricStatus, { color: secondaryTextColor }]}>850 left</Text>
        </SoftGlassCard>
      </View>

      {/* AI Insight */}
      <SoftGlassCard variant="medium" style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: `${PASTEL_COLORS.accents.softPurple}30` }]}>
            <Ionicons name="bulb" size={20} color={PASTEL_COLORS.accents.softPurple} />
          </View>
          <View style={styles.insightTextContainer}>
            <Text style={[styles.insightTitle, { color: textColor }]}>Today's Insight</Text>
            <Text style={[styles.insightText, { color: secondaryTextColor }]}>
              Your recovery is excellent. Perfect day for high-intensity training.
            </Text>
          </View>
        </View>
      </SoftGlassCard>

      {/* Device Connection */}
      <SoftGlassCard variant="soft" style={styles.deviceCard}>
        <View style={styles.deviceRow}>
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceLabel, { color: secondaryTextColor }]}>Link your device</Text>
            <Text style={[styles.deviceSubtext, { color: secondaryTextColor }]}>to your account</Text>
          </View>
          <TouchableOpacity style={[styles.linkButton, { backgroundColor: `${PASTEL_COLORS.accents.softBlue}40` }]}>
            <Text style={[styles.linkButtonText, { color: textColor }]}>Link</Text>
          </TouchableOpacity>
          <View style={styles.deviceImage}>
            <Ionicons name="watch" size={32} color={secondaryTextColor} />
          </View>
        </View>
      </SoftGlassCard>

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
  greeting: {
    marginBottom: SPACING.xl,
  },
  greetingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
  },
  heroCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  heroLabel: {
    fontSize: 13,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xl,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: -3,
  },
  heroTarget: {
    fontSize: 24,
    fontWeight: '200',
    marginLeft: 8,
  },
  miniMetricsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  miniMetric: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SOFT_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  miniMetricLabel: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 2,
  },
  miniMetricValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  metricCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    minHeight: 160,
    marginBottom: SPACING.md,
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '300',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  metricStatus: {
    fontSize: 12,
  },
  insightCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  insightHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deviceCard: {
    padding: SPACING.lg,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  deviceSubtext: {
    fontSize: 13,
  },
  linkButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SOFT_RADIUS.lg,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deviceImage: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
