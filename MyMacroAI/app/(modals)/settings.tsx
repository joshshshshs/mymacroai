import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { ThemedText } from '@/src/components/ui/ThemedText';

export default function SettingsModal() {
  const router = useRouter();
  const { hardware, actions } = useUserStore();
  const { light } = useHaptics();

  const handleToggleHardware = (value: boolean) => {
    light();
    if (value) {
      // Simulate HealthKit Permissions Flow
      // In a real app, you'd trigger the native permission dialog here.
      actions.setHardware(true, 'apple');
    } else {
      actions.setHardware(false, 'none');
    }
  };

  return (
    <View style={styles.container}>
      <SoftDreamyBackground />

      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="h3" style={styles.headerTitle}>Settings</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <ThemedText variant="label" style={styles.sectionTitle}>Device Connections</ThemedText>

        <SoftGlassCard variant="soft" style={styles.settingCard}>
          <View style={styles.cardRow}>
            <View style={styles.iconContainer}>
              <Ionicons name={hardware.hasWearable ? "watch" : "watch-outline"} size={24} color={hardware.hasWearable ? "#10B981" : "#FFF"} />
            </View>
            <View style={styles.textContainer}>
              <ThemedText variant="body" weight="600" style={styles.settingLabel}>Wearable Integration</ThemedText>
              <ThemedText variant="caption" style={styles.settingSubLabel}>
                {hardware.hasWearable
                  ? "Connected to " + (hardware.deviceType === 'apple' ? 'Apple Health' : 'Device')
                  : "Sync HealthKit / Garmin"
                }
              </ThemedText>
            </View>
            <Switch
              value={hardware.hasWearable}
              onValueChange={handleToggleHardware}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16, 185, 129, 0.5)' }}
              thumbColor={hardware.hasWearable ? '#10B981' : '#f4f3f4'}
              ios_backgroundColor="rgba(255,255,255,0.1)"
            />
          </View>

          {hardware.hasWearable && (
            <View style={styles.activeModules}>
              <View style={styles.moduleTag}>
                <Ionicons name="heart" size={12} color="#F87171" />
                <Text style={styles.moduleText}>Heart Rate</Text>
              </View>
              <View style={styles.moduleTag}>
                <Ionicons name="moon" size={12} color="#60A5FA" />
                <Text style={styles.moduleText}>Sleep Analysis</Text>
              </View>
            </View>
          )}
        </SoftGlassCard>

        <SoftGlassCard variant="soft" style={StyleSheet.flatten([styles.settingCard, { marginTop: 12, opacity: 0.6 }])}>
          <View style={styles.cardRow}>
            <View style={styles.textContainer}>
              <Text style={styles.settingLabel}>Coming Soon</Text>
              <Text style={styles.settingSubLabel}>Advanced Smart Scale Integration</Text>
            </View>
          </View>
        </SoftGlassCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color handled by SoftDreamyBackground
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe Area approx
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10,
  },
  settingCard: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  activeModules: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  moduleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  moduleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  }
});