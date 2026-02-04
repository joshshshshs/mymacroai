/**
 * StatChip - Toggleable stat visibility chip for Flex Grid
 * Features: orange highlight when active, haptic feedback, animated press
 */

import React from 'react';
import { Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';
import { COLORS, SPACING, RADIUS, MOTION } from '../../design-system/tokens';

interface StatChipProps {
    icon: string;
    label: string;
    isActive: boolean;
    onToggle: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const StatChip: React.FC<StatChipProps> = ({
    icon,
    label,
    isActive,
    onToggle,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();

    const scale = useSharedValue(1);

    const colors = {
        activeBg: COLORS.gamification.vitaminOrange,
        inactiveBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        activeText: '#FFFFFF',
        inactiveText: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        border: isActive
            ? COLORS.gamification.vitaminOrange
            : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, MOTION.spring.snappy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, MOTION.spring.bouncy);
    };

    const handlePress = () => {
        light();
        onToggle();
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.chip,
                animatedStyle,
                {
                    backgroundColor: isActive ? colors.activeBg : colors.inactiveBg,
                    borderColor: colors.border,
                },
            ]}
        >
            <Text style={styles.icon}>{icon}</Text>
            <Text
                style={[
                    styles.label,
                    { color: isActive ? colors.activeText : colors.inactiveText }
                ]}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.pill,
        borderWidth: 1.5,
        gap: 6,
        marginRight: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    icon: {
        fontSize: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default StatChip;
