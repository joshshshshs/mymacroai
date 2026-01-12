import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { VISCOUS_SPRING } from '../../utils/physics';

interface LiquidRingProps {
    value: number; // 0-100
    color: string;
    size: number;
    strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const LiquidRing: React.FC<LiquidRingProps> = ({
    value,
    color,
    size,
    strokeWidth = 8,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        // "Slosh" effect enabled by VISCOUS_SPRING
        progress.value = withSpring(value / 100, VISCOUS_SPRING);
    }, [value]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        {/* Gradient for liquid effect look */}
                        <Stop offset="0%" stopColor={color} stopOpacity="1" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
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

                {/* Liquid Progress */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#liquidGrad)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    animatedProps={animatedProps}
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
        </View>
    );
};
