/**
 * BioStrip - Live Status Glass Pills
 *
 * State of the Art Features:
 * - Glassmorphism pills with BlurView
 * - Hydration: Blue glow + ripple animation on tap
 * - Fasting Timer: Purple gradient
 * - Active Burn: Orange pulsing
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';

// Glass & Light Color Palette
const COLORS = {
    hydrationBlue: '#00D2FF',
    hydrationBlueDark: '#0099CC',
    hydrationGlow: 'rgba(0, 210, 255, 0.3)',
    fastingPurple: '#A855F7',
    fastingPurpleDark: '#7C3AED',
    fastingGlow: 'rgba(168, 85, 247, 0.3)',
    burnOrange: '#FF5C00',
    burnOrangeDark: '#E55A00',
    burnGlow: 'rgba(255, 92, 0, 0.3)',
    proteinBlue: '#3B82F6',
    carbsGreen: '#22C55E',
    fatsYellow: '#EAB308',
};

interface Props {
    waterIntake: number;
    waterGoal: number;
    fastingHours: number;
    activeBurn: number;
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fats: { current: number; target: number };
    onWaterAdd?: () => void;
}

// Glass Pill Component with Ripple Effect
interface GlassPillProps {
    icon: string;
    label: string;
    value: string;
    gradientColors: [string, string];
    glowColor: string;
    onPress?: () => void;
    progress?: number;
    showAddButton?: boolean;
}

const GlassPill: React.FC<GlassPillProps> = ({
    icon,
    label,
    value,
    gradientColors,
    glowColor,
    onPress,
    progress,
    showAddButton = false,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const scale = useSharedValue(1);
    const rippleScale = useSharedValue(0);
    const rippleOpacity = useSharedValue(0);

    const handlePress = useCallback(() => {
        // Scale bounce
        scale.value = withSequence(
            withSpring(0.95, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );

        // Ripple effect
        rippleScale.value = 0;
        rippleOpacity.value = 0.5;
        rippleScale.value = withTiming(2, { duration: 400, easing: Easing.out(Easing.cubic) });
        rippleOpacity.value = withTiming(0, { duration: 400 });

        if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            runOnJS(onPress)();
        }
    }, [onPress]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const rippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rippleScale.value }],
        opacity: rippleOpacity.value,
    }));

    return (
        <Animated.View style={[styles.pillWrapper, containerStyle]}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                disabled={!onPress}
            >
                <BlurView
                    intensity={isDark ? 40 : 80}
                    tint="light"
                    style={styles.glassPill}
                >
                    {/* Ripple Effect */}
                    <Animated.View
                        style={[
                            styles.ripple,
                            { backgroundColor: glowColor },
                            rippleStyle,
                        ]}
                    />

                    {/* Progress Bar Background */}
                    {progress !== undefined && (
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                                styles.progressFill,
                                { width: `${Math.min(progress * 100, 100)}%` },
                            ]}
                        />
                    )}

                    {/* Content */}
                    <View style={styles.pillContent}>
                        <View style={[styles.iconCircle, { backgroundColor: `${gradientColors[0]}20` }]}>
                            <Text style={styles.pillIcon}>{icon}</Text>
                        </View>
                        <View style={styles.pillText}>
                            <Text style={[styles.pillValue, { color: gradientColors[0] }]}>{value}</Text>
                            <Text style={[styles.pillLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>{label}</Text>
                        </View>
                        {showAddButton && (
                            <View style={[styles.addButton, { backgroundColor: `${gradientColors[0]}30` }]}>
                                <Ionicons name="add" size={18} color={gradientColors[0]} />
                            </View>
                        )}
                    </View>
                </BlurView>
            </TouchableOpacity>

            {/* Glow Shadow */}
            <View style={[styles.glowShadow, { shadowColor: glowColor }]} />
        </Animated.View>
    );
};

// Macro Progress Pill
const MacroProgressPill: React.FC<{
    label: string;
    current: number;
    target: number;
    color: string;
}> = ({ label, current, target, color }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const progress = target > 0 ? Math.min(current / target, 1) : 0;

    return (
        <View style={styles.macroPillContainer}>
            <BlurView
                intensity={isDark ? 30 : 60}
                tint="light"
                style={[styles.macroPill, { borderColor: `${color}40` }]}
            >
                {/* Progress Fill */}
                <View
                    style={[
                        styles.macroProgress,
                        { width: `${progress * 100}%`, backgroundColor: color },
                    ]}
                />

                {/* Content */}
                <View style={styles.macroContent}>
                    <Text style={[styles.macroLabel, { color }]}>{label}</Text>
                    <Text style={[styles.macroValue, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                        {current}
                        <Text style={[styles.macroUnit, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>/{target}g</Text>
                    </Text>
                </View>
            </BlurView>
        </View>
    );
};

export const BioStrip: React.FC<Props> = ({
    waterIntake,
    waterGoal,
    fastingHours,
    activeBurn,
    protein,
    carbs,
    fats,
    onWaterAdd,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const formatWater = (ml: number) => {
        return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
    };

    const formatFasting = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    return (
        <View style={styles.container}>
            {/* Section Label */}
            <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93' }]}>
                LIVE STATUS
            </Text>

            {/* Main Bio Pills - Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={148}
            >
                {/* Hydration Pill */}
                <GlassPill
                    icon="💧"
                    label="Hydration"
                    value={formatWater(waterIntake)}
                    gradientColors={[COLORS.hydrationBlue, COLORS.hydrationBlueDark]}
                    glowColor={COLORS.hydrationGlow}
                    progress={waterIntake / waterGoal}
                    onPress={onWaterAdd}
                    showAddButton
                />

                {/* Fasting Timer Pill */}
                <GlassPill
                    icon="⏳"
                    label="Fasted"
                    value={formatFasting(fastingHours)}
                    gradientColors={[COLORS.fastingPurple, COLORS.fastingPurpleDark]}
                    glowColor={COLORS.fastingGlow}
                />

                {/* Active Burn Pill */}
                <GlassPill
                    icon="🔥"
                    label="Active"
                    value={`${activeBurn}`}
                    gradientColors={[COLORS.burnOrange, COLORS.burnOrangeDark]}
                    glowColor={COLORS.burnGlow}
                />
            </ScrollView>

            {/* Macro Progress Pills Row */}
            <View style={styles.macroRow}>
                <MacroProgressPill
                    label="Protein"
                    current={protein.current}
                    target={protein.target}
                    color={COLORS.proteinBlue}
                />
                <MacroProgressPill
                    label="Carbs"
                    current={carbs.current}
                    target={carbs.target}
                    color={COLORS.carbsGreen}
                />
                <MacroProgressPill
                    label="Fats"
                    current={fats.current}
                    target={fats.target}
                    color={COLORS.fatsYellow}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.md,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xl,
    },
    scrollContent: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md,
    },
    pillWrapper: {
        position: 'relative',
    },
    glassPill: {
        minWidth: 140,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS['2xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    ripple: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 50,
        height: 50,
        borderRadius: 25,
        marginTop: -25,
        marginLeft: -25,
    },
    progressFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        opacity: 0.2,
    },
    pillContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillIcon: {
        fontSize: 18,
    },
    pillText: {
        flex: 1,
    },
    pillValue: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    pillLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 1,
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowShadow: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        bottom: -5,
        borderRadius: RADIUS['2xl'],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        zIndex: -1,
    },
    macroRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    macroPillContainer: {
        flex: 1,
    },
    macroPill: {
        height: 52,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    macroProgress: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        opacity: 0.2,
    },
    macroContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
    },
    macroLabel: {
        fontSize: 12,
        fontWeight: '800',
    },
    macroValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    macroUnit: {
        fontSize: 10,
        fontWeight: '500',
    },
});

export default BioStrip;
