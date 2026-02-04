/**
 * SleepPhaseCard - Educational sleep phase insight card
 * Features: icon, duration, status badge, educational description
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

export type SleepPhase = 'deep' | 'rem' | 'light' | 'latency';
export type PhaseStatus = 'excellent' | 'optimal' | 'low' | 'high';

interface SleepPhaseCardProps {
    phase: SleepPhase;
    duration: string; // e.g., "1h 45m" or "12 min"
    percentage?: number; // e.g., 20 for 20%
    status: PhaseStatus;
    compact?: boolean;
}

const PHASE_CONFIG: Record<SleepPhase, {
    icon: string;
    label: string;
    color: string;
    bgColor: string;
    description: string;
}> = {
    deep: {
        icon: '💪',
        label: 'Deep Sleep',
        color: '#4F46E5',
        bgColor: 'rgba(79, 70, 229, 0.1)',
        description: 'Muscle repair & growth hormone release happens here.',
    },
    rem: {
        icon: '🧠',
        label: 'REM Sleep',
        color: '#9333EA',
        bgColor: 'rgba(147, 51, 234, 0.1)',
        description: 'Memory consolidation & emotional processing.',
    },
    light: {
        icon: '🌙',
        label: 'Light Sleep',
        color: '#06B6D4',
        bgColor: 'rgba(6, 182, 212, 0.1)',
        description: 'Transition phase. Body temperature drops.',
    },
    latency: {
        icon: '⏱️',
        label: 'Sleep Latency',
        color: '#6B7280',
        bgColor: 'rgba(107, 114, 128, 0.1)',
        description: 'Time to fall asleep. <15 min is ideal.',
    },
};

const STATUS_CONFIG: Record<PhaseStatus, { label: string; color: string; bgColor: string }> = {
    excellent: { label: 'Excellent', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    optimal: { label: 'Optimal', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    low: { label: 'Low', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    high: { label: 'High', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
};

export const SleepPhaseCard: React.FC<SleepPhaseCardProps> = ({
    phase,
    duration,
    percentage,
    status,
    compact = false,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const config = PHASE_CONFIG[phase];
    const statusConfig = STATUS_CONFIG[status];

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        cardBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    };

    return (
        <View style={[styles.card, compact && styles.cardCompact]}>
            <LinearGradient
                colors={isDark
                    ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Color accent bar */}
                <View style={[styles.accentBar, { backgroundColor: config.color }]} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                        <Text style={styles.icon}>{config.icon}</Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {config.label.toUpperCase()}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Duration */}
                <View style={styles.valueRow}>
                    <Text style={[styles.duration, { color: colors.text }]}>{duration}</Text>
                    {percentage !== undefined && (
                        <Text style={[styles.percentage, { color: config.color }]}>({percentage}%)</Text>
                    )}
                </View>

                {/* Educational Description */}
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {config.description}
                </Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    cardCompact: {
        minWidth: 160,
    },
    gradient: {
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: RADIUS.xl,
        position: 'relative',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: RADIUS.xl,
        borderBottomLeftRadius: RADIUS.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 18,
    },
    headerText: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '800',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: SPACING.xs,
    },
    duration: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    percentage: {
        fontSize: 14,
        fontWeight: '700',
    },
    description: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 16,
        fontStyle: 'italic',
    },
});

export default SleepPhaseCard;
