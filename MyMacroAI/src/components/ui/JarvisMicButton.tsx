import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';
import { VISCOUS_SPRING } from '../../utils/physics';
import { haptics } from '../../utils/haptics';

export type JarvisState = 'idle' | 'listening' | 'processing' | 'executing' | 'success' | 'error';

interface JarvisMicButtonProps {
    state: JarvisState;
    onPress: () => void;
    onLongPress?: () => void;
    style?: any;
}

const STATE_COLORS = {
    idle: '#3B82F6',       // Blue
    listening: '#10B981',  // Green
    processing: '#F59E0B', // Orange
    executing: '#8B5CF6',  // Purple
    success: '#10B981',    // Green
    error: '#EF4444',      // Red
};

export const JarvisMicButton: React.FC<JarvisMicButtonProps> = ({
    state,
    onPress,
    onLongPress,
    style
}) => {
    // Animation values
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);
    const rotation = useSharedValue(0);
    const buttonScale = useSharedValue(1);

    const activeColor = STATE_COLORS[state];

    // Helper to reset animations
    const resetAnimations = () => {
        cancelAnimation(pulseScale);
        cancelAnimation(pulseOpacity);
        cancelAnimation(rotation);
        pulseScale.value = 1;
        pulseOpacity.value = 0;
        rotation.value = 0;
    };

    useEffect(() => {
        resetAnimations();

        switch (state) {
            case 'listening':
                // Breathing / Pulse effect
                pulseScale.value = withRepeat(
                    withSequence(
                        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
                        withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) })
                    ),
                    -1,
                    true // reverse
                );
                pulseOpacity.value = withRepeat(
                    withSequence(
                        withTiming(0.2, { duration: 1500 }),
                        withTiming(0.6, { duration: 1500 })
                    ),
                    -1,
                    true
                );
                break;

            case 'processing':
                // Rotation effect
                rotation.value = withRepeat(
                    withTiming(360, { duration: 2000, easing: Easing.linear }),
                    -1,
                    false
                );
                break;
        }
    }, [state]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
        borderColor: activeColor,
    }));

    const rotationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handlePress = () => {
        haptics.heavy();
        onPress();
    };

    const handlePressIn = () => {
        buttonScale.value = withSpring(0.90, VISCOUS_SPRING);
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1, VISCOUS_SPRING);
    };

    return (
        <View style={[styles.wrapper, style]}>
            {/* Pulse Ring */}
            <Animated.View style={[styles.pulseRing, pulseStyle]} />

            {/* Main Button */}
            <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handlePress}
                    onLongPress={onLongPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View style={[styles.container, { shadowColor: activeColor }]}>
                        <BlurView intensity={60} tint="dark" style={styles.blur}>
                            <Animated.View style={rotationStyle}>
                                <Ionicons
                                    name={state === 'listening' ? 'mic' : 'mic-outline'}
                                    size={32}
                                    color={activeColor}
                                />
                            </Animated.View>
                        </BlurView>

                        {/* Border glow */}
                        <View style={[styles.border, { borderColor: activeColor }]} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
    },
    pulseRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        zIndex: 0,
    },
    container: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight backing
        justifyContent: 'center',
        alignItems: 'center',

        // Shadow Glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
        borderWidth: 1.5,
        opacity: 0.4,
    },
});
