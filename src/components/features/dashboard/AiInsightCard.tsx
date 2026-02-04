import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { aiContextService } from '@/src/services/ai/AIContextService';

export const AiInsightCard: React.FC = () => {
    const router = useRouter();
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInsight();
    }, []);

    const loadInsight = async () => {
        try {
            setIsLoading(true);
            const aiInsight = await aiContextService.generateInsight();
            setInsight(aiInsight);
        } catch (error) {
            console.warn('Failed to load AI insight:', error);
            setInsight('Tracking on point. Keep the momentum.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePress = () => {
        router.push('/(tabs)/ai');
    };

    return (
        <SoftGlassCard variant="soft" style={styles.container} onPress={handlePress}>
            {/* Lime Border Highlight (Active Intelligence Indicator) */}
            <View style={[StyleSheet.absoluteFill, styles.limeBorder]} pointerEvents="none" />

            <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={22} color="#84CC16" />
            </View>
            <View style={styles.textContainer}>
                <ThemedText variant="caption" style={styles.label}>AI INSIGHT</ThemedText>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#84CC16" style={{ alignSelf: 'flex-start' }} />
                ) : (
                    <ThemedText variant="body" style={styles.message}>
                        {insight}
                    </ThemedText>
                )}
            </View>
        </SoftGlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
        overflow: 'hidden',
    },
    limeBorder: {
        borderWidth: 1.5,
        borderColor: 'rgba(132, 204, 22, 0.5)', // Lime-500 with transparency
        borderRadius: 24, // Match SoftGlassCard radius
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(132, 204, 22, 0.15)', // Lime glow bg
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    label: {
        color: '#84CC16', // Lime-500
        fontWeight: '700',
        letterSpacing: 1.5,
        fontSize: 10,
        marginBottom: 4,
    },
    message: {
        color: '#E2E8F0', // Slate-200
        lineHeight: 20,
        fontSize: 14,
    },
});
