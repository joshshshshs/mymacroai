/**
 * User Profile View - Social Profile Paper Trail
 * View another user's profile with matchup stats and recent wins
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

interface Achievement {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  category: string;
  timeAgo: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    icon: '🏆',
    iconColor: '#F59E0B',
    title: 'Hit 95% Recovery',
    category: 'Sleep & Rest',
    timeAgo: '2h ago',
  },
  {
    id: '2',
    icon: '🔥',
    iconColor: '#FF4500',
    title: "Completed 'Murph'",
    category: 'CrossFit',
    timeAgo: 'Yesterday',
  },
  {
    id: '3',
    icon: '💧',
    iconColor: '#3B82F6',
    title: '7 Day Hydration Streak',
    category: 'Habits',
    timeAgo: '2 days ago',
  },
];

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const heartbeatScale = useRef(new Animated.Value(1)).current;

  // Get user data from params
  const userName = (params.name as string) || 'User';
  const userHandle = (params.handle as string) || '';
  const isOnline = true;

  useEffect(() => {
    // Heartbeat animation for Nudge button
    const animate = () => {
      Animated.sequence([
        Animated.timing(heartbeatScale, {
          toValue: 1.03,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(animate, 1000);
      });
    };
    animate();
  }, []);

  const handleNudge = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // In a full implementation, this would:
    // 1. Get the target user's push token from the backend
    // 2. Send a push notification via your notification service
    // For now, we show a confirmation and simulate the nudge
    try {
      // Request notification permissions if not already granted
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permissions needed', 'Enable notifications to send nudges');
          return;
        }
      }

      // Show local confirmation (in production, this would be a server-sent push to the other user)
      Alert.alert(
        'Nudge Sent! 💪',
        'Your squad member will receive a motivation boost.',
        [{ text: 'Got it', onPress: () => router.back() }]
      );

      // Log the nudge for analytics
      if (__DEV__) console.log('[UserProfile] Nudge sent to user');
    } catch (error) {
      if (__DEV__) console.error('[UserProfile] Failed to send nudge:', error);
      Alert.alert('Oops', 'Could not send nudge. Try again later.');
    }
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
        <View style={[styles.blob, styles.blobTopLeft]} />
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 200 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {/* Avatar Glow */}
              <View style={styles.avatarGlow} />

              {/* Avatar */}
              <View style={styles.avatar}>
                <LinearGradient
                  colors={['#F3F4F6', '#D1D5DB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {userName.split(' ').map(n => n[0]).join('')}
                  </Text>
                </LinearGradient>

                {/* Online Status */}
                {isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userHandle}>{userHandle}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Strain (You) */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <Text style={styles.statLabel}>STRAIN</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>14.2</Text>
                  <Text style={styles.statWinner}>You</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Matchup */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 245, 237, 0.5)', 'rgba(255, 237, 213, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCardGradient, styles.matchupCard]}
              >
                <View style={styles.matchupGlow} />
                <Text style={[styles.statLabel, { color: '#FF4500' }]}>MATCHUP</Text>
                <Text style={styles.matchupValue}>Tie</Text>
              </LinearGradient>
            </View>

            {/* Recovery (Alex) */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <Text style={styles.statLabel}>RECOV</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>88%</Text>
                  <Text style={[styles.statWinner, { color: '#EF4444' }]}>Alex</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Recent Wins Section */}
          <View style={styles.winsSection}>
            <View style={styles.winsSectionHeader}>
              <Text style={styles.winsSectionTitle}>RECENT WINS</Text>
              <TouchableOpacity>
                <Text style={styles.viewHistory}>View History</Text>
              </TouchableOpacity>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              {/* Timeline Line */}
              <View style={styles.timelineLine} />

              {ACHIEVEMENTS.map((achievement, index) => (
                <View key={achievement.id} style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Text style={styles.timelineEmoji}>{achievement.icon}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.achievementCard}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.5)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.achievementCardGradient}
                    >
                      <View style={styles.achievementContent}>
                        <View style={styles.achievementText}>
                          <Text style={styles.achievementTitle}>
                            {achievement.title}
                          </Text>
                          <Text style={styles.achievementMeta}>
                            {achievement.category} • {achievement.timeAgo}
                          </Text>
                        </View>
                        <View style={styles.achievementChevron}>
                          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Nudge Button */}
        <View style={[styles.nudgeContainer, { bottom: insets.bottom + 100 }]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nudgeWrapper}
          >
            <Animated.View style={{ transform: [{ scale: heartbeatScale }] }}>
              <TouchableOpacity
                style={styles.nudgeButton}
                onPress={handleNudge}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FF4500', '#FF4500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nudgeButtonGradient}
                >
                  <Ionicons name="heart" size={24} color="#FFFFFF" />
                  <Text style={styles.nudgeButtonText}>Nudge</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </View>
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
    opacity: 0.6,
  },
  blobTopRight: {
    top: '-20%',
    right: '-20%',
    width: 600,
    height: 600,
    backgroundColor: '#FFFFFF',
  },
  blobTopLeft: {
    top: '10%',
    left: '10%',
    width: 300,
    height: 300,
    backgroundColor: '#E5E7EB',
  },
  blobBottomLeft: {
    bottom: '-10%',
    left: '-20%',
    width: 500,
    height: 500,
    backgroundColor: '#FFF7ED',
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
    paddingTop: 16,
    gap: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 150,
    height: 150,
    marginLeft: -75,
    marginTop: -75,
    backgroundColor: '#FFFFFF',
    borderRadius: 75,
    opacity: 0.6,
    zIndex: -1,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#121212',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4B5563',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#F2F4F6',
    zIndex: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
  },
  matchupCard: {
    position: 'relative',
    overflow: 'hidden',
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  matchupGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  statWinner: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  matchupValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF4500',
  },
  winsSection: {
    paddingTop: 8,
  },
  winsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  winsSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1.5,
  },
  viewHistory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF4500',
  },
  timeline: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: 'rgba(229, 231, 235, 0.8)',
    zIndex: -1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  timelineEmoji: {
    fontSize: 20,
  },
  achievementCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  achievementCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  achievementMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  achievementChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 30,
  },
  nudgeWrapper: {
    borderRadius: 24,
    padding: 8,
    shadowColor: '#E5E7EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  nudgeButton: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  nudgeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  nudgeButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
