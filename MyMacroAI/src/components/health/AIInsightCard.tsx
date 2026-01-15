/**
 * AIInsightCard - Dynamic coaching advice based on health data
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HealthData } from '@/hooks/useHealthData';

interface Props {
    data: HealthData;
}

function generateInsight(data: HealthData): string {
    const { recoveryScore, hrv, hrvTrend, sleep, stress, strain, capacity } = data;

    // Check for overtraining
    if (strain > capacity) {
        return "⚠️ You're pushing past your capacity today. Consider swapping intense work for mobility or a recovery walk. Your body needs the downtime.";
    }

    // Check for low HRV
    if (hrvTrend === 'down' && recoveryScore < 70) {
        return "Your HRV is down but sleep was solid. You might be fighting off something mild. I'd swap heavy lifts for a lighter volume day and prioritize hydration.";
    }

    // Check for poor sleep
    if (sleep.totalMinutes < 360) {
        return "Under 6 hours of sleep is impacting recovery. Tonight, aim for an earlier bedtime. Even 30 extra minutes will boost tomorrow's score.";
    }

    // Check for stress
    if (stress === 'high') {
        return "Stress is elevated today. A 10-minute walk or breathing session would help bring your nervous system back to baseline before training.";
    }

    // Good recovery
    if (recoveryScore >= 80) {
        return "🔥 Systems are green! Today's a great day to push intensity. Your body is primed for performance—use it.";
    }

    // Default moderate advice
    return "You're in the adaptation zone. Listen to your body—moderate intensity is ideal today. Focus on technique over PRs.";
}

export const AIInsightCard: React.FC<Props> = ({ data }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const insight = generateInsight(data);

    const colors = {
        bg: isDark ? 'rgba(44,44,46,0.9)' : 'rgba(255,255,255,0.95)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93',
        accent: '#FF5C00',
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
                <View style={[styles.card, { backgroundColor: colors.bg }]}>
                    <View style={styles.header}>
                        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={[styles.title, { color: colors.text }]}>Coach Insight</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Based on today's data</Text>
                        </View>
                    </View>
                    <Text style={[styles.insight, { color: colors.text }]}>{insight}</Text>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
    },
    blur: {
        overflow: 'hidden',
        borderRadius: 24,
    },
    card: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 11,
        marginTop: 1,
    },
    insight: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
});
