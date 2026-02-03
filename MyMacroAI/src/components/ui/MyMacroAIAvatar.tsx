/**
 * MyMacroAIAvatar - Reusable AI avatar component using app logo
 * Uses white icon with transparent background for cleaner look
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

// Import white logo (no background)


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

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            {/* Logo Image - white icon with transparent circular background */}
            <View
                style={[
                    styles.background,
                    {
                        width: dimension,
                        height: dimension,
                        borderRadius: dimension / 2,
                        backgroundColor: isDark ? 'rgba(255, 92, 0, 0.15)' : 'rgba(255, 92, 0, 0.1)',
                        borderColor: isDark ? 'rgba(255, 92, 0, 0.3)' : 'rgba(255, 92, 0, 0.2)',
                    },
                ]}
            >
                <Image
                    source={isDark ? require('../../../assets/black bkg.png') : require('../../../assets/white bkg.png')}
                    style={{
                        width: dimension,
                        height: dimension,
                        borderRadius: dimension / 2,
                    }}
                    resizeMode="cover"
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
    background: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#FF5C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
});

export default MyMacroAIAvatar;
