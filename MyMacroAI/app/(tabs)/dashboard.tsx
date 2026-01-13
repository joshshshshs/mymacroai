/**
 * Dashboard Page - The Cockpit
 * "Heads-Up Display" (HUD) organized into intelligent layers.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { CockpitDashboard } from '@/src/components/features/dashboard/CockpitDashboard';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CockpitDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1410', // Deep Forest Base
  },
});
