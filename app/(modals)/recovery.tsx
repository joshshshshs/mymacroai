/**
 * Recovery Dashboard - Normalized recovery metrics from all wearables
 * Displays unified recovery score and recommendations
 */

import React, { useEffect, useState } from 'react';
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
import Svg, { Circle } from 'react-native-svg';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { wearableAdapter, NormalizedRecoveryData, RecoveryRecommendation } from '@/src/services/wearables/WearableAdapter';

const RING_SIZE = 200;
const RING_STROKE = 16;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function RecoveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [recoveryData, setRecoveryData] = useState<NormalizedRecoveryData | null>(null);
  const [recommendation, setRecommendation] = useState<RecoveryRecommendation | null>(null);

  const loadData = async () => {
    // In production, this would get data from connected wearables
    // For now, use manual entry as fallback
    const data = await wearableAdapter.fetchRecoveryData('manual', 'current-user');
    if (data) {
      setRecoveryData(data);
      setRecommendation(wearableAdapter.generateRecommendation(data));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recoveryScore = recoveryData?.recoveryScore ?? 85;
  const ringOffset = RING_CIRCUMFERENCE - (recoveryScore / 100) * RING_CIRCUMFERENCE;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const metrics = [
    {
      label: 'Sleep Quality',
      value: recoveryData?.sleepQuality ?? 88,
      icon: 'moon',
      color: '#6366F1',
    },
    {
      label: 'HRV Readiness',
      value: recoveryData?.hrvReadiness ?? 72,
      icon: 'pulse',
      color: '#EC4899',
    },
    {
      label: 'Strain Level',
      value: recoveryData?.strain ?? 45,
      icon: 'barbell',
      color: '#F59E0B',
    },
  ];

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
          <Text style={styles.title}>Recovery</Text>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/wearable-sync' as any)}
            style={styles.backButton}
          >
            <Ionicons name="settings-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
          }
        >
          <View style={styles.ringContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={getScoreColor(recoveryScore)}
                strokeWidth={RING_STROKE}
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                fill="none"
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={[styles.scoreValue, { color: getScoreColor(recoveryScore) }]}>
                {recoveryScore}
              </Text>
              <Text style={styles.scoreLabel}>Recovery Score</Text>
            </View>
          </View>

          {recommendation && (
            <View style={[styles.recommendationCard, { backgroundColor: `${getScoreColor(recoveryScore)}15` }]}>
              <View style={styles.recommendationHeader}>
                <Ionicons
                  name={recommendation.intensity === 'high' ? 'flash' : recommendation.intensity === 'medium' ? 'walk' : 'bed'}
                  size={20}
                  color={getScoreColor(recoveryScore)}
                />
                <Text style={[styles.recommendationTitle, { color: getScoreColor(recoveryScore) }]}>
                  {recommendation.title ?? recommendation.status}
                </Text>
              </View>
              <Text style={styles.recommendationText}>{recommendation.description ?? recommendation.message}</Text>
              <View style={styles.recommendationMeta}>
                <Text style={styles.recommendationIntensity}>
                  Recommended: {(recommendation.intensity ?? 'medium').charAt(0).toUpperCase() + (recommendation.intensity ?? 'medium').slice(1)} Intensity
                </Text>
              </View>
            </View>
          )}

          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                  <Ionicons name={metric.icon as any} size={18} color={metric.color} />
                </View>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: getScoreColor(metric.value) }]}>
                  {metric.value}%
                </Text>
                <View style={styles.metricBar}>
                  <View
                    style={[
                      styles.metricBarFill,
                      {
                        width: `${metric.value}%`,
                        backgroundColor: getScoreColor(metric.value),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sourceCard}>
            <Ionicons name="analytics" size={20} color="rgba(255,255,255,0.6)" />
            <View style={styles.sourceContent}>
              <Text style={styles.sourceTitle}>Data Source</Text>
              <Text style={styles.sourceText}>
                {recoveryData?.provider === 'manual'
                  ? 'Manual Entry'
                  : recoveryData?.provider?.toUpperCase() ?? 'Not Connected'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.connectLink}
              onPress={() => router.push('/(modals)/wearable-sync' as any)}
            >
              <Text style={styles.connectLinkText}>Connect Device</Text>
              <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
            </TouchableOpacity>
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
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginTop: 4,
  },
  recommendationCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIntensity: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  metricBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sourceContent: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    marginBottom: 2,
  },
  sourceText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  connectLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectLinkText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
});
