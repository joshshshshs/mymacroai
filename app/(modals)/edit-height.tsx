/**
 * Edit Height Screen - Premium slider with auto-sync
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

export default function EditHeightScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const healthMetrics = useUserStore(s => s.healthMetrics);
    const updateHealthMetrics = useUserStore(s => s.updateHealthMetrics);
    const preferences = useUserStore(s => s.preferences);
    const isMetric = preferences?.measurementSystem !== 'imperial';

    // Initialize with stored value or default
    const initialHeight = healthMetrics?.height || 175;
    const [height, setHeight] = useState(initialHeight);

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

    // Handle height change with animation
    const handleHeightChange = useCallback((value: number) => {
        const roundedValue = Math.round(value);
        setHeight(roundedValue);

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
        const roundedValue = Math.round(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateHealthMetrics({ height: roundedValue });
    }, [updateHealthMetrics]);

    // Convert for display
    const cmToFeetInches = (cm: number) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return { feet, inches };
    };

    const displayHeight = isMetric ? height : cmToFeetInches(height);
    const minHeight = isMetric ? 120 : 48; // 4'0" in inches
    const maxHeight = isMetric ? 220 : 84; // 7'0" in inches

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
                    <Text style={[styles.title, { color: colors.text }]}>Height</Text>
                    <View style={styles.headerButton} />
                </View>

                <View style={styles.content}>
                    {/* Height Display Card */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.displayWrapper}>
                        <Animated.View style={[styles.glowEffect, { backgroundColor: colors.accentGlow }, glowStyle]} />
                        <View style={[styles.displayCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENT HEIGHT</Text>
                            <Animated.View style={animatedStyle}>
                                {isMetric ? (
                                    <View style={styles.heightRow}>
                                        <Text style={[styles.heightValue, { color: colors.text }]}>
                                            {height}
                                        </Text>
                                        <Text style={[styles.heightUnit, { color: colors.accent }]}>cm</Text>
                                    </View>
                                ) : (
                                    <View style={styles.heightRow}>
                                        <Text style={[styles.heightValue, { color: colors.text }]}>
                                            {(displayHeight as { feet: number; inches: number }).feet}
                                        </Text>
                                        <Text style={[styles.heightUnit, { color: colors.accent }]}>ft</Text>
                                        <Text style={[styles.heightValue, { color: colors.text, marginLeft: 8 }]}>
                                            {(displayHeight as { feet: number; inches: number }).inches}
                                        </Text>
                                        <Text style={[styles.heightUnit, { color: colors.accent }]}>in</Text>
                                    </View>
                                )}
                            </Animated.View>
                        </View>
                    </Animated.View>

                    {/* Premium Slider Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.sliderCard, { backgroundColor: colors.card }]}>
                        <View style={styles.sliderHeader}>
                            <Text style={[styles.sliderTitle, { color: colors.text }]}>Adjust Height</Text>
                            <View style={[styles.liveBadge, { backgroundColor: `${colors.accent}15` }]}>
                                <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
                                <Text style={[styles.liveText, { color: colors.accent }]}>LIVE SYNC</Text>
                            </View>
                        </View>
                        <View style={styles.sliderLabels}>
                            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
                                {isMetric ? '120 cm' : "4'0\""}
                            </Text>
                            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
                                {isMetric ? '220 cm' : "7'0\""}
                            </Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={minHeight}
                            maximumValue={maxHeight}
                            step={1}
                            value={isMetric ? height : height / 2.54}
                            onValueChange={(val) => handleHeightChange(isMetric ? val : val * 2.54)}
                            onSlidingComplete={(val) => handleSlidingComplete(isMetric ? val : val * 2.54)}
                            minimumTrackTintColor={colors.accent}
                            maximumTrackTintColor={colors.sliderTrack}
                            thumbTintColor={colors.accent}
                        />
                    </Animated.View>

                    {/* Quick Adjust Buttons */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickAdjustRow}>
                        {[-5, -1, 1, 5].map((delta) => (
                            <TouchableOpacity
                                key={delta}
                                style={[styles.quickButton, { backgroundColor: colors.card }]}
                                onPress={() => {
                                    const minCm = 120;
                                    const maxCm = 220;
                                    const newHeight = Math.max(minCm, Math.min(maxCm, height + delta));
                                    handleHeightChange(newHeight);
                                    handleSlidingComplete(newHeight);
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
                                Height affects your BMR and macro calculations
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
    heightRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    heightValue: {
        fontSize: 72,
        fontWeight: '800',
        letterSpacing: -2,
    },
    heightUnit: {
        fontSize: 28,
        fontWeight: '700',
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
