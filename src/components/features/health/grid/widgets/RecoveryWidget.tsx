/**
 * RecoveryWidget - Recovery gauge block for Bevel grid
 * Wraps existing RecoveryGauge in grid-compatible container
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SPACING } from '@/src/design-system/tokens';
import Svg, { Circle } from 'react-native-svg';

export const RecoveryWidget: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Mock data - connect to health store later
    const recoveryScore = 78;
    const status = recoveryScore >= 70 ? 'Prime' : recoveryScore >= 40 ? 'Fair' : 'Rest';

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const trackColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

    const getStatusColor = (score: number) => {
        if (score >= 70) return '#10B981';
        if (score >= 40) return '#F59E0B';
        return '#EF4444';
    };

    const statusColor = getStatusColor(recoveryScore);
    const circumference = 2 * Math.PI * 50; // radius = 50
    const progress = (recoveryScore / 100) * circumference;

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.label, { color: secondaryColor }]}>RECOVERY</Text>

            {/* Circular Progress */}
            <View style={styles.gaugeContainer}>
                <Svg width={120} height={120}>
                    {/* Background circle */}
                    <Circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke={trackColor}
                        strokeWidth="10"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke={statusColor}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${progress} ${circumference}`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="60, 60"
                    />
                </Svg>

                <View style={styles.gaugeCenter}>
                    <Text style={[styles.score, { color: textColor }]}>{recoveryScore}</Text>
                    <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 32,
        padding: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        alignSelf: 'flex-start',
    },
    gaugeContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gaugeCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    score: {
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: -2,
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
});
