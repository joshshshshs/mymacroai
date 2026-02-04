/**
 * Hardware Hub - Wearable Device Management
 * Connect and sync health data from multiple devices
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Device {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'syncing' | 'queued';
  lastSync?: string;
  battery?: string;
  statusText: string;
}

const DEVICES: Device[] = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    icon: '❤️',
    color: '#EF4444',
    status: 'connected',
    statusText: 'Auto-Sync Active',
    lastSync: 'Now',
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    icon: '💍',
    color: '#111827',
    status: 'connected',
    statusText: 'Last Sync: 2m ago',
    battery: '92%',
  },
  {
    id: 'whoop',
    name: 'Whoop 4.0',
    icon: '💪',
    color: '#1F2937',
    status: 'connected',
    statusText: 'Sync: 45m ago',
    battery: '34%',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    icon: '⌚',
    color: '#2563EB',
    status: 'connected',
    statusText: 'Sync: 5m ago',
    battery: '14d',
  },
];

const ScannerBeam = () => {
  const translateY = React.useRef(new Animated.Value(-150)).current;

  React.useEffect(() => {
    const animate = () => {
      translateY.setValue(-150);
      Animated.timing(translateY, {
        toValue: 600,
        duration: 2500,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.scannerBeam,
        {
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    />
  );
};

export default function HardwareScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(72);

  const handleForceSync = () => {
    setIsSyncing(true);
    // Simulate sync progress
    setTimeout(() => {
      setIsSyncing(false);
    }, 5000);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Soft Background Blobs */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.blob, styles.blobTopRight]} />
        <View style={[styles.blob, styles.blobBottomLeft]} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
          <View style={styles.statusIcons}>
            <Text style={styles.statusIcon}>📶</Text>
            <Text style={styles.statusIcon}>📡</Text>
            <Text style={styles.statusIcon}>🔋</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadge}>
                {isSyncing && <View style={styles.pulseDot} />}
                <Text style={[styles.headerLabel, isSyncing && { color: '#FF4500' }]}>
                  {isSyncing ? 'SYSTEM STATUS' : 'CONNECTIVITY'}
                </Text>
              </View>
              <Text style={styles.headerTitle}>
                {isSyncing ? 'Syncing CNS\nPipelines...' : 'Hardware\nHub'}
              </Text>

              {/* Sync Progress Bar */}
              {isSyncing && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Total Progress</Text>
                    <Text style={styles.progressValue}>{syncProgress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${syncProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Devices List */}
          <View style={styles.devicesContainer}>
            {isSyncing && <ScannerBeam />}

            <View style={styles.devicesList}>
              {DEVICES.map((device, index) => {
                const deviceIsSyncing = isSyncing && index === 2; // Whoop is syncing
                const deviceCompleted = isSyncing && index < 2; // First two completed
                const deviceQueued = isSyncing && index > 2; // Rest queued

                return (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceCard,
                      deviceIsSyncing && styles.deviceCardSyncing,
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.6)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.deviceCardGradient}
                    >
                      {deviceIsSyncing && (
                        <View style={styles.deviceGlow} />
                      )}

                      <View style={styles.deviceContent}>
                        <View style={styles.deviceInfo}>
                          <View style={[styles.deviceIcon, { backgroundColor: device.color }]}>
                            <Text style={styles.deviceEmoji}>{device.icon}</Text>
                          </View>
                          <View style={styles.deviceText}>
                            <Text style={styles.deviceName}>{device.name}</Text>
                            <View style={styles.deviceStatus}>
                              {deviceCompleted && (
                                <View style={styles.statusDot} />
                              )}
                              {deviceQueued && (
                                <View style={[styles.statusDot, { backgroundColor: '#D1D5DB' }]} />
                              )}
                              <Text
                                style={[
                                  styles.deviceStatusText,
                                  deviceIsSyncing && styles.deviceStatusTextSyncing,
                                  deviceQueued && styles.deviceStatusTextQueued,
                                ]}
                              >
                                {deviceIsSyncing
                                  ? 'Decrypting Packets...'
                                  : deviceCompleted
                                    ? device.id === 'apple-health'
                                      ? 'Biometrics Secured'
                                      : 'Data Stream Active'
                                    : deviceQueued
                                      ? 'Queued'
                                      : device.statusText}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.deviceRight}>
                          {deviceCompleted && (
                            <View style={styles.checkBadge}>
                              <Ionicons name="checkmark" size={20} color="#FF4500" />
                            </View>
                          )}
                          {deviceIsSyncing && (
                            <View style={styles.syncBadge}>
                              <Ionicons name="sync" size={20} color="#FF4500" />
                            </View>
                          )}
                          {deviceQueued && (
                            <View style={styles.queuedBadge}>
                              <Ionicons name="hourglass-outline" size={18} color="#9CA3AF" />
                            </View>
                          )}
                          {!isSyncing && device.battery && (
                            <View style={styles.batteryBadge}>
                              <Ionicons
                                name="battery-full"
                                size={14}
                                color={
                                  device.battery.includes('%')
                                    ? parseInt(device.battery) > 50
                                      ? '#10B981'
                                      : '#F59E0B'
                                    : '#10B981'
                                }
                                style={{ transform: [{ rotate: '90deg' }] }}
                              />
                              <Text style={styles.batteryText}>{device.battery}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.syncButton,
                isSyncing && styles.syncButtonActive,
              ]}
              onPress={handleForceSync}
              activeOpacity={0.9}
              disabled={isSyncing}
            >
              <LinearGradient
                colors={isSyncing ? ['#FFFFFF', '#F9FAFB'] : ['#FF4500', '#FF4500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.syncButtonGradient}
              >
                <Ionicons
                  name={isSyncing ? 'refresh' : 'sync'}
                  size={22}
                  color={isSyncing ? '#6B7280' : '#FFFFFF'}
                  style={isSyncing ? styles.spinningIcon : undefined}
                />
                <Text style={[styles.syncButtonText, isSyncing && styles.syncButtonTextActive]}>
                  Force Pull Data
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.lastUpdateText}>
              Last full system update: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F4F6',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.4,
  },
  blobTopRight: {
    top: '-20%',
    right: '-20%',
    width: 600,
    height: 600,
    backgroundColor: '#FED7AA',
  },
  blobBottomLeft: {
    bottom: '-10%',
    left: '-20%',
    width: 500,
    height: 500,
    backgroundColor: '#DBEAFE',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  statusTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusIcon: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4500',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#121212',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF4500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 999,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  devicesContainer: {
    position: 'relative',
    paddingVertical: 16,
  },
  scannerBeam: {
    position: 'absolute',
    left: -16,
    right: -16,
    height: 120,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 69, 0, 0.3)',
    zIndex: 20,
    pointerEvents: 'none',
  },
  devicesList: {
    gap: 12,
    position: 'relative',
    zIndex: 10,
  },
  deviceCard: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  deviceCardSyncing: {
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  deviceCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  deviceGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 69, 0, 0.05)',
  },
  deviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  deviceEmoji: {
    fontSize: 24,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 2,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  deviceStatusTextSyncing: {
    color: '#FF4500',
  },
  deviceStatusTextQueued: {
    color: '#9CA3AF',
  },
  deviceRight: {
    alignItems: 'flex-end',
  },
  checkBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queuedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4B5563',
  },
  actionContainer: {
    paddingTop: 8,
    alignItems: 'center',
  },
  syncButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 8,
  },
  syncButtonActive: {
    shadowOpacity: 0,
  },
  syncButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  syncButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  syncButtonTextActive: {
    color: '#6B7280',
  },
  spinningIcon: {
    // Animation would be added via Animated API
  },
  lastUpdateText: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
