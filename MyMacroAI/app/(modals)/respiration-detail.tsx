/**
 * Respiration Detail Page - "Ocean Breath" Theme
 * Premium breathing rate analysis with calming wave animations
 * Unique: Flowing ocean waves, breathing circle, calming cyan palette
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
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useTabBarStore } from '@/src/store/tabBarStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animated Wave Component
const FloatingWave = ({ delay = 0, color = '#06B6D4' }: { delay?: number; color?: string }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 2000 + delay }),
                withTiming(0.3, { duration: 2000 + delay })
            ),
            -1,
            true
        );
    }, []);

    const waveStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.wave, waveStyle]}>
            <Svg width={SCREEN_WIDTH} height={60} viewBox="0 0 400 60">
                <Path
                    d="M0,30 Q50,10 100,30 T200,30 T300,30 T400,30 L400,60 L0,60 Z"
                    fill={color}
                />
            </Svg>
        </Animated.View>
    );
};

export default function RespirationDetailScreen() {
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

    // Breathing animation
    const breatheProgress = useSharedValue(0);
    const waveOffset = useSharedValue(0);

    useEffect(() => {
        breatheProgress.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
        waveOffset.value = withRepeat(
            withTiming(1, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const breatheCircleStyle = useAnimatedStyle(() => {
        const scale = interpolate(breatheProgress.value, [0, 1], [0.85, 1.15]);
        return { transform: [{ scale }] };
    });

    const glowStyle = useAnimatedStyle(() => {
        const opacity = interpolate(breatheProgress.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
        const scale = interpolate(breatheProgress.value, [0, 1], [0.9, 1.2]);
        return { opacity, transform: [{ scale }] };
    });

    const breatheTextStyle = useAnimatedStyle(() => {
        const opacity = breatheProgress.value > 0.5 ? 1 : 0.6;
        return { opacity };
    });

    const colors = {
        bg: isDark ? '#0A1628' : '#E0F7FA',
        card: isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.9)',
        text: isDark ? '#FFFFFF' : '#0D3B4F',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(13, 59, 79, 0.6)',
        accent: '#06B6D4',
        accentLight: '#22D3EE',
        accentDark: '#0891B2',
        surface: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        border: isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.3)',
    };

    // Mock data
    const currentRate = 14;
    const avgRate = 13.5;
    const minRate = 12;
    const maxRate = 16;
    const statusText = currentRate >= 12 && currentRate <= 16 ? 'Optimal' : 'Review';

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Ocean Background */}
            <View style={styles.oceanBg}>
                <LinearGradient
                    colors={isDark
                        ? ['#0A1628', '#0C2942', '#0E3A5C']
                        : ['#E0F7FA', '#B2EBF2', '#80DEEA']}
                    style={StyleSheet.absoluteFill}
                />
                <FloatingWave delay={0} color={isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.2)'} />
                <FloatingWave delay={500} color={isDark ? 'rgba(34, 211, 238, 0.1)' : 'rgba(34, 211, 238, 0.15)'} />
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
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Respiration</Text>
                        <View style={styles.headerSpacer} />
                    </Animated.View>

                    {/* AI Insight Card - TOP */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <BlurView intensity={isDark ? 30 : 60} style={[styles.aiCard, { borderColor: colors.border }]}>
                            <View style={styles.aiHeader}>
                                <MyMacroAIAvatar size="small" accentColor={colors.accent} />
                                <Text style={[styles.aiLabel, { color: colors.accent }]}>MYMACRO AI BREATH COACH</Text>
                            </View>
                            <Text style={[styles.aiText, { color: colors.text }]}>
                                Your breathing is calm and steady at {currentRate} breaths/min. This rhythm supports
                                focus and relaxation. Try the 4-7-8 technique tonight for deeper sleep.
                            </Text>
                        </BlurView>
                    </Animated.View>

                    {/* Hero: Breathing Visualization */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={isDark
                                    ? ['#0891B2', '#06B6D4', '#22D3EE']
                                    : ['#06B6D4', '#22D3EE', '#67E8F9']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                {/* Breathing Circle */}
                                <Animated.View style={[styles.glowRing, glowStyle]}>
                                    <View style={styles.glowRingInner} />
                                </Animated.View>

                                <Animated.View style={[styles.breatheCircle, breatheCircleStyle]}>
                                    <View style={styles.breatheInner}>
                                        <Text style={styles.rateValue}>{currentRate}</Text>
                                        <Text style={styles.rateLabel}>breaths/min</Text>
                                    </View>
                                </Animated.View>

                                <View style={styles.statusBadge}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>{statusText}</Text>
                                </View>

                                {/* Wave decoration */}
                                <View style={styles.heroWaveContainer}>
                                    <Svg width="100%" height={40} viewBox="0 0 400 40" preserveAspectRatio="none">
                                        <Path
                                            d="M0,20 Q50,5 100,20 T200,20 T300,20 T400,20 L400,40 L0,40 Z"
                                            fill="rgba(255,255,255,0.15)"
                                        />
                                    </Svg>
                                </View>
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Breathing Guide Prompt */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <View style={styles.guideRow}>
                            <View style={[styles.guideDot, { backgroundColor: colors.accent }]} />
                            <Animated.Text style={[styles.guideText, breatheTextStyle, { color: colors.textSecondary }]}>
                                Breathe with the circle
                            </Animated.Text>
                        </View>
                    </Animated.View>

                    {/* Stats Grid */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="analytics-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{avgRate}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="trending-down-outline" size={18} color="#22C55E" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{minRate}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lowest</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="trending-up-outline" size={18} color="#F97316" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{maxRate}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest</Text>
                        </View>
                    </Animated.View>

                    {/* Today's Pattern Chart */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <BlurView intensity={isDark ? 20 : 50} style={[styles.chartCard, { borderColor: colors.border }]}>
                            <Text style={[styles.chartTitle, { color: colors.text }]}>Today's Breathing Pattern</Text>
                            <View style={styles.chartContainer}>
                                <Svg width="100%" height={80} viewBox="0 0 300 60" preserveAspectRatio="none">
                                    <Defs>
                                        <SvgLinearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.4" />
                                            <Stop offset="50%" stopColor={colors.accentLight} stopOpacity="1" />
                                            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.4" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    <Path
                                        d="M0,30 Q20,15 40,30 T80,30 T120,30 T160,30 T200,30 T240,30 T280,30 T300,30"
                                        fill="none"
                                        stroke="url(#breathGrad)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    {/* Trend baseline */}
                                    <Path
                                        d="M0,40 L300,40"
                                        fill="none"
                                        stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                                        strokeWidth="1"
                                        strokeDasharray="4,4"
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

                    {/* Breathing Exercises */}
                    <Animated.View entering={FadeInDown.delay(450).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BREATHING EXERCISES</Text>

                        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={['rgba(6, 182, 212, 0.1)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.exerciseIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                                <Text style={styles.exerciseEmoji}>🧘</Text>
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseTitle, { color: colors.text }]}>Box Breathing</Text>
                                <Text style={[styles.exerciseDesc, { color: colors.textSecondary }]}>
                                    4-4-4-4 pattern • Calm focus
                                </Text>
                            </View>
                            <Ionicons name="play-circle" size={32} color={colors.accent} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={['rgba(147, 51, 234, 0.1)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.exerciseIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                                <Text style={styles.exerciseEmoji}>🌙</Text>
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseTitle, { color: colors.text }]}>4-7-8 Sleep Prep</Text>
                                <Text style={[styles.exerciseDesc, { color: colors.textSecondary }]}>
                                    Deep relaxation • Better sleep
                                </Text>
                            </View>
                            <Ionicons name="play-circle" size={32} color="#9333EA" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={['rgba(34, 197, 94, 0.1)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={[styles.exerciseIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                                <Text style={styles.exerciseEmoji}>⚡</Text>
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseTitle, { color: colors.text }]}>Energizing Breath</Text>
                                <Text style={[styles.exerciseDesc, { color: colors.textSecondary }]}>
                                    Quick 2-2-2 • Boost alertness
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
    oceanBg: { ...StyleSheet.absoluteFillObject },
    wave: { position: 'absolute', bottom: 0, left: 0, right: 0 },
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
        marginBottom: SPACING.md,
    },
    heroGradient: {
        paddingVertical: 50,
        alignItems: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        top: 30,
    },
    glowRingInner: {
        flex: 1,
        margin: 10,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    breatheCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    breatheInner: {
        alignItems: 'center',
    },
    rateValue: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    rateLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginTop: -4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heroWaveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    guideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: SPACING.lg,
    },
    guideDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    guideText: {
        fontSize: 14,
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
