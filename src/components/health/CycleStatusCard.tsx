/**
 * CycleStatusCard - Hormonal phase gauge with BMR impact
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CycleData } from '@/hooks/useHealthData';

interface Props {
    data: CycleData;
    onPress?: () => void;
}

const PHASES = ['MENSTRUAL', 'FOLLICULAR', 'OVULATION', 'LUTEAL'];
const PHASE_COLORS: Record<string, string> = {
    MENSTRUAL: '#EF4444',
    FOLLICULAR: '#F97316',
    OVULATION: '#22C55E',
    LUTEAL: '#8B5CF6',
};

export const CycleStatusCard: React.FC<Props> = ({ data, onPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        track: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    };

    const phaseColor = PHASE_COLORS[data.phase] || '#8B5CF6';
    const phaseName = data.phase.charAt(0) + data.phase.slice(1).toLowerCase();
    const currentPhaseIndex = PHASES.indexOf(data.phase);

    // Phase gauge - semi-circle
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;

    const Container = onPress ? TouchableOpacity : View;
    
    return (
        <Container onPress={onPress} style={[styles.card, { backgroundColor: colors.bg }]}>
            <View style={styles.content}>
                {/* Left: Phase Gauge */}
                <View style={styles.gaugeSection}>
                    <View style={styles.gaugeContainer}>
                        <Svg width={size} height={size / 2 + 10}>
                            {/* Background arc */}
                            <Path
                                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                                stroke={colors.track}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* Progress arc */}
                            <Path
                                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                                stroke={phaseColor}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(currentPhaseIndex + 1) / 4 * Math.PI * radius} ${Math.PI * radius}`}
                            />
                        </Svg>
                    </View>
                    <View style={styles.phaseInfo}>
                        <Text style={[styles.phaseName, { color: phaseColor }]}>{phaseName}</Text>
                        <Text style={[styles.phaseDay, { color: colors.textSecondary }]}>Day {data.day}</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.track }]} />

                {/* Right: BMR Impact */}
                <View style={styles.bmrSection}>
                    <View style={styles.bmrHeader}>
                        <Ionicons name="flame" size={16} color="#F97316" />
                        <Text style={[styles.bmrLabel, { color: colors.textSecondary }]}>BMR IMPACT</Text>
                    </View>
                    <Text style={[styles.bmrValue, { color: colors.text }]}>
                        {data.bmrChange >= 0 ? '+' : ''}{data.bmrChange}
                    </Text>
                    <Text style={[styles.bmrUnit, { color: colors.textSecondary }]}>kcal/day</Text>
                </View>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
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
        marginBottom: 8,
    },
    phaseInfo: {
        alignItems: 'center',
    },
    phaseName: {
        fontSize: 16,
        fontWeight: '700',
    },
    phaseDay: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 60,
        marginHorizontal: 20,
    },
    bmrSection: {
        flex: 1,
        alignItems: 'center',
    },
    bmrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    bmrLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    bmrValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    bmrUnit: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
});
