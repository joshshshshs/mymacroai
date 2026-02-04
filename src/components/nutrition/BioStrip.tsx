/**
 * BioStrip - Hydration and Fasting trackers
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
    waterLiters: number;
    waterGoal: number;
    lastMealTime?: Date;
    onWaterPress: () => void;
}

export const BioStrip: React.FC<Props> = ({ waterLiters, waterGoal, lastMealTime, onWaterPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        water: '#00B4D8',
        fasting: '#A855F7',
    };

    // Calculate fasting time
    const getFastingTime = () => {
        if (!lastMealTime) {
            // Mock: assume last meal was 14 hours ago
            return { hours: 14, minutes: 20 };
        }
        const now = new Date();
        const diff = now.getTime() - lastMealTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    };

    const fasting = getFastingTime();
    const waterPercent = (waterLiters / waterGoal) * 100;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Hydration */}
            <TouchableOpacity
                style={styles.widget}
                onPress={() => { light(); onWaterPress(); }}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="water" size={20} color={colors.water} />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.value, { color: colors.text }]}>{waterLiters.toFixed(1)}L</Text>
                    <View style={styles.miniBar}>
                        <View
                            style={[styles.miniBarFill, {
                                width: `${Math.min(waterPercent, 100)}%`,
                                backgroundColor: colors.water,
                            }]}
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.textSecondary }]} />

            {/* Fasting Timer */}
            <View style={styles.widget}>
                <View style={styles.iconContainer}>
                    <Ionicons name="timer-outline" size={20} color={colors.fasting} />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.value, { color: colors.text }]}>
                        {fasting.hours}h {fasting.minutes}m
                    </Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Fasted</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    widget: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,180,216,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
    label: {
        fontSize: 11,
        marginTop: 1,
    },
    miniBar: {
        height: 4,
        backgroundColor: 'rgba(0,180,216,0.15)',
        borderRadius: 2,
        marginTop: 4,
        overflow: 'hidden',
    },
    miniBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    divider: {
        width: 1,
        height: 32,
        opacity: 0.2,
        marginHorizontal: 12,
    },
});
