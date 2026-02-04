/**
 * Stress Detail Page - "Zen Garden" Theme
 * Stress level analysis with calming ripple animations
 * Unique: Concentric ripples, zen-inspired purple/pink palette, meditation cards
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
    withDelay,
    Easing,
    interpolate,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useTabBarStore } from '@/src/store/tabBarStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calming Ripple Component
const CalmingRipple = ({ delay = 0, size = 200 }: { delay?: number; size?: number }) => {
    const scale = useSharedValue(0.3);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: 4000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withTiming(0, { duration: 4000 }),
                -1,
                false
            )
        );
    }, []);

    const rippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.ripple,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                rippleStyle,
            ]}
        />
    );
};

// Floating Petal Component
const FloatingPetal = ({ delay = 0, startX = 50 }: { delay?: number; startX?: number }) => {
    const translateY = useSharedValue(-50);
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(400, { duration: 8000, easing: Easing.linear }),
                -1,
                false
            )
        );
        translateX.value = withRepeat(
            withTiming(30, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        rotate.value = withRepeat(
            withTiming(360, { duration: 6000 }),
            -1,
            false
        );
        opacity.value = withDelay(
            delay,
            withTiming(0.5, { duration: 1000 })
        );
    }, []);

    const petalStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.petal,
                { left: startX },
                petalStyle,
            ]}
        >
            <Text style={{ fontSize: 16 }}>🌸</Text>
        </Animated.View>
    );
};

export default function StressDetailScreen() {
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

    // Breathing animation for main circle
    const breathe = useSharedValue(0);

    useEffect(() => {
        breathe.value = withRepeat(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const breatheStyle = useAnimatedStyle(() => {
        const scale = interpolate(breathe.value, [0, 1], [0.95, 1.05]);
        return { transform: [{ scale }] };
    });

    const colors = {
        bg: isDark ? '#1A0F24' : '#FDF2F8',
        card: isDark ? 'rgba(147, 51, 234, 0.08)' : 'rgba(255, 255, 255, 0.9)',
        text: isDark ? '#FFFFFF' : '#4A1D6A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(74, 29, 106, 0.6)',
        accent: '#9333EA',
        accentLight: '#A855F7',
        success: '#22C55E',
        warning: '#F97316',
        surface: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        border: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.2)',
    };

    // Mock data
    const currentStress = 32;
    const avgStress = 38;
    const peakStress = 65;

    const getStressLevel = (value: number) => {
        if (value <= 30) return { text: 'Low', color: colors.success, emoji: '😌' };
        if (value <= 60) return { text: 'Moderate', color: colors.warning, emoji: '😐' };
        return { text: 'High', color: '#EF4444', emoji: '😰' };
    };

    const stressLevel = getStressLevel(currentStress);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Zen Background */}
            <View style={styles.zenBg}>
                <LinearGradient
                    colors={isDark
                        ? ['#1A0F24', '#2D1B42', '#3B2157']
                        : ['#FDF2F8', '#FCE7F3', '#FBCFE8']}
                    style={StyleSheet.absoluteFill}
                />
                <FloatingPetal delay={0} startX={SCREEN_WIDTH * 0.1} />
                <FloatingPetal delay={2000} startX={SCREEN_WIDTH * 0.4} />
                <FloatingPetal delay={4000} startX={SCREEN_WIDTH * 0.7} />
                <FloatingPetal delay={6000} startX={SCREEN_WIDTH * 0.9} />
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
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Stress Level</Text>
                        <View style={styles.headerSpacer} />
                    </Animated.View>

                    {/* AI Insight Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <BlurView intensity={isDark ? 30 : 60} style={[styles.aiCard, { borderColor: colors.border }]}>
                            <View style={styles.aiHeader}>
                                <MyMacroAIAvatar size="small" accentColor={colors.accent} />
                                <Text style={[styles.aiLabel, { color: colors.accent }]}>MYMACRO AI WELLNESS COACH</Text>
                            </View>
                            <Text style={[styles.aiText, { color: colors.text }]}>
                                Your stress is low today at {currentStress}%. Great job staying calm!
                                Try the 5-minute meditation below to maintain this balanced state throughout the day.
                            </Text>
                        </BlurView>
                    </Animated.View>

                    {/* Hero: Stress Visualization */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={isDark
                                    ? ['#7C3AED', '#9333EA', '#A855F7']
                                    : ['#A855F7', '#C084FC', '#D8B4FE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                {/* Visualization container - centers both */}
                                <View style={styles.visualizationContainer}>
                                    {/* Ripples */}
                                    <View style={styles.ripplesContainer}>
                                        <CalmingRipple delay={0} size={200} />
                                        <CalmingRipple delay={1000} size={200} />
                                        <CalmingRipple delay={2000} size={200} />
                                    </View>

                                    {/* Main circle */}
                                    <Animated.View style={[styles.mainCircle, breatheStyle]}>
                                        <Text style={styles.stressEmoji}>{stressLevel.emoji}</Text>
                                        <Text style={styles.stressValue}>{currentStress}</Text>
                                        <Text style={styles.stressUnit}>%</Text>
                                    </Animated.View>
                                </View>

                                <View style={[styles.statusBadge, { backgroundColor: `${stressLevel.color}30` }]}>
                                    <View style={[styles.statusDot, { backgroundColor: stressLevel.color }]} />
                                    <Text style={styles.statusText}>{stressLevel.text} Stress</Text>
                                </View>

                                <Text style={styles.heroLabel}>Breathe and relax</Text>
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Stats Grid */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="analytics-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{avgStress}%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="arrow-up-outline" size={18} color={colors.warning} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{peakStress}%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peak</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="time-outline" size={18} color={colors.success} />
                            <Text style={[styles.statValue, { color: colors.text }]}>2pm</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peak Time</Text>
                        </View>
                    </Animated.View>

                    {/* Stress Chart */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)}>
                        <BlurView intensity={isDark ? 20 : 50} style={[styles.chartCard, { borderColor: colors.border }]}>
                            <Text style={[styles.chartTitle, { color: colors.text }]}>Today's Stress Pattern</Text>
                            <View style={styles.chartContainer}>
                                <Svg width="100%" height={100} viewBox="0 0 300 80" preserveAspectRatio="none">
                                    <Defs>
                                        <SvgLinearGradient id="stressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.4" />
                                            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    {/* Stress zones */}
                                    <Path
                                        d="M0,0 L300,0 L300,25 L0,25 Z"
                                        fill={isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'}
                                    />
                                    <Path
                                        d="M0,25 L300,25 L300,50 L0,50 Z"
                                        fill={isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.08)'}
                                    />
                                    {/* Stress line */}
                                    <Path
                                        d="M0,60 L30,55 L60,50 L90,35 L120,30 L150,25 L180,40 L210,50 L240,55 L270,60 L300,58"
                                        fill="none"
                                        stroke={colors.accent}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    {/* Area fill */}
                                    <Path
                                        d="M0,60 L30,55 L60,50 L90,35 L120,30 L150,25 L180,40 L210,50 L240,55 L270,60 L300,58 L300,80 L0,80 Z"
                                        fill="url(#stressGrad)"
                                    />
                                </Svg>
                            </View>
                            <View style={styles.chartLabels}>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>6 AM</Text>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>12 PM</Text>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>6 PM</Text>
                                <Text style={[styles.chartLabel, { color: colors.accent }]}>Now</Text>
                            </View>
                        </BlurView>
                    </Animated.View>

                    {/* Relaxation Exercises */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RELAXATION EXERCISES</Text>

                        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={['rgba(147, 51, 234, 0.1)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.exerciseIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                                <Text style={styles.exerciseEmoji}>🧘‍♀️</Text>
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseTitle, { color: colors.text }]}>5-Min Meditation</Text>
                                <Text style={[styles.exerciseDesc, { color: colors.textSecondary }]}>
                                    Guided mindfulness • Quick reset
                                </Text>
                            </View>
                            <Ionicons name="play-circle" size={32} color={colors.accent} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={['rgba(236, 72, 153, 0.1)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.exerciseIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                                <Text style={styles.exerciseEmoji}>🌊</Text>
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseTitle, { color: colors.text }]}>Body Scan</Text>
                                <Text style={[styles.exerciseDesc, { color: colors.textSecondary }]}>
                                    Progressive relaxation • Release tension
                                </Text>
                            </View>
                            <Ionicons name="play-circle" size={32} color="#EC4899" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={['rgba(34, 197, 94, 0.1)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.exerciseIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                                <Text style={styles.exerciseEmoji}>🌿</Text>
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseTitle, { color: colors.text }]}>Nature Sounds</Text>
                                <Text style={[styles.exerciseDesc, { color: colors.textSecondary }]}>
                                    Forest ambiance • Background calm
                                </Text>
                            </View>
                            <Ionicons name="play-circle" size={32} color="#22C55E" />
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    zenBg: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    petal: { position: 'absolute', top: 0 },
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
    visualizationContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripplesContainer: {
        position: 'absolute',
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
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
    stressEmoji: {
        fontSize: 32,
        marginBottom: -8,
    },
    stressValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    stressUnit: {
        fontSize: 18,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginTop: -8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heroLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 12,
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
        fontSize: 22,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    chartCard: {
        borderRadius: 20,
        padding: SPACING.lg,
        borderWidth: 1,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    chartContainer: {
        marginVertical: SPACING.sm,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    chartLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: SPACING.sm,
        gap: SPACING.md,
        overflow: 'hidden',
    },
    exerciseIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseEmoji: {
        fontSize: 24,
    },
    exerciseContent: {
        flex: 1,
    },
    exerciseTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    exerciseDesc: {
        fontSize: 12,
        marginTop: 2,
    },
});
