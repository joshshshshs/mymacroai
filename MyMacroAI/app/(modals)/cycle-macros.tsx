/**
 * Cycle Macros - View phase-based macro adjustments
 * Shows current adjustments and comparison to baseline
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { cyclePhaseAdapter, CyclePhase, CyclePhaseAdjustments } from '@/src/services/nutrition/CyclePhaseAdapter';
import { useUserStore } from '@/src/store/UserStore';

const PHASE_INFO: Record<CyclePhase, { name: string; color: string; icon: string; tips: string[] }> = {
  menstrual: {
    name: 'Menstrual Phase',
    color: '#EF4444',
    icon: '🌙',
    tips: [
      'Focus on iron-rich foods (spinach, red meat, legumes)',
      'Anti-inflammatory foods help with cramps',
      'Gentle movement is encouraged',
    ],
  },
  follicular: {
    name: 'Follicular Phase',
    color: '#10B981',
    icon: '🌱',
    tips: [
      'Energy is rising - great for higher intensity workouts',
      'Increase carb intake to fuel performance',
      'Protein synthesis is optimal',
    ],
  },
  ovulatory: {
    name: 'Ovulatory Phase',
    color: '#F59E0B',
    icon: '☀️',
    tips: [
      'Peak energy and strength - push hard!',
      'Balanced macros support hormonal function',
      'Great time for personal records',
    ],
  },
  luteal: {
    name: 'Luteal Phase',
    color: '#8B5CF6',
    icon: '🌸',
    tips: [
      'Metabolic rate increases - you need more calories',
      'Focus on magnesium and B vitamins',
      'Cravings are normal - plan healthy alternatives',
    ],
  },
  unknown: {
    name: 'Unknown Phase',
    color: '#6B7280',
    icon: '❓',
    tips: [
      'Set your cycle start date to get personalized recommendations',
      'Track your cycle for better macro adjustments',
      'No adjustments applied without cycle data',
    ],
  },
};

export default function CycleMacrosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dailyTarget } = useUserStore();
  const [currentPhase, setCurrentPhase] = useState<CyclePhase>('follicular');
  const [adjustments, setAdjustments] = useState<CyclePhaseAdjustments | null>(null);

  const colors = {
    bg: isDark ? '#0F0F0F' : '#F5F5F7',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#AEAEB2',
    card: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    cardBorder: isDark ? 'transparent' : 'rgba(0,0,0,0.08)',
    buttonBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  };

  useEffect(() => {
    // Get current phase and adjustments
    const fetchPhaseData = async () => {
      const phase = await cyclePhaseAdapter.getCurrentPhase('current-user');
      if (phase) {
        setCurrentPhase(phase);
      }

      const adj = cyclePhaseAdapter.calculatePhaseAdjustments(
        phase || 'follicular',
        dailyTarget.calories,
        dailyTarget.protein,
        dailyTarget.carbs,
        dailyTarget.fats
      );
      // Convert MacroAdjustment to CyclePhaseAdjustments format
      setAdjustments({
        adjustedCalories: dailyTarget.calories + adj.calorieAdjustment,
        adjustedProtein: dailyTarget.protein + adj.proteinAdjustment,
        adjustedCarbs: dailyTarget.carbs + adj.carbAdjustment,
        adjustedFat: dailyTarget.fats + adj.fatAdjustment,
        reason: adj.reason,
        recommendations: adj.recommendations,
      });
    };

    fetchPhaseData();
  }, [dailyTarget]);

  const phaseInfo = PHASE_INFO[currentPhase];

  const macroComparison = [
    {
      label: 'Calories',
      baseline: dailyTarget.calories,
      adjusted: adjustments?.adjustedCalories ?? dailyTarget.calories,
      unit: 'kcal',
      color: '#FF4500',
    },
    {
      label: 'Protein',
      baseline: dailyTarget.protein,
      adjusted: adjustments?.adjustedProtein ?? dailyTarget.protein,
      unit: 'g',
      color: '#3B82F6',
    },
    {
      label: 'Carbs',
      baseline: dailyTarget.carbs,
      adjusted: adjustments?.adjustedCarbs ?? dailyTarget.carbs,
      unit: 'g',
      color: '#10B981',
    },
    {
      label: 'Fat',
      baseline: dailyTarget.fats,
      adjusted: adjustments?.adjustedFat ?? dailyTarget.fats,
      unit: 'g',
      color: '#F59E0B',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.buttonBg }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Phase Macros</Text>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/cycle-tracking' as any)}
            style={[styles.backButton, { backgroundColor: colors.buttonBg }]}
          >
            <Ionicons name="calendar-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.phaseCard, { backgroundColor: colors.card, borderColor: phaseInfo.color, borderWidth: isDark ? 2 : 1 }]}>
            <View style={[styles.phaseIcon, { backgroundColor: `${phaseInfo.color}20` }]}>
              <Text style={styles.phaseEmoji}>{phaseInfo.icon}</Text>
            </View>
            <View style={styles.phaseInfo}>
              <Text style={[styles.phaseLabel, { color: colors.textSecondary }]}>Current Phase</Text>
              <Text style={[styles.phaseName, { color: phaseInfo.color }]}>
                {phaseInfo.name}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Adjusted Macros</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Based on your cycle phase, here are your optimized targets:
          </Text>

          <View style={styles.macroGrid}>
            {macroComparison.map((macro) => {
              const diff = macro.adjusted - macro.baseline;
              const diffPercent = Math.round((diff / macro.baseline) * 100);

              return (
                <View key={macro.label} style={[styles.macroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: isDark ? 0 : 1 }]}>
                  <View style={[styles.macroIndicator, { backgroundColor: macro.color }]} />
                  <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>{macro.label}</Text>
                  <Text style={[styles.macroValue, { color: colors.text }]}>
                    {Math.round(macro.adjusted)} <Text style={[styles.macroUnit, { color: colors.textSecondary }]}>{macro.unit}</Text>
                  </Text>
                  {diff !== 0 && (
                    <View style={[styles.diffBadge, { backgroundColor: diff > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                      <Ionicons
                        name={diff > 0 ? 'arrow-up' : 'arrow-down'}
                        size={12}
                        color={diff > 0 ? '#10B981' : '#EF4444'}
                      />
                      <Text style={[styles.diffText, { color: diff > 0 ? '#10B981' : '#EF4444' }]}>
                        {diffPercent > 0 ? '+' : ''}{diffPercent}%
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.baselineText, { color: colors.textTertiary }]}>
                    Baseline: {Math.round(macro.baseline)} {macro.unit}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Phase Tips</Text>

          <View style={styles.tipsList}>
            {phaseInfo.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={[styles.tipDot, { backgroundColor: phaseInfo.color }]} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.buttonBg }]}
            onPress={() => router.push('/(modals)/cycle-tracking' as any)}
          >
            <Ionicons name="refresh" size={18} color={colors.text} />
            <Text style={[styles.updateButtonText, { color: colors.text }]}>Update Cycle Phase</Text>
          </TouchableOpacity>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  phaseIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseEmoji: {
    fontSize: 28,
  },
  phaseInfo: {
    marginLeft: 16,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
  },
  macroIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 16,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 12,
  },
  macroValue: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 12,
  },
  macroUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 12,
    gap: 4,
  },
  diffText: {
    fontSize: 12,
    fontWeight: '600',
  },
  baselineText: {
    fontSize: 11,
    marginTop: 8,
    marginLeft: 12,
  },
  tipsList: {
    gap: 12,
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

