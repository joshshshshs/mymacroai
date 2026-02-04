/**
 * Edit Theme Screen - Complete Theme Customization
 * 
 * Allows users to:
 * - Choose light/dark/system mode
 * - Select accent color theme
 * - Each accent works in both modes
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import {
  useTheme,
  ACCENT_THEMES,
  AccentThemeId,
  ThemeMode,
} from '@/src/providers/ThemeProvider';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// MODE OPTION COMPONENT
// ============================================================================

interface ModeOptionProps {
  mode: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onSelect: () => void;
  colors: any;
}

const ModeOption: React.FC<ModeOptionProps> = ({
  mode,
  label,
  icon,
  isSelected,
  onSelect,
  colors,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View style={[styles.modeOption, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.modeCard,
          {
            backgroundColor: isSelected ? colors.primaryBackground : colors.cardBackground,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={icon}
          size={28}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[
            styles.modeLabel,
            { color: isSelected ? colors.primary : colors.text },
          ]}
        >
          {label}
        </Text>
        {isSelected && (
          <View style={[styles.modeCheck, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// ACCENT THEME OPTION COMPONENT
// ============================================================================

interface AccentOptionProps {
  themeId: AccentThemeId;
  isSelected: boolean;
  isOwned: boolean;
  onSelect: () => void;
  colors: any;
  currentMode: 'light' | 'dark';
}

const AccentOption: React.FC<AccentOptionProps> = ({
  themeId,
  isSelected,
  isOwned,
  onSelect,
  colors,
  currentMode,
}) => {
  const theme = ACCENT_THEMES[themeId];
  const previewColor = currentMode === 'dark' ? theme.preview.dark : theme.preview.light;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!isOwned && theme.price > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.accentCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: isSelected ? previewColor : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Color Preview Circle */}
        <LinearGradient
          colors={theme.colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accentPreview}
        >
          {isSelected && (
            <View style={styles.accentCheck}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
          {!isOwned && theme.price > 0 && (
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={16} color="#FFF" />
            </View>
          )}
        </LinearGradient>

        {/* Info */}
        <View style={styles.accentInfo}>
          <View style={styles.accentNameRow}>
            <Text style={[styles.accentName, { color: colors.text }]}>
              {theme.name}
            </Text>
            {theme.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={8} color="#000" />
              </View>
            )}
          </View>
          <Text style={[styles.accentDesc, { color: colors.textSecondary }]}>
            {!isOwned && theme.price > 0
              ? `🪙 ${theme.price} coins`
              : theme.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function EditThemeScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const { colors, themePreference, accentTheme, setMode, setAccentTheme, mode } = useTheme();
  
  // Get owned themes
  const economy = useUserStore(s => s.economy);
  const unlockedThemes = economy?.unlockedThemes || ['default'];

  // Local state for pending changes
  const [pendingMode, setPendingMode] = useState<ThemeMode>(themePreference);
  const [pendingAccent, setPendingAccent] = useState<AccentThemeId>(accentTheme);
  
  const hasChanges = pendingMode !== themePreference || pendingAccent !== accentTheme;

  // Check if theme is owned
  const isThemeOwned = (themeId: AccentThemeId): boolean => {
    if (themeId === 'default') return true;
    return unlockedThemes.includes(themeId);
  };

  // Handle save
  const handleSave = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMode(pendingMode);
    setAccentTheme(pendingAccent);
    router.back();
  }, [pendingMode, pendingAccent, setMode, setAccentTheme, router]);

  // Preview mode for accent colors
  const previewMode = pendingMode === 'system' 
    ? (systemColorScheme || 'light') 
    : pendingMode;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerButton, { backgroundColor: colors.cardBackground }]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.headerButton,
              {
                backgroundColor: hasChanges ? colors.primary : colors.cardBackground,
              },
            ]}
            disabled={!hasChanges}
          >
            <Ionicons
              name="checkmark"
              size={24}
              color={hasChanges ? '#FFF' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Selection */}
          <Animated.View entering={FadeIn.delay(100)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mode</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Choose light, dark, or match your system
            </Text>

            <View style={styles.modeRow}>
              <ModeOption
                mode="light"
                label="Light"
                icon="sunny"
                isSelected={pendingMode === 'light'}
                onSelect={() => setPendingMode('light')}
                colors={colors}
              />
              <ModeOption
                mode="dark"
                label="Dark"
                icon="moon"
                isSelected={pendingMode === 'dark'}
                onSelect={() => setPendingMode('dark')}
                colors={colors}
              />
              <ModeOption
                mode="system"
                label="Auto"
                icon="phone-portrait"
                isSelected={pendingMode === 'system'}
                onSelect={() => setPendingMode('system')}
                colors={colors}
              />
            </View>
          </Animated.View>

          {/* Accent Theme Selection */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.accentSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Color Theme</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Works in both light and dark mode
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(modals)/my-collection')}
                style={styles.collectionLink}
              >
                <Text style={[styles.collectionLinkText, { color: colors.primary }]}>
                  My Collection
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.accentGrid}>
              {Object.keys(ACCENT_THEMES).map((themeId, index) => (
                <Animated.View
                  key={themeId}
                  entering={FadeInDown.delay(300 + index * 50)}
                >
                  <AccentOption
                    themeId={themeId as AccentThemeId}
                    isSelected={pendingAccent === themeId}
                    isOwned={isThemeOwned(themeId as AccentThemeId)}
                    onSelect={() => {
                      if (isThemeOwned(themeId as AccentThemeId)) {
                        setPendingAccent(themeId as AccentThemeId);
                      } else {
                        router.push('/(modals)/shop');
                      }
                    }}
                    colors={colors}
                    currentMode={previewMode}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Live Preview */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
            <View style={styles.previewContainer}>
              {/* Light Preview */}
              <View style={[styles.previewPane, { backgroundColor: '#F5F5F7' }]}>
                <View style={styles.previewTopBar}>
                  <Ionicons name="sunny" size={14} color="#1A1A1A" />
                  <Text style={[styles.previewModeLabel, { color: '#1A1A1A' }]}>Light</Text>
                </View>
                <View style={[styles.previewCard, { backgroundColor: '#FFFFFF' }]}>
                  <View
                    style={[
                      styles.previewAccentBar,
                      { backgroundColor: ACCENT_THEMES[pendingAccent].preview.light },
                    ]}
                  />
                  <View style={[styles.previewLine, { backgroundColor: '#E5E5EA' }]} />
                  <View style={[styles.previewLineShort, { backgroundColor: '#E5E5EA' }]} />
                </View>
              </View>

              {/* Dark Preview */}
              <View style={[styles.previewPane, { backgroundColor: '#0A0A0C' }]}>
                <View style={styles.previewTopBar}>
                  <Ionicons name="moon" size={14} color="#FFFFFF" />
                  <Text style={[styles.previewModeLabel, { color: '#FFFFFF' }]}>Dark</Text>
                </View>
                <View style={[styles.previewCard, { backgroundColor: '#1C1C1E' }]}>
                  <View
                    style={[
                      styles.previewAccentBar,
                      { backgroundColor: ACCENT_THEMES[pendingAccent].preview.dark },
                    ]}
                  />
                  <View style={[styles.previewLine, { backgroundColor: '#2C2C2E' }]} />
                  <View style={[styles.previewLineShort, { backgroundColor: '#2C2C2E' }]} />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Shop Link */}
          <Animated.View entering={FadeIn.delay(500)}>
            <TouchableOpacity
              style={[styles.shopBanner, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/(modals)/shop')}
            >
              <View style={[styles.shopIconWrap, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="color-palette" size={24} color={colors.primary} />
              </View>
              <View style={styles.shopBannerContent}>
                <Text style={[styles.shopBannerTitle, { color: colors.text }]}>
                  Want more themes?
                </Text>
                <Text style={[styles.shopBannerSubtitle, { color: colors.textSecondary }]}>
                  Visit the shop to unlock premium colors
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.lg,
  },

  // Section
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Mode Selection
  modeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modeOption: {
    flex: 1,
  },
  modeCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    gap: SPACING.sm,
    position: 'relative',
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeCheck: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Accent Section
  accentSection: {
    marginBottom: SPACING.xl,
  },
  collectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collectionLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accentGrid: {
    gap: SPACING.md,
  },
  accentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  accentPreview: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  accentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  accentName: {
    fontSize: 15,
    fontWeight: '600',
  },
  premiumBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // Preview
  previewSection: {
    marginBottom: SPACING.xl,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  previewPane: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  previewModeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  previewAccentBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  previewLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  previewLineShort: {
    height: 4,
    width: '60%',
    borderRadius: 2,
  },

  // Shop Banner
  shopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  shopIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBannerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  shopBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  shopBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
