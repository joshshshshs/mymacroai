import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import { ThemedText } from '../../ui/ThemedText';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RecoveryGaugeProps {
    score: number; // 0-100
}

export const RecoveryGauge: React.FC<RecoveryGaugeProps> = ({ score }) => {
    const animatedScore = useSharedValue(0);
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;

    // Semicircle calculations
    const cx = size / 2;
    const cy = size / 2;

    // Background Arc (180 degrees)
    // MstartX,startY A radius,radius 0 0,1 endX,endY
    const startAngle = Math.PI; // 180 deg
    const endAngle = 2 * Math.PI; // 360 deg

    // Helper to get coordinates
    const getCoords = (angle: number) => {
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    };

    const bgStart = getCoords(Math.PI);
    const bgEnd = getCoords(0); // 0 is 3 o'clock, but we want 180 to 360 (9 o'clock to 3 o'clock clockwise)

    // Adjusted for standard gauge: 9 o'clock (PI) to 3 o'clock (0)
    // Actually SVG coordinates: 0 angle is 3 o'clock. 
    // We want to draw from PI (left) to 2PI (right) -> No, that's bottom half.
    // We want PI (left) to 0 (right) via top.
    // Actually easier: draw from PI to 0 in clockwise direction? No, counter-clockwise is negative.
    // Let's stick to standard arc path definition manually.

    // M 10,80 A 70,70 0 0 1 150,80
    const bgPath = `M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${size / 2}`;

    useEffect(() => {
        animatedScore.value = withDelay(500, withSpring(score / 100, { damping: 15 }));
    }, [score]);

    const animatedProps = useAnimatedProps(() => {
        const progress = animatedScore.value;
        const strokeDasharray = Math.PI * radius; // Half circumference
        const strokeDashoffset = strokeDasharray * (1 - progress);
        return {
            strokeDasharray: [strokeDasharray, strokeDasharray],
            strokeDashoffset: strokeDashoffset,
        };
    });

    const getStatusColor = (s: number) => {
        if (s >= 70) return '#10B981'; // Green
        if (s >= 40) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const color = getStatusColor(score);

    return (
        <View style={styles.container}>
            <Svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
                <Defs>
                    <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#EF4444" />
                        <Stop offset="0.5" stopColor="#F59E0B" />
                        <Stop offset="1" stopColor="#10B981" />
                    </LinearGradient>
                </Defs>

                {/* Track */}
                <Path
                    d={bgPath}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Progress */}
                <AnimatedPath
                    d={bgPath}
                    stroke="url(#gaugeGrad)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    animatedProps={animatedProps}
                />
            </Svg>

            <View style={styles.content}>
                <ThemedText variant="h1" style={{ fontSize: 32, lineHeight: 36, color: '#FFF' }}>{score}%</ThemedText>
                <ThemedText variant="caption" style={{ color: color, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {score >= 70 ? 'Prime' : score >= 40 ? 'Fair' : 'Rest'}
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    content: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
    }
});
