/**
 * CoachMicButton - Pulsing AI button that opens Coach modal
 * Primary orange color with glow effect
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import { useHaptics } from '@/hooks/useHaptics';

export const CoachMicButton: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { medium } = useHaptics();

    const primaryColor = '#E05D3D';

    // Pulsing animation
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    React.useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        pulseOpacity.value = withRepeat(
            withTiming(0.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const handlePress = () => {
        medium();
        router.push('/(modals)/scan' as any);
    };

    return (
        <View style={styles.container}>
            {/* Outer pulse ring */}
            <Animated.View
                style={[
                    styles.pulseOuter,
                    pulseAnimatedStyle,
                    { backgroundColor: primaryColor },
                ]}
            />

            {/* Middle glow ring */}
            <View style={[styles.pulseMiddle, { backgroundColor: `${primaryColor}30` }]} />

            {/* Main button */}
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={handlePress}
            >
                <Ionicons name="flash" size={26} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseOuter: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    pulseMiddle: {
        position: 'absolute',
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E05D3D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
});
