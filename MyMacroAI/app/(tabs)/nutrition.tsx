/**
 * Nutrition Page - Complete Redesign
 * Features: Today's Intake, History, Pantry
 * Uses new minimal header and segmented control
 */

import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { SegmentedControl } from '@/src/components/features/nutrition/SegmentedControl';
import { SoftNutritionToday } from '@/src/components/features/nutrition/SoftNutritionToday';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { SPACING } from '@/src/design-system/tokens';

export default function NutritionScreen() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabs = ['Today', 'History', 'Pantry'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={[]}>
        {/* Global Header */}
        <AppHeader />

        {/* Screen Title */}
        <View style={styles.titleContainer}>
          <ThemedText variant="premium-heading" style={styles.screenTitle}>
            Nutrition
          </ThemedText>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedContainer}>
          <SegmentedControl
            segments={tabs}
            activeIndex={activeTabIndex}
            onChange={setActiveTabIndex}
          />
        </View>

        {/* Content */}
        {activeTabIndex === 0 && <SoftNutritionToday />}
        {activeTabIndex === 1 && (
          <View style={styles.placeholderView}>
            <ThemedText variant="h3" style={styles.placeholderText}>
              History View Coming Soon
            </ThemedText>
          </View>
        )}
        {activeTabIndex === 2 && (
          <View style={styles.placeholderView}>
            <ThemedText variant="h3" style={styles.placeholderText}>
              Pantry View Coming Soon
            </ThemedText>
          </View>
        )}
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
  titleContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  segmentedContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  placeholderView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  placeholderText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
