import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, withSpring, withDelay } from 'react-native-reanimated';
import { ThemedText } from '../../ui/ThemedText';
import { SOFT_RADIUS } from '@/src/design-system/aesthetics';
import { Ionicons } from '@expo/vector-icons';
import { useCombinedTheme } from '@/src/design-system/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HeroRingProps {
    calories: number;
    target: number;
    macros: {
        protein: { current: number; target: number };
        carbs: { current: number; target: number };
        fats: { current: number; target: number };
    };
    variant?: 'calories-only' | 'macros-split';
    onEditPress?: () => void;
}

export const HeroRing: React.FC<HeroRingProps> = ({ calories, target, macros, variant = 'macros-split', onEditPress }) => {
    const { colors, isDark } = useCombinedTheme();

    // Shared Config
    const size = 300;
    const center = size / 2;

    // --- VARIANT 1: CALORIES ONLY (Single Ring) ---
    const calProgress = Math.min(calories / target, 1);
    const svCal = useSharedValue(0);

    // --- VARIANT 2: MACROS SPLIT (3 Concentric Rings) ---
    const protProgress = Math.min(macros.protein.current / macros.protein.target, 1);
    const carbProgress = Math.min(macros.carbs.current / macros.carbs.target, 1);
    const fatProgress = Math.min(macros.fats.current / macros.fats.target, 1);

    const svProt = useSharedValue(0);
    const svCarb = useSharedValue(0);
    const svFat = useSharedValue(0);

    useEffect(() => {
        if (variant === 'calories-only') {
            svCal.value = withSpring(calProgress, { damping: 15, stiffness: 60 });
        } else {
            svProt.value = withSpring(protProgress, { damping: 18, stiffness: 50 });
            svCarb.value = withDelay(100, withSpring(carbProgress, { damping: 18, stiffness: 50 }));
            svFat.value = withDelay(200, withSpring(fatProgress, { damping: 18, stiffness: 50 }));
        }
    }, [variant, calProgress, protProgress, carbProgress, fatProgress]);


    // --- RENDER HELPERS ---

    const renderCaloriesOnly = () => {
        const strokeWidth = 24;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const originVal = center + ", " + center;

        const animatedProps = useAnimatedProps(() => ({
            strokeDashoffset: circumference * (1 - svCal.value),
        }));

        return (
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={colors.gradientStart} />
                        <Stop offset="1" stopColor={colors.gradientEnd} />
                    </LinearGradient>
                </Defs>

                {/* Track */}
                <Circle cx={center} cy={center} r={radius} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} strokeWidth={strokeWidth} fill="transparent" />

                {/* Progress */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#calGrad)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={originVal}
                    animatedProps={animatedProps}
                />
            </Svg>
        );
    };

    const renderMacrosSplit = () => {
        const sw = 14;
        const gap = 8;
        const originVal = center + ", " + center;

        // 3 Rings: Protein (Outer), Carbs (Middle), Fats (Inner)
        const rProt = (size - sw) / 2;
        const rCarb = rProt - sw - gap;
        const rFat = rCarb - sw - gap;

        const cProt = 2 * Math.PI * rProt;
        const cCarb = 2 * Math.PI * rCarb;
        const cFat = 2 * Math.PI * rFat;

        const propsProt = useAnimatedProps(() => ({ strokeDashoffset: cProt * (1 - svProt.value) }));
        const propsCarb = useAnimatedProps(() => ({ strokeDashoffset: cCarb * (1 - svCarb.value) }));
        const propsFat = useAnimatedProps(() => ({ strokeDashoffset: cFat * (1 - svFat.value) }));

        return (
            <Svg width={size} height={size}>
                {/* Protein Ring (Outer) */}
                <Circle cx={center} cy={center} r={rProt} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} strokeWidth={sw} fill="transparent" />
                <AnimatedCircle
                    cx={center} cy={center} r={rProt}
                    stroke={colors.macros.protein} strokeWidth={sw} fill="transparent"
                    strokeDasharray={cProt} strokeLinecap="round" rotation="-90" origin={originVal}
                    animatedProps={propsProt}
                />

                {/* Carb Ring (Middle) */}
                <Circle cx={center} cy={center} r={rCarb} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} strokeWidth={sw} fill="transparent" />
                <AnimatedCircle
                    cx={center} cy={center} r={rCarb}
                    stroke={colors.macros.carbs} strokeWidth={sw} fill="transparent"
                    strokeDasharray={cCarb} strokeLinecap="round" rotation="-90" origin={originVal}
                    animatedProps={propsCarb}
                />

                {/* Fat Ring (Inner) */}
                <Circle cx={center} cy={center} r={rFat} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} strokeWidth={sw} fill="transparent" />
                <AnimatedCircle
                    cx={center} cy={center} r={rFat}
                    stroke={colors.macros.fats} strokeWidth={sw} fill="transparent"
                    strokeDasharray={cFat} strokeLinecap="round" rotation="-90" origin={originVal}
                    animatedProps={propsFat}
                />
            </Svg>
        );
    };

    const glowSize = size + 60;
    const viewBoxStr = "0 0 " + glowSize + " " + glowSize;

    return (
        <View style={styles.container}>
            {/* Edit Widget Button (Placeholder for user request) */}
            <TouchableOpacity style={[styles.editButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} onPress={onEditPress}>
                <Ionicons name="add" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Background Glow */}
            <View style={styles.glowContainer}>
                <Svg height={glowSize} width={glowSize} viewBox={viewBoxStr}>
                    <Defs>
                        <LinearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor={colors.gradientStart} stopOpacity={isDark ? 0.2 : 0.15} />
                            <Stop offset="1" stopColor={colors.gradientEnd} stopOpacity={isDark ? 0.1 : 0.05} />
                        </LinearGradient>
                    </Defs>
                    <Circle cx={glowSize / 2} cy={glowSize / 2} r={size / 2} fill="url(#glowGrad)" />
                </Svg>
            </View>

            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                {variant === 'calories-only' ? renderCaloriesOnly() : renderMacrosSplit()}

                {/* Center Content */}
                <View style={styles.content}>
                    <ThemedText variant="label" style={{ color: colors.textSecondary, letterSpacing: 2 }}>REMAINING</ThemedText>
                    <ThemedText variant="premium-heading" style={{ fontSize: 48, lineHeight: 56, color: colors.textPrimary }}>
                        {Math.max(target - calories, 0)}
                    </ThemedText>
                    <ThemedText variant="caption" style={{ color: colors.textMuted }}>
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
    editButton: {
        position: 'absolute',
        top: 0,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
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
