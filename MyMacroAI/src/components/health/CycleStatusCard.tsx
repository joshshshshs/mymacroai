/**
 * CycleStatusCard - Premium Cycle Widget
 * Pink lunar gradient with phase indicator
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { CycleData } from '@/hooks/useHealthData';
import { useCombinedTheme } from '@/src/design-system/theme';

interface Props {
    data: CycleData;
    onPress?: () => void;
}

const PHASES = ['MENSTRUAL', 'FOLLICULAR', 'OVULATION', 'LUTEAL'];
const PHASE_EMOJIS: Record<string, string> = {
    MENSTRUAL: '🌑',
    FOLLICULAR: '🌙',
    OVULATION: '🌕',
    LUTEAL: '🌓',
};

export const CycleStatusCard: React.FC<Props> = ({ data, onPress }) => {
    const { isDark } = useCombinedTheme();

    // Gentle moon glow
    const glow = useSharedValue(0.3);

    useEffect(() => {
        glow.value = withRepeat(
            withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
    }));

    const phaseName = data.phase.charAt(0) + data.phase.slice(1).toLowerCase();
    const phaseEmoji = PHASE_EMOJIS[data.phase] || '🌙';
    const currentPhaseIndex = PHASES.indexOf(data.phase);

    // Phase gauge - semi-circle
    const size = 70;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <LinearGradient
                colors={isDark
                    ? ['#6B1F58', '#BE185D', '#EC4899']
                    : ['#EC4899', '#F472B6', '#FBCFE8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Moon glow */}
                <Animated.View style={[styles.moonGlow, glowStyle]} />

                <View style={styles.content}>
                    {/* Left: Phase Gauge */}
                    <View style={styles.gaugeSection}>
                        <View style={styles.gaugeContainer}>
                            <Svg width={size} height={size / 2 + 8}>
                                {/* Background arc */}
                                <Path
                                    d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                    strokeLinecap="round"
                                />
                                {/* Progress arc */}
                                <Path
                                    d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                                    stroke="#FFFFFF"
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(currentPhaseIndex + 1) / 4 * Math.PI * radius} ${Math.PI * radius}`}
                                />
                            </Svg>
                            <Text style={styles.phaseEmoji}>{phaseEmoji}</Text>
                        </View>
                        <View style={styles.phaseInfo}>
                            <Text style={styles.phaseName}>{phaseName}</Text>
                            <Text style={styles.phaseDay}>Day {data.day}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Right: BMR Impact */}
                    <View style={styles.bmrSection}>
                        <View style={styles.bmrHeader}>
                            <Ionicons name="flame" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.bmrLabel}>BMR</Text>
                        </View>
                        <Text style={styles.bmrValue}>
                            {data.bmrChange >= 0 ? '+' : ''}{data.bmrChange}
                        </Text>
                        <Text style={styles.bmrUnit}>kcal/day</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    gradient: {
        padding: 20,
        position: 'relative',
    },
    moonGlow: {
        position: 'absolute',
        top: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gaugeSection: {
        flex: 1,
        alignItems: 'center',
    },
    gaugeContainer: {
        marginBottom: 6,
        alignItems: 'center',
    },
    phaseEmoji: {
        fontSize: 20,
        marginTop: -8,
    },
    phaseInfo: {
        alignItems: 'center',
    },
    phaseName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    phaseDay: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
        color: 'rgba(255,255,255,0.7)',
    },
    divider: {
        width: 1,
        height: 50,
        marginHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    bmrSection: {
        flex: 1,
        alignItems: 'center',
    },
    bmrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    bmrLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: 'rgba(255,255,255,0.7)',
    },
    bmrValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    bmrUnit: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
        color: 'rgba(255,255,255,0.7)',
    },
});
