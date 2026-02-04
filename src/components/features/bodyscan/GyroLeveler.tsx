/**
 * GyroLeveler - Phone alignment indicator using device gyroscope
 * Shows a line that turns orange when phone is properly vertical
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';

interface GyroLevelerProps {
    onAligned?: (isAligned: boolean) => void;
    threshold?: number; // Degrees of tolerance
}

export const GyroLeveler: React.FC<GyroLevelerProps> = ({
    onAligned,
    threshold = 5,
}) => {
    const [rotation, setRotation] = useState({ beta: 0, gamma: 0 });
    const rotationX = useSharedValue(0);
    const rotationY = useSharedValue(0);
    const alignedProgress = useSharedValue(0);

    useEffect(() => {
        let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;

        const startListening = async () => {
            const isAvailable = await DeviceMotion.isAvailableAsync();
            if (!isAvailable) return;

            DeviceMotion.setUpdateInterval(50);

            subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
                if (data.rotation) {
                    const beta = (data.rotation.beta * 180) / Math.PI; // Front-back tilt
                    const gamma = (data.rotation.gamma * 180) / Math.PI; // Left-right tilt

                    setRotation({ beta, gamma });

                    rotationX.value = withSpring(gamma, { damping: 15, stiffness: 100 });
                    rotationY.value = withSpring(beta - 90, { damping: 15, stiffness: 100 }); // 90 = vertical

                    // Check if phone is approximately vertical
                    const isVertical = Math.abs(beta - 90) < threshold && Math.abs(gamma) < threshold;
                    alignedProgress.value = withSpring(isVertical ? 1 : 0, { damping: 20 });

                    onAligned?.(isVertical);
                }
            });
        };

        startListening();

        return () => {
            subscription?.remove();
        };
    }, [threshold, onAligned]);

    const lineAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotationX.value}deg` },
            ],
            backgroundColor: interpolateColor(
                alignedProgress.value,
                [0, 1],
                ['rgba(255, 255, 255, 0.4)', '#FF4500']
            ),
        };
    });

    const dotAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                alignedProgress.value,
                [0, 1],
                ['rgba(255, 255, 255, 0.6)', '#FF4500']
            ),
            transform: [
                { scale: alignedProgress.value === 1 ? 1.2 : 1 },
            ],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: alignedProgress.value,
        };
    });

    return (
        <View style={styles.container}>
            {/* Center reference line */}
            <View style={styles.referenceContainer}>
                <View style={styles.referenceLine} />
                <View style={styles.centerTick} />
            </View>

            {/* Dynamic leveler line */}
            <View style={styles.levelerContainer}>
                <Animated.View style={[styles.levelerLine, lineAnimatedStyle]}>
                    <Animated.View style={[styles.centerDot, dotAnimatedStyle]} />
                </Animated.View>
            </View>

            {/* Alignment indicator */}
            <Animated.View style={[styles.alignedIndicator, textAnimatedStyle]}>
                <Text style={styles.alignedText}>ALIGNED</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    referenceContainer: {
        position: 'absolute',
        width: 120,
        alignItems: 'center',
    },
    referenceLine: {
        width: 120,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 1,
    },
    centerTick: {
        position: 'absolute',
        width: 2,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: -3,
    },
    levelerContainer: {
        width: 100,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelerLine: {
        width: 80,
        height: 3,
        borderRadius: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute',
    },
    alignedIndicator: {
        position: 'absolute',
        bottom: 0,
    },
    alignedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FF4500',
        letterSpacing: 1,
    },
});
