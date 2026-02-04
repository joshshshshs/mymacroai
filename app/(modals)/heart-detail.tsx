/**
 * Heart Detail Page - "Vital Pulse" Theme
 * Heart rate analysis with pulsing heartbeat animation
 * Unique: Heartbeat pulse rings, ECG line, red gradient, heart rate zones
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
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
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

// Pulsing Heart Ring Component
const HeartPulseRing = ({ delay = 0, size = 180 }: { delay?: number; size?: number }) => {
    const scale = useSharedValue(0.6);
    const opacity = useSharedValue(0.8);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
                    withTiming(1.3, { duration: 600, easing: Easing.out(Easing.ease) })
                ),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 400 }),
                    withTiming(0, { duration: 600 })
                ),
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
        <Animated.View
            style={[
                styles.pulseRing,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                ringStyle,
            ]}
        />
    );
};

// Animated ECG Line
const ECGLine = ({ color = '#EF4444' }: { color?: string }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    return (
        <Svg width="100%" height={60} viewBox="0 0 300 60" preserveAspectRatio="none">
            <Defs>
                <SvgLinearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <Stop offset="50%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.2" />
                </SvgLinearGradient>
            </Defs>
            <Path
                d="M0,30 L20,30 L30,30 L40,20 L50,40 L55,30 L60,5 L65,55 L70,25 L75,35 L80,30 L100,30 L120,30 L130,30 L140,20 L150,40 L155,30 L160,5 L165,55 L170,25 L175,35 L180,30 L200,30 L220,30 L230,30 L240,20 L250,40 L255,30 L260,5 L265,55 L270,25 L275,35 L280,30 L300,30"
                fill="none"
                stroke="url(#ecgGrad)"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </Svg>
    );
};

export default function HeartDetailScreen() {
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

    // Heartbeat animation
    const heartbeat = useSharedValue(1);

    useEffect(() => {
        heartbeat.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 150 }),
                withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 550 })
            ),
            -1,
            false
        );
    }, []);

    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartbeat.value }],
    }));

    const colors = {
        bg: isDark ? '#1A0A0A' : '#FEF2F2',
        card: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.9)',
        text: isDark ? '#FFFFFF' : '#7F1D1D',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(127, 29, 29, 0.6)',
        accent: '#EF4444',
        accentLight: '#F87171',
        success: '#22C55E',
        warning: '#F97316',
        surface: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        border: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)',
    };

    // Mock data
    const currentBPM = 72;
    const restingBPM = 62;
    const maxBPM = 145;
    const avgBPM = 78;

    const getZone = (bpm: number) => {
        if (bpm < 60) return { zone: 'Resting', color: '#3B82F6' };
        if (bpm < 100) return { zone: 'Normal', color: colors.success };
        if (bpm < 140) return { zone: 'Active', color: colors.warning };
        return { zone: 'Peak', color: colors.accent };
    };

    const zone = getZone(currentBPM);

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Red Gradient Background */}
            <View style={styles.heartBg}>
                <LinearGradient
                    colors={isDark
                        ? ['#1A0A0A', '#2D1515', '#3D1C1C']
                        : ['#FEF2F2', '#FEE2E2', '#FECACA']}
                    style={StyleSheet.absoluteFill}
                />
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
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Heart Rate</Text>
                        <View style={styles.headerSpacer} />
                    </Animated.View>

                    {/* AI Insight Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <BlurView intensity={isDark ? 30 : 60} style={[styles.aiCard, { borderColor: colors.border }]}>
                            <View style={styles.aiHeader}>
                                <MyMacroAIAvatar size="small" accentColor={colors.accent} />
                                <Text style={[styles.aiLabel, { color: colors.accent }]}>MYMACRO AI HEART COACH</Text>
                            </View>
                            <Text style={[styles.aiText, { color: colors.text }]}>
                                Your heart rate is {currentBPM} BPM, right in the healthy range. Your resting heart rate
                                of {restingBPM} BPM suggests good cardiovascular fitness. Keep up the active lifestyle!
                            </Text>
                        </BlurView>
                    </Animated.View>

                    {/* Hero: Heart Visualization */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <View style={styles.heroCard}>
                            <LinearGradient
                                colors={isDark
                                    ? ['#DC2626', '#EF4444', '#F87171']
                                    : ['#EF4444', '#F87171', '#FCA5A5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                {/* Visualization container - centers both */}
                                <View style={styles.visualizationContainer}>
                                    {/* Pulse rings */}
                                    <View style={styles.pulsesContainer}>
                                        <HeartPulseRing delay={0} size={180} />
                                        <HeartPulseRing delay={500} size={180} />
                                    </View>

                                    {/* Heart icon with pulse */}
                                    <Animated.View style={[styles.heartCircle, heartStyle]}>
                                        <Ionicons name="heart" size={40} color="rgba(255,255,255,0.8)" />
                                        <Text style={styles.bpmValue}>{currentBPM}</Text>
                                        <Text style={styles.bpmUnit}>BPM</Text>
                                    </Animated.View>
                                </View>

                                <View style={[styles.statusBadge, { backgroundColor: `${zone.color}40` }]}>
                                    <View style={[styles.statusDot, { backgroundColor: zone.color }]} />
                                    <Text style={styles.statusText}>{zone.zone}</Text>
                                </View>

                                {/* ECG Line at bottom */}
                                <View style={styles.ecgContainer}>
                                    <ECGLine color="rgba(255,255,255,0.6)" />
                                </View>
                            </LinearGradient>
                        </View>
                    </Animated.View>

                    {/* Stats Grid */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="bed-outline" size={18} color="#3B82F6" />
                            <Text style={[styles.statValue, { color: colors.text }]}>{restingBPM}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Resting</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="analytics-outline" size={18} color={colors.accent} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{avgBPM}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="flame-outline" size={18} color={colors.warning} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{maxBPM}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peak</Text>
                        </View>
                    </Animated.View>

                    {/* Heart Rate Chart */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)}>
                        <BlurView intensity={isDark ? 20 : 50} style={[styles.chartCard, { borderColor: colors.border }]}>
                            <Text style={[styles.chartTitle, { color: colors.text }]}>Today's Heart Rate</Text>
                            <View style={styles.chartContainer}>
                                <Svg width="100%" height={100} viewBox="0 0 300 80" preserveAspectRatio="none">
                                    <Defs>
                                        <SvgLinearGradient id="hrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.4" />
                                            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
                                        </SvgLinearGradient>
                                    </Defs>
                                    {/* Heart rate zones */}
                                    <Path
                                        d="M0,0 L300,0 L300,20 L0,20 Z"
                                        fill={isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'}
                                    />
                                    <Path
                                        d="M0,20 L300,20 L300,40 L0,40 Z"
                                        fill={isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.08)'}
                                    />
                                    {/* HR line */}
                                    <Path
                                        d="M0,55 L20,50 L40,55 L60,48 L80,40 L100,35 L120,25 L140,30 L160,45 L180,55 L200,52 L220,50 L240,48 L260,55 L280,50 L300,52"
                                        fill="none"
                                        stroke={colors.accent}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    {/* Area */}
                                    <Path
                                        d="M0,55 L20,50 L40,55 L60,48 L80,40 L100,35 L120,25 L140,30 L160,45 L180,55 L200,52 L220,50 L240,48 L260,55 L280,50 L300,52 L300,80 L0,80 Z"
                                        fill="url(#hrGrad)"
                                    />
                                </Svg>
                            </View>
                            <View style={styles.chartLabels}>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>12 AM</Text>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>6 AM</Text>
                                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>12 PM</Text>
                                <Text style={[styles.chartLabel, { color: colors.accent }]}>Now</Text>
                            </View>
                        </BlurView>
                    </Animated.View>

                    {/* Heart Rate Zones */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>HEART RATE ZONES</Text>

                        <View style={[styles.zoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.zoneIndicator, { backgroundColor: '#3B82F6' }]} />
                            <View style={styles.zoneInfo}>
                                <Text style={[styles.zoneName, { color: colors.text }]}>Resting</Text>
                                <Text style={[styles.zoneDesc, { color: colors.textSecondary }]}>Below 60 BPM</Text>
                            </View>
                            <Text style={[styles.zoneRange, { color: colors.textSecondary }]}>💤</Text>
                        </View>

                        <View style={[styles.zoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.zoneIndicator, { backgroundColor: colors.success }]} />
                            <View style={styles.zoneInfo}>
                                <Text style={[styles.zoneName, { color: colors.text }]}>Normal</Text>
                                <Text style={[styles.zoneDesc, { color: colors.textSecondary }]}>60-100 BPM</Text>
                            </View>
                            <Text style={[styles.zoneRange, { color: colors.textSecondary }]}>💚</Text>
                        </View>

                        <View style={[styles.zoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.zoneIndicator, { backgroundColor: colors.warning }]} />
                            <View style={styles.zoneInfo}>
                                <Text style={[styles.zoneName, { color: colors.text }]}>Active</Text>
                                <Text style={[styles.zoneDesc, { color: colors.textSecondary }]}>100-140 BPM</Text>
                            </View>
                            <Text style={[styles.zoneRange, { color: colors.textSecondary }]}>🔥</Text>
                        </View>

                        <View style={[styles.zoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.zoneIndicator, { backgroundColor: colors.accent }]} />
                            <View style={styles.zoneInfo}>
                                <Text style={[styles.zoneName, { color: colors.text }]}>Peak</Text>
                                <Text style={[styles.zoneDesc, { color: colors.textSecondary }]}>Above 140 BPM</Text>
                            </View>
                            <Text style={[styles.zoneRange, { color: colors.textSecondary }]}>❤️‍🔥</Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heartBg: { ...StyleSheet.absoluteFillObject },
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
    pulsesContainer: {
        position: 'absolute',
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    heartCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    bpmValue: {
        fontSize: 52,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: -8,
    },
    bpmUnit: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2,
        marginTop: -6,
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
    ecgContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
    zoneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: SPACING.sm,
        gap: SPACING.md,
    },
    zoneIndicator: {
        width: 6,
        height: 40,
        borderRadius: 3,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneName: {
        fontSize: 15,
        fontWeight: '600',
    },
    zoneDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    zoneRange: {
        fontSize: 20,
    },
});
