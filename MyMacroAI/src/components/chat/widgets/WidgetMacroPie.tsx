/**
 * WidgetMacroPie - Ring chart for macro breakdown
 * Shows Protein, Carbs, Fat as a donut chart
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { WidgetExportButton } from './WidgetExportButton';

interface MacroPieData {
    p: number; // Protein grams
    c: number; // Carbs grams
    f: number; // Fat grams
}

interface Props {
    data: MacroPieData;
}

export const WidgetMacroPie: React.FC<Props> = ({ data }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { p, c, f } = data;

    // Calculate calories
    const proteinCal = p * 4;
    const carbsCal = c * 4;
    const fatCal = f * 9;
    const totalCal = proteinCal + carbsCal + fatCal;

    // Calculate percentages
    const pPercent = totalCal > 0 ? (proteinCal / totalCal) * 100 : 0;
    const cPercent = totalCal > 0 ? (carbsCal / totalCal) * 100 : 0;
    const fPercent = totalCal > 0 ? (fatCal / totalCal) * 100 : 0;

    // SVG ring configuration
    const size = 120;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke dash arrays for each segment
    const pDash = (pPercent / 100) * circumference;
    const cDash = (cPercent / 100) * circumference;
    const fDash = (fPercent / 100) * circumference;

    // Calculate rotation offsets
    const pOffset = 0;
    const cOffset = pPercent * 3.6; // Convert to degrees
    const fOffset = (pPercent + cPercent) * 3.6;

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FAFAF8',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        protein: '#FF6B35', // Vitamin Orange
        carbs: '#4ECDC4',   // Teal
        fat: '#FFE66D',     // Yellow
        track: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <WidgetExportButton data={data} type="MACRO_PIE" />

            <View style={styles.content}>
                {/* Ring Chart */}
                <View style={styles.chartContainer}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            {/* Background track */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={colors.track}
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            {/* Fat segment */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={colors.fat}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${fDash} ${circumference}`}
                                strokeDashoffset={-((pDash + cDash))}
                                strokeLinecap="round"
                            />
                            {/* Carbs segment */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={colors.carbs}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${cDash} ${circumference}`}
                                strokeDashoffset={-(pDash)}
                                strokeLinecap="round"
                            />
                            {/* Protein segment */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={colors.protein}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${pDash} ${circumference}`}
                                strokeLinecap="round"
                            />
                        </G>
                    </Svg>
                    <View style={styles.centerLabel}>
                        <Text style={[styles.totalCal, { color: colors.text }]}>{totalCal}</Text>
                        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>kcal</Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: colors.protein }]} />
                        <View>
                            <Text style={[styles.legendValue, { color: colors.text }]}>{p}g</Text>
                            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Protein</Text>
                        </View>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: colors.carbs }]} />
                        <View>
                            <Text style={[styles.legendValue, { color: colors.text }]}>{c}g</Text>
                            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Carbs</Text>
                        </View>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: colors.fat }]} />
                        <View>
                            <Text style={[styles.legendValue, { color: colors.text }]}>{f}g</Text>
                            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Fat</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginTop: 8,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    chartContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        position: 'absolute',
        alignItems: 'center',
    },
    totalCal: {
        fontSize: 20,
        fontWeight: '800',
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    legend: {
        flex: 1,
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    legendLabel: {
        fontSize: 11,
    },
});
