/**
 * UpgradeBanner - Sticky upgrade button for free users
 * Appears in headers across all pages with different placements
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useUserStore } from '@/src/store/UserStore';

type BannerVariant = 'pill' | 'compact' | 'icon' | 'text';

interface UpgradeBannerProps {
    variant?: BannerVariant;
    style?: any;
}

/**
 * UpgradeBanner - Shows upgrade CTA for non-Pro users
 * - pill: Full pill with "PRO" text and sparkle
 * - compact: Small pill with crown icon
 * - icon: Just the icon button
 * - text: Text link style
 */
export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
    variant = 'pill',
    style,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const isPro = useUserStore((state) => state.isPro);

    // Don't render if user is already Pro
    if (isPro) return null;

    const colors = {
        accent: '#FF4500',
        accentLight: '#FF6B35',
        text: '#FFFFFF',
        bgLight: isDark ? 'rgba(255,69,0,0.15)' : 'rgba(255,69,0,0.1)',
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(modals)/premium' as any);
    };

    // Icon-only variant
    if (variant === 'icon') {
        return (
            <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.bgLight }, style]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Ionicons name="sparkles" size={18} color={colors.accent} />
            </TouchableOpacity>
        );
    }

    // Compact variant with crown
    if (variant === 'compact') {
        return (
            <TouchableOpacity
                style={[styles.compactButton, style]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.accentLight, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.compactGradient}
                >
                    <Ionicons name="diamond" size={12} color={colors.text} />
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Text link variant
    if (variant === 'text') {
        return (
            <TouchableOpacity onPress={handlePress} style={style}>
                <Text style={[styles.textLink, { color: colors.accent }]}>
                    Upgrade to Pro
                </Text>
            </TouchableOpacity>
        );
    }

    // Default pill variant
    return (
        <TouchableOpacity
            style={[styles.pillButton, style]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[colors.accentLight, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pillGradient}
            >
                <Ionicons name="sparkles" size={12} color={colors.text} />
                <Text style={styles.pillText}>PRO</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

/**
 * UpgradeHeaderButton - Specifically for header placement
 * Shows a subtle but noticeable upgrade button
 */
export const UpgradeHeaderButton: React.FC<{ style?: any }> = ({ style }) => {
    const isPro = useUserStore((state) => state.isPro);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (isPro) return null;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(modals)/premium' as any);
    };

    return (
        <TouchableOpacity
            style={[
                styles.headerButton,
                {
                    backgroundColor: isDark ? 'rgba(255,69,0,0.2)' : 'rgba(255,69,0,0.1)',
                    borderColor: isDark ? 'rgba(255,69,0,0.3)' : 'rgba(255,69,0,0.2)',
                },
                style,
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Ionicons name="sparkles" size={14} color="#FF4500" />
            <Text style={styles.headerButtonText}>PRO</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Pill variant
    pillButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    pillGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    pillText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Compact variant
    compactButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    compactGradient: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },

    // Icon variant
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Text variant
    textLink: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Header button
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
    },
    headerButtonText: {
        color: '#FF4500',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export default UpgradeBanner;
