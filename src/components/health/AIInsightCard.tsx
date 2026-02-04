/**
 * AIInsightCard - Dynamic coaching advice based on health data
 * Clickable to open full AI Daily Summary modal
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { HealthData } from '@/hooks/useHealthData';
import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';

interface Props {
    data: HealthData;
}

function generateInsight(data: HealthData): string {
    const { recoveryScore, hrv, hrvTrend, sleep, stress, strain, capacity } = data;

    // Check for overtraining
    if (strain > capacity) {
        return "Hold up champ – you're redlining today! 🛑 Swap the intensity for some mobility work or a recovery walk. Your gains happen during rest, not just the grind.";
    }

    // Check for low HRV
    if (hrvTrend === 'down' && recoveryScore < 70) {
        return "Your HRV dipped but sleep looks solid. Listen – your body might be fighting something off. Dial back the weights, hydrate like a pro, and let your system do its thing.";
    }

    // Check for poor sleep
    if (sleep.totalMinutes < 360) {
        return "Real talk: under 6 hours is sabotaging your gains. 😴 Tonight, get to bed 30 mins earlier. Your future self will thank you with a boosted recovery score.";
    }

    // Check for stress
    if (stress === 'high') {
        return "Stress levels are elevated. Before you train, take 10 mins for a walk or breathing session. Calm the nervous system, then crush the workout. Trust the process. 🧘";
    }

    // Good recovery
    if (recoveryScore >= 80) {
        return "🔥 You're in the green zone! Today's YOUR day to push hard. Body's primed, systems are go – make it count and leave nothing on the table!";
    }

    // Default moderate advice
    return "You're in the adaptation zone – that's where growth happens. 💪 Moderate intensity today, focus on form over PRs. Consistency beats intensity every time.";
}

export const AIInsightCard: React.FC<Props> = ({ data }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const insight = generateInsight(data);

    const colors = {
        bg: isDark ? 'rgba(44,44,46,0.9)' : 'rgba(255,255,255,0.95)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93',
        textMuted: isDark ? 'rgba(255,255,255,0.4)' : '#AEAEB2',
        accent: '#FF5C00',
        accentBg: isDark ? 'rgba(255,92,0,0.15)' : 'rgba(255,92,0,0.08)',
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/(modals)/ai-daily-summary' as any);
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.container}>
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
                    <View style={[styles.card, { backgroundColor: colors.bg }]}>
                        <View style={styles.header}>
                            <MyMacroAIAvatar size="medium" />
                            <View style={styles.headerText}>
                                <Text style={[styles.title, { color: colors.text }]}>MyMacro AI</Text>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Based on today's data</Text>
                            </View>
                        </View>
                        <Text style={[styles.insight, { color: colors.text }]} numberOfLines={3}>{insight}</Text>

                        {/* Tap for full summary hint */}
                        <View style={[styles.tapHint, { backgroundColor: colors.accentBg }]}>
                            <Ionicons name="expand-outline" size={14} color={colors.accent} />
                            <Text style={[styles.tapHintText, { color: colors.accent }]}>
                                Tap for full summary
                            </Text>
                            <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                        </View>
                    </View>
                </BlurView>
            </View>
        </TouchableOpacity>
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
    headerText: {
        flex: 1,
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
    tapHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    tapHintText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
