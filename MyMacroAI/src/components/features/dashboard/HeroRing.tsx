import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import { ThemedText } from '../../ui/ThemedText';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { SOFT_RADIUS } from '@/src/design-system/aesthetics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HeroRingProps {
    calories: number;
    target: number;
    macros: {
        protein: { current: number; target: number };
        carbs: { current: number; target: number };
        fats: { current: number; target: number };
    };
}

export const HeroRing: React.FC<HeroRingProps> = ({ calories, target, macros }) => {
    const progress = Math.min(calories / target, 1);
    const animatedProgress = useSharedValue(0);
    const size = 280;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Macro rings config (simpler, thinner rings inside)
    const macroStrokeWidth = 6;
    const macroRadius = radius - 30;

    useEffect(() => {
        animatedProgress.value = withSpring(progress, { damping: 15, stiffness: 60 });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animatedProgress.value),
    }));

    return (
        <View style={styles.container}>
            {/* Background Glow */}
            <View style={styles.glowContainer}>
                <Svg height={size + 40} width={size + 40} viewBox={`0 0 ${size + 40} ${size + 40}`}>
                    <Defs>
                        <LinearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#2DD4BF" stopOpacity="0.2" />
                            <Stop offset="1" stopColor="#A78BFA" stopOpacity="0.1" />
                        </LinearGradient>
                    </Defs>
                    <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={size / 2} fill="url(#glowGrad)" />
                </Svg>
            </View>

            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#2DD4BF" />
                            <Stop offset="1" stopColor="#A78BFA" />
                        </LinearGradient>
                    </Defs>

                    {/* Track */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />

                    {/* Progress */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#ringGrad)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                        animatedProps={animatedProps}
                    />
                </Svg>

                {/* Center Content */}
                <View style={styles.content}>
                    <ThemedText variant="label" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>REMAINING</ThemedText>
                    <ThemedText variant="premium-heading" style={{ fontSize: 48, lineHeight: 56, color: '#FFF' }}>
                        {Math.max(target - calories, 0)}
                    </ThemedText>
                    <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        kcal left
                    </ThemedText>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    glowContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        position: 'absolute',
        alignItems: 'center',
    }
});
