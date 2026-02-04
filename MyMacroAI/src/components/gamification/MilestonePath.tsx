/**
 * MilestonePath - "The Roadmap" Vertical Timeline
 *
 * Shows past achievements, current goal progress, and locked future milestones.
 * Milestone Tiers: Starter, Warrior, Spartan, Titan, Champion, Legend
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { Milestone } from '@/hooks/useStreak';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../design-system/tokens';

interface Props {
    milestones: Milestone[];
    currentStreak: number;
    daysUntilNext?: number;
}

// Milestone tier visual configs
const TIER_CONFIG: Record<number, {
    gradient: readonly [string, string, ...string[]];
    glowColor: string;
    badgeColor: string;
}> = {
    3: {
        gradient: ['#CD7F32', '#B87333'],
        glowColor: 'rgba(205, 127, 50, 0.4)',
        badgeColor: COLORS.gamification.milestones.bronze,
    },
    7: {
        gradient: ['#C0C0C0', '#A8A8A8'],
        glowColor: 'rgba(192, 192, 192, 0.4)',
        badgeColor: COLORS.gamification.milestones.silver,
    },
    14: {
        gradient: ['#FFD700', '#FFC200'],
        glowColor: 'rgba(255, 215, 0, 0.4)',
        badgeColor: COLORS.gamification.milestones.gold,
    },
    30: {
        gradient: ['#E5E4E2', '#C0C0C0'],
        glowColor: 'rgba(229, 228, 226, 0.4)',
        badgeColor: COLORS.gamification.milestones.platinum,
    },
    60: {
        gradient: ['#B9F2FF', '#87CEEB'],
        glowColor: 'rgba(185, 242, 255, 0.5)',
        badgeColor: COLORS.gamification.milestones.diamond,
    },
    100: {
        gradient: ['#FF1744', '#FF5722', '#FFD700'],
        glowColor: 'rgba(255, 215, 0, 0.6)',
        badgeColor: '#FFD700',
    },
};

// Animated Milestone Node
const MilestoneNode: React.FC<{
    milestone: Milestone;
    isAchieved: boolean;
    isCurrent: boolean;
    progress: number;
}> = ({ milestone, isAchieved, isCurrent }) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);
    const config = TIER_CONFIG[milestone.days] || TIER_CONFIG[7];

    useEffect(() => {
        if (isCurrent) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [isCurrent]);

    const nodeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    if (isAchieved) {
        return (
            <View style={styles.nodeWrapper}>
                <View style={[styles.nodeGlow, { backgroundColor: config.glowColor }]} />
                <LinearGradient colors={config.gradient} style={styles.nodeAchieved}>
                    <Text style={styles.nodeIcon}>{milestone.icon}</Text>
                </LinearGradient>
            </View>
        );
    }

    if (isCurrent) {
        return (
            <Animated.View style={[styles.nodeWrapper, nodeStyle]}>
                <Animated.View style={[styles.nodeGlow, { backgroundColor: config.glowColor }, glowStyle]} />
                <View style={[styles.nodeCurrent, { borderColor: COLORS.gamification.vitaminOrange }]}>
                    <Text style={styles.nodeIcon}>{milestone.icon}</Text>
                </View>
            </Animated.View>
        );
    }

    return (
        <View style={styles.nodeWrapper}>
            <View style={styles.nodeLocked}>
                <Ionicons name="lock-closed" size={16} color="rgba(150, 150, 150, 0.5)" />
            </View>
        </View>
    );
};

export const MilestonePath: React.FC<Props> = ({
    milestones,
    currentStreak,
    daysUntilNext,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const currentIndex = milestones.findIndex(m => !m.achieved);
    const nextMilestone = milestones[currentIndex];

    // Calculate progress toward current milestone
    const prevMilestoneDays = currentIndex > 0 ? milestones[currentIndex - 1].days : 0;
    const currentMilestoneDays = nextMilestone?.days || 0;
    const progressRange = currentMilestoneDays - prevMilestoneDays;
    const progress = progressRange > 0
        ? Math.min(1, (currentStreak - prevMilestoneDays) / progressRange)
        : 0;

    // Calculate days until next if not provided
    const daysRemaining = daysUntilNext ?? (nextMilestone ? nextMilestone.days - currentStreak : 0);

    // Show milestones: 1 achieved, current, 2 locked
    const visibleMilestones = milestones.slice(
        Math.max(0, currentIndex - 1),
        Math.min(milestones.length, currentIndex + 3)
    );

    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryText = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    const cardBg = isDark ? 'rgba(30, 30, 35, 0.6)' : 'rgba(255, 255, 255, 0.85)';
    const lineBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

    return (
        <View style={[styles.container, { backgroundColor: cardBg }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: secondaryText }]}>ROADMAP</Text>
                    <Text style={[styles.subtitle, { color: textColor }]}>
                        {nextMilestone ? `${nextMilestone.title || nextMilestone.name} in ${daysRemaining} days` : 'All milestones achieved!'}
                    </Text>
                </View>

                {nextMilestone && (
                    <View style={styles.progressBadge}>
                        <LinearGradient
                            colors={TIER_CONFIG[nextMilestone.days]?.gradient || ['#FF5C00', '#FF8A50']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.progressBadgeInner}
                        >
                            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                        </LinearGradient>
                    </View>
                )}
            </View>

            <View style={styles.timeline}>
                <View style={[styles.timelineLine, { backgroundColor: lineBg }]} />

                {visibleMilestones.map((milestone) => {
                    const isAchieved = milestone.achieved;
                    const isCurrent = milestone === nextMilestone;
                    const isLocked = !isAchieved && !isCurrent;
                    const daysLeft = milestone.days - currentStreak;

                    return (
                        <View key={milestone.days} style={styles.milestoneRow}>
                            <MilestoneNode
                                milestone={milestone}
                                isAchieved={isAchieved}
                                isCurrent={isCurrent}
                                progress={progress}
                            />

                            <View style={[styles.milestoneContent, isLocked && styles.contentLocked]}>
                                <View style={styles.titleRow}>
                                    <Text
                                        style={[
                                            styles.milestoneTitle,
                                            { color: textColor },
                                            isCurrent && { color: COLORS.gamification.vitaminOrange },
                                            isLocked && { color: 'rgba(150, 150, 150, 0.6)' },
                                        ]}
                                    >
                                        {milestone.title || `${milestone.days}-Day ${milestone.name}`}
                                    </Text>
                                    <Text style={[styles.milestoneDays, { color: secondaryText }]}>
                                        {milestone.days} days
                                    </Text>
                                </View>

                                {isAchieved && milestone.achievedDate && (
                                    <View style={styles.achievedRow}>
                                        <Ionicons name="checkmark-circle" size={14} color={COLORS.gamification.springGreen} />
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.gamification.springGreen }}>
                                            Achieved {milestone.achievedDate}
                                        </Text>
                                    </View>
                                )}

                                {isCurrent && (
                                    <View style={styles.currentRow}>
                                        <Ionicons name="flame" size={14} color={COLORS.gamification.vitaminOrange} />
                                        <Text style={styles.currentText}>{daysLeft} days remaining</Text>
                                        <View style={styles.miniProgressBar}>
                                            <View style={[styles.miniProgressFill, { width: `${progress * 100}%` }]} />
                                        </View>
                                    </View>
                                )}

                                {isLocked && (
                                    <View style={styles.lockedRow}>
                                        <Ionicons name="lock-closed-outline" size={12} color="rgba(150, 150, 150, 0.5)" />
                                        <Text style={styles.lockedText}>Locked</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        marginVertical: SPACING.lg,
        ...SHADOWS.soft,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    progressBadge: {
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    progressBadgeInner: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    progressText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    timeline: {
        position: 'relative',
        paddingLeft: 60,
    },
    timelineLine: {
        position: 'absolute',
        left: 27,
        top: 28,
        bottom: 28,
        width: 2,
        borderRadius: 1,
    },
    milestoneRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    nodeWrapper: {
        position: 'absolute',
        left: -60,
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nodeGlow: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    nodeAchieved: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.md,
    },
    nodeCurrent: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        backgroundColor: 'rgba(255, 92, 0, 0.1)',
    },
    nodeLocked: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: 'rgba(150, 150, 150, 0.25)',
    },
    nodeIcon: {
        fontSize: 20,
    },
    milestoneContent: {
        flex: 1,
        paddingLeft: SPACING.sm,
        paddingTop: SPACING.xs,
    },
    contentLocked: {
        opacity: 0.5,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    milestoneDays: {
        fontSize: 13,
        fontWeight: '600',
    },
    achievedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    currentRow: {
        marginTop: 6,
    },
    currentText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.gamification.vitaminOrange,
        marginTop: 2,
    },
    miniProgressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 92, 0, 0.15)',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    miniProgressFill: {
        height: '100%',
        backgroundColor: COLORS.gamification.vitaminOrange,
        borderRadius: 2,
    },
    lockedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    lockedText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(150, 150, 150, 0.5)',
    },
});
