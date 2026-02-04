/**
 * MyMacroAIAvatar - Reusable AI avatar component using app logo
 * Uses different logo assets for light and dark mode
 */

import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

// Import logo assets
const LOGO_LIGHT = require('../../../assets/white bkg.png');
const LOGO_DARK = require('../../../assets/black bkg.png');

type AvatarSize = 'small' | 'medium' | 'large';

interface MyMacroAIAvatarProps {
    size?: AvatarSize;
    animated?: boolean;
    accentColor?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = {
    small: 40,
    medium: 52,
    large: 64,
};

export const MyMacroAIAvatar: React.FC<MyMacroAIAvatarProps> = ({
    size = 'medium',
    animated = true,
    accentColor,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const dimension = SIZE_MAP[size];
    const primaryColor = accentColor || '#FF5C00'; // Vitamin Orange

    // Animation values
    const glowOpacity = useSharedValue(0.4);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (animated) {
            // Subtle glow pulse
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );

            // Subtle scale pulse
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        }
    }, [animated]);

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    // Select logo based on theme: light mode = white background, dark mode = black background
    const logoSource = isDark ? LOGO_DARK : LOGO_LIGHT;

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            {/* Logo Image */}
            <View
                style={[
                    styles.background,
                    {
                        width: dimension,
                        height: dimension,
                        borderRadius: dimension / 2,
                        backgroundColor: isDark ? 'rgba(30, 30, 34, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                ]}
            >
                <Image
                    source={logoSource}
                    style={{
                        width: dimension * 0.9,
                        height: dimension * 0.9,
                        borderRadius: (dimension * 0.9) / 2,
                    }}
                    resizeMode="contain"
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
    },
    background: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
});

export default MyMacroAIAvatar;

