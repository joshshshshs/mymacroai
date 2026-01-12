import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

// UI Components
import { DreamyBackground } from '@/src/components/ui/DreamyBackground';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { GlassDockNav, TabItem } from '@/src/components/ui/GlassDockNav';
import { JarvisMicButton } from '@/src/components/ui/JarvisMicButton';
import { LiquidRing } from '@/src/components/ui/LiquidRing';
import { OmniLoggerSheet } from '@/src/components/features/input/OmniLoggerSheet';

// Utils
import { haptics } from '@/src/utils/haptics';

import { useUserStore } from '@/src/store/UserStore'; // Added useUserStore
import { geminiService } from '@/src/services/ai/GeminiService'; // Added geminiService

export default function DashboardScreen() {
  const router = useRouter(); // Added router
  const [activeTab, setActiveTab] = useState(0);
  const [isOmniLoggerOpen, setIsOmniLoggerOpen] = useState(false);

  const { currentIntake, dailyTarget, coins } = useUserStore(); // Added user store state

  // Dynamic Context Message
  const [contextMessage, setContextMessage] = useState("Analyzing biometrics...");

  useEffect(() => {
    // Update context message based on time of day
    const hour = new Date().getHours();
    setContextMessage(geminiService.getContextMessage(hour));
  }, []);

  // Calculate Remaining
  const remainingCals = dailyTarget.calories - currentIntake.calories;
  const progress = Math.min(currentIntake.calories / dailyTarget.calories, 1);

  // Derived Data for Display
  const calories = {
    current: currentIntake.calories,
    target: dailyTarget.calories,
    remaining: remainingCals,
    macros: {
      protein: { current: currentIntake.protein, target: dailyTarget.protein, label: 'Protein' },
      carbs: { current: currentIntake.carbs, target: dailyTarget.carbs, label: 'Carbs' },
      fats: { current: currentIntake.fats, target: dailyTarget.fats, label: 'Fats' },
    }
  };

  const navTabs: TabItem[] = [
    { icon: 'home-outline', label: 'Home' },
    { icon: 'restaurant-outline', label: 'Kitchen' },
    { icon: 'mic', label: '', isJarvis: true },
    { icon: 'pulse-outline', label: 'Biology' },
    { icon: 'people-outline', label: 'Squad' },
  ];

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    haptics.selection();
  };

  const handleMicPress = () => {
    haptics.medium();
    setIsOmniLoggerOpen(true);
  };

  return (
    <View style={styles.container}>
      {/* 0. Background */}
      <DreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Spacer (AppHeader is in MainLayout) */}
          <View style={{ height: 60 }} />

          {/* 1. Hero Section: Nested Liquid Rings */}
          <View style={styles.heroSection}>
            <View style={styles.ringsContainer}>
              {/* Outer: Protein (Green) */}
              <View style={styles.ringWrapper}>
                <LiquidRing
                  value={(calories.macros.protein.current / calories.macros.protein.target) * 100}
                  size={280}
                  color="#10B981"
                  strokeWidth={12}
                />
              </View>
              {/* Middle: Carbs (Blue) */}
              <View style={[styles.ringWrapper, styles.absoluteCenter]}>
                <LiquidRing
                  value={(calories.macros.carbs.current / calories.macros.carbs.target) * 100}
                  size={220}
                  color="#3B82F6"
                  strokeWidth={12}
                />
              </View>
              {/* Inner: Fats (Orange) */}
              <View style={[styles.ringWrapper, styles.absoluteCenter]}>
                <LiquidRing
                  value={(calories.macros.fats.current / calories.macros.fats.target) * 100}
                  size={160}
                  color="#F59E0B"
                  strokeWidth={12}
                />
              </View>

              {/* Center Text */}
              <View style={styles.centerTextContainer}>
                <Text style={styles.heroNumber}>{calories.remaining}</Text>
                <Text style={styles.heroLabel}>kcal left</Text>
              </View>
            </View>
          </View>

          {/* Context Card - Intelligent Insight */}
          <View className="mx-5 mb-6">
            <GlassCard variant="default" intensity={20}>
              <View className="flex-row items-center space-x-3 p-1">
                <Ionicons name="sparkles" size={18} color="#FCD34D" />
                <Text className="text-mist-50 text-sm font-medium flex-1">
                  {contextMessage}
                </Text>
              </View>
            </GlassCard>
          </View>

          {/* 3. Quick Stream (Recent Logs) */}
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          <View style={styles.streamContainer}>
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} style={styles.streamItem} intensity={20}>
                <View style={styles.streamRow}>
                  <View style={styles.streamIconBg}>
                    <Ionicons name="fast-food-outline" size={16} color="#A3E635" />
                  </View>
                  <View>
                    <Text style={styles.streamTitle}>Oatmeal & Berries</Text>
                    <Text style={styles.streamTime}>8:30 AM • 450 kcal</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>

          {/* Spacer for Dock Nav */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Omni-Logger Sheet */}
      <OmniLoggerSheet
        visible={isOmniLoggerOpen}
        onClose={() => setIsOmniLoggerOpen(false)}
      />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  ringsContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    // Ensuring rings are centered is handled by absolute positioning logic below
  },
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -500 }, { translateY: -500 }], // Hacky without dynamic sizes? 
    // Actually, transform translate percent is relative to element size.
    // -50% of element size works.
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: -4,
  },
  contextCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contextTextContainer: {
    flex: 1,
  },
  contextTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contextBody: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streamContainer: {
    gap: 12,
  },
  streamItem: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  streamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streamIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '500',
  },
  streamTime: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
});