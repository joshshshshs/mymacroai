/**
 * OnboardingPagination - Animated dots and action button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    SharedValue,
    interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
    scrollX: SharedValue<number>;
    totalSlides: number;
    currentIndex: number;
    onNext: () => void;
    onComplete: () => void;
}

export const OnboardingPagination: React.FC<Props> = ({
    scrollX,
    totalSlides,
    currentIndex,
    onNext,
    onComplete,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light, medium } = useHaptics();

    const colors = {
        bg: isDark ? '#2C2C2E' : '#F0F0F0',
        dot: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
        activeDot: '#FF5C00',
        buttonBg: '#FF5C00',
        buttonText: '#FFFFFF',
    };

    const isLastSlide = currentIndex === totalSlides - 1;

    const handlePress = () => {
        if (isLastSlide) {
            medium();
            onComplete();
        } else {
            light();
            onNext();
        }
    };

    // Button animation
    const buttonStyle = useAnimatedStyle(() => {
        const progress = scrollX.value / SCREEN_WIDTH;

        const width = interpolate(
            progress,
            [0, 1, 2],
            [56, 56, SCREEN_WIDTH - 80]
        );

        const borderRadius = interpolate(
            progress,
            [0, 1, 2],
            [28, 28, 16]
        );

        return { width, borderRadius };
    });

    return (
        <View style={styles.container}>
            {/* Dots */}
            <View style={styles.dotsContainer}>
                {Array.from({ length: totalSlides }).map((_, index) => {
                    const dotStyle = useAnimatedStyle(() => {
                        const progress = scrollX.value / SCREEN_WIDTH;

                        const width = interpolate(
                            progress,
                            [index - 1, index, index + 1],
                            [8, 24, 8],
                            'clamp'
                        );

                        const backgroundColor = interpolateColor(
                            progress,
                            [index - 0.5, index, index + 0.5],
                            [colors.dot, colors.activeDot, colors.dot]
                        );

                        return { width, backgroundColor };
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[styles.dot, dotStyle]}
                        />
                    );
                })}
            </View>

            {/* Action Button */}
            <Animated.View style={[styles.button, { backgroundColor: colors.buttonBg }, buttonStyle]}>
                <TouchableOpacity
                    style={styles.buttonInner}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    {isLastSlide ? (
                        <Text style={styles.buttonText}>Initiate Protocol</Text>
                    ) : (
                        <Ionicons name="arrow-forward" size={24} color={colors.buttonText} />
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        gap: 24,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    button: {
        height: 56,
        overflow: 'hidden',
    },
    buttonInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
