/**
 * Profile & Settings - Unified Control Center
 * 
 * Clean, organized settings hub with logical sections:
 * - Account & Profile
 * - AI Coach Settings
 * - Goals & Body Data
 * - Connected Devices
 * - App Preferences
 * - Privacy & Data
 * - Help & About
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { useTheme, getThemeLabel } from '@/hooks/useTheme';

// ============================================================================
// TYPES
// ============================================================================

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
  badge?: string;
  badgeColor?: string;
}

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  value,
  onPress,
  showChevron = true,
  danger = false,
  badge,
  badgeColor,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const colors = {
    text: danger ? '#EF4444' : (isDark ? '#FFFFFF' : '#1A1A1A'),
    subtext: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    icon: danger ? '#EF4444' : '#FF5C00',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  };

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: `${colors.icon}15` }]}>
        <Ionicons name={icon} size={18} color={colors.icon} />
      </View>
      
      <View style={styles.menuContent}>
        <View style={styles.menuLabelRow}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badgeColor || '#FF5C00' }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        )}
      </View>
      
      {value && (
        <Text style={[styles.menuValue, { color: colors.subtext }]}>{value}</Text>
      )}
      
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93' }]}>
      {title}
    </Text>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { themePreference } = useTheme();
  
  // Store data
  const user = useUserStore(s => s.user);
  const isPro = useUserStore(s => s.isPro);
  const founderStatus = useUserStore(s => s.founderStatus);
  const preferences = useUserStore(s => s.preferences);
  const healthMetrics = useUserStore(s => s.healthMetrics);
  const streak = useUserStore(s => s.streak);
  const hardware = useUserStore(s => s.hardware);

  // Colors
  const colors = {
    bg: isDark ? '#0A0A0C' : '#F5F5F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    accent: '#FF5C00',
    gold: '#FFD700',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  };

  // Navigation
  const navigate = (route: string) => {
    router.push(route as any);
  };

  // Pro card animation
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Derived values
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const isFounder = founderStatus?.isFounder || false;
  
  const weightDisplay = healthMetrics?.weight
    ? preferences?.measurementSystem === 'imperial'
      ? `${Math.round((healthMetrics.weight || 0) * 2.205)} lbs`
      : `${healthMetrics.weight} kg`
    : 'Not set';
    
  const goalDisplay = (() => {
    const goals = preferences?.fitnessGoals;
    if (!goals || goals.length === 0) return 'Not set';
    const labels: Record<string, string> = {
      'fat_loss': 'Fat Loss',
      'muscle_gain': 'Muscle Gain',
      'maintenance': 'Maintenance',
      'recomp': 'Recomposition',
    };
    return labels[goals[0]] || 'Custom';
  })();

  const unitsDisplay = preferences?.measurementSystem === 'imperial' ? 'Imperial' : 'Metric';
  
  const connectedDevices = hardware?.hasWearable ? '1 connected' : 'None';

  // Sign out handler
  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Handle sign out
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.heroSection}>
            <TouchableOpacity
              style={[styles.avatarContainer, { borderColor: colors.accent }]}
              onPress={() => navigate('/(modals)/edit-profile')}
              activeOpacity={0.8}
            >
              {(user as any)?.avatarUrl ? (
                <Image source={{ uri: (user as any).avatarUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[colors.accent, '#FF8C40']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarInitial}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
              {(isPro || isFounder) && (
                <View style={[styles.statusBadge, { backgroundColor: isFounder ? colors.gold : colors.accent }]}>
                  <Ionicons name={isFounder ? 'diamond' : 'star'} size={10} color="#FFF" />
                  <Text style={styles.statusBadgeText}>
                    {isFounder ? 'FOUNDER' : 'PRO'}
                  </Text>
                </View>
              )}
            </View>

            {userEmail && (
              <Text style={[styles.userEmail, { color: colors.subtext }]}>{userEmail}</Text>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{streak || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Day Streak</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{weightDisplay}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Current</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{goalDisplay}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Goal</Text>
              </View>
            </View>
          </Animated.View>

          {/* Pro Upsell */}
          {!isPro && !isFounder && (
            <Animated.View entering={FadeInDown.delay(100)}>
              <TouchableOpacity
                onPress={() => navigate('/(modals)/premium')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FF5C00', '#FF8C40', '#FFB366']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.proCard}
                >
                  <View style={styles.proCardIcon}>
                    <Ionicons name="sparkles" size={24} color="#FFF" />
                  </View>
                  <View style={styles.proCardContent}>
                    <Text style={styles.proCardTitle}>Upgrade to Pro</Text>
                    <Text style={styles.proCardSubtitle}>
                      AI Personas • Predictive Analytics • Coach Mode
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Account Section */}
          <SectionHeader title="ACCOUNT" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              subtitle="Name, photo, public profile"
              onPress={() => navigate('/(modals)/edit-profile')}
            />
            <MenuItem
              icon="card-outline"
              label="Subscription"
              subtitle={isPro ? 'MyMacro Pro Active' : 'Free Plan'}
              value={isPro ? 'Manage' : 'Upgrade'}
              onPress={() => navigate('/(modals)/premium')}
            />
          </View>

          {/* AI Coach Section */}
          <SectionHeader title="AI COACH" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="sparkles-outline"
              label="Coach Persona"
              subtitle="Choose your coaching style"
              value="Balanced"
              onPress={() => navigate('/(modals)/edit-voice')}
              badge={isPro ? undefined : 'PRO'}
              badgeColor="#8B5CF6"
            />
            <MenuItem
              icon="speedometer-outline"
              label="Coach Intensity"
              subtitle="Gentle to Spartan mode"
              onPress={() => navigate('/(modals)/settings')}
            />
          </View>

          {/* Goals & Body Section */}
          <SectionHeader title="GOALS & BODY" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="flag-outline"
              label="Fitness Goal"
              subtitle="Your primary objective"
              value={goalDisplay}
              onPress={() => navigate('/(modals)/edit-goal')}
            />
            <MenuItem
              icon="body-outline"
              label="Body Measurements"
              subtitle="Weight, height, body composition"
              onPress={() => navigate('/(modals)/edit-weight')}
            />
            <MenuItem
              icon="nutrition-outline"
              label="Diet Preferences"
              subtitle="Dietary style and restrictions"
              onPress={() => navigate('/(modals)/edit-diet-style')}
            />
            <MenuItem
              icon="barbell-outline"
              label="Training Style"
              subtitle="Your workout DNA"
              onPress={() => navigate('/(modals)/training-onboarding')}
            />
          </View>

          {/* Connected Devices */}
          <SectionHeader title="CONNECTED DEVICES" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="watch-outline"
              label="Wearables"
              subtitle="Apple Health, Oura, Whoop, Garmin"
              value={connectedDevices}
              onPress={() => navigate('/(modals)/features')}
            />
          </View>

          {/* App Preferences */}
          <SectionHeader title="APP PREFERENCES" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="color-palette-outline"
              label="Appearance"
              subtitle="Theme and display options"
              value={getThemeLabel(themePreference)}
              onPress={() => navigate('/(modals)/edit-theme')}
            />
            <MenuItem
              icon="albums-outline"
              label="My Collection"
              subtitle="Themes and items you've unlocked"
              onPress={() => navigate('/(modals)/my-collection')}
            />
            <MenuItem
              icon="globe-outline"
              label="Language"
              subtitle="App language"
              value="English"
              onPress={() => navigate('/(modals)/edit-language')}
            />
            <MenuItem
              icon="resize-outline"
              label="Units"
              subtitle="Measurement system"
              value={unitsDisplay}
              onPress={() => navigate('/(modals)/edit-units')}
            />
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              subtitle="Reminders and alerts"
              onPress={() => navigate('/(modals)/settings')}
            />
          </View>

          {/* Privacy & Data */}
          <SectionHeader title="PRIVACY & DATA" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Settings"
              subtitle="Data sharing and visibility"
              onPress={() => navigate('/(modals)/data-privacy')}
            />
            <MenuItem
              icon="download-outline"
              label="Export My Data"
              subtitle="Download all your data"
              onPress={() => navigate('/(modals)/vault')}
            />
            <MenuItem
              icon="eye-off-outline"
              label="Ghost Mode"
              subtitle="Hide from leaderboards"
              onPress={() => navigate('/(modals)/data-privacy')}
            />
          </View>

          {/* Help & Support */}
          <SectionHeader title="HELP & SUPPORT" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              subtitle="FAQs and guides"
              onPress={() => navigate('/(modals)/support')}
            />
            <MenuItem
              icon="map-outline"
              label="Roadmap"
              subtitle="Upcoming features"
              onPress={() => navigate('/(modals)/roadmap')}
            />
            <MenuItem
              icon="chatbubble-outline"
              label="Send Feedback"
              subtitle="Help us improve"
              onPress={() => navigate('/(modals)/support')}
            />
            <MenuItem
              icon="document-text-outline"
              label="Legal"
              subtitle="Terms, privacy policy"
              onPress={() => navigate('/(modals)/support')}
            />
          </View>

          {/* Danger Zone */}
          <SectionHeader title="DANGER ZONE" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <MenuItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleSignOut}
              showChevron={false}
              danger
            />
          </View>

          {/* Version */}
          <Text style={[styles.versionText, { color: colors.subtext }]}>
            MyMacro v2.1.0 • Made with 💪
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 60,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5C00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A0A0C',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: SPACING.md,
  },

  // Pro Card
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  proCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  proCardContent: {
    flex: 1,
  },
  proCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Sections
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    marginLeft: 4,
  },
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuValue: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },

  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: SPACING.xl,
  },
});
