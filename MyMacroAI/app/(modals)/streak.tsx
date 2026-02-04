/**
 * Streak & Consistency Modal - "The Gamification Engine"
 *
 * This page appears when users tap the Flame Icon and must feel
 * rewarding, urgent, and visually distinct. It's the heart of
 * the app's retention mechanics.
 *
 * Layout (Top to Bottom):
 * 1. Hero Section: "The Eternal Flame" - animated fire based on streak
 * 2. Consistency Chain: Calendar heatmap
 * 3. Roadmap: Next milestone timeline
 * 4. MacroCoin Exchange: Power-up shop
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, SHADOWS } from '@/src/design-system/tokens';
import { useStreak } from '@/hooks/useStreak';
import {
    StreakFlame,
    ConsistencyGrid,
    MilestonePath,
    PowerUpShop,
} from '@/src/components/gamification';

export default function StreakScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const {
        data,
        isLateInDay,
        streakIntensity,
        milestones,
        nextMilestone,
        daysUntilNextMilestone,
        useFreeze,
        spendCoins,
    } = useStreak();

    const colors = {
        bg: isDark ? '#121214' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        cardBg: isDark ? 'rgba(30, 30, 35, 0.6)' : 'rgba(255, 255, 255, 0.85)',
    };

    // Check if streak needs restoring (yesterday was missed)
    const needsRestore = data.history.length > 1 &&
        data.history[data.history.length - 2]?.status === 'MISS';

    const handlePurchase = (itemId: string, cost: number) => {
        if (itemId === 'streak-freeze') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return spendCoins(cost);
    };

    const handleFreezePress = () => {
        if (data.freezesAvailable > 0) {
            useFreeze();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: '',
                    headerTransparent: true,
                    headerStyle: { backgroundColor: 'transparent' },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.backButtonBlur}>
                                <Ionicons name="chevron-back" size={24} color={colors.text} />
                            </BlurView>
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Warm gradient background - vertical from top */}
            <LinearGradient
                colors={isDark
                    ? ['#2A1810', '#1A0F0A', colors.bg]
                    : ['#FFF0E6', '#FFF8F3', colors.bg]
                }
                style={styles.gradientBg}
                locations={[0, 0.4, 1]}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. Hero: Eternal Flame */}
                    <StreakFlame
                        streak={data.currentStreak}
                        intensity={streakIntensity}
                        isUrgent={isLateInDay && !data.dailyGoalHit}
                    />

                    {/* Freeze Button - Floating glass pill */}
                    {data.freezesAvailable > 0 && (
                        <TouchableOpacity
                            style={styles.freezeButtonContainer}
                            onPress={handleFreezePress}
                            activeOpacity={0.8}
                        >
                            <BlurView
                                intensity={40}
                                tint={isDark ? 'dark' : 'light'}
                                style={[
                                    styles.freezeButton,
                                    needsRestore && styles.freezeButtonPulse,
                                ]}
                            >
                                <Ionicons name="snow" size={18} color={COLORS.gamification.iceBlue} />
                                <Text style={styles.freezeText}>
                                    {data.freezesAvailable} {needsRestore ? 'Restore Streak' : 'Freezes Left'}
                                </Text>
                            </BlurView>
                        </TouchableOpacity>
                    )}

                    {/* Stats Row */}
                    <View style={[styles.statsCard, { backgroundColor: colors.cardBg }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {data.longestStreak}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Longest Streak
                            </Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {nextMilestone?.icon} {daysUntilNextMilestone}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Days to {nextMilestone?.name}
                            </Text>
                        </View>
                    </View>

                    {/* 2. Consistency Chain (Calendar Heatmap) */}
                    <ConsistencyGrid history={data.history} />

                    {/* 3. Roadmap (Milestone Path) */}
                    <MilestonePath
                        milestones={milestones}
                        currentStreak={data.currentStreak}
                        daysUntilNext={daysUntilNextMilestone}
                    />

                    {/* 4. MacroCoin Exchange (Power-Up Shop) */}
                    <PowerUpShop
                        coins={data.coins}
                        onPurchase={handlePurchase}
                        ownedFreezes={data.freezesAvailable}
                    />

                    {/* Bottom Padding */}
                    <View style={{ height: 60 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 500,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingTop: 60,
    },
    backButton: {
        marginLeft: SPACING.sm,
        borderRadius: 20,
        overflow: 'hidden',
    },
    backButtonBlur: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    freezeButtonContainer: {
        alignItems: 'center',
        marginTop: -SPACING.lg,
    },
    freezeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.pill,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.gamification.iceBlueDim,
        overflow: 'hidden',
    },
    freezeButtonPulse: {
        borderColor: COLORS.gamification.iceBlue,
        borderWidth: 2,
    },
    freezeText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gamification.iceBlue,
    },
    statsCard: {
        flexDirection: 'row',
        marginHorizontal: SPACING.xl,
        marginVertical: SPACING.lg,
        padding: SPACING.xl,
        borderRadius: RADIUS['2xl'],
        ...SHADOWS.soft,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        marginHorizontal: SPACING.lg,
    },
});
