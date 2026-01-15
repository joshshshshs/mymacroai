/**
 * Cycle Tracking - Log and track menstrual cycle phases
 * Provides phase-based macro adjustments
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { cyclePhaseAdapter, CyclePhase } from '@/src/services/nutrition/CyclePhaseAdapter';

interface PhaseOption {
  id: CyclePhase;
  name: string;
  description: string;
  color: string;
  icon: string;
  days: string;
}

const PHASES: PhaseOption[] = [
  {
    id: 'menstrual',
    name: 'Menstrual',
    description: 'Focus on iron-rich foods and anti-inflammatory nutrients',
    color: '#EF4444',
    icon: '🌙',
    days: 'Days 1-5',
  },
  {
    id: 'follicular',
    name: 'Follicular',
    description: 'Great for higher intensity, increase carbs for energy',
    color: '#10B981',
    icon: '🌱',
    days: 'Days 6-13',
  },
  {
    id: 'ovulatory',
    name: 'Ovulatory',
    description: 'Peak performance window, maintain balanced macros',
    color: '#F59E0B',
    icon: '☀️',
    days: 'Days 14-17',
  },
  {
    id: 'luteal',
    name: 'Luteal',
    description: 'Higher calorie needs, focus on magnesium and B vitamins',
    color: '#8B5CF6',
    icon: '🌸',
    days: 'Days 18-28',
  },
];

export default function CycleTrackingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase | null>(null);
  const [cycleDay, setCycleDay] = useState(1);
  const [saving, setSaving] = useState(false);

  const handlePhaseSelect = useCallback((phase: CyclePhase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPhase(phase);

    // Auto-estimate cycle day based on phase
    switch (phase) {
      case 'menstrual':
        setCycleDay(3);
        break;
      case 'follicular':
        setCycleDay(10);
        break;
      case 'ovulatory':
        setCycleDay(15);
        break;
      case 'luteal':
        setCycleDay(22);
        break;
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPhase) {
      Alert.alert('Select Phase', 'Please select your current cycle phase');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    try {
      await cyclePhaseAdapter.logCyclePhase(
        'current-user',
        selectedPhase,
        cycleDay,
        28
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Phase Logged',
        'Your nutrition targets have been adjusted based on your cycle phase.',
        [{ text: 'View Adjustments', onPress: () => router.push('/(modals)/cycle-macros' as any) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save cycle phase. Please try again.');
    }

    setSaving(false);
  }, [selectedPhase, cycleDay, router]);

  const adjustDay = useCallback((delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCycleDay(prev => Math.max(1, Math.min(35, prev + delta)));
  }, []);

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
          <Text style={styles.title}>Cycle Tracking</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Track your cycle to receive personalized macro adjustments that support your body's changing needs.
          </Text>

          <View style={styles.daySelector}>
            <Text style={styles.dayLabel}>Cycle Day</Text>
            <View style={styles.dayControls}>
              <TouchableOpacity
                style={styles.dayButton}
                onPress={() => adjustDay(-1)}
              >
                <Ionicons name="remove" size={20} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.dayDisplay}>
                <Text style={styles.dayValue}>{cycleDay}</Text>
              </View>
              <TouchableOpacity
                style={styles.dayButton}
                onPress={() => adjustDay(1)}
              >
                <Ionicons name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Select Current Phase</Text>

          <View style={styles.phaseList}>
            {PHASES.map((phase) => (
              <TouchableOpacity
                key={phase.id}
                style={[
                  styles.phaseCard,
                  selectedPhase === phase.id && {
                    borderColor: phase.color,
                    backgroundColor: `${phase.color}15`,
                  },
                ]}
                onPress={() => handlePhaseSelect(phase.id)}
              >
                <View style={[styles.phaseIcon, { backgroundColor: `${phase.color}20` }]}>
                  <Text style={styles.phaseEmoji}>{phase.icon}</Text>
                </View>
                <View style={styles.phaseInfo}>
                  <View style={styles.phaseHeader}>
                    <Text style={[styles.phaseName, { color: phase.color }]}>{phase.name}</Text>
                    <Text style={styles.phaseDays}>{phase.days}</Text>
                  </View>
                  <Text style={styles.phaseDescription}>{phase.description}</Text>
                </View>
                {selectedPhase === phase.id && (
                  <View style={[styles.checkmark, { backgroundColor: phase.color }]}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !selectedPhase && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!selectedPhase || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save & Adjust Macros'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Phase-based adjustments are research-backed and help optimize your nutrition throughout your cycle.
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    marginBottom: 24,
  },
  daySelector: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  dayLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  dayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDisplay: {
    width: 80,
    alignItems: 'center',
  },
  dayValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  phaseList: {
    gap: 12,
    marginBottom: 24,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  phaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseEmoji: {
    fontSize: 24,
  },
  phaseInfo: {
    flex: 1,
    marginLeft: 14,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  phaseDays: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  phaseDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#FF4500',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
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
