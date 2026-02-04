/**
 * UsageLimitBar - Shows usage progress and upgrade prompt
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface UsageLimitBarProps {
    /** Feature name to display */
    featureName: string;
    /** Current usage count */
    used: number;
    /** Maximum allowed (limit) */
    limit: number;
    /** Whether to show upgrade prompt */
    showUpgrade?: boolean;
    /** Compact mode for inline display */
    compact?: boolean;
}

export function UsageLimitBar({
    featureName,
    used,
    limit,
    showUpgrade = true,
    compact = false,
}: UsageLimitBarProps) {
    const router = useRouter();
    const { isDark } = useTheme();

    const percentage = Math.min((used / limit) * 100, 100);
    const remaining = Math.max(limit - used, 0);
    const isNearLimit = percentage >= 80;
    const isAtLimit = used >= limit;

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        bg: isDark ? '#1C1C1E' : '#F5F5F7',
        barBg: isDark ? '#2C2C2E' : '#E5E5EA',
        barFill: isAtLimit ? '#FF3B30' : isNearLimit ? '#FF9500' : '#FF5C00',
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <Text style={[styles.compactText, { color: colors.textSecondary }]}>
                    {remaining}/{limit}
                </Text>
                <View style={[styles.compactBar, { backgroundColor: colors.barBg }]}>
                    <View
                        style={[
                            styles.compactBarFill,
                            { width: `${percentage}%`, backgroundColor: colors.barFill },
                        ]}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
                <Text style={[styles.featureName, { color: colors.text }]}>{featureName}</Text>
                <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                    {used}/{limit} used today
                </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: colors.barBg }]}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${percentage}%`, backgroundColor: colors.barFill },
                    ]}
                />
            </View>

            {isAtLimit && showUpgrade && (
                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => router.push('/(modals)/premium')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#FF5C00', '#FF8C00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.upgradeGradient}
                    >
                        <Ionicons name="flash" size={16} color="#FFFFFF" />
                        <Text style={styles.upgradeText}>Upgrade for Unlimited</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {isNearLimit && !isAtLimit && (
                <Text style={[styles.warningText, { color: '#FF9500' }]}>
                    ⚠️ {remaining} remaining today
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureName: {
        fontSize: 14,
        fontWeight: '600',
    },
    usageText: {
        fontSize: 12,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    upgradeButton: {
        marginTop: 12,
    },
    upgradeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    upgradeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    warningText: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    compactText: {
        fontSize: 11,
        fontWeight: '500',
    },
    compactBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    compactBarFill: {
        height: '100%',
        borderRadius: 2,
    },
});
