/**
 * RespirationCard - Premium Breathing Widget
 * Cyan ocean gradient with wave effect
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { RespirationData } from '@/hooks/useHealthData';
import { useCombinedTheme } from '@/src/design-system/theme';

interface Props {
    data: RespirationData;
    onPress?: () => void;
}

export const RespirationCard: React.FC<Props> = ({ data, onPress }) => {
    const { isDark } = useCombinedTheme();

    // Breathing animation
    const breathe = useSharedValue(0);

    useEffect(() => {
        breathe.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const waveStyle = useAnimatedStyle(() => {
        const translateY = interpolate(breathe.value, [0, 1], [0, -6]);
        return { transform: [{ translateY }] };
    });

    const isElevated = data.tempDeviation > 0.3;
    const tempSign = data.tempDeviation >= 0 ? '+' : '';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <LinearGradient
                colors={isDark
                    ? ['#0C4A6E', '#0891B2', '#06B6D4']
                    : ['#06B6D4', '#22D3EE', '#67E8F9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Wave decoration */}
                <Animated.View style={[styles.waveContainer, waveStyle]}>
                    <Svg width="150" height="30" viewBox="0 0 150 30">
                        <Path
                            d="M0,15 Q20,5 40,15 T80,15 T120,15 T150,15"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            fill="none"
                        />
                    </Svg>
                </Animated.View>

                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="pulse" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.label}>RESPIRATION</Text>
                </View>

                <View style={styles.mainRow}>
                    <Text style={styles.value}>{data.rpm}</Text>
                    <Text style={styles.unit}>rpm</Text>
                </View>

                {/* Temp Deviation */}
                <View style={[styles.tempBadge, isElevated && styles.tempBadgeWarning]}>
                    <Ionicons
                        name="thermometer-outline"
                        size={12}
                        color={isElevated ? '#FEF3C7' : 'rgba(255,255,255,0.8)'}
                    />
                    <Text style={[styles.tempText, isElevated && styles.tempTextWarning]}>
                        {tempSign}{data.tempDeviation.toFixed(1)}°C
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#0891B2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
    gradient: {
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    iconBg: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.8)',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    value: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    unit: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
        color: 'rgba(255,255,255,0.7)',
    },
    tempBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    tempBadgeWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.4)',
    },
    tempText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    tempTextWarning: {
        color: '#FEF3C7',
    },
});
