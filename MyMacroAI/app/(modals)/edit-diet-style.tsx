/**
 * Edit Diet Style Screen - Select dietary preference with auto-sync
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING, COLORS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';

type DietStyle = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegetarian' | 'vegan' | 'mediterranean';

interface DietOption {
    id: DietStyle;
    label: string;
    description: string;
    emoji: string;
    macroRatio: string;
}

const DIET_STYLES: DietOption[] = [
    {
        id: 'balanced',
        label: 'Balanced',
        description: 'Flexible macro distribution',
        emoji: '⚖️',
        macroRatio: '40C / 30P / 30F',
    },
    {
        id: 'high_protein',
        label: 'High Protein',
        description: 'Prioritizes muscle building',
        emoji: '💪',
        macroRatio: '35C / 40P / 25F',
    },
    {
        id: 'low_carb',
        label: 'Low Carb',
        description: 'Reduced carbohydrate intake',
        emoji: '🥩',
        macroRatio: '20C / 35P / 45F',
    },
    {
        id: 'keto',
        label: 'Ketogenic',
        description: 'Very low carb, high fat',
        emoji: '🥑',
        macroRatio: '5C / 25P / 70F',
    },
    {
        id: 'vegetarian',
        label: 'Vegetarian',
        description: 'No meat, includes dairy/eggs',
        emoji: '🥗',
        macroRatio: '50C / 20P / 30F',
    },
    {
        id: 'vegan',
        label: 'Vegan',
        description: 'Plant-based only',
        emoji: '🌱',
        macroRatio: '55C / 20P / 25F',
    },
    {
        id: 'mediterranean',
        label: 'Mediterranean',
        description: 'Whole foods, healthy fats',
        emoji: '🫒',
        macroRatio: '45C / 20P / 35F',
    },
];

export default function EditDietStyleScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const preferences = useUserStore(s => s.preferences);
    const updatePreferences = useUserStore(s => s.actions.updatePreferences);

    // Get current diet from preferences or default
    const currentDiet = (preferences?.dietaryPreferences?.[0] as DietStyle) || 'balanced';

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        cardSelected: isDark ? '#2C2C2E' : '#FFF5F0',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: COLORS.gamification.vitaminOrange,
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderSelected: COLORS.gamification.vitaminOrange,
    };

    // Auto-sync on selection
    const handleSelect = useCallback((diet: DietStyle) => {
        if (diet !== currentDiet) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            updatePreferences({ dietaryPreferences: [diet] });
        }
    }, [currentDiet, updatePreferences]);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.headerButton, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Diet Style</Text>
                    <View style={styles.headerButton} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Choose your preferred eating style
                    </Text>

                    {DIET_STYLES.map((diet, index) => {
                        const isSelected = currentDiet === diet.id;
                        return (
                            <Animated.View
                                key={diet.id}
                                entering={FadeInDown.delay(index * 50).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.dietCard,
                                        {
                                            backgroundColor: isSelected ? colors.cardSelected : colors.card,
                                            borderColor: isSelected ? colors.borderSelected : colors.border,
                                        },
                                    ]}
                                    onPress={() => handleSelect(diet.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.emojiContainer,
                                        { backgroundColor: isSelected ? `${colors.accent}15` : `${colors.textSecondary}08` },
                                    ]}>
                                        <Text style={styles.emoji}>{diet.emoji}</Text>
                                    </View>
                                    <View style={styles.dietInfo}>
                                        <Text style={[styles.dietLabel, { color: colors.text }]}>
                                            {diet.label}
                                        </Text>
                                        <Text style={[styles.dietDescription, { color: colors.textSecondary }]}>
                                            {diet.description}
                                        </Text>
                                        <View style={[styles.ratioChip, { backgroundColor: `${colors.accent}10` }]}>
                                            <Text style={[styles.ratioText, { color: colors.accent }]}>
                                                {diet.macroRatio}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.radioOuter,
                                        { borderColor: isSelected ? colors.accent : colors.border },
                                    ]}>
                                        {isSelected && (
                                            <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}

                    {/* Info Card */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.infoIcon, { backgroundColor: `${colors.accent}15` }]}>
                                <Ionicons name="sync-outline" size={20} color={colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>Auto-Sync Enabled</Text>
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    Your macro ratios adjust based on your diet style
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    dietCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 12,
    },
    emojiContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    emoji: {
        fontSize: 26,
    },
    dietInfo: {
        flex: 1,
    },
    dietLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    dietDescription: {
        fontSize: 13,
        marginBottom: 8,
    },
    ratioChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratioText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 20,
        padding: 18,
        marginTop: SPACING.md,
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
});
