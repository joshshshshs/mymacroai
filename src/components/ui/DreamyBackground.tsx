import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export const DreamyBackground = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Animation values for subtle movement
    const bloom1Scale = useSharedValue(1.5);
    const bloom2Scale = useSharedValue(1.3);

    useEffect(() => {
        bloom1Scale.value = withRepeat(
            withTiming(1.7, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        bloom2Scale.value = withRepeat(
            withTiming(1.5, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const bloom1Style = useAnimatedStyle(() => ({
        transform: [{ scale: bloom1Scale.value }],
    }));

    const bloom2Style = useAnimatedStyle(() => ({
        transform: [{ scale: bloom2Scale.value }],
    }));

    if (!isDark) {
        // Light Mode: Morning Mist
        return (
            <View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: '#F2F5F3' }]}>
                {/* Lavender Tint */}
                <AnimatedGradient
                    colors={['rgba(167, 139, 250, 0.15)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, bloom1Style]}
                />
                {/* Sky Tint */}
                <AnimatedGradient
                    colors={['transparent', 'rgba(56, 189, 248, 0.12)']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[StyleSheet.absoluteFill, bloom2Style]}
                />
            </View>
        );
    }

    // Dark Mode: Deep Forest with Bioluminescent Blooms
    return (
        <View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: '#0B1410' }]}>
            {/* Bloom 1 - Violet */}
            <AnimatedGradient
                colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, bloom1Style]}
            />

            {/* Bloom 2 - Teal */}
            <AnimatedGradient
                colors={['transparent', 'rgba(20, 184, 166, 0.12)']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[StyleSheet.absoluteFill, bloom2Style]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 0,
    },
});
