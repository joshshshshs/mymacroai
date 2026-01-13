/**
 * Squad Page - Complete Redesign
 * Leaderboard, squad members, weekly league
 */

import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { AppHeader } from '@/src/components/navigation/AppHeader';
import { SoftSquad } from '@/src/components/features/squad/SoftSquad';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { SPACING } from '@/src/design-system/tokens';

export default function SquadScreen() {
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
            Squad
          </ThemedText>
        </View>

        {/* Squad Content */}
        <SoftSquad />
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
