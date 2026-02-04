/**
 * LiquidOrb - Animated background orb that morphs with scroll
 */

import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    SharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    scrollX: SharedValue<number>;
    totalSlides: number;
}

export const LiquidOrb: React.FC<Props> = ({ scrollX, totalSlides }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const progress = scrollX.value / SCREEN_WIDTH;

        // Slide 0: Center, large, pulsing
        // Slide 1: Wide, stretched, lower
        // Slide 2: Small, sharp, center

        const translateX = interpolate(
            progress,
            [0, 1, 2],
            [0, 0, 0]
        );

        const translateY = interpolate(
            progress,
            [0, 1, 2],
            [-80, 100, 150]
        );

        const scaleX = interpolate(
            progress,
            [0, 1, 2],
            [1, 2.5, 0.6]
        );

        const scaleY = interpolate(
            progress,
            [0, 1, 2],
            [1, 0.6, 0.6]
        );

        const opacity = interpolate(
            progress,
            [0, 1, 2],
            [0.8, 0.6, 0.9]
        );

        // Apply pulse only on first slide
        const pulseScale = progress < 0.5 ? pulse.value : 1;

        return {
            transform: [
                { translateX },
                { translateY },
                { scaleX: scaleX * pulseScale },
                { scaleY: scaleY * pulseScale },
            ],
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <BlurView intensity={60} tint="default" style={styles.blur}>
                <Animated.View style={styles.orb} />
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 300,
        height: 300,
        top: SCREEN_HEIGHT * 0.25,
        left: (SCREEN_WIDTH - 300) / 2,
        zIndex: 0,
    },
    blur: {
        width: '100%',
        height: '100%',
        borderRadius: 150,
        overflow: 'hidden',
    },
    orb: {
        width: '100%',
        height: '100%',
        borderRadius: 150,
        backgroundColor: '#FF5C00',
    },
});
