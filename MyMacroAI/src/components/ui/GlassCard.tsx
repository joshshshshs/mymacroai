import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { VISCOUS_SPRING } from '../../utils/physics';

interface GlassCardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'hero';
    intensity?: number;
    onPress?: () => void;
    style?: ViewStyle;
    showSheen?: boolean;
    glowColor?: string;
    className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    variant = 'default',
    intensity,
    onPress,
    style,
    showSheen = false,
    glowColor,
    className,
}) => {
    const scale = useSharedValue(1);

    // Determine standard intensity if not manually overridden
    // Specs: Default around 30-50 (40 is good). Elevated 60. Hero 80.
    const baseIntensity = intensity ?? (variant === 'hero' ? 80 : variant === 'elevated' ? 60 : 40);

    // Android optimization: cap intensity
    const adjustedIntensity = Platform.OS === 'android' ? Math.min(baseIntensity, 50) : baseIntensity;

    // Visual variants
    const borderRadius = variant === 'hero' ? 32 : 28; // 3xl vs 2xl

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) scale.value = withSpring(0.96, VISCOUS_SPRING);
    };

    const handlePressOut = () => {
        if (onPress) scale.value = withSpring(1, VISCOUS_SPRING);
    };

    const Container = onPress ? AnimatedPressable : Animated.View;

    return (
        <Container
            style={[
                styles.container,
                { borderRadius },
                glowColor ? { shadowColor: glowColor, shadowOpacity: 0.4, shadowRadius: 16 } : null,
                style,
                animatedStyle
            ]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className={className}
        >
            <BlurView
                intensity={adjustedIntensity}
                tint="dark"
                style={StyleSheet.absoluteFill}
                // Fallback color for low-power mode or when blur is disabled
                reducedTransparencyFallbackColor="rgba(19, 32, 28, 0.95)"
            />

            {/* 1px Border Layer */}
            <View style={[styles.border, { borderRadius }]} />

            {/* Optional Top-Left Sheen */}
            {showSheen && (
                <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: Platform.select({
            // On Android, we might need a slight tint if BlurView isn't supported perfectly,
            // but expo-blur usually handles it. Adding a very subtle base.
            android: 'rgba(255, 255, 255, 0.02)',
            default: 'transparent',
        }),
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
        zIndex: 1,
        pointerEvents: 'none',
    },
    content: {
        zIndex: 2,
    },
});
