/**
 * ConsistencyGrid - 30-day calendar heatmap
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { DayEntry, DayStatus } from '@/hooks/useStreak';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
    history: DayEntry[];
}

export const ConsistencyGrid: React.FC<Props> = ({ history }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();
    const [selectedDay, setSelectedDay] = useState<DayEntry | null>(null);

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        hit: '#FF5C00',
        partial: 'rgba(255,92,0,0.4)',
        miss: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        frozen: '#00BFFF',
        tooltipBg: isDark ? '#3C3C3E' : '#F5F5F5',
    };

    const getStatusColor = (status: DayStatus) => {
        switch (status) {
            case 'HIT': return colors.hit;
            case 'PARTIAL': return colors.partial;
            case 'MISS': return colors.miss;
            case 'FROZEN': return colors.frozen;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    };

    const handleDayPress = (day: DayEntry) => {
        light();
        setSelectedDay(selectedDay?.date === day.date ? null : day);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Text style={[styles.title, { color: colors.text }]}>Consistency</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gridContent}
            >
                {history.map((day, index) => (
                    <TouchableOpacity
                        key={day.date}
                        style={styles.dayColumn}
                        onPress={() => handleDayPress(day)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                            {getDayLabel(day.date)}
                        </Text>
                        <View style={styles.dayCircleContainer}>
                            {day.status === 'FROZEN' ? (
                                <View style={[styles.frozenCube, { backgroundColor: colors.frozen }]}>
                                    <Ionicons name="snow" size={12} color="#FFFFFF" />
                                </View>
                            ) : (
                                <View
                                    style={[
                                        styles.dayCircle,
                                        { backgroundColor: getStatusColor(day.status) },
                                        day.status === 'MISS' && styles.dayCircleEmpty,
                                        day.status === 'MISS' && { borderColor: colors.miss },
                                    ]}
                                />
                            )}
                        </View>
                        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                            {new Date(day.date).getDate()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Tooltip */}
            {selectedDay && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(100)}
                    style={[styles.tooltip, { backgroundColor: colors.tooltipBg }]}
                >
                    <Text style={[styles.tooltipDate, { color: colors.text }]}>
                        {formatDate(selectedDay.date)}
                    </Text>
                    {selectedDay.calories && (
                        <Text style={[styles.tooltipStat, { color: colors.textSecondary }]}>
                            {selectedDay.calories} kcal
                        </Text>
                    )}
                    {selectedDay.workout && (
                        <Text style={[styles.tooltipStat, { color: colors.textSecondary }]}>
                            {selectedDay.workout}
                        </Text>
                    )}
                    {selectedDay.status === 'FROZEN' && (
                        <Text style={[styles.tooltipStat, { color: colors.frozen }]}>
                            ❄️ Freeze Used
                        </Text>
                    )}
                    {selectedDay.status === 'MISS' && (
                        <Text style={[styles.tooltipStat, { color: colors.textSecondary }]}>
                            Missed
                        </Text>
                    )}
                </Animated.View>
            )}

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.hit }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Hit</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.partial }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Partial</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.frozen }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Freeze</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    gridContent: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 20,
    },
    dayColumn: {
        alignItems: 'center',
        gap: 6,
    },
    dayLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    dayCircleContainer: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    dayCircleEmpty: {
        backgroundColor: 'transparent',
        borderWidth: 2,
    },
    frozenCube: {
        width: 20,
        height: 20,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    tooltip: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    tooltipDate: {
        fontSize: 14,
        fontWeight: '700',
    },
    tooltipStat: {
        fontSize: 12,
        marginTop: 2,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(150,150,150,0.1)',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '500',
    },
});
