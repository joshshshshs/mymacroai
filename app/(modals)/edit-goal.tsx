/**
 * Edit Goal Screen - Select fitness/nutrition goal with auto-sync
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

type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'recomp' | 'performance';

interface GoalOption {
    id: Goal;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    macroFocus: string;
    color: string;
}

const GOALS: GoalOption[] = [
    {
        id: 'fat_loss',
        label: 'Fat Loss',
        description: 'Caloric deficit with high protein',
        icon: 'trending-down-outline',
        macroFocus: '↓ Calories, ↑ Protein',
        color: '#EF4444',
    },
    {
        id: 'muscle_gain',
        label: 'Muscle Gain',
        description: 'Caloric surplus for hypertrophy',
        icon: 'trending-up-outline',
        macroFocus: '↑ Calories, ↑ Protein',
        color: '#10B981',
    },
    {
        id: 'maintenance',
        label: 'Maintenance',
        description: 'Maintain current physique',
        icon: 'swap-horizontal-outline',
        macroFocus: 'Balanced macros',
        color: '#3B82F6',
    },
    {
        id: 'recomp',
        label: 'Body Recomposition',
        description: 'Build muscle while losing fat',
        icon: 'sync-outline',
        macroFocus: '= Calories, ↑↑ Protein',
        color: '#8B5CF6',
    },
    {
        id: 'performance',
        label: 'Athletic Performance',
        description: 'Optimize for training output',
        icon: 'flash-outline',
        macroFocus: '↑ Carbs, ↑ Protein',
        color: '#F59E0B',
    },
];

export default function EditGoalScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const preferences = useUserStore(s => s.preferences);
    const updatePreferences = useUserStore(s => s.actions.updatePreferences);

    // Get current goal from preferences or default
    const currentGoal = (preferences?.fitnessGoals?.[0] as Goal) || 'fat_loss';

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
    const handleSelect = useCallback((goal: Goal) => {
        if (goal !== currentGoal) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            updatePreferences({ fitnessGoals: [goal] });
        }
    }, [currentGoal, updatePreferences]);

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
                    <Text style={[styles.title, { color: colors.text }]}>Goal</Text>
                    <View style={styles.headerButton} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        What's your primary fitness goal?
                    </Text>

                    {GOALS.map((goal, index) => {
                        const isSelected = currentGoal === goal.id;
                        return (
                            <Animated.View
                                key={goal.id}
                                entering={FadeInDown.delay(index * 50).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.goalCard,
                                        {
                                            backgroundColor: isSelected ? colors.cardSelected : colors.card,
                                            borderColor: isSelected ? goal.color : colors.border,
                                        },
                                    ]}
                                    onPress={() => handleSelect(goal.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        { backgroundColor: isSelected ? `${goal.color}20` : `${colors.textSecondary}10` },
                                    ]}>
                                        <Ionicons
                                            name={goal.icon}
                                            size={24}
                                            color={isSelected ? goal.color : colors.textSecondary}
                                        />
                                    </View>
                                    <View style={styles.goalInfo}>
                                        <Text style={[styles.goalLabel, { color: colors.text }]}>
                                            {goal.label}
                                        </Text>
                                        <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>
                                            {goal.description}
                                        </Text>
                                        <View style={[styles.macroChip, { backgroundColor: `${goal.color}10` }]}>
                                            <Text style={[styles.macroText, { color: goal.color }]}>
                                                {goal.macroFocus}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.radioOuter,
                                        { borderColor: isSelected ? goal.color : colors.border },
                                    ]}>
                                        {isSelected && (
                                            <View style={[styles.radioInner, { backgroundColor: goal.color }]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}

                    {/* Info Card */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.infoIcon, { backgroundColor: `${colors.accent}15` }]}>
                                <Ionicons name="sync-outline" size={20} color={colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>Auto-Sync Enabled</Text>
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    Your macro targets adjust based on your goal
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
    goalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 12,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    goalInfo: {
        flex: 1,
    },
    goalLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    goalDescription: {
        fontSize: 13,
        marginBottom: 8,
    },
    macroChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    macroText: {
        fontSize: 11,
        fontWeight: '700',
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
