import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/src/design-system/tokens';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanModal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SoftDreamyBackground />
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <SoftGlassCard variant="prominent" style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="scan-outline" size={48} color={COLORS.accent.lime500} />
            </View>
            <ThemedText style={styles.title}>Scanner Coming Soon</ThemedText>
            <ThemedText style={styles.description}>
              We are building a powerful AI food scanner.
              Stay tuned for updates!
            </ThemedText>
          </SoftGlassCard>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
  },
  closeButton: {
    padding: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.pill,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.pill,
  },
  title: {
    ...TYPOGRAPHY.heading.h2,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body.medium,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});