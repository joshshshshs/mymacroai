/**
 * Settings Screen - Detailed Preferences
 * 
 * This page is for detailed settings that need more space:
 * - AI Coach configuration
 * - Notification preferences
 * - Bio-optimization protocols
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore, useBioOptimizationProfile, useCoachIntensity } from '@/src/store/UserStore';
import { useTheme } from '@/hooks/useTheme';
import { PeptideStatus } from '@/src/types';
import { COACH_PERSONAS, PersonaId, getPersona } from '@/src/services/ai/CoachPersonas';

// ============================================================================
// HELPERS
// ============================================================================

const getPeptideStatusLabel = (status: PeptideStatus, count: number): string => {
  switch (status) {
    case 'ACTIVE_DISCLOSED':
      return count > 0 ? `Active (${count} compound${count > 1 ? 's' : ''})` : 'Active';
    case 'ACTIVE_UNDISCLOSED':
      return 'Active (Private)';
    case 'NONE':
      return 'Not using';
    default:
      return 'Not configured';
  }
};

const getIntensityLabel = (val: number): string => {
  if (val < 20) return "🧘 Zen Monk";
  if (val < 40) return "🤝 Supportive";
  if (val < 60) return "⚖️ Balanced";
  if (val < 80) return "🔥 Intense";
  return "⚔️ Spartan";
};

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: 'chevron' | 'toggle' | 'value' | 'none';
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  subtitle,
  value,
  onPress,
  rightElement = 'chevron',
  toggleValue,
  onToggle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const colors = {
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    icon: '#FF5C00',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  };

  const content = (
    <View style={[styles.settingsItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.itemIconWrap, { backgroundColor: `${colors.icon}15` }]}>
        <Ionicons name={icon} size={18} color={colors.icon} />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.itemSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        )}
      </View>
      
      {rightElement === 'chevron' && (
        <>
          {value && <Text style={[styles.itemValue, { color: colors.subtext }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
        </>
      )}
      
      {rightElement === 'toggle' && (
        <Switch
          value={toggleValue}
          onValueChange={(val) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle?.(val);
          }}
          trackColor={{ false: isDark ? '#3A3A3C' : '#E5E5EA', true: '#FF5C00' }}
          thumbColor="#FFFFFF"
        />
      )}
      
      {rightElement === 'value' && value && (
        <Text style={[styles.itemValue, { color: colors.icon, fontWeight: '600' }]}>{value}</Text>
      )}
    </View>
  );

  if (onPress && rightElement !== 'toggle') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// ============================================================================
// SECTION HEADER
// ============================================================================

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93' }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.sectionSubheader, { color: isDark ? 'rgba(255,255,255,0.3)' : '#AEAEB2' }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Store
  const preferences = useUserStore(s => s.preferences);
  const bioProfile = useBioOptimizationProfile();
  const coachIntensity = useCoachIntensity();
  const setCoachIntensity = useUserStore(s => s.setCoachIntensity);
  const updatePreferences = useUserStore(s => s.actions.updatePreferences);
  
  // Local state
  const [hapticsEnabled, setHapticsEnabled] = useState(preferences?.haptics !== false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [insightNotifications, setInsightNotifications] = useState(true);
  
  // Current persona (would come from store in production)
  const [currentPersona] = useState<PersonaId>('balanced');
  const persona = getPersona(currentPersona);

  // Colors
  const colors = {
    bg: isDark ? '#0A0A0C' : '#F5F5F7',
    card: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subtext: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    accent: '#FF5C00',
  };

  // Handlers
  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    updatePreferences({ haptics: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* AI Coach Configuration */}
        <SectionHeader 
          title="AI COACH" 
          subtitle="Personalize your coaching experience"
        />
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Coach Persona */}
          <SettingsItem
            icon="sparkles-outline"
            label="Coach Persona"
            subtitle={persona.description}
            value={persona.name}
            onPress={() => router.push('/(modals)/edit-voice')}
          />
          
          {/* Intensity Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderLabelRow}>
                <View style={[styles.sliderIconWrap, { backgroundColor: `${colors.accent}15` }]}>
                  <Ionicons name="speedometer-outline" size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.sliderLabel, { color: colors.text }]}>Coach Intensity</Text>
                  <Text style={[styles.sliderSublabel, { color: colors.subtext }]}>
                    How hard should your coach push you?
                  </Text>
                </View>
              </View>
              <Text style={[styles.intensityBadge, { color: colors.accent }]}>
                {getIntensityLabel(coachIntensity)}
              </Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderEnd, { color: colors.subtext }]}>Gentle</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={coachIntensity}
                onSlidingComplete={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setCoachIntensity(val);
                }}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={isDark ? '#3A3A3C' : '#E5E5EA'}
                thumbTintColor={colors.accent}
              />
              <Text style={[styles.sliderEnd, { color: colors.subtext }]}>Spartan</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <SectionHeader 
          title="NOTIFICATIONS" 
          subtitle="Control what alerts you receive"
        />
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsItem
            icon="notifications-outline"
            label="Push Notifications"
            subtitle="Master toggle for all notifications"
            rightElement="toggle"
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <SettingsItem
            icon="restaurant-outline"
            label="Meal Reminders"
            subtitle="Remind me to log meals"
            rightElement="toggle"
            toggleValue={mealReminders}
            onToggle={setMealReminders}
          />
          <SettingsItem
            icon="barbell-outline"
            label="Workout Reminders"
            subtitle="Training day notifications"
            rightElement="toggle"
            toggleValue={workoutReminders}
            onToggle={setWorkoutReminders}
          />
          <SettingsItem
            icon="bulb-outline"
            label="AI Insights"
            subtitle="Proactive tips and observations"
            rightElement="toggle"
            toggleValue={insightNotifications}
            onToggle={setInsightNotifications}
          />
        </View>

        {/* Bio-Optimization */}
        <SectionHeader 
          title="BIO-OPTIMIZATION" 
          subtitle="Advanced health protocols"
        />
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsItem
            icon="flask-outline"
            label="Peptide Protocols"
            subtitle={getPeptideStatusLabel(bioProfile.peptideStatus, bioProfile.activeCompounds.length)}
            onPress={() => router.push('/(modals)/bio-optimization')}
          />
          <SettingsItem
            icon="fitness-outline"
            label="Cycle Tracking"
            subtitle="Menstrual phase integration"
            onPress={() => router.push('/(modals)/cycle-tracking')}
          />
          <SettingsItem
            icon="moon-outline"
            label="Sleep Protocols"
            subtitle="Wind-down and wake optimization"
            onPress={() => router.push('/(modals)/unwind-dnd')}
          />
        </View>

        {/* App Experience */}
        <SectionHeader 
          title="APP EXPERIENCE" 
          subtitle="Customize how the app feels"
        />
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsItem
            icon="phone-portrait-outline"
            label="Haptic Feedback"
            subtitle="Vibration on interactions"
            rightElement="toggle"
            toggleValue={hapticsEnabled}
            onToggle={handleHapticsToggle}
          />
          <SettingsItem
            icon="musical-notes-outline"
            label="Sound Effects"
            subtitle="Audio feedback"
            rightElement="toggle"
            toggleValue={true}
            onToggle={() => {}}
          />
        </View>

        {/* Data Import */}
        <SectionHeader 
          title="DATA IMPORT" 
          subtitle="Bring your existing data"
        />
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingsItem
            icon="cloud-upload-outline"
            label="Import from MyFitnessPal"
            subtitle="CSV file import"
            onPress={() => router.push('/(modals)/import')}
          />
          <SettingsItem
            icon="download-outline"
            label="Import from Apple Health"
            subtitle="Historical health data"
            onPress={() => router.push('/(modals)/features')}
          />
        </View>

        {/* Developer Options - Only show in DEV */}
        {__DEV__ && (
          <>
            <SectionHeader title="DEVELOPER" subtitle="Debug options" />
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SettingsItem
                icon="bug-outline"
                label="Debug Panel"
                onPress={() => {}}
              />
              <SettingsItem
                icon="refresh-outline"
                label="Reset Onboarding"
                onPress={() => {}}
              />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    padding: SPACING.lg,
  },
  
  // Section Header
  sectionHeaderContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sectionSubheader: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // Card
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  
  // Settings Item
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  
  // Slider Section
  sliderSection: {
    padding: SPACING.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sliderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  sliderSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  intensityBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  slider: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  sliderEnd: {
    fontSize: 11,
    fontWeight: '600',
    width: 50,
  },
});
