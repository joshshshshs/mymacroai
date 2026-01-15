/**
 * AI Narrative Tab - Daily Narrative Engine
 * Inspired by iOS AI Daily Narrative design with glass morphism
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useUserStore } from '@/src/store/UserStore';
import { useOmniLogger } from '@/hooks/useOmniLogger';
import { SPACING, RADIUS, SHADOWS } from '@/src/design-system/tokens';

// Icons
const SparkleIcon = ({ color = '#9CA3AF' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const MicIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="4.5" width="6" height="9" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M6 11.5v1a6 6 0 0 0 12 0v-1" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <Path d="M12 17.5v2.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <Path d="M9 20h6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

const TrendingUpIcon = ({ color = '#FF4500' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17l6-6 4 4 8-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M17 7h4v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const FlameIcon = ({ color = '#F97316' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2c-2 3-4 5.5-4 8.5a4 4 0 0 0 8 0c0-3-2-5.5-4-8.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ScienceIcon = ({ color = '#3B82F6' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 3h6v7l5 8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2l5-8V3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const BedIcon = ({ color = '#8B5CF6' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <Path
      d="M3 10v7a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <Path d="M5 10V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

export default function AiNarrativeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const healthMetrics = useUserStore(state => state.healthMetrics);
  const currentIntake = useUserStore(state => state.currentIntake);
  const dailyTarget = useUserStore(state => state.dailyTarget);

  const {
    startListening,
    stopListening,
    isListening,
    isProcessing,
    isExecuting,
  } = useOmniLogger();

  const [inputText, setInputText] = useState('');

  const isVoiceBusy = isListening || isProcessing || isExecuting;

  const handleVoicePress = async () => {
    if (isVoiceBusy) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate readiness score (simple mock based on metrics)
  const getReadinessScore = () => {
    let score = 75; // Base score
    if (healthMetrics.sleepMinutes && healthMetrics.sleepMinutes >= 420) score += 10;
    if (healthMetrics.heartRate && healthMetrics.heartRate < 70) score += 5;
    if (healthMetrics.steps && healthMetrics.steps > 5000) score += 10;
    return Math.min(score, 100);
  };

  const readinessScore = getReadinessScore();
  const userName = user?.name?.split(' ')[0] || 'User';

  // Calculate calorie adjustment
  const calorieAdjustment = Math.floor((dailyTarget.calories - currentIntake.calories) * 0.18);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Soft Dreamy Background Blobs */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.blob, styles.blobTopLeft]} />
        <View style={[styles.blob, styles.blobTopRight]} />
        <View style={[styles.blob, styles.blobBottom]} />
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.narrativeBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.narrativeBadgeText}>NARRATIVE ENGINE</Text>
            </View>
            <Text style={styles.greeting}>
              {getGreeting()},{'\n'}
              <Text style={styles.userName}>{userName}.</Text>
            </Text>
          </View>

          {/* Hero Priority Card */}
          <View style={styles.priorityCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glassCard}
            >
              {/* Accent Blob */}
              <View style={styles.cardAccentBlob} />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityBadgeText}>TOP PRIORITY</Text>
                  </View>
                  <SparkleIcon color="#9CA3AF" />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.focusLabel}>Current Focus</Text>
                  <Text style={styles.focusTitle}>
                    Recovery{'\n'}Optimization
                  </Text>
                  <Text style={styles.focusDescription}>
                    Your metabolic baseline suggests optimal recovery capacity today. We've adjusted your intensity targets accordingly.
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.readinessContainer}>
                    <View style={styles.readinessInfo}>
                      <Text style={styles.readinessLabel}>READINESS</Text>
                      <Text style={styles.readinessValue}>{readinessScore}%</Text>
                    </View>
                    <View style={styles.readinessRing}>
                      <Svg width={40} height={40} viewBox="0 0 36 36">
                        <Circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke="rgba(234, 104, 66, 0.2)"
                          strokeWidth="3"
                        />
                        <Circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke="#FF4500"
                          strokeWidth="3"
                          strokeDasharray={`${readinessScore}, 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </Svg>
                    </View>
                  </View>

                  <View style={styles.adaptationTag}>
                    <TrendingUpIcon />
                    <Text style={styles.adaptationText}>Peak adaptation window open</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* System Alerts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SYSTEM ALERTS</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.alertsScroll}
            >
              <View style={styles.alertCard}>
                <View style={styles.alertIcon}>
                  <FlameIcon />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTime}>10m ago</Text>
                  <Text style={styles.alertLabel}>Dietary Change</Text>
                  <Text style={styles.alertTitle}>Target Adjusted (+{calorieAdjustment}kcal)</Text>
                </View>
              </View>

              <View style={styles.alertCard}>
                <View style={[styles.alertIcon, { backgroundColor: '#DBEAFE' }]}>
                  <ScienceIcon />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTime}>2h ago</Text>
                  <Text style={styles.alertLabel}>Training</Text>
                  <Text style={styles.alertTitle}>New Protocol Generated</Text>
                </View>
              </View>

              <View style={styles.alertCard}>
                <View style={[styles.alertIcon, { backgroundColor: '#EDE9FE' }]}>
                  <BedIcon />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTime}>7h ago</Text>
                  <Text style={styles.alertLabel}>Recovery</Text>
                  <Text style={styles.alertTitle}>Sleep Cycle Optimized</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Glass Dock Input */}
        <View style={[styles.dockContainer, { bottom: insets.bottom + 8 }]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.7)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassDock}
          >
            <View style={styles.dockContent}>
              <TextInput
                style={styles.input}
                placeholder="Ask anything..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity
                style={styles.micButton}
                onPress={handleVoicePress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={isVoiceBusy ? ['#EF4444', '#DC2626'] : ['#1F2937', '#111827']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.micGradient}
                >
                  <MicIcon />
                </LinearGradient>
                {isVoiceBusy && <View style={styles.micPulse} />}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.6,
  },
  blobTopLeft: {
    top: '-10%',
    left: '-10%',
    width: '80%',
    height: '50%',
    backgroundColor: '#DBEAFE',
  },
  blobTopRight: {
    top: '20%',
    right: '-20%',
    width: '70%',
    height: '60%',
    backgroundColor: '#FED7AA',
  },
  blobBottom: {
    bottom: '10%',
    left: '10%',
    width: '60%',
    height: '40%',
    backgroundColor: '#E9D5FF',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 8,
  },
  statusTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusIcon: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  narrativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4500',
  },
  narrativeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '300',
    color: '#111827',
    lineHeight: 40,
  },
  userName: {
    fontWeight: '800',
    color: '#000000',
  },
  priorityCard: {
    marginBottom: 32,
  },
  glassCard: {
    borderRadius: 40,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  cardAccentBlob: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(234, 104, 66, 0.1)',
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF4500',
    letterSpacing: 1.2,
  },
  cardBody: {
    marginBottom: 24,
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  focusTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 36,
    marginBottom: 16,
  },
  focusDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 20,
  },
  cardFooter: {
    gap: 8,
  },
  readinessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  readinessInfo: {
    flex: 1,
  },
  readinessLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 2,
  },
  readinessValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  readinessRing: {
    width: 40,
    height: 40,
  },
  adaptationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adaptationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingLeft: 4,
  },
  alertsScroll: {
    gap: 12,
    paddingRight: 24,
  },
  alertCard: {
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...SHADOWS.sm,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alertContent: {
    gap: 2,
  },
  alertTime: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  alertLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 18,
  },
  dockContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 100,
  },
  glassDock: {
    borderRadius: 999,
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.glass,
  },
  dockContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    paddingLeft: 16,
  },
  micButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    position: 'relative',
  },
  micGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  micPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
