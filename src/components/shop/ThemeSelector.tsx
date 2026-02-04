/**
 * ThemeSelector - "The Paint Shop"
 * 
 * A premium theme selector component for the MacroShop.
 * Displays theme palettes as smartphone-shaped cards with live previews.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { ThemePalette, THEME_PALETTES, getEffectivePrice } from '@/src/design-system/themes';
import { useAppTheme } from '@/src/design-system/theme';
import { useUserStore, useActiveThemeId, useOwnedThemes, useSetActiveTheme, usePurchaseTheme } from '@/src/store/UserStore';
import { MacroCoinIcon } from '@/src/components/ui/MacroCoinIcon';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.38;
const CARD_HEIGHT = CARD_WIDTH * 1.8;

// ============================================================================
// MINI RING PREVIEW
// ============================================================================

interface MiniRingPreviewProps {
    colors: ThemePalette['colors'];
    size?: number;
}

const MiniRingPreview: React.FC<MiniRingPreviewProps> = ({ colors, size = 60 }) => {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = 0.72; // Demo progress

    return (
        <Svg width={size} height={size}>
            <Defs>
                <SvgLinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={colors.gradient.start} />
                    <Stop offset="100%" stopColor={colors.gradient.end} />
                </SvgLinearGradient>
            </Defs>

            {/* Background ring */}
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={strokeWidth}
                fill="none"
            />

            {/* Progress ring */}
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#ringGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference * progress} ${circumference}`}
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
            />
        </Svg>
    );
};

// ============================================================================
// THEME CARD
// ============================================================================

interface ThemeCardProps {
    theme: ThemePalette;
    isActive: boolean;
    isOwned: boolean;
    isPro: boolean;
    onPress: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
    theme,
    isActive,
    isOwned,
    isPro,
    onPress,
}) => {
    const effectivePrice = getEffectivePrice(theme, isPro);
    const canEquip = isOwned || effectivePrice === 0;

    const handlePress = () => {
        Haptics.impactAsync(
            canEquip ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
        );
        onPress();
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isActive && {
                    borderWidth: 3,
                    borderColor: theme.colors.primary,
                    shadowColor: theme.colors.shadow,
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                },
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {/* Card Background Gradient */}
            <LinearGradient
                colors={['#FFFFFF', theme.colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Themed accent blob */}
            <View style={[styles.accentBlob, { backgroundColor: theme.colors.secondary }]} />

            {/* Content */}
            <View style={styles.cardContent}>
                {/* Mini Ring Preview */}
                <View style={styles.previewContainer}>
                    <MiniRingPreview colors={theme.colors} size={70} />

                    {/* Demo calories text */}
                    <View style={styles.demoText}>
                        <Text style={[styles.demoNumber, { color: theme.colors.primary }]}>1,847</Text>
                        <Text style={styles.demoLabel}>kcal</Text>
                    </View>
                </View>

                {/* Chart color swatches */}
                <View style={styles.swatchRow}>
                    {theme.colors.charts.map((color, index) => (
                        <View
                            key={index}
                            style={[styles.swatch, { backgroundColor: color }]}
                        />
                    ))}
                </View>

                {/* Theme Name */}
                <Text style={styles.themeName} numberOfLines={1}>
                    {theme.name}
                </Text>
            </View>

            {/* Status Overlay */}
            {isActive ? (
                <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                    <Text style={styles.statusText}>Active</Text>
                </View>
            ) : !canEquip ? (
                <View style={styles.lockedOverlay}>
                    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
                    <Ionicons name="lock-closed" size={24} color="rgba(0,0,0,0.5)" />
                    <View style={styles.priceTag}>
                        <MacroCoinIcon size={14} />
                        <Text style={styles.priceText}>{effectivePrice.toLocaleString()}</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.statusBadge, styles.equipBadge]}>
                    <Text style={styles.equipText}>Equip</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// ============================================================================
// THEME SELECTOR
// ============================================================================

interface ThemeSelectorProps {
    onThemeChange?: (themeId: string) => void;
    onPurchase?: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    onThemeChange,
    onPurchase,
}) => {
    // Use the exported theme hooks from UserStore
    const activeThemeId = useActiveThemeId();
    const ownedThemes = useOwnedThemes();
    const setActiveTheme = useSetActiveTheme();
    const purchaseTheme = usePurchaseTheme();
    const isPro = useUserStore(s => s.isPro);
    const economy = useUserStore(s => s.economy);

    const handleThemePress = (theme: ThemePalette) => {
        const effectivePrice = getEffectivePrice(theme, isPro);
        const isOwned = ownedThemes.includes(theme.id) || theme.isDefault;

        if (isOwned || effectivePrice === 0) {
            // Equip theme
            setActiveTheme(theme.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onThemeChange?.(theme.id);
        } else if (economy.macroCoins >= effectivePrice) {
            // Purchase theme
            purchaseTheme(theme.id);
            setActiveTheme(theme.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onPurchase?.(theme.id);
        } else {
            // Not enough coins
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>🎨 Theme Skins</Text>
                <Text style={styles.sectionSubtitle}>Personalize your experience</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + SPACING.md}
            >
                {THEME_PALETTES.map((theme) => (
                    <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isActive={activeThemeId === theme.id}
                        isOwned={ownedThemes.includes(theme.id) || theme.isDefault === true}
                        isPro={isPro}
                        onPress={() => handleThemePress(theme)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.lg,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: RADIUS.xl,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    accentBlob: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.15,
    },
    cardContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
    },
    previewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    demoText: {
        position: 'absolute',
        alignItems: 'center',
    },
    demoNumber: {
        fontSize: 12,
        fontWeight: '800',
    },
    demoLabel: {
        fontSize: 8,
        color: '#8E8E93',
        fontWeight: '500',
    },
    swatchRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: SPACING.sm,
    },
    swatch: {
        width: 16,
        height: 16,
        borderRadius: 4,
    },
    themeName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    statusBadge: {
        position: 'absolute',
        bottom: SPACING.md,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
    },
    equipBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    equipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        gap: 4,
    },
    priceText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default ThemeSelector;
