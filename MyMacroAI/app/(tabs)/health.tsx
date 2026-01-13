/**
 * Health Page - Complete Redesign
 * Recovery hub, wearables, HRV, sleep tracking
 */

import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { SoftHealth } from '@/src/components/features/health/SoftHealth';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { SPACING } from '@/src/design-system/tokens';

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
            Health
          </ThemedText>
        </View>

        {/* Health Content */}
        <SoftHealth />
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
});
