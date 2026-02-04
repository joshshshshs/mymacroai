/**
 * FreezeButton - Streak freeze pill button
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
    freezesAvailable: number;
    needsRestore: boolean;
    onPress: () => void;
}

export const FreezeButton: React.FC<Props> = ({ freezesAvailable, needsRestore, onPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { medium } = useHaptics();

    const pulseScale = useSharedValue(1);

    React.useEffect(() => {
        if (needsRestore) {
            pulseScale.value = withRepeat(
                withTiming(1.08, { duration: 800 }),
                -1,
                true
            );
        }
    }, [needsRestore]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: needsRestore ? pulseScale.value : 1 }],
    }));

    const colors = {
        bg: isDark ? 'rgba(0,191,255,0.15)' : 'rgba(0,191,255,0.1)',
        text: '#00BFFF',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    };

    const handlePress = () => {
        medium();
        onPress();
    };

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.bg }]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Ionicons name="snow" size={16} color={colors.text} />
                <Text style={[styles.text, { color: colors.text }]}>
                    {needsRestore ? 'Restore Streak' : `${freezesAvailable} Freezes`}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
});
