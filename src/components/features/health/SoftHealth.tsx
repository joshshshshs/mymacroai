/**
 * Soft Health Component
 * Ultra-soft glassmorphic design for recovery and health metrics
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { PASTEL_COLORS, SOFT_RADIUS } from '../../../design-system/aesthetics';
import { SPACING } from '../../../design-system/tokens';
import Svg, { Circle } from 'react-native-svg';

export const SoftHealth: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';

  // Mock data
  const recovery = { score: 78, status: 'Ready' };
  const metrics = {
    sleep: { value: 7.5, target: 8 },
    hrv: { value: 45, trend: 'up' },
    rhr: { value: 58, status: 'normal' },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Recovery Score Gauge */}
      <SoftGlassCard variant="prominent" gradient="purpleDream" style={styles.recoveryCard}>
        <Text style={[styles.recoveryLabel, { color: secondaryTextColor }]}>Recovery Score</Text>

        {/* Circular Progress */}
        <View style={styles.gaugeContainer}>
          <Svg width={160} height={160}>
            {/* Background circle */}
            <Circle
              cx="80"
              cy="80"
              r="70"
              stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx="80"
              cy="80"
              r="70"
              stroke={PASTEL_COLORS.accents.softGreen}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(recovery.score / 100) * 440} 440`}
              strokeLinecap="round"
              rotation="-90"
              origin="80, 80"
            />
          </Svg>

          <View style={styles.gaugeCenter}>
            <Text style={[styles.recoveryScore, { color: textColor }]}>{recovery.score}</Text>
            <Text style={[styles.recoveryStatus, { color: PASTEL_COLORS.accents.softGreen }]}>
              {recovery.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.recoveryDescription, { color: secondaryTextColor }]}>
          Your body is well-recovered and ready for high-intensity training
        </Text>
      </SoftGlassCard>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Sleep */}
        <SoftGlassCard variant="soft" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="moon" size={24} color={PASTEL_COLORS.accents.softPurple} />
            <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>Sleep</Text>
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>
            {metrics.sleep.value}
            <Text style={[styles.metricUnit, { color: secondaryTextColor }]}> hrs</Text>
          </Text>
          <Text style={[styles.metricSubtext, { color: secondaryTextColor }]}>
            -{(metrics.sleep.target - metrics.sleep.value).toFixed(1)} from goal
          </Text>
        </SoftGlassCard>

        {/* HRV */}
        <SoftGlassCard variant="soft" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="pulse" size={24} color={PASTEL_COLORS.accents.softPink} />
            <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>HRV</Text>
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>
            {metrics.hrv.value}
            <Text style={[styles.metricUnit, { color: secondaryTextColor }]}> ms</Text>
          </Text>
          <View style={styles.trendRow}>
            <Ionicons
              name="trending-up"
              size={14}
              color={PASTEL_COLORS.accents.softGreen}
            />
            <Text style={[styles.metricSubtext, { color: PASTEL_COLORS.accents.softGreen }]}>
              Trending up
            </Text>
          </View>
        </SoftGlassCard>

        {/* Resting HR */}
        <SoftGlassCard variant="soft" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="heart" size={24} color={PASTEL_COLORS.accents.softPink} />
            <Text style={[styles.metricLabel, { color: secondaryTextColor }]}>Resting HR</Text>
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>
            {metrics.rhr.value}
            <Text style={[styles.metricUnit, { color: secondaryTextColor }]}> bpm</Text>
          </Text>
          <Text style={[styles.metricSubtext, { color: secondaryTextColor }]}>Normal range</Text>
        </SoftGlassCard>
      </View>

      {/* Wearables Section */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Connected Devices</Text>

      <SoftGlassCard variant="soft" style={styles.wearableCard}>
        <View style={styles.wearableRow}>
          <View style={styles.wearableInfo}>
            <Text style={[styles.wearableName, { color: textColor }]}>Oura Ring</Text>
            <Text style={[styles.wearableStatus, { color: PASTEL_COLORS.accents.softGreen }]}>
              ● Connected • Synced 5m ago
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color={secondaryTextColor} />
          </TouchableOpacity>
        </View>
      </SoftGlassCard>

      <TouchableOpacity>
        <SoftGlassCard variant="soft" gradient="blueMist" style={styles.addDeviceCard}>
          <Ionicons name="add-circle-outline" size={24} color={PASTEL_COLORS.accents.softBlue} />
          <Text style={[styles.addDeviceText, { color: textColor }]}>Add Device</Text>
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
  recoveryCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  recoveryLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.lg,
    fontWeight: '400',
  },
  gaugeContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  gaugeCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryScore: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: -2,
  },
  recoveryStatus: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 4,
  },
  recoveryDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '300',
  },
  metricsGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  metricCard: {
    padding: SPACING.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -1,
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '300',
  },
  metricSubtext: {
    fontSize: 13,
    fontWeight: '300',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: SPACING.md,
  },
  wearableCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  wearableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wearableInfo: {
    flex: 1,
  },
  wearableName: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 4,
  },
  wearableStatus: {
    fontSize: 13,
    fontWeight: '300',
  },
  addDeviceCard: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  addDeviceText: {
    fontSize: 15,
    fontWeight: '400',
  },
});
