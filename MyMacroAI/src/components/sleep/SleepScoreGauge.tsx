/**
 * SleepScoreGauge - Semi-circle gauge for sleep quality
 * Features: SVG arc, dynamic color, quality label, percentile context
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SPACING } from '@/src/design-system/tokens';

interface SleepScoreGaugeProps {
    score: number; // 0-100
    percentile?: number; // e.g., 85 = "better than 85% of users"
}

const GAUGE_SIZE = 220;
const STROKE_WIDTH = 16;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;

// Create SVG arc path for semi-circle
const createArc = (percentage: number): string => {
    const startAngle = 180; // Start from left
    const endAngle = 180 + (180 * (percentage / 100)); // End based on percentage

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const centerX = GAUGE_SIZE / 2;
    const centerY = GAUGE_SIZE / 2;

    const x1 = centerX + RADIUS * Math.cos(startRad);
    const y1 = centerY + RADIUS * Math.sin(startRad);
    const x2 = centerX + RADIUS * Math.cos(endRad);
    const y2 = centerY + RADIUS * Math.sin(endRad);

    const largeArc = percentage > 50 ? 1 : 0;

    return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`;
};

const getQualityInfo = (score: number): { label: string; color: string; gradient: [string, string] } => {
    if (score >= 80) {
        return {
            label: 'Optimal Recovery',
            color: '#10B981',
            gradient: ['#10B981', '#059669']
        };
    }
    if (score >= 60) {
        return {
            label: 'Fair Recovery',
            color: '#F59E0B',
            gradient: ['#F59E0B', '#D97706']
        };
    }
    return {
        label: 'Needs Improvement',
        color: '#EF4444',
        gradient: ['#EF4444', '#DC2626']
    };
};

export const SleepScoreGauge: React.FC<SleepScoreGaugeProps> = ({
    score,
    percentile = 85,
}) => {
    const quality = getQualityInfo(score);
    const arcPath = createArc(score);
    const backgroundArc = createArc(100);

    return (
        <View style={styles.container}>
            {/* SVG Gauge */}
            <View style={styles.gaugeContainer}>
                <Svg width={GAUGE_SIZE} height={GAUGE_SIZE / 2 + 20} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE / 2 + 20}`}>
                    <Defs>
                        <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={quality.gradient[0]} />
                            <Stop offset="100%" stopColor={quality.gradient[1]} />
                        </LinearGradient>
                    </Defs>

                    {/* Background Arc */}
                    <Path
                        d={backgroundArc}
                        fill="none"
                        stroke="rgba(0,0,0,0.08)"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                    />

                    {/* Score Arc */}
                    <Path
                        d={arcPath}
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                    />
                </Svg>

                {/* Score Text Overlay */}
                <View style={styles.scoreOverlay}>
                    <Text style={styles.scoreValue}>{score}</Text>
                    <Text style={[styles.qualityLabel, { color: quality.color }]}>
                        {quality.label}
                    </Text>
                </View>
            </View>

            {/* Percentile Context */}
            <View style={styles.contextContainer}>
                <Text style={styles.contextText}>
                    You slept better than <Text style={styles.contextHighlight}>{percentile}%</Text> of users
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    gaugeContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreOverlay: {
        position: 'absolute',
        bottom: 10,
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: '900',
        color: '#1A1A1A',
        letterSpacing: -3,
    },
    qualityLabel: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: -4,
    },
    contextContainer: {
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: SPACING.md,
    },
    contextText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    contextHighlight: {
        color: '#4F46E5',
        fontWeight: '800',
    },
});

export default SleepScoreGauge;
