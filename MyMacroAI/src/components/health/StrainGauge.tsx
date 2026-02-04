/**
 * StrainGauge - Premium Load vs Capacity Widget
 * Orange/gray gradient with animated bars and glow
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    strain: number;    // 0-21 scale
    capacity: number;  // 0-21 scale
}

export const StrainGauge: React.FC<Props> = ({ strain, capacity }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const strainWidth = useSharedValue(0);
    const capacityWidth = useSharedValue(0);
    const pulse = useSharedValue(0.7);

    const isOverloaded = strain > capacity;

    useEffect(() => {
        const maxValue = 21;
        strainWidth.value = withTiming((strain / maxValue) * 100, {
            duration: 900,
            easing: Easing.out(Easing.cubic),
        });
        capacityWidth.value = withTiming((capacity / maxValue) * 100, {
            duration: 900,
            easing: Easing.out(Easing.cubic),
        });

        if (isOverloaded) {
            pulse.value = withRepeat(
                withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        }
    }, [strain, capacity, isOverloaded]);

    const strainStyle = useAnimatedStyle(() => ({
        width: `${strainWidth.value}%`,
    }));

    const capacityStyle = useAnimatedStyle(() => ({
        width: `${capacityWidth.value}%`,
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: isOverloaded ? pulse.value : 0,
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDark
                    ? ['#1C1917', '#292524', '#44403C']
                    : ['#44403C', '#57534E', '#78716C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Warning pulse for overload */}
                <Animated.View style={[styles.warningPulse, pulseStyle]} />

                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconBg}>
                            <Ionicons name="flash" size={16} color="#FF5C00" />
                        </View>
                        <Text style={styles.title}>Load vs Capacity</Text>
                    </View>
                    {isOverloaded && (
                        <View style={styles.warningBadge}>
                            <Ionicons name="warning" size={12} color="#FEF3C7" />
                            <Text style={styles.warningText}>Overload</Text>
                        </View>
                    )}
                </View>

                {/* Capacity Bar */}
                <View style={styles.barRow}>
                    <Text style={styles.barLabel}>CAPACITY</Text>
                    <View style={styles.barWrapper}>
                        <View style={styles.track}>
                            <Animated.View style={[capacityStyle]}>
                                <LinearGradient
                                    colors={['#6B7280', '#9CA3AF', '#D1D5DB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.barFill}
                                />
                            </Animated.View>
                        </View>
                        <Text style={styles.barValue}>{capacity.toFixed(1)}</Text>
                    </View>
                </View>

                {/* Strain Bar */}
                <View style={styles.barRow}>
                    <Text style={styles.barLabel}>STRAIN</Text>
                    <View style={styles.barWrapper}>
                        <View style={styles.track}>
                            <Animated.View style={[strainStyle]}>
                                <LinearGradient
                                    colors={isOverloaded
                                        ? ['#DC2626', '#EF4444', '#F87171']
                                        : ['#C2410C', '#EA580C', '#FB923C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.barFill}
                                />
                            </Animated.View>
                        </View>
                        <Text style={styles.barValue}>{strain.toFixed(1)}</Text>
                    </View>
                </View>

                <Text style={styles.hint}>
                    {isOverloaded
                        ? '⚠️ Consider rest for optimal recovery'
                        : '✓ Keep strain below capacity'}
                </Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FF5C00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    gradient: {
        padding: 20,
        position: 'relative',
    },
    warningPulse: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBg: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 92, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    warningText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FEF3C7',
    },
    barRow: {
        marginBottom: 14,
    },
    barLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 6,
        color: 'rgba(255,255,255,0.6)',
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    track: {
        flex: 1,
        height: 14,
        borderRadius: 7,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    barFill: {
        height: '100%',
        borderRadius: 7,
    },
    barValue: {
        fontSize: 15,
        fontWeight: '700',
        width: 40,
        textAlign: 'right',
        color: '#FFFFFF',
    },
    hint: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 6,
        color: 'rgba(255,255,255,0.6)',
    },
});
