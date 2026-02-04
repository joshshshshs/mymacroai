/**
 * Hardware Hub - Wearable Device Management
 * Premium redesign with custom icons, gradients, and status indicators
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  useColorScheme,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, G, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface Device {
  id: string;
  name: string;
  type: 'apple' | 'oura' | 'whoop' | 'garmin';
  color: string;
  gradientColors: [string, string];
  status: 'connected' | 'syncing' | 'disconnected';
  lastSync?: Date;
  battery?: number;
  batteryDays?: number;
}

const DEVICES: Device[] = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    type: 'apple',
    color: '#FF2D55',
    gradientColors: ['#FF2D55', '#FF6B6B'],
    status: 'connected',
    lastSync: new Date(),
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    type: 'oura',
    color: '#1A1A1A',
    gradientColors: ['#2D2D2D', '#1A1A1A'],
    status: 'connected',
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    battery: 92,
  },
  {
    id: 'whoop',
    name: 'Whoop 4.0',
    type: 'whoop',
    color: '#00A6FF',
    gradientColors: ['#00A6FF', '#0066CC'],
    status: 'connected',
    lastSync: new Date(Date.now() - 45 * 60 * 1000),
    battery: 34,
  },
  {
    id: 'garmin',
    name: 'Garmin Watch',
    type: 'garmin',
    color: '#007DC3',
    gradientColors: ['#00A0E3', '#007DC3'],
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    batteryDays: 14,
  },
];

// Custom SVG Device Icons
const AppleHealthIcon = ({ size = 24, color = '#FF2D55' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={color}
    />
  </Svg>
);

const OuraIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" fill="none" />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

const WhoopIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" rx="6" stroke={color} strokeWidth="2.5" fill="none" />
    <Circle cx="8" cy="12" r="2" fill={color} />
    <Path d="M12 9v6M15 10v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const GarminIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

const DeviceIcon = ({ type, size = 24, color = '#FFFFFF' }: { type: Device['type']; size?: number; color?: string }) => {
  switch (type) {
    case 'apple':
      return <AppleHealthIcon size={size} color={color} />;
    case 'oura':
      return <OuraIcon size={size} color={color} />;
    case 'whoop':
      return <WhoopIcon size={size} color={color} />;
    case 'garmin':
      return <GarminIcon size={size} color={color} />;
    default:
      return <Ionicons name="watch" size={size} color={color} />;
  }
};

// Battery visualization component
const BatteryIndicator = ({
  level,
  days,
  isDark
}: {
  level?: number;
  days?: number;
  isDark: boolean;
}) => {
  const getBatteryColor = () => {
    if (days) return '#10B981'; // Battery days always green
    if (!level) return '#6B7280';
    if (level > 60) return '#10B981';
    if (level > 30) return '#F59E0B';
    return '#EF4444';
  };

  const displayValue = days ? `${days}d` : level ? `${level}%` : '--';
  const fillWidth = days ? 100 : (level || 0);

  return (
    <View style={styles.batteryContainer}>
      <View style={[styles.batteryOuter, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]}>
        <View
          style={[
            styles.batteryFill,
            {
              width: `${fillWidth}%`,
              backgroundColor: getBatteryColor(),
            }
          ]}
        />
      </View>
      <Text style={[styles.batteryText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
        {displayValue}
      </Text>
    </View>
  );
};

// Connection status indicator with pulse animation
const StatusIndicator = ({ status, isDark }: { status: Device['status']; isDark: boolean }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (status === 'connected') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.5,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'syncing': return '#F59E0B';
      case 'disconnected': return '#6B7280';
    }
  };

  return (
    <View style={styles.statusIndicatorContainer}>
      {status === 'connected' && (
        <Animated.View
          style={[
            styles.statusPulse,
            {
              backgroundColor: getStatusColor(),
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            }
          ]}
        />
      )}
      <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
    </View>
  );
};

// Format sync time
const formatSyncTime = (date?: Date): string => {
  if (!date) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ScannerBeam = ({ isDark }: { isDark: boolean }) => {
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(-150);
      Animated.timing(translateY, {
        toValue: 600,
        duration: 2500,
        useNativeDriver: true,
        easing: Easing.linear,
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
          backgroundColor: isDark ? 'rgba(255, 69, 0, 0.08)' : 'rgba(255, 69, 0, 0.06)',
          borderBottomColor: isDark ? 'rgba(255, 69, 0, 0.4)' : 'rgba(255, 69, 0, 0.3)',
        },
      ]}
      pointerEvents="none"
    />
  );
};

export default function HardwareScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const colors = {
    bg: isDark ? '#0A0A0A' : '#F5F5F7',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
    card: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    accent: '#FF4500',
  };

  const handleForceSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncing(true);
    setSyncProgress(0);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 5000,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSyncing(false);
    });

    progressAnim.addListener(({ value }) => {
      setSyncProgress(Math.round(value));
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Background gradient blobs */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={isDark
            ? ['rgba(255,69,0,0.15)', 'transparent']
            : ['rgba(255,182,150,0.4)', 'transparent']
          }
          style={[styles.blob, styles.blobTopRight]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <LinearGradient
          colors={isDark
            ? ['rgba(59,130,246,0.1)', 'transparent']
            : ['rgba(147,197,253,0.4)', 'transparent']
          }
          style={[styles.blob, styles.blobBottomLeft]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadge}>
                {isSyncing && (
                  <Animated.View
                    style={[
                      styles.pulseDot,
                      { backgroundColor: colors.accent }
                    ]}
                  />
                )}
                <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
                  {isSyncing ? 'SYNCING' : 'DEVICES'}
                </Text>
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {isSyncing ? 'Pulling\nData...' : 'Hardware\nHub'}
              </Text>

              {/* Sync Progress Bar */}
              {isSyncing && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Total Progress
                    </Text>
                    <Text style={[styles.progressValue, { color: colors.accent }]}>
                      {syncProgress}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                          backgroundColor: colors.accent,
                        }
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                }
              ]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Devices List */}
          <View style={styles.devicesContainer}>
            {isSyncing && <ScannerBeam isDark={isDark} />}

            <View style={styles.devicesList}>
              {DEVICES.map((device, index) => {
                const deviceIsSyncing = isSyncing && index === Math.floor(syncProgress / 25);
                const deviceCompleted = isSyncing && syncProgress > (index + 1) * 25;
                const deviceQueued = isSyncing && syncProgress <= index * 25;

                return (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceCard,
                      deviceIsSyncing && styles.deviceCardSyncing,
                    ]}
                    activeOpacity={0.8}
                  >
                    <BlurView
                      intensity={isDark ? 40 : 80}
                      tint={isDark ? 'dark' : 'light'}
                      style={[
                        styles.deviceCardBlur,
                        {
                          borderColor: deviceIsSyncing
                            ? colors.accent
                            : colors.cardBorder,
                        }
                      ]}
                    >
                      {deviceIsSyncing && (
                        <View style={[styles.deviceGlow, { backgroundColor: `${colors.accent}10` }]} />
                      )}

                      <View style={styles.deviceContent}>
                        <View style={styles.deviceInfo}>
                          {/* Device Icon */}
                          <LinearGradient
                            colors={device.gradientColors}
                            style={styles.deviceIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <DeviceIcon
                              type={device.type}
                              size={24}
                              color={device.type === 'apple' ? '#FFFFFF' : '#FFFFFF'}
                            />
                          </LinearGradient>

                          <View style={styles.deviceText}>
                            <View style={styles.deviceNameRow}>
                              <Text style={[styles.deviceName, { color: colors.text }]}>
                                {device.name}
                              </Text>
                              <StatusIndicator status={device.status} isDark={isDark} />
                            </View>
                            <Text style={[styles.deviceStatusText, { color: colors.textSecondary }]}>
                              {deviceIsSyncing
                                ? 'Syncing data...'
                                : deviceCompleted
                                  ? 'Sync complete'
                                  : deviceQueued
                                    ? 'Waiting...'
                                    : `Last sync: ${formatSyncTime(device.lastSync)}`}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.deviceRight}>
                          {deviceCompleted && (
                            <View style={[styles.checkBadge, { backgroundColor: `${colors.accent}15` }]}>
                              <Ionicons name="checkmark" size={20} color={colors.accent} />
                            </View>
                          )}
                          {deviceIsSyncing && (
                            <View style={[styles.syncBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                              <Ionicons name="sync" size={20} color={colors.accent} />
                            </View>
                          )}
                          {deviceQueued && (
                            <View style={[styles.queuedBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                              <Ionicons name="hourglass-outline" size={18} color={colors.textTertiary} />
                            </View>
                          )}
                          {!isSyncing && (device.battery !== undefined || device.batteryDays !== undefined) && (
                            <BatteryIndicator
                              level={device.battery}
                              days={device.batteryDays}
                              isDark={isDark}
                            />
                          )}
                        </View>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Add Device Card */}
          <TouchableOpacity
            style={[
              styles.addDeviceCard,
              {
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.addDeviceIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="add" size={24} color={colors.textSecondary} />
            </View>
            <Text style={[styles.addDeviceText, { color: colors.textSecondary }]}>
              Add New Device
            </Text>
          </TouchableOpacity>

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
                colors={isSyncing
                  ? (isDark ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['#FFFFFF', '#F9FAFB'])
                  : ['#FF4500', '#FF6A00']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.syncButtonGradient}
              >
                <Ionicons
                  name={isSyncing ? 'refresh' : 'sync'}
                  size={22}
                  color={isSyncing ? colors.textSecondary : '#FFFFFF'}
                />
                <Text style={[styles.syncButtonText, isSyncing && { color: colors.textSecondary }]}>
                  {isSyncing ? 'Syncing...' : 'Force Sync All'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.lastUpdateText, { color: colors.textTertiary }]}>
              Last full sync: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTopRight: {
    top: -100,
    right: -100,
    width: 400,
    height: 400,
  },
  blobBottomLeft: {
    bottom: -50,
    left: -100,
    width: 350,
    height: 350,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    gap: 6,
    marginBottom: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  devicesContainer: {
    position: 'relative',
  },
  scannerBeam: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 100,
    borderBottomWidth: 2,
    zIndex: 20,
    pointerEvents: 'none',
  },
  devicesList: {
    gap: 12,
    position: 'relative',
    zIndex: 10,
  },
  deviceCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  deviceCardSyncing: {
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  deviceCardBlur: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  deviceGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  deviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceText: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '700',
  },
  deviceStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusIndicatorContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPulse: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deviceRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  checkBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queuedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryOuter: {
    width: 32,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    padding: 2,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 2,
  },
  batteryText: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 32,
  },
  addDeviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addDeviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDeviceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    paddingTop: 8,
    alignItems: 'center',
  },
  syncButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
  },
  syncButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lastUpdateText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '500',
  },
});
