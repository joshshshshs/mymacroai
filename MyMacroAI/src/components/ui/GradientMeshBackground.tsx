/**
 * GradientMeshBackground - Reusable animated gradient mesh background
 * 
 * Usage:
 * <GradientMeshBackground variant="primary" />
 * 
 * Variants provide unique color combinations for different pages:
 * - primary: Orange accent (default)
 * - nutrition: Green/teal
 * - health: Blue/purple
 * - social: Orange/pink
 * - ai: Purple/cyan
 * - profile: Blue/indigo
 * - community: Pink/purple
 * - settings: Gray/blue
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// VARIANT DEFINITIONS
// ============================================================================

export type MeshVariant =
    | 'primary'      // Orange - Dashboard, default
    | 'nutrition'    // Green/Teal - Nutrition pages
    | 'health'       // Blue/Purple - Health detail pages
    | 'social'       // Orange/Pink - Squad, social pages
    | 'ai'           // Purple/Cyan - AI Coach, AI pages
    | 'profile'      // Blue/Indigo - Profile, settings
    | 'community'    // Pink/Purple - Community
    | 'neutral'      // Subtle gray - Modals, forms
    | 'success'      // Green - Achievements
    | 'warm';        // Warm orange/yellow - Streak, goals

interface OrbConfig {
    light: { color1: string; color2: string };
    dark: { color1: string; color2: string };
}

const VARIANT_COLORS: Record<MeshVariant, OrbConfig> = {
    primary: {
        light: { color1: 'rgba(255, 92, 0, 0.12)', color2: 'rgba(124, 58, 237, 0.08)' },
        dark: { color1: 'rgba(255, 92, 0, 0.25)', color2: 'rgba(124, 58, 237, 0.18)' },
    },
    nutrition: {
        light: { color1: 'rgba(16, 185, 129, 0.12)', color2: 'rgba(6, 182, 212, 0.08)' },
        dark: { color1: 'rgba(16, 185, 129, 0.25)', color2: 'rgba(6, 182, 212, 0.18)' },
    },
    health: {
        light: { color1: 'rgba(59, 130, 246, 0.12)', color2: 'rgba(139, 92, 246, 0.08)' },
        dark: { color1: 'rgba(59, 130, 246, 0.25)', color2: 'rgba(139, 92, 246, 0.18)' },
    },
    social: {
        light: { color1: 'rgba(255, 92, 0, 0.12)', color2: 'rgba(236, 72, 153, 0.08)' },
        dark: { color1: 'rgba(255, 92, 0, 0.25)', color2: 'rgba(236, 72, 153, 0.18)' },
    },
    ai: {
        light: { color1: 'rgba(139, 92, 246, 0.12)', color2: 'rgba(6, 182, 212, 0.08)' },
        dark: { color1: 'rgba(139, 92, 246, 0.25)', color2: 'rgba(6, 182, 212, 0.18)' },
    },
    profile: {
        light: { color1: 'rgba(59, 130, 246, 0.1)', color2: 'rgba(99, 102, 241, 0.08)' },
        dark: { color1: 'rgba(59, 130, 246, 0.22)', color2: 'rgba(99, 102, 241, 0.15)' },
    },
    community: {
        light: { color1: 'rgba(236, 72, 153, 0.1)', color2: 'rgba(168, 85, 247, 0.08)' },
        dark: { color1: 'rgba(236, 72, 153, 0.22)', color2: 'rgba(168, 85, 247, 0.18)' },
    },
    neutral: {
        light: { color1: 'rgba(100, 116, 139, 0.08)', color2: 'rgba(71, 85, 105, 0.05)' },
        dark: { color1: 'rgba(100, 116, 139, 0.15)', color2: 'rgba(71, 85, 105, 0.12)' },
    },
    success: {
        light: { color1: 'rgba(34, 197, 94, 0.12)', color2: 'rgba(16, 185, 129, 0.08)' },
        dark: { color1: 'rgba(34, 197, 94, 0.25)', color2: 'rgba(16, 185, 129, 0.18)' },
    },
    warm: {
        light: { color1: 'rgba(245, 158, 11, 0.12)', color2: 'rgba(255, 92, 0, 0.08)' },
        dark: { color1: 'rgba(245, 158, 11, 0.25)', color2: 'rgba(255, 92, 0, 0.18)' },
    },
};

// ============================================================================
// BACKGROUND GRADIENT COLORS
// ============================================================================

export const getBackgroundGradient = (isDark: boolean): [string, string, string] => {
    return isDark
        ? ['#0A0A0C', '#141418', '#0A0A0C']
        : ['#F8F9FA', '#FFFFFF', '#F8F9FA'];
};

// ============================================================================
// COMPONENT
// ============================================================================

interface GradientMeshBackgroundProps {
    variant?: MeshVariant;
    intensity?: 'subtle' | 'normal' | 'strong';
    animated?: boolean;
}

export const GradientMeshBackground: React.FC<GradientMeshBackgroundProps> = ({
    variant = 'primary',
    intensity = 'normal',
    animated = true,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = VARIANT_COLORS[variant];
    const orbColors = isDark ? colors.dark : colors.light;

    // Intensity multipliers
    const opacityMultiplier = intensity === 'subtle' ? 0.6 : intensity === 'strong' ? 1.4 : 1;

    // Animation values
    const orb1Y = useSharedValue(0);
    const orb2X = useSharedValue(0);
    const orb1Rotation = useSharedValue(0);
    const orb2Rotation = useSharedValue(0);

    useEffect(() => {
        if (!animated) return;

        // Orb 1: Vertical floating + slight rotation
        orb1Y.value = withRepeat(
            withSequence(
                withTiming(-40, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
                withTiming(40, { duration: 7000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        orb1Rotation.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-5, { duration: 10000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Orb 2: Horizontal floating + rotation
        orb2X.value = withRepeat(
            withSequence(
                withTiming(25, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-25, { duration: 9000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        orb2Rotation.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
                withTiming(8, { duration: 12000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [animated]);

    const orb1Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: orb1Y.value },
            { rotate: `${orb1Rotation.value}deg` },
        ],
    }));

    const orb2Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: orb2X.value },
            { rotate: `${orb2Rotation.value}deg` },
        ],
    }));

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {/* Base Gradient */}
            <LinearGradient
                colors={getBackgroundGradient(isDark)}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Orb 1 - Top Left */}
            <Animated.View
                style={[
                    styles.orb,
                    styles.orb1,
                    {
                        backgroundColor: orbColors.color1,
                        opacity: 0.4 * opacityMultiplier,
                    },
                    animated && orb1Style,
                ]}
            />

            {/* Orb 2 - Bottom Right */}
            <Animated.View
                style={[
                    styles.orb,
                    styles.orb2,
                    {
                        backgroundColor: orbColors.color2,
                        opacity: 0.35 * opacityMultiplier,
                    },
                    animated && orb2Style,
                ]}
            />
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orb1: {
        width: SCREEN_WIDTH * 0.85,
        height: SCREEN_WIDTH * 0.85,
        top: -SCREEN_WIDTH * 0.3,
        left: -SCREEN_WIDTH * 0.25,
    },
    orb2: {
        width: SCREEN_WIDTH * 0.7,
        height: SCREEN_WIDTH * 0.7,
        bottom: SCREEN_HEIGHT * 0.15,
        right: -SCREEN_WIDTH * 0.25,
    },
});

export default GradientMeshBackground;
