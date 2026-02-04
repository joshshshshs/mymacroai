/**
 * StressCard - Stress level with wave line visualization
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { StressLevel } from '@/hooks/useHealthData';
import { useCombinedTheme } from '@/src/design-system/theme';
import { COLORS } from '@/src/design-system/tokens';

interface Props {
    level: StressLevel;
    history: number[];
    onPress?: () => void;
}

export const StressCard: React.FC<Props> = ({ level, history, onPress }) => {
    const { colors: themeColors, isDark } = useCombinedTheme();

    // Map stress levels to semantic colors
    const stressLevelColors = {
        low: COLORS.semantic.recovery.light,      // Green - good recovery
        moderate: COLORS.semantic.nutrition.light, // Orange - caution
        high: COLORS.semantic.stress.light,       // Red/Pink - high stress
    };

    const colors = {
        bg: themeColors.surface,
        text: themeColors.textPrimary,
        textSecondary: themeColors.textSecondary,
        ...stressLevelColors,
    };

    const stressColor = stressLevelColors[level];
    const stressLabel = level.charAt(0).toUpperCase() + level.slice(1);

    // Generate wave path from history
    const width = 140;
    const height = 40;
    const points = history.slice(-12);

    const generatePath = () => {
        if (points.length < 2) return '';

        const stepX = width / (points.length - 1);
        const maxY = Math.max(...points, 50);

        let path = `M 0 ${height - (points[0] / maxY) * height}`;

        for (let i = 1; i < points.length; i++) {
            const x = i * stepX;
            const y = height - (points[i] / maxY) * height;
            const prevX = (i - 1) * stepX;
            const prevY = height - (points[i - 1] / maxY) * height;
            const cpX = (prevX + x) / 2;
            path += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
        }

        return path;
    };

    const Container = onPress ? TouchableOpacity : View;
    
    return (
        <Container onPress={onPress} style={[styles.card, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
                <Ionicons name="fitness" size={18} color={stressColor} />
                <Text style={[styles.label, { color: colors.textSecondary }]}>STRESS</Text>
            </View>

            <Text style={[styles.value, { color: stressColor }]}>{stressLabel}</Text>

            {/* Wave Line */}
            <View style={styles.chartContainer}>
                <Svg width={width} height={height}>
                    <Defs>
                        <LinearGradient id="stressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={stressColor} stopOpacity={0.3} />
                            <Stop offset="100%" stopColor={stressColor} />
                        </LinearGradient>
                    </Defs>
                    <Path
                        d={generatePath()}
                        stroke="url(#stressGradient)"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                    />
                </Svg>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    value: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    chartContainer: {
        marginTop: 4,
    },
});
