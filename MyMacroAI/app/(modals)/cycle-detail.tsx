/**
 * Cycle Detail Page - "Lunar Flow" Theme
 * Menstrual cycle tracking with flowing moon phases
 * Unique: Moon phase animation, flowing gradients, cycle phase cards
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    useColorScheme,
    Dimensions,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useTabBarStore } from '@/src/store/tabBarStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Flowing Glow Component
const FlowingGlow = ({ delay = 0, color = '#EC4899' }: { delay?: number; color?: string }) => {
    const translateX = useSharedValue(-100);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(SCREEN_WIDTH + 100, { duration: 6000 + delay, easing: Easing.linear }),
            -1,
            false
        );
        opacity.value = withRepeat(
            withTiming(0.6, { duration: 3000 }),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.flowGlow,
                { backgroundColor: color },
                glowStyle,
            ]}
        />
    );
};

// Moon Phase Component
const MoonPhase = ({ phase = 0.5, size = 120 }: { phase?: number; size?: number }) => {
    // phase: 0 = new moon, 0.5 = full moon, 1 = new moon again
    const illuminationWidth = size * Math.abs(phase - 0.5) * 2;
    const isWaxing = phase < 0.5;

    return (
        <View style={[styles.moonContainer, { width: size, height: size }]}>
            <View style={[styles.moonBase, { width: size, height: size, borderRadius: size / 2 }]} />
            <View
                style={[
                    styles.moonShadow,
                    {
                        width: illuminationWidth,
                        height: size,
                        borderRadius: size / 2,
                        [isWaxing ? 'right' : 'left']: 0,
                    }
                ]}
            />
        </View>
    );
};

export default function CycleDetailScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { hideTabBar, showTabBar } = useTabBarStore();

    // Hide tab bar on mount
    useEffect(() => {
        hideTabBar();
        return () => showTabBar();
    }, [hideTabBar, showTabBar]);

    // Gentle pulsing animation
    const pulse = useSharedValue(1);
    const rotation = useSharedValue(0);

    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        rotation.value = withRepeat(
            withTiming(360, { duration: 60000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const orbitStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const colors = {
        bg: isDark ? '#1A0F1E' : '#FDF4FF',
        card: isDark ? 'rgba(236, 72, 153, 0.08)' : 'rgba(255, 255, 255, 0.9)',
        text: isDark ? '#FFFFFF' : '#701A75',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(112, 26, 117, 0.6)',
        accent: '#EC4899',
        accentLight: '#F472B6',
        phase1: '#EC4899', // Menstrual
        phase2: '#A855F7', // Follicular
        phase3: '#3B82F6', // Ovulation
        phase4: '#F97316', // Luteal
        surface: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        border: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.2)',
    };

    // Mock data
    const currentDay = 14;
    const cycleLength = 28;
    const currentPhase = 'Ovulation';
    const daysUntilPeriod = 14;
    const fertileWindow = true;

    const getPhaseInfo = (phase: string) => {
        switch (phase) {
            case 'Menstrual':
                return { color: colors.phase1, days: '1-5', emoji: '🌑', desc: 'Rest & restore' };
            case 'Follicular':
                return { color: colors.phase2, days: '6-13', emoji: '🌙', desc: 'Energy rising' };
            case 'Ovulation':
                return { color: colors.phase3, days: '14-16', emoji: '🌕', desc: 'Peak energy' };
            case 'Luteal':
                return { color: colors.phase4, days: '17-28', emoji: '🌓', desc: 'Winding down' };
            default:
                return { color: colors.accent, days: '--', emoji: '🌙', desc: '' };
        }
    };

    const phaseInfo = getPhaseInfo(currentPhase);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Flowing Background */}
            <View style={styles.cycleBg}>
                <LinearGradient
                    colors={isDark
                        ? ['#1A0F1E', '#2D1B3D', '#3D1B4D']
                        : ['#FDF4FF', '#FAE8FF', '#F5D0FE']}
                    style={StyleSheet.absoluteFill}
                />
                <FlowingGlow delay={0} color={isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)'} />
                <FlowingGlow delay={2000} color={isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.08)'} />
            </View>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                        <TouchableOpacity
                            style={[styles.backButton, { backgroundColor: colors.surface }]}
                            onPress={handleBack}
                        >
                            <Ionicons name="chevron-back" size={22} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Cycle Tracking</Text>
                        <View style={styles.headerSpacer} />
                    </Animated.View>

                    {/* AI Insight Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <BlurView intensity={isDark ? 30 : 60} style={[styles.aiCard, { borderColor: colors.border }]}>
                            <View style={styles.aiHeader}>
                                <MyMacroAIAvatar size="small" accentColor={colors.accent} />
                                <Text style={[styles.aiLabel, { color: colors.accent }]}>MYMACRO AI CYCLE COACH</Text>
                            </View>
                            <Text style={[styles.aiText, { color: colors.text }]}>
                                You're in your {currentPhase.toLowerCase()} phase (Day {currentDay}). Energy levels tend to peak now -
                                great time for high-intensity workouts and important meetings!
                            </Text>
                        </BlurView>
                    </Animated.View>

                    {/* Hero: Cycle Visualization */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={isDark
                                    ? ['#BE185D', '#EC4899', '#F472B6']
                                    : ['#EC4899', '#F472B6', '#FBCFE8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                {/* Orbiting decorations */}
                                <Animated.View style={[styles.orbitContainer, orbitStyle]}>
                                    <View style={styles.orbitDot} />
                                </Animated.View>

                                {/* Main circle */}
                                <Animated.View style={[styles.mainCircle, pulseStyle]}>
                                    <Text style={styles.phaseEmoji}>{phaseInfo.emoji}</Text>
                                    <Text style={styles.dayValue}>Day {currentDay}</Text>
                                    <Text style={styles.phaseLabel}>{currentPhase}</Text>
                                </Animated.View>

                                {fertileWindow && (
                                    <View style={styles.fertileIndicator}>
                                        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                                        <Text style={styles.fertileText}>Fertile Window</Text>
                                    </View>
                                )}

                                <View style={styles.periodCountdown}>
                                    <Text style={styles.countdownValue}>{daysUntilPeriod}</Text>
                                    <Text style={styles.countdownLabel}>days until period</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Cycle Progress */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <BlurView intensity={isDark ? 20 : 50} style={[styles.progressCard, { borderColor: colors.border }]}>
                            <Text style={[styles.progressTitle, { color: colors.text }]}>Cycle Progress</Text>
                            <View style={styles.progressBar}>
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressFill, { width: `${(currentDay / cycleLength) * 100}%` }]}>
                                        <LinearGradient
                                            colors={[colors.phase1, colors.phase2, colors.phase3, colors.phase4]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.progressMarker, { left: `${(currentDay / cycleLength) * 100}%` }]}>
                                    <View style={styles.markerDot} />
                                </View>
                            </View>
                            <View style={styles.progressLabels}>
                                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Day 1</Text>
                                <Text style={[styles.progressLabel, { color: colors.accent }]}>Day {currentDay}</Text>
                                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Day {cycleLength}</Text>
                            </View>
                        </BlurView>
                    </Animated.View>

                    {/* Stats Grid */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{cycleLength}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cycle Length</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="water-outline" size={18} color={colors.phase1} />
                            <Text style={[styles.statValue, { color: colors.text }]}>5</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Period Days</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="sync-outline" size={18} color={colors.phase3} />
                            <Text style={[styles.statValue, { color: colors.text }]}>28</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Cycle</Text>
                        </View>
                    </Animated.View>

                    {/* Cycle Phases */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CYCLE PHASES</Text>

                        <View style={[styles.phaseCard, currentPhase === 'Menstrual' && styles.phaseCardActive, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={[`${colors.phase1}15`, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.phaseIndicator, { backgroundColor: colors.phase1 }]} />
                            <View style={styles.phaseInfo}>
                                <View style={styles.phaseHeader}>
                                    <Text style={styles.phaseCardEmoji}>🌑</Text>
                                    <Text style={[styles.phaseName, { color: colors.text }]}>Menstrual</Text>
                                </View>
                                <Text style={[styles.phaseDesc, { color: colors.textSecondary }]}>
                                    Days 1-5 • Rest & restore
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.phaseCard, currentPhase === 'Follicular' && styles.phaseCardActive, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={[`${colors.phase2}15`, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.phaseIndicator, { backgroundColor: colors.phase2 }]} />
                            <View style={styles.phaseInfo}>
                                <View style={styles.phaseHeader}>
                                    <Text style={styles.phaseCardEmoji}>🌙</Text>
                                    <Text style={[styles.phaseName, { color: colors.text }]}>Follicular</Text>
                                </View>
                                <Text style={[styles.phaseDesc, { color: colors.textSecondary }]}>
                                    Days 6-13 • Energy rising
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.phaseCard, currentPhase === 'Ovulation' && styles.phaseCardActive, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={[`${colors.phase3}15`, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.phaseIndicator, { backgroundColor: colors.phase3 }]} />
                            <View style={styles.phaseInfo}>
                                <View style={styles.phaseHeader}>
                                    <Text style={styles.phaseCardEmoji}>🌕</Text>
                                    <Text style={[styles.phaseName, { color: colors.text }]}>Ovulation</Text>
                                    {currentPhase === 'Ovulation' && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>NOW</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.phaseDesc, { color: colors.textSecondary }]}>
                                    Days 14-16 • Peak energy & fertility
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.phaseCard, currentPhase === 'Luteal' && styles.phaseCardActive, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={[`${colors.phase4}15`, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.phaseIndicator, { backgroundColor: colors.phase4 }]} />
                            <View style={styles.phaseInfo}>
                                <View style={styles.phaseHeader}>
                                    <Text style={styles.phaseCardEmoji}>🌓</Text>
                                    <Text style={[styles.phaseName, { color: colors.text }]}>Luteal</Text>
                                </View>
                                <Text style={[styles.phaseDesc, { color: colors.textSecondary }]}>
                                    Days 17-28 • Winding down
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Quick Actions */}
                    <Animated.View entering={FadeInDown.delay(450).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>QUICK ACTIONS</Text>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
                                <Text style={[styles.actionText, { color: colors.text }]}>Log Symptoms</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="water-outline" size={24} color={colors.phase1} />
                                <Text style={[styles.actionText, { color: colors.text }]}>Log Period</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    cycleBg: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    flowGlow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        top: '30%',
    },
    safeArea: { flex: 1 },
    content: { padding: SPACING.lg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSpacer: { width: 40 },
    aiCard: {
        borderRadius: 20,
        padding: SPACING.md,
        borderWidth: 1,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    aiLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    aiText: {
        fontSize: 14,
        lineHeight: 21,
    },
    heroCard: {
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    heroGradient: {
        paddingVertical: 50,
        alignItems: 'center',
        position: 'relative',
    },
    orbitContainer: {
        position: 'absolute',
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    orbitDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginTop: -5,
    },
    mainCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    phaseEmoji: {
        fontSize: 36,
        marginBottom: 4,
    },
    dayValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    phaseLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    fertileIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 20,
    },
    fertileText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    periodCountdown: {
        alignItems: 'center',
        marginTop: 16,
    },
    countdownValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    countdownLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.7)',
    },
    moonContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    moonBase: {
        backgroundColor: '#FEF3C7',
    },
    moonShadow: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    progressCard: {
        borderRadius: 20,
        padding: SPACING.lg,
        borderWidth: 1,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    progressBar: {
        position: 'relative',
        height: 8,
        marginBottom: SPACING.sm,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(128,128,128,0.2)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressMarker: {
        position: 'absolute',
        top: -4,
        marginLeft: -8,
    },
    markerDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#EC4899',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    phaseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: SPACING.sm,
        gap: SPACING.md,
        overflow: 'hidden',
    },
    phaseCardActive: {
        borderWidth: 2,
    },
    phaseIndicator: {
        width: 6,
        height: 50,
        borderRadius: 3,
    },
    phaseInfo: {
        flex: 1,
    },
    phaseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    phaseCardEmoji: {
        fontSize: 18,
    },
    phaseName: {
        fontSize: 16,
        fontWeight: '600',
    },
    currentBadge: {
        backgroundColor: '#EC4899',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    currentBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    phaseDesc: {
        fontSize: 12,
        marginTop: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionButton: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
