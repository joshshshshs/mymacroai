/**
 * Settings Screen - Preferences & Tuning
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';
import { ProfileMenuItem } from '@/src/components/profile';
import { useUserStore, TRAINING_STYLES, useBioOptimizationProfile, useCoachIntensity } from '@/src/store/UserStore';
import { useTheme, ThemeMode, getThemeLabel } from '@/hooks/useTheme';
import { PeptideStatus } from '@/src/types';

// Helper function for peptide status label
const getPeptideStatusLabel = (status: PeptideStatus, compoundCount: number): string => {
  switch (status) {
    case 'ACTIVE_DISCLOSED':
      return compoundCount > 0 ? `Active (${compoundCount} compound${compoundCount > 1 ? 's' : ''})` : 'Active (Disclosed)';
    case 'ACTIVE_UNDISCLOSED':
      return 'Active (Private)';
    case 'NONE':
      return 'Not using';
    case 'PREFER_NOT_TO_SAY':
    default:
      return 'Not configured';
  }
};

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, themePreference, setTheme, colors: themeColors } = useTheme();
  const preferences = useUserStore(s => s.preferences);
  const trainingStyles = useUserStore(s => s.trainingStyles) || [];
  const bioProfile = useBioOptimizationProfile();

  // Get display text for training styles
  const trainingStylesText = trainingStyles.length === 0
    ? 'Not set'
    : trainingStyles.length > 1
      ? `Hybrid (${trainingStyles.length} styles)`
      : TRAINING_STYLES.find(s => s.id === trainingStyles[0])?.label || 'Not set';

  // Coach Intensity from store (0-100)
  const coachIntensity = useCoachIntensity();
  const setCoachIntensity = useUserStore(s => s.setCoachIntensity);

  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Get intensity label for display
  const getIntensityLabel = (val: number): string => {
    if (val < 20) return "Zen Monk";
    if (val < 40) return "Supportive";
    if (val < 60) return "Balanced";
    if (val < 80) return "Intense";
    return "Spartan";
  };

  const colors = {
    bg: isDark ? '#121214' : '#F5F5F7',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    accent: '#FF5C00',
  };

  // Cycle through theme options
  const handleThemeChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themePreference as ThemeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  // Get theme icon
  const getThemeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (themePreference) {
      case 'dark': return 'moon';
      case 'light': return 'sunny';
      default: return 'phone-portrait-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Biological Profile */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>BIOLOGICAL PROFILE</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <ProfileMenuItem
            icon="body-outline"
            label="Weight"
            subtitle="85 kg"
            rightElement="badge"
            badgeText="Edit"
          />
          <ProfileMenuItem
            icon="resize-outline"
            label="Height"
            subtitle="183 cm"
            rightElement="badge"
            badgeText="Edit"
          />
          <ProfileMenuItem
            icon="calendar-outline"
            label="Age"
            subtitle="28 years"
            rightElement="badge"
            badgeText="Edit"
          />
        </View>

        {/* Nutrition Strategy */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NUTRITION STRATEGY</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <ProfileMenuItem
            icon="trending-down-outline"
            label="Goal"
            subtitle="Fat Loss"
            onPress={() => { }}
          />
          <ProfileMenuItem
            icon="leaf-outline"
            label="Diet Style"
            subtitle="Balanced"
            onPress={() => { }}
          />
        </View>

        {/* Training Protocol */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TRAINING PROTOCOL</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <ProfileMenuItem
            icon="barbell-outline"
            label="Training DNA"
            subtitle={trainingStylesText}
            onPress={() => router.push('/(modals)/training-onboarding')}
          />
        </View>

        {/* Bio-Optimization */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>BIO-OPTIMIZATION</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <ProfileMenuItem
            icon="flask-outline"
            label="Peptide Protocols"
            subtitle={getPeptideStatusLabel(bioProfile.peptideStatus, bioProfile.activeCompounds.length)}
            onPress={() => router.push('/(modals)/bio-optimization')}
          />
        </View>

        {/* AI Persona */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AI PERSONA</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sliderRow}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: colors.text }]}>Coach Intensity</Text>
              <Text style={[styles.intensityBadge, { color: colors.accent }]}>
                {getIntensityLabel(coachIntensity)}
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderEnd, { color: colors.textSecondary }]}>Gentle</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={coachIntensity}
                onSlidingComplete={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCoachIntensity(val);
                }}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.textSecondary}
                thumbTintColor={colors.accent}
              />
              <Text style={[styles.sliderEnd, { color: colors.textSecondary }]}>Spartan</Text>
            </View>
            <Text style={[styles.sliderHint, { color: colors.textSecondary }]}>
              Syncs instantly with AI
            </Text>
          </View>
          <ProfileMenuItem
            icon="volume-high-outline"
            label="Voice"
            subtitle="Female"
            onPress={() => { }}
          />
        </View>

        {/* App Experience */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APP EXPERIENCE</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <ProfileMenuItem
            icon={getThemeIcon()}
            label="Theme"
            subtitle={getThemeLabel(themePreference as ThemeMode)}
            onPress={handleThemeChange}
          />
          <ProfileMenuItem
            icon="scale-outline"
            label="Units"
            subtitle="Metric (kg, cm)"
            onPress={() => { }}
          />
          <ProfileMenuItem
            icon="phone-portrait-outline"
            label="Haptics"
            rightElement="toggle"
            toggleValue={hapticsEnabled}
            onToggle={setHapticsEnabled}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sliderRow: {
    padding: 14,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  intensityBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  sliderEnd: {
    fontSize: 11,
    fontWeight: '500',
  },
  sliderHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});