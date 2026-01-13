import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface JarvisOrbProps {
    onPress?: () => void;
    state?: 'idle' | 'listening' | 'processing';
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({ onPress, state = 'idle' }) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.5);
    const ringScale = useSharedValue(1);

    useEffect(() => {
        if (state === 'listening') {
            scale.value = withRepeat(withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
            glowOpacity.value = withRepeat(withSequence(withTiming(1, { duration: 800 }), withTiming(0.5, { duration: 800 })), -1, true);
            ringScale.value = withRepeat(withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);
        } else {
            scale.value = withTiming(1);
            glowOpacity.value = withTiming(0.5);
            ringScale.value = withTiming(1);
        }
    }, [state]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: 1 - (ringScale.value - 1) * 2, // Fade out as it expands
    }));

    const getGradientColors = () => {
        switch (state) {
            case 'listening': return ['#F472B6', '#A78BFA']; // Pink/Purple pulse
            case 'processing': return ['#60A5FA', '#3B82F6']; // Blue pulse
            default: return ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']; // Subtle glass
        }
    };

    return (
        <View style={styles.container}>
            {/* Pulsating Ring (only visible when listening) */}
            {state === 'listening' && (
                <Animated.View style={[styles.ring, ringStyle]} />
            )}

            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <Animated.View style={[styles.orb, animatedStyle]}>
                    {/* Glow Layer */}
                    <Animated.View style={[StyleSheet.absoluteFill, styles.glow, glowStyle]}>
                        <LinearGradient
                            colors={state === 'listening' ? ['#A78BFA', 'transparent'] : ['rgba(255,255,255,0.2)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>

                    {/* Glass Body */}
                    <BlurView intensity={40} tint="light" style={styles.glassBody}>
                        <LinearGradient
                            colors={getGradientColors() as any}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />

                        {/* Core Icon */}
                        <Ionicons
                            name={state === 'listening' ? "mic" : "aperture"}
                            size={28}
                            color="#FFF"
                            style={{ opacity: 0.9 }}
                        />

                        {/* Reflection Highlight */}
                        <View style={styles.highlight} />
                    </BlurView>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
    },
    orb: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    glassBody: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        borderRadius: 32,
    },
    highlight: {
        position: 'absolute',
        top: 5,
        left: 10,
        width: 20,
        height: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.4)',
        transform: [{ rotate: '-45deg' }],
    },
    ring: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#A78BFA',
        backgroundColor: 'transparent',
    }
});
