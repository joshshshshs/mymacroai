/**
 * SleepAIInsight - AI Coach recommendation based on sleep data
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';

interface SleepAIInsightProps {
    remHigh?: boolean;
    deepLow?: boolean;
    customMessage?: string;
}

const getInsightMessage = (remHigh: boolean, deepLow: boolean): string => {
    if (remHigh && !deepLow) {
        return "Your REM sleep was high last night. You should feel mentally sharp today. Perfect day for deep work or complex tasks.";
    }
    if (deepLow) {
        return "Your deep sleep was lower than usual. Consider limiting caffeine after 2 PM and keeping your room cooler tonight.";
    }
    if (remHigh && deepLow) {
        return "Good REM but low deep sleep. Try some light exercise today to promote better physical recovery tonight.";
    }
    return "Solid sleep architecture last night! Your body completed all restoration cycles. Ready for peak performance today.";
};

export const SleepAIInsight: React.FC<SleepAIInsightProps> = ({
    remHigh = true,
    deepLow = false,
    customMessage,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const message = customMessage || getInsightMessage(remHigh, deepLow);

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#4B5563',
    };

    return (
        <LinearGradient
            colors={isDark
                ? ['rgba(79, 70, 229, 0.15)', 'rgba(147, 51, 234, 0.1)']
                : ['rgba(79, 70, 229, 0.08)', 'rgba(147, 51, 234, 0.05)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* AI Avatar */}
            <View style={styles.avatarContainer}>
                <MyMacroAIAvatar size="medium" accentColor="#4F46E5" />
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
                <Text style={[styles.label, { color: '#4F46E5' }]}>MYMACRO AI SLEEP COACH</Text>
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                    {message}
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
        gap: SPACING.md,
    },
    avatarContainer: {
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 22,
    },
    messageContainer: {
        flex: 1,
    },
    label: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    message: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 20,
    },
});

export default SleepAIInsight;
