/**
 * Wearable Sync - Connect and configure wearable devices
 * Supports Oura, Whoop, Garmin, Samsung Health, and Google Fit integration
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { useWearableConnections, WearableDevice } from '@/hooks/useWearableConnections';

export default function WearableSyncScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    devices,
    isInitialized,
    error,
    connect,
    disconnect,
    syncDevice,
    syncAll,
  } = useWearableConnections();

  const handleConnect = useCallback(async (device: WearableDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check platform compatibility
    if (device.id === 'samsung_health' && Platform.OS !== 'android') {
      Alert.alert('Not Available', 'Samsung Health is only available on Android devices.');
      return;
    }

    if (device.id === 'apple_health' && Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Health is only available on iOS devices.');
      return;
    }

    const success = await connect(device.id);

    if (!success && device.supportsOAuth) {
      Alert.alert(
        'Connection Started',
        'Complete the sign-in process in your browser to connect.',
        [{ text: 'OK' }]
      );
    }
  }, [connect]);

  const handleDisconnect = useCallback((device: WearableDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnect(device.id),
        },
      ]
    );
  }, [disconnect]);

  const handleSync = useCallback(async (device: WearableDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await syncDevice(device.id);

    if (!success) {
      Alert.alert('Sync Failed', 'Could not sync with device. Please try again.');
    }
  }, [syncDevice]);

  // Filter devices based on platform
  const filteredDevices = devices.filter(device => {
    if (device.id === 'samsung_health' && Platform.OS !== 'android') return false;
    if (device.id === 'google_fit' && Platform.OS !== 'android') return false;
    if (device.id === 'apple_health' && Platform.OS !== 'ios') return false;
    return true;
  });

  const formatLastSync = (date?: Date) => {
    if (!date) return null;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

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
          <Text style={styles.title}>Connect Wearable</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Connect your wearable devices to sync recovery, sleep, and activity data automatically.
          </Text>

          <View style={styles.deviceList}>
            {filteredDevices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
                  style={styles.deviceGradient}
                />

                <View style={styles.deviceHeader}>
                  <View style={[styles.deviceIcon, { backgroundColor: device.color }]}>
                    <Text style={styles.deviceEmoji}>{device.icon}</Text>
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceDescription}>{device.description}</Text>
                    {device.connectionStatus.connected && device.connectionStatus.lastSync && (
                      <Text style={styles.lastSyncText}>
                        Last sync: {formatLastSync(device.connectionStatus.lastSync)}
                      </Text>
                    )}
                  </View>
                  {device.connectionStatus.connected && (
                    <View style={styles.connectedBadge}>
                      <View style={styles.connectedDot} />
                      <Text style={styles.connectedText}>Connected</Text>
                    </View>
                  )}
                </View>

                <View style={styles.deviceActions}>
                  {device.connectionStatus.connected ? (
                    <>
                      <TouchableOpacity
                        style={styles.syncButton}
                        onPress={() => handleSync(device)}
                        disabled={device.isLoading}
                      >
                        {device.isLoading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Ionicons name="sync" size={16} color="#FFF" />
                            <Text style={styles.syncButtonText}>Sync Now</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.disconnectButton}
                        onPress={() => handleDisconnect(device)}
                      >
                        <Text style={styles.disconnectButtonText}>Disconnect</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.connectButton}
                      onPress={() => handleConnect(device)}
                      disabled={device.isLoading}
                    >
                      {device.isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons name="link" size={16} color="#FFF" />
                          <Text style={styles.connectButtonText}>Connect</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="warning" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your Data is Secure</Text>
              <Text style={styles.infoText}>
                We only access the data you authorize and never share your health information with third parties.
              </Text>
            </View>
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
  deviceList: {
    gap: 16,
  },
  deviceCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  deviceGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceEmoji: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  deviceDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4500',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  syncButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  disconnectButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  disconnectButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
  lastSyncText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    flex: 1,
  },
});
