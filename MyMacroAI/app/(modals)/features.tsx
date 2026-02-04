/**
 * Features Hub - Access all new features
 * Clean sectioned design with warm theme colors
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useHaptics } from '@/hooks/useHaptics';

type FeatureSection = {
  title: string;
  items: FeatureItem[];
};

type FeatureItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  route?: string;
  action?: () => void;
  badge?: string;
  badgeColor?: string;
  iconBg: string;
  iconColor: string;
};

export default function FeaturesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { light } = useHaptics();

  const [soundEnabled, setSoundEnabled] = useState(true);

  const colors = {
    bg: isDark ? '#121214' : '#FAF9F6',
    card: isDark ? 'rgba(30, 30, 32, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.4)',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  };

  // Feature colors matching the mockup
  const featureColors = {
    blue: { bg: isDark ? 'rgba(59,130,246,0.2)' : '#E8F4FD', icon: '#3B82F6' },
    green: { bg: isDark ? 'rgba(16,185,129,0.2)' : '#E8F8F0', icon: '#10B981' },
    purple: { bg: isDark ? 'rgba(99,102,241,0.2)' : '#EEE8FD', icon: '#6366F1' },
    pink: { bg: isDark ? 'rgba(236,72,153,0.2)' : '#FDE8F3', icon: '#EC4899' },
    violet: { bg: isDark ? 'rgba(139,92,246,0.2)' : '#F3E8FD', icon: '#8B5CF6' },
    orange: { bg: isDark ? 'rgba(245,158,11,0.2)' : '#FEF3E2', icon: '#F59E0B' },
    cyan: { bg: isDark ? 'rgba(6,182,212,0.2)' : '#E8FAFB', icon: '#06B6D4' },
    red: { bg: isDark ? 'rgba(239,68,68,0.2)' : '#FDE8E8', icon: '#EF4444' },
    teal: { bg: isDark ? 'rgba(20,184,166,0.2)' : '#E8FBF9', icon: '#14B8A6' },
  };

  const features: FeatureSection[] = [
    {
      title: 'RECOVERY & WEARABLES',
      items: [
        {
          icon: 'watch',
          title: 'Connect Wearable',
          description: 'Sync Oura, Whoop, or Garmin',
          route: '/(modals)/hardware',
          badge: 'NEW',
          badgeColor: '#3B82F6',
          iconBg: featureColors.blue.bg,
          iconColor: featureColors.blue.icon,
        },
        {
          icon: 'fitness',
          title: 'Recovery Dashboard',
          description: 'View normalized recovery metrics',
          route: '/(modals)/recovery',
          iconBg: featureColors.green.bg,
          iconColor: featureColors.green.icon,
        },
      ],
    },
    {
      title: 'CYCLE TRACKING',
      items: [
        {
          icon: 'calendar',
          title: 'Log Cycle Phase',
          description: 'Track menstrual cycle for macro adjustments',
          route: '/(modals)/cycle-tracking',
          iconBg: featureColors.pink.bg,
          iconColor: featureColors.pink.icon,
        },
        {
          icon: 'nutrition',
          title: 'Phase-Based Macros',
          description: 'Auto-adjust nutrition by cycle phase',
          route: '/(modals)/cycle-macros',
          badge: 'BETA',
          badgeColor: '#8B5CF6',
          iconBg: featureColors.violet.bg,
          iconColor: featureColors.violet.icon,
        },
      ],
    },
    {
      title: 'PHOTO ANALYSIS',
      items: [
        {
          icon: 'camera',
          title: '3-Photo Protocol',
          description: 'Comprehensive physique analysis',
          route: '/(modals)/three-photo',
          iconBg: featureColors.orange.bg,
          iconColor: featureColors.orange.icon,
        },
        {
          icon: 'body',
          title: 'Progress Photos',
          description: 'Compare past photo sets',
          route: '/(modals)/progress-photos',
          iconBg: featureColors.cyan.bg,
          iconColor: featureColors.cyan.icon,
        },
        {
          icon: 'lock-closed',
          title: 'Biometric Vault',
          description: 'Secure progress photos with FaceID',
          route: '/(modals)/vault',
          badge: 'SECURE',
          badgeColor: '#8B5CF6',
          iconBg: featureColors.violet.bg,
          iconColor: featureColors.violet.icon,
        },
      ],
    },
    {
      title: 'SOCIAL & SQUAD',
      items: [
        {
          icon: 'people',
          title: 'My Squad',
          description: 'Manage your accountability squad',
          route: '/(tabs)/squad',
          iconBg: featureColors.red.bg,
          iconColor: featureColors.red.icon,
        },
        {
          icon: 'gift',
          title: 'Referrals',
          description: 'Invite friends and earn credits',
          route: '/(modals)/referrals',
          iconBg: featureColors.orange.bg,
          iconColor: featureColors.orange.icon,
        },
      ],
    },
  ];

  const handleFeaturePress = (item: FeatureItem) => {
    light();
    if (item.route) {
      router.push(item.route as any);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { light(); router.back(); }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Features</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {features.map((section, sectionIndex) => (
            <Animated.View
              key={section.title}
              entering={FadeInDown.delay(sectionIndex * 50).duration(300)}
              style={styles.section}
            >
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>

              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {section.items.map((item, itemIndex) => (
                  <React.Fragment key={item.title}>
                    <TouchableOpacity
                      onPress={() => handleFeaturePress(item)}
                      style={styles.featureItem}
                      activeOpacity={0.6}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                        <Ionicons name={item.icon} size={22} color={item.iconColor} />
                      </View>

                      <View style={styles.featureText}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.featureTitle, { color: colors.text }]}>
                            {item.title}
                          </Text>
                          {item.badge && (
                            <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                              <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                          {item.description}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {itemIndex < section.items.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </Animated.View>
          ))}

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  featureDescription: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 74,
  },
});
