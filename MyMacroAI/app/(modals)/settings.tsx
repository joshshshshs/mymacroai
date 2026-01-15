/**
 * Settings Screen - Preferences & Tuning
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

import { SPACING } from '@/src/design-system/tokens';
import { ProfileMenuItem } from '@/src/components/profile';
import { useUserStore, TRAINING_STYLES } from '@/src/store/UserStore';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const preferences = useUserStore(s => s.preferences);
  const trainingStyles = useUserStore(s => s.trainingStyles) || [];

  // Get display text for training styles
  const trainingStylesText = trainingStyles.length === 0
    ? 'Not set'
    : trainingStyles.length > 1
      ? `Hybrid (${trainingStyles.length} styles)`
      : TRAINING_STYLES.find(s => s.id === trainingStyles[0])?.label || 'Not set';

  const [aiPersona, setAiPersona] = useState(0.5); // 0 = Gentle, 1 = Spartan
  const [haptics, setHaptics] = useState(true);

  const colors = {
    bg: isDark ? '#121214' : '#F5F5F7',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    accent: '#FF5C00',
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

        {/* AI Persona */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AI PERSONA</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>Coach Intensity</Text>
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderEnd, { color: colors.textSecondary }]}>Gentle</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={aiPersona}
                onValueChange={setAiPersona}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.textSecondary}
                thumbTintColor={colors.accent}
              />
              <Text style={[styles.sliderEnd, { color: colors.textSecondary }]}>Spartan</Text>
            </View>
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
            icon="moon-outline"
            label="Theme"
            subtitle="System"
            onPress={() => { }}
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
            toggleValue={haptics}
            onToggle={setHaptics}
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
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
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
});