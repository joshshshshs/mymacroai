/**
 * My Collection - Purchased Items Gallery
 * 
 * Shows all items the user has purchased with MacroCoins:
 * - Unlocked themes (with preview and apply option)
 * - Purchased features
 * - Streak freezes
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { useTheme, ACCENT_THEMES, AccentThemeId } from '@/src/providers/ThemeProvider';

// ============================================================================
// THEME CARD COMPONENT
// ============================================================================

interface ThemeCardProps {
  themeId: AccentThemeId;
  isOwned: boolean;
  isActive: boolean;
  onApply: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ themeId, isOwned, isActive, onApply }) => {
  const { colors, mode } = useTheme();
  const theme = ACCENT_THEMES[themeId];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isOwned) {
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onApply();
    }
  };

  const previewColor = mode === 'dark' ? theme.preview.dark : theme.preview.light;

  return (
    <Animated.View entering={FadeInDown.delay(100)} style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.themeCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: isActive ? previewColor : colors.border,
            borderWidth: isActive ? 2 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={!isOwned}
      >
        {/* Color Preview */}
        <LinearGradient
          colors={theme.colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.themePreview}
        >
          {isActive && (
            <View style={styles.activeCheckmark}>
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </View>
          )}
        </LinearGradient>

        {/* Info */}
        <View style={styles.themeInfo}>
          <View style={styles.themeNameRow}>
            <Text style={[styles.themeName, { color: colors.text }]}>{theme.name}</Text>
            {theme.isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: '#FFD700' }]}>
                <Ionicons name="star" size={10} color="#000" />
              </View>
            )}
          </View>
          <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
            {theme.description}
          </Text>
        </View>

        {/* Action */}
        <View style={styles.themeAction}>
          {isActive ? (
            <View style={[styles.activeLabel, { backgroundColor: `${previewColor}20` }]}>
              <Text style={[styles.activeLabelText, { color: previewColor }]}>Active</Text>
            </View>
          ) : isOwned ? (
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: previewColor }]}
              onPress={handlePress}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.lockedLabel, { backgroundColor: colors.surfaceElevated }]}>
              <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// ITEM CARD COMPONENT
// ============================================================================

interface ItemCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  description: string;
  quantity?: number;
  color: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ icon, name, description, quantity, color }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.itemCard,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <View style={[styles.itemIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {quantity !== undefined && (
        <View style={[styles.quantityBadge, { backgroundColor: color }]}>
          <Text style={styles.quantityText}>×{quantity}</Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function MyCollectionScreen() {
  const router = useRouter();
  const { colors, accentTheme, setAccentTheme, mode } = useTheme();
  
  // Get user's purchases
  const economy = useUserStore(s => s.economy);
  const unlockedThemes = economy?.unlockedThemes || ['default'];
  const streakFreezes = economy?.streakFreezes || 0;
  const macroCoins = economy?.macroCoins || 0;

  // Handle theme apply
  const handleApplyTheme = useCallback((themeId: AccentThemeId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAccentTheme(themeId);
  }, [setAccentTheme]);

  // Check if theme is owned
  const isThemeOwned = (themeId: AccentThemeId): boolean => {
    if (themeId === 'default') return true;
    return unlockedThemes.includes(themeId);
  };

  // Count owned themes (excluding default)
  const ownedThemesCount = unlockedThemes.filter(t => t !== 'default').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Collection',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Stats */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="color-palette" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{ownedThemesCount + 1}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Themes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="snow" size={24} color="#38BDF8" />
              <Text style={[styles.statValue, { color: colors.text }]}>{streakFreezes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Freezes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name="wallet" size={24} color="#FBBF24" />
              <Text style={[styles.statValue, { color: colors.text }]}>{macroCoins}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coins</Text>
            </View>
          </Animated.View>

          {/* Themes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Color Themes</Text>
              <TouchableOpacity
                onPress={() => router.push('/(modals)/shop')}
                style={styles.shopLink}
              >
                <Text style={[styles.shopLinkText, { color: colors.primary }]}>Shop More</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Each theme works in both light and dark mode
            </Text>

            <View style={styles.themeGrid}>
              {Object.keys(ACCENT_THEMES).map((themeId) => (
                <ThemeCard
                  key={themeId}
                  themeId={themeId as AccentThemeId}
                  isOwned={isThemeOwned(themeId as AccentThemeId)}
                  isActive={accentTheme === themeId}
                  onApply={() => handleApplyTheme(themeId as AccentThemeId)}
                />
              ))}
            </View>
          </View>

          {/* Other Items Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Power-Ups</Text>
            
            {streakFreezes > 0 ? (
              <ItemCard
                icon="snow"
                name="Streak Freeze"
                description="Protect your streak for one day"
                quantity={streakFreezes}
                color="#38BDF8"
              />
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
                <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No power-ups yet
                </Text>
                <TouchableOpacity
                  style={[styles.shopButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(modals)/shop')}
                >
                  <Text style={styles.shopButtonText}>Visit Shop</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Mode Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Your selected theme in both modes
            </Text>
            
            <View style={styles.previewRow}>
              {/* Light Mode Preview */}
              <View style={[styles.previewCard, { backgroundColor: '#F5F5F7' }]}>
                <View style={styles.previewHeader}>
                  <Ionicons name="sunny" size={16} color="#1A1A1A" />
                  <Text style={[styles.previewLabel, { color: '#1A1A1A' }]}>Light</Text>
                </View>
                <View
                  style={[
                    styles.previewAccent,
                    { backgroundColor: ACCENT_THEMES[accentTheme].preview.light },
                  ]}
                />
              </View>
              
              {/* Dark Mode Preview */}
              <View style={[styles.previewCard, { backgroundColor: '#1C1C1E' }]}>
                <View style={styles.previewHeader}>
                  <Ionicons name="moon" size={16} color="#FFFFFF" />
                  <Text style={[styles.previewLabel, { color: '#FFFFFF' }]}>Dark</Text>
                </View>
                <View
                  style={[
                    styles.previewAccent,
                    { backgroundColor: ACCENT_THEMES[accentTheme].preview.dark },
                  ]}
                />
              </View>
            </View>
          </View>

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
  content: {
    padding: SPACING.lg,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  shopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Theme Grid
  themeGrid: {
    gap: SPACING.md,
  },

  // Theme Card
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  themePreview: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  themeAction: {
    marginLeft: SPACING.sm,
  },
  activeLabel: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  activeLabelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  lockedLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  quantityBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
  },
  shopButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Preview
  previewRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  previewCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewAccent: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
});
