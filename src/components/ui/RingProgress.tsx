import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

interface RingProgressProps {
    value: number; // 0-100
    size: number;
    strokeWidth: number;
    gradientColors: [string, string];
    showValue?: boolean;
    label?: string;
    unit?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RingProgress: React.FC<RingProgressProps> = ({
    value,
    size,
    strokeWidth,
    gradientColors,
    showValue = true,
    label,
    unit = '',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(value / 100, {
            duration: 1500,
            easing: Easing.out(Easing.cubic),
        });
    }, [value]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={gradientColors[0]} />
                        <Stop offset="100%" stopColor={gradientColors[1]} />
                    </LinearGradient>
                </Defs>

                {/* Track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#grad)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    animatedProps={animatedProps}
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {(showValue || label) && (
                <View style={styles.content}>
                    {showValue && (
                        <Text style={styles.value}>
                            {value}
                            {unit && <Text style={styles.unit}>{unit}</Text>}
                        </Text>
                    )}
                    {label && <Text style={styles.label}>{label}</Text>}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    unit: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94A3B8',
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 2,
        textTransform: 'uppercase',
    },
});
