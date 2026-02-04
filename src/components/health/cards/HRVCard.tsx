/**
 * HRVCard - Heart Rate Variability display card
 * Stub implementation for app boot compatibility
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface HRVData {
  value: number;
  trend?: 'up' | 'down' | 'stable';
  history?: number[];
}

export interface HRVCardProps {
  // Support both patterns
  data?: HRVData;
  hrv?: number;
  trend?: 'up' | 'down' | 'stable';
  onPress?: () => void;
}

export const HRVCard: React.FC<HRVCardProps> = ({ data, hrv, trend: propTrend, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const hrvValue = hrv ?? data?.value ?? 45;
  const trend = propTrend ?? data?.trend ?? 'stable';

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#6B7280' }]}>HRV</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#111827' }]}>{hrvValue}</Text>
        <Text style={[styles.unit, { color: isDark ? '#8E8E93' : '#6B7280' }]}>ms</Text>
        <Text style={[styles.trend, { color: '#10B981' }]}>{getTrendIcon()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    minWidth: 120,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  trend: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HRVCard;
