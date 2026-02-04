/**
 * Edit Weight Screen - Premium slider with auto-sync
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING, COLORS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';

export default function EditWeightScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const healthMetrics = useUserStore(s => s.healthMetrics);
    const updateHealthMetrics = useUserStore(s => s.updateHealthMetrics);
    const preferences = useUserStore(s => s.preferences);
    const isMetric = preferences?.measurementSystem !== 'imperial';

    // Initialize with stored value or default
    const initialWeight = healthMetrics?.weight || 75;
    const [weight, setWeight] = useState(initialWeight);

    // Animations
    const scale = useSharedValue(1);
    const pulseGlow = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: pulseGlow.value,
        transform: [{ scale: 1 + pulseGlow.value * 0.1 }],
    }));

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: COLORS.gamification.vitaminOrange,
        accentGlow: isDark ? 'rgba(255, 92, 0, 0.3)' : 'rgba(255, 92, 0, 0.15)',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        sliderTrack: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    };

    // Handle weight change with animation
    const handleWeightChange = useCallback((value: number) => {
        const roundedValue = Math.round(value * 10) / 10;
        setWeight(roundedValue);

        // Pulse animation
        scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
        pulseGlow.value = withSpring(0.8, { damping: 10 });

        setTimeout(() => {
            scale.value = withSpring(1, { damping: 15, stiffness: 300 });
            pulseGlow.value = withSpring(0, { damping: 10 });
        }, 150);
    }, []);

    // Auto-sync on sliding complete
    const handleSlidingComplete = useCallback((value: number) => {
        const roundedValue = Math.round(value * 10) / 10;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateHealthMetrics({ weight: isMetric ? roundedValue : roundedValue / 2.205 });
    }, [updateHealthMetrics, isMetric]);

    // Convert to lbs for display if imperial
    const displayWeight = isMetric ? weight : Math.round(weight * 2.205);
    const unit = isMetric ? 'kg' : 'lbs';
    const minWeight = isMetric ? 30 : 66;
    const maxWeight = isMetric ? 200 : 440;

    // Get BMI category indicator
    const getBMIIndicator = (weightKg: number) => {
        const heightM = (healthMetrics?.height || 175) / 100;
        const bmi = weightKg / (heightM * heightM);
        if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6' };
        if (bmi < 25) return { label: 'Healthy', color: '#10B981' };
        if (bmi < 30) return { label: 'Overweight', color: '#F59E0B' };
        return { label: 'Obese', color: '#EF4444' };
    };

    const bmiIndicator = getBMIIndicator(weight);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.headerButton, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Weight</Text>
                    <View style={styles.headerButton} />
                </View>

                <View style={styles.content}>
                    {/* Weight Display Card */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.displayWrapper}>
                        <Animated.View style={[styles.glowEffect, { backgroundColor: colors.accentGlow }, glowStyle]} />
                        <View style={[styles.displayCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENT WEIGHT</Text>
                            <Animated.View style={animatedStyle}>
                                <View style={styles.weightRow}>
                                    <Text style={[styles.weightValue, { color: colors.text }]}>
                                        {displayWeight.toFixed(1)}
                                    </Text>
                                    <Text style={[styles.weightUnit, { color: colors.accent }]}>{unit}</Text>
                                </View>
                            </Animated.View>
                            <View style={[styles.bmiChip, { backgroundColor: `${bmiIndicator.color}15` }]}>
                                <View style={[styles.bmiDot, { backgroundColor: bmiIndicator.color }]} />
                                <Text style={[styles.bmiText, { color: bmiIndicator.color }]}>
                                    {bmiIndicator.label} Range
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Premium Slider Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.sliderCard, { backgroundColor: colors.card }]}>
                        <View style={styles.sliderHeader}>
                            <Text style={[styles.sliderTitle, { color: colors.text }]}>Adjust Weight</Text>
                            <View style={[styles.liveBadge, { backgroundColor: `${colors.accent}15` }]}>
                                <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
                                <Text style={[styles.liveText, { color: colors.accent }]}>LIVE SYNC</Text>
                            </View>
                        </View>
                        <View style={styles.sliderLabels}>
                            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{minWeight} {unit}</Text>
                            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{maxWeight} {unit}</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={minWeight}
                            maximumValue={maxWeight}
                            step={0.1}
                            value={displayWeight}
                            onValueChange={(val) => handleWeightChange(isMetric ? val : val / 2.205)}
                            onSlidingComplete={(val) => handleSlidingComplete(isMetric ? val : val / 2.205)}
                            minimumTrackTintColor={colors.accent}
                            maximumTrackTintColor={colors.sliderTrack}
                            thumbTintColor={colors.accent}
                        />
                    </Animated.View>

                    {/* Quick Adjust Buttons */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickAdjustRow}>
                        {[-1, -0.5, 0.5, 1].map((delta) => (
                            <TouchableOpacity
                                key={delta}
                                style={[styles.quickButton, { backgroundColor: colors.card }]}
                                onPress={() => {
                                    const newWeight = Math.max(minWeight, Math.min(maxWeight, displayWeight + delta));
                                    handleWeightChange(isMetric ? newWeight : newWeight / 2.205);
                                    handleSlidingComplete(isMetric ? newWeight : newWeight / 2.205);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Text style={[styles.quickButtonText, { color: delta > 0 ? '#10B981' : '#EF4444' }]}>
                                    {delta > 0 ? '+' : ''}{delta}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>

                    {/* Info Card */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[styles.infoCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.infoIcon, { backgroundColor: `${colors.accent}15` }]}>
                            <Ionicons name="sync-outline" size={20} color={colors.accent} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoTitle, { color: colors.text }]}>Auto-Sync Enabled</Text>
                            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                Changes sync instantly with your macro calculations
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    displayWrapper: {
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    glowEffect: {
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        borderRadius: 44,
    },
    displayCard: {
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    weightRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    weightValue: {
        fontSize: 72,
        fontWeight: '800',
        letterSpacing: -2,
    },
    weightUnit: {
        fontSize: 28,
        fontWeight: '700',
    },
    bmiChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bmiDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bmiText: {
        fontSize: 13,
        fontWeight: '600',
    },
    sliderCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: SPACING.lg,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sliderTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sliderLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    slider: {
        width: '100%',
        height: 44,
    },
    quickAdjustRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: SPACING.lg,
    },
    quickButton: {
        width: 64,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 20,
        padding: 18,
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
});
