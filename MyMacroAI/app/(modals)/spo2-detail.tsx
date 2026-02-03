/**
 * SPO2 Detail Page - "Oxygen Flow" Theme
 * Blood oxygen level analysis with pulsing oxygen bubbles
 * Unique: Rising bubble animation, blue gradient, oxygen saturation visualization
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

// Floating Bubble Component
const FloatingBubble = ({
    delay = 0,
    size = 20,
    startX = 50,
    color = 'rgba(59, 130, 246, 0.5)'
}: {
    delay?: number;
    size?: number;
    startX?: number;
    color?: string;
}) => {
    const translateY = useSharedValue(200);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-100, { duration: 4000 + Math.random() * 2000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withTiming(0.8, { duration: 2000 }),
                -1,
                true
            )
        );
        scale.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: 2000 }),
                -1,
                true
            )
        );
    }, []);

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    left: startX,
                },
                bubbleStyle,
            ]}
        />
    );
};

// Pulsing Ring Component
const PulsingRing = ({ delay = 0 }: { delay?: number }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withTiming(0, { duration: 2000 }),
                -1,
                false
            )
        );
    }, []);

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.pulsingRing, ringStyle]} />
    );
};

export default function SPO2DetailScreen() {
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

    const colors = {
        bg: isDark ? '#0F172A' : '#EFF6FF',
        card: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.9)',
        text: isDark ? '#FFFFFF' : '#1E3A5F',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(30, 58, 95, 0.6)',
        accent: '#3B82F6',
        accentLight: '#60A5FA',
        success: '#22C55E',
        warning: '#F97316',
        surface: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        border: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)',
    };

    // Mock data
    const currentSPO2 = 98;
    const avgSPO2 = 97;
    const minSPO2 = 95;
    const maxSPO2 = 99;

    const getStatus = (value: number) => {
        if (value >= 95) return { text: 'Optimal', color: colors.success };
        if (value >= 90) return { text: 'Normal', color: colors.warning };
        return { text: 'Low', color: '#EF4444' };
    };

    const status = getStatus(currentSPO2);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background with bubbles */}
            <View style={styles.bubbleBg}>
                <LinearGradient
                    colors={isDark
                        ? ['#0F172A', '#1E3A5F', '#1E40AF']
                        : ['#EFF6FF', '#DBEAFE', '#BFDBFE']}
                    style={StyleSheet.absoluteFill}
                />
                <FloatingBubble delay={0} size={30} startX={SCREEN_WIDTH * 0.1} color={isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'} />
                <FloatingBubble delay={500} size={20} startX={SCREEN_WIDTH * 0.3} color={isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(96, 165, 250, 0.25)'} />
                <FloatingBubble delay={1000} size={25} startX={SCREEN_WIDTH * 0.5} color={isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)'} />
                <FloatingBubble delay={1500} size={15} startX={SCREEN_WIDTH * 0.7} color={isDark ? 'rgba(147, 197, 253, 0.3)' : 'rgba(147, 197, 253, 0.3)'} />
                <FloatingBubble delay={2000} size={22} startX={SCREEN_WIDTH * 0.85} color={isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'} />
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
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Blood Oxygen</Text>
                        <View style={styles.headerSpacer} />
                    </Animated.View>

                    {/* AI Insight Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <BlurView intensity={isDark ? 30 : 60} style={[styles.aiCard, { borderColor: colors.border }]}>
                            <View style={styles.aiHeader}>
                                <MyMacroAIAvatar size="small" accentColor={colors.accent} />
                                <Text style={[styles.aiLabel, { color: colors.accent }]}>MYMACRO AI OXYGEN MONITOR</Text>
                            </View>
                            <Text style={[styles.aiText, { color: colors.text }]}>
                                Your blood oxygen is excellent at {currentSPO2}%. This indicates healthy oxygen transport
                                and good cardiovascular function. Keep active to maintain this level!
                            </Text>
                        </BlurView>
                    </Animated.View>

                    {/* Hero: SpO2 Visualization */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={isDark
                                    ? ['#1E40AF', '#3B82F6', '#60A5FA']
                                    : ['#3B82F6', '#60A5FA', '#93C5FD']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                {/* Visualization container - centers both rings and circle */}
                                <View style={styles.visualizationContainer}>
                                    {/* Pulsing rings */}
                                    <View style={styles.ringsContainer}>
                                        <PulsingRing delay={0} />
                                        <PulsingRing delay={700} />
                                        <PulsingRing delay={1400} />
                                    </View>

                                    {/* Main circle */}
                                    <View style={styles.mainCircle}>
                                        <View style={styles.circleInner}>
                                            <Ionicons name="water" size={28} color="rgba(255,255,255,0.6)" />
                                            <Text style={styles.spo2Value}>{currentSPO2}</Text>
                                            <Text style={styles.spo2Unit}>%</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[styles.statusBadge, { backgroundColor: `${status.color}30` }]}>
                                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                                    <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{status.text}</Text>
                                </View>

                                <Text style={styles.heroLabel}>Blood Oxygen Saturation</Text>
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Stats Grid */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="analytics-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{avgSPO2}%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="trending-down-outline" size={18} color={colors.warning} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{minSPO2}%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lowest</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="trending-up-outline" size={18} color={colors.success} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{maxSPO2}%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest</Text>
                        </View>
                    </Animated.View>

                    {/* Saturation Chart */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)}>
                        <BlurView intensity={isDark ? 20 : 50} style={[styles.chartCard, { borderColor: colors.border }]}>
                            <Text style={[styles.chartTitle, { color: colors.text }]}>Today's Oxygen Levels</Text>
                            <View style={styles.chartContainer}>
                                <Svg width="100%" height={100} viewBox="0 0 300 80" preserveAspectRatio="none">
                                    <Defs>
                                        <SvgLinearGradient id="spo2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.4" />
                                            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    {/* Optimal zone */}
                                    <Path
                                        d="M0,0 L300,0 L300,20 L0,20 Z"
                                        fill={isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)'}
                                    />
                                    {/* Line chart */}
                                    <Path
                                        d="M0,15 L30,12 L60,18 L90,10 L120,14 L150,8 L180,16 L210,12 L240,10 L270,15 L300,12"
                                        fill="none"
                                        stroke={colors.accent}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    {/* Area fill */}
                                    <Path
                                        d="M0,15 L30,12 L60,18 L90,10 L120,14 L150,8 L180,16 L210,12 L240,10 L270,15 L300,12 L300,80 L0,80 Z"
                                        fill="url(#spo2Grad)"
                                    />
                                </Svg>
                                {/* Reference line */}
                                <View style={[styles.refLine, { top: 20 }]}>
                                    <Text style={[styles.refLabel, { color: colors.success }]}>95% optimal</Text>
                                </View>
                            </View>
                            <View style={styles.chartLabels}>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>12 AM</Text>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>6 AM</Text>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>12 PM</Text>
                                <Text style={[styles.chartLabel, { color: colors.accent }]}>Now</Text>
                            </View>
                        </BlurView>
                    </Animated.View>

                    {/* Info Cards */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>UNDERSTANDING SpO2</Text>

                        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                                <Text style={styles.infoEmoji}>💚</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>95-100% Optimal</Text>
                                <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                                    Healthy oxygen levels for most adults
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                                <Text style={styles.infoEmoji}>🧡</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>90-94% Review</Text>
                                <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                                    May need attention, consult if persistent
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                                <Text style={styles.infoEmoji}>❤️</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>Below 90% Alert</Text>
                                <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                                    Seek medical attention if levels drop here
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bubbleBg: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    bubble: { position: 'absolute', bottom: 50 },
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
    ringsContainer: {
        position: 'absolute',
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulsingRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
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
    circleInner: {
        alignItems: 'center',
    },
    spo2Value: {
        fontSize: 64,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: -8,
    },
    spo2Unit: {
        fontSize: 24,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginTop: -10,
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
        position: 'relative',
    },
    refLine: {
        position: 'absolute',
        right: 0,
    },
    refLabel: {
        fontSize: 9,
        fontWeight: '600',
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
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: SPACING.sm,
        gap: SPACING.md,
    },
    infoIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoEmoji: {
        fontSize: 24,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoDesc: {
        fontSize: 12,
        marginTop: 2,
    },
});
