/**
 * PremiumGate - Wraps content that requires premium access
 *
 * Shows locked state for free users, full content for premium users
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { useIsPremium } from '@/src/hooks/usePremium';
import { TierFeatures, FEATURE_NAMES } from '@/src/config/tiers';

interface PremiumGateProps {
    /** The feature being gated */
    feature: keyof TierFeatures;
    /** Content to show when user has access */
    children: ReactNode;
    /** Style for the container */
    style?: object;
    /** Show as overlay on top of blurred content */
    overlay?: boolean;
    /** Custom locked message */
    lockedMessage?: string;
    /** Compact mode (smaller lock icon) */
    compact?: boolean;
}

export function PremiumGate({
    feature,
    children,
    style,
    overlay = true,
    lockedMessage,
    compact = false,
}: PremiumGateProps) {
    const router = useRouter();
    const { isDark } = useTheme();
    const isPremium = useIsPremium();

    // If user has premium, show children directly
    if (isPremium) {
        return <>{children}</>;
    }

    const featureName = FEATURE_NAMES[feature] || 'This feature';
    const message = lockedMessage || `${featureName} is a Pro feature`;

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93',
        bg: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        lockBg: isDark ? '#2C2C2E' : '#F5F5F7',
    };

    const handleUpgrade = () => {
        router.push('/(modals)/premium');
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={[styles.compactContainer, { backgroundColor: colors.lockBg }, style]}
                onPress={handleUpgrade}
                activeOpacity={0.7}
            >
                <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
                <Text style={[styles.compactText, { color: colors.textSecondary }]}>Pro</Text>
            </TouchableOpacity>
        );
    }

    if (overlay) {
        return (
            <View style={[styles.overlayContainer, style]}>
                {/* Blurred background content */}
                <View style={styles.blurredContent}>
                    {children}
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
                </View>

                {/* Lock overlay */}
                <View style={[styles.lockOverlay, { backgroundColor: colors.bg }]}>
                    <View style={[styles.lockIcon, { backgroundColor: colors.lockBg }]}>
                        <Ionicons name="lock-closed" size={24} color="#FF5C00" />
                    </View>
                    <Text style={[styles.lockTitle, { color: colors.text }]}>{message}</Text>
                    <Text style={[styles.lockSubtitle, { color: colors.textSecondary }]}>
                        Upgrade to Pro for full access
                    </Text>
                    <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#FF5C00', '#FF8C00']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.upgradeButton}
                        >
                            <Ionicons name="flash" size={16} color="#FFFFFF" />
                            <Text style={styles.upgradeText}>Unlock Pro</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Non-overlay mode - just show lock state
    return (
        <TouchableOpacity
            style={[styles.lockedContainer, { backgroundColor: colors.lockBg }, style]}
            onPress={handleUpgrade}
            activeOpacity={0.7}
        >
            <View style={styles.lockIcon}>
                <Ionicons name="lock-closed" size={20} color="#FF5C00" />
            </View>
            <View style={styles.lockedTextContainer}>
                <Text style={[styles.lockedTitle, { color: colors.text }]}>{featureName}</Text>
                <Text style={[styles.lockedSubtitle, { color: colors.textSecondary }]}>
                    Tap to unlock with Pro
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );
}

/**
 * Simple lock badge to indicate premium content
 */
export function ProBadge({ style }: { style?: object }) {
    return (
        <LinearGradient
            colors={['#FF5C00', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.proBadge, style]}
        >
            <Text style={styles.proBadgeText}>PRO</Text>
        </LinearGradient>
    );
}

/**
 * Lock icon indicator
 */
export function LockIndicator({ size = 16 }: { size?: number }) {
    return (
        <View style={[styles.lockIndicator, { width: size + 8, height: size + 8 }]}>
            <Ionicons name="lock-closed" size={size} color="#FF5C00" />
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
    },
    blurredContent: {
        opacity: 0.5,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
    },
    lockIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    lockTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    lockSubtitle: {
        fontSize: 13,
        marginBottom: 16,
        textAlign: 'center',
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        gap: 6,
    },
    upgradeText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    lockedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    lockedTextContainer: {
        flex: 1,
    },
    lockedTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    lockedSubtitle: {
        fontSize: 12,
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        gap: 4,
    },
    compactText: {
        fontSize: 10,
        fontWeight: '700',
    },
    proBadge: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    proBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    lockIndicator: {
        backgroundColor: 'rgba(255, 92, 0, 0.1)',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PremiumGate;
