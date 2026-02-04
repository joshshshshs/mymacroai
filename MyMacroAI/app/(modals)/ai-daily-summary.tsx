/**
 * AI Daily Summary Modal - Comprehensive day view with adaptive recommendations
 * 
 * Features:
 * - Calendar date picker to view previous days
 * - Full summary of nutrition, health, activity, and more
 * - Adaptive recommendations that update when user takes action
 * - AI coaching insights
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { GradientMeshBackground } from '@/src/components/ui/GradientMeshBackground';
import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';
import { useUserStore } from '@/src/store/UserStore';
import { SPACING } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// THEME COLORS
// ============================================================================

const getColors = (isDark: boolean) => ({
    bg: isDark ? '#0A0A0C' : '#F8F9FA',
    surface: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.95)',
    surfaceAlt: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
    accent: '#FF5C00',
    accentBg: isDark ? 'rgba(255, 92, 0, 0.12)' : 'rgba(255, 92, 0, 0.08)',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    success: '#22C55E',
    successBg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
    warning: '#F59E0B',
    warningBg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    danger: '#EF4444',
    dangerBg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
    blurTint: isDark ? 'dark' : 'light' as 'dark' | 'light',
});

// ============================================================================
// TYPES
// ============================================================================

interface DailySummary {
    date: Date;
    nutrition: {
        calories: { current: number; target: number };
        protein: { current: number; target: number };
        carbs: { current: number; target: number };
        fats: { current: number; target: number };
        water: { current: number; target: number };
    };
    health: {
        steps: number;
        stepsGoal: number;
        sleep: number; // minutes
        sleepGoal: number;
        recoveryScore: number;
        hrv: number;
        rhr: number;
        stress: 'low' | 'medium' | 'high';
    };
    activity: {
        activeMinutes: number;
        workoutsCompleted: number;
        caloriesBurned: number;
    };
    mood?: 'great' | 'good' | 'okay' | 'low';
    journalEntry?: string;
}

interface Recommendation {
    id: string;
    category: 'nutrition' | 'health' | 'activity' | 'recovery';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionLabel: string;
    actionRoute?: string;
    isCompleted: boolean;
    icon: string;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateDailySummary = (date: Date): DailySummary => {
    const isToday = date.toDateString() === new Date().toDateString();
    const dayOfWeek = date.getDay();

    // Vary data by day
    const baseCals = 1800 + (dayOfWeek * 100);
    const baseSteps = 5000 + (dayOfWeek * 1500);

    return {
        date,
        nutrition: {
            calories: { current: isToday ? baseCals : baseCals + 200, target: 2200 },
            protein: { current: isToday ? 120 : 145, target: 160 },
            carbs: { current: isToday ? 180 : 220, target: 250 },
            fats: { current: isToday ? 55 : 70, target: 75 },
            water: { current: isToday ? 1.5 : 2.2, target: 2.5 },
        },
        health: {
            steps: isToday ? baseSteps : baseSteps + 2000,
            stepsGoal: 10000,
            sleep: isToday ? 380 : 420 + (dayOfWeek * 10),
            sleepGoal: 480,
            recoveryScore: isToday ? 68 : 75 + (dayOfWeek * 2),
            hrv: 42 + (dayOfWeek * 3),
            rhr: 58 + (dayOfWeek % 4),
            stress: isToday ? 'medium' : dayOfWeek > 4 ? 'low' : 'medium',
        },
        activity: {
            activeMinutes: isToday ? 25 : 45 + (dayOfWeek * 5),
            workoutsCompleted: dayOfWeek % 2,
            caloriesBurned: isToday ? 180 : 350 + (dayOfWeek * 30),
        },
        mood: isToday ? 'good' : dayOfWeek > 3 ? 'great' : 'good',
    };
};

const generateRecommendations = (summary: DailySummary): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const { nutrition, health, activity } = summary;

    // Protein check
    const proteinPercent = (nutrition.protein.current / nutrition.protein.target) * 100;
    if (proteinPercent < 80) {
        recommendations.push({
            id: 'protein-low',
            category: 'nutrition',
            priority: 'high',
            title: 'Boost your protein intake',
            description: `You're at ${Math.round(proteinPercent)}% of your protein goal. Add a protein shake or Greek yogurt to hit your target.`,
            actionLabel: 'Log Protein',
            actionRoute: '/(modals)/log-meal',
            isCompleted: false,
            icon: '🥩',
        });
    }

    // Water check
    const waterPercent = (nutrition.water.current / nutrition.water.target) * 100;
    if (waterPercent < 60) {
        recommendations.push({
            id: 'water-low',
            category: 'nutrition',
            priority: 'high',
            title: 'Stay hydrated',
            description: `Only ${nutrition.water.current}L logged. Drink ${(nutrition.water.target - nutrition.water.current).toFixed(1)}L more to hit your goal.`,
            actionLabel: 'Log Water',
            actionRoute: '/(modals)/water-log',
            isCompleted: false,
            icon: '💧',
        });
    }

    // Steps check
    const stepsPercent = (health.steps / health.stepsGoal) * 100;
    if (stepsPercent < 50) {
        recommendations.push({
            id: 'steps-low',
            category: 'activity',
            priority: 'medium',
            title: 'Get moving!',
            description: `${health.steps.toLocaleString()} of ${health.stepsGoal.toLocaleString()} steps. A 15-min walk would add ~1,500 steps.`,
            actionLabel: 'Track Walk',
            isCompleted: false,
            icon: '🚶',
        });
    }

    // Sleep check
    if (health.sleep < 360) {
        recommendations.push({
            id: 'sleep-low',
            category: 'recovery',
            priority: 'high',
            title: 'Prioritize sleep tonight',
            description: 'Under 6 hours is hurting your recovery. Aim for 7-8 hours for optimal performance.',
            actionLabel: 'Set Reminder',
            isCompleted: false,
            icon: '😴',
        });
    }

    // Recovery check
    if (health.recoveryScore < 70) {
        recommendations.push({
            id: 'recovery-low',
            category: 'recovery',
            priority: 'medium',
            title: 'Take it easy today',
            description: 'Recovery score is below optimal. Consider lighter activity or rest day.',
            actionLabel: 'View Recovery',
            actionRoute: '/(modals)/recovery',
            isCompleted: false,
            icon: '🔋',
        });
    }

    // Stress check
    if (health.stress === 'high') {
        recommendations.push({
            id: 'stress-high',
            category: 'health',
            priority: 'high',
            title: 'Manage your stress',
            description: 'High stress detected. Try a 5-min breathing exercise or short meditation.',
            actionLabel: 'Breathe',
            isCompleted: false,
            icon: '🧘',
        });
    }

    // Positive reinforcement if doing well
    if (proteinPercent >= 90 && waterPercent >= 80 && stepsPercent >= 80) {
        recommendations.push({
            id: 'doing-great',
            category: 'nutrition',
            priority: 'low',
            title: 'Crushing it! 🔥',
            description: 'You\'re on track with nutrition, hydration, and activity. Keep it up!',
            actionLabel: 'View Progress',
            isCompleted: true,
            icon: '🏆',
        });
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};

// ============================================================================
// COMPONENTS
// ============================================================================

const CalendarStrip: React.FC<{
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    colors: ReturnType<typeof getColors>;
}> = ({ selectedDate, onDateSelect, colors }) => {
    const dates = useMemo(() => {
        const result: Date[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push(date);
        }
        return result;
    }, []);

    const formatDay = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
    const formatDate = (date: Date) => date.getDate().toString();
    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

    return (
        <View style={[styles.calendarStrip, { borderColor: colors.border }]}>
            {dates.map((date, index) => (
                <TouchableOpacity
                    key={date.toISOString()}
                    onPress={() => {
                        Haptics.selectionAsync();
                        onDateSelect(date);
                    }}
                    style={[
                        styles.calendarDay,
                        isSelected(date) && [styles.calendarDaySelected, { backgroundColor: colors.accent }],
                    ]}
                >
                    <Text style={[
                        styles.calendarDayName,
                        { color: isSelected(date) ? '#FFF' : colors.textMuted },
                    ]}>
                        {formatDay(date)}
                    </Text>
                    <Text style={[
                        styles.calendarDayNum,
                        { color: isSelected(date) ? '#FFF' : colors.text },
                    ]}>
                        {formatDate(date)}
                    </Text>
                    {isToday(date) && !isSelected(date) && (
                        <View style={[styles.todayDot, { backgroundColor: colors.accent }]} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const StatCard: React.FC<{
    label: string;
    value: string;
    subValue?: string;
    icon: string;
    progress?: number;
    color: string;
    colors: ReturnType<typeof getColors>;
}> = ({ label, value, subValue, icon, progress, color, colors }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statCardHeader}>
            <Text style={styles.statCardIcon}>{icon}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
        <Text style={[styles.statCardValue, { color: colors.text }]}>{value}</Text>
        {subValue && <Text style={[styles.statCardSub, { color: colors.textSecondary }]}>{subValue}</Text>}
        {progress !== undefined && (
            <View style={[styles.progressBar, { backgroundColor: colors.surfaceAlt }]}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
                    ]}
                />
            </View>
        )}
    </View>
);

const RecommendationCard: React.FC<{
    recommendation: Recommendation;
    index: number;
    colors: ReturnType<typeof getColors>;
    onAction: (rec: Recommendation) => void;
}> = ({ recommendation, index, colors, onAction }) => {
    const priorityColors = {
        high: colors.danger,
        medium: colors.warning,
        low: colors.success,
    };

    const priorityBgColors = {
        high: colors.dangerBg,
        medium: colors.warningBg,
        low: colors.successBg,
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
            <TouchableOpacity
                onPress={() => onAction(recommendation)}
                activeOpacity={0.8}
                style={[
                    styles.recCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    recommendation.isCompleted && { opacity: 0.7 },
                ]}
            >
                <View style={styles.recLeft}>
                    <View style={[styles.recIcon, { backgroundColor: priorityBgColors[recommendation.priority] }]}>
                        <Text style={styles.recIconText}>{recommendation.icon}</Text>
                    </View>
                    <View style={styles.recContent}>
                        <View style={styles.recTitleRow}>
                            <Text style={[styles.recTitle, { color: colors.text }]}>{recommendation.title}</Text>
                            {recommendation.isCompleted && (
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            )}
                        </View>
                        <Text style={[styles.recDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                            {recommendation.description}
                        </Text>
                    </View>
                </View>
                {!recommendation.isCompleted && (
                    <View style={[styles.recAction, { backgroundColor: colors.accentBg }]}>
                        <Text style={[styles.recActionText, { color: colors.accent }]}>{recommendation.actionLabel}</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const AISummaryCard: React.FC<{
    summary: DailySummary;
    colors: ReturnType<typeof getColors>;
}> = ({ summary, colors }) => {
    const generateNarrative = () => {
        const { nutrition, health, activity } = summary;
        const isToday = summary.date.toDateString() === new Date().toDateString();
        const dayPrefix = isToday ? "Today" : summary.date.toLocaleDateString('en-US', { weekday: 'long' });

        const calPercent = Math.round((nutrition.calories.current / nutrition.calories.target) * 100);
        const proteinPercent = Math.round((nutrition.protein.current / nutrition.protein.target) * 100);
        const stepsPercent = Math.round((health.steps / health.stepsGoal) * 100);

        let intro = '';
        let body = '';
        let outro = '';

        // Overall assessment
        if (calPercent >= 85 && calPercent <= 110 && proteinPercent >= 80 && stepsPercent >= 70) {
            intro = `${dayPrefix} is shaping up nicely! 🔥`;
            body = `You're at ${calPercent}% of your calorie goal with solid protein intake (${proteinPercent}%). `;
        } else if (calPercent < 60) {
            intro = `${dayPrefix} needs some catch-up! ⚡`;
            body = `You're only at ${calPercent}% of your calorie goal. Don't let the day slip—fuel up! `;
        } else {
            intro = `${dayPrefix} is progressing. 💪`;
            body = `Calories at ${calPercent}%, protein at ${proteinPercent}%. `;
        }

        // Activity commentary
        if (stepsPercent >= 100) {
            body += `Crushed your step goal with ${health.steps.toLocaleString()} steps! `;
        } else if (stepsPercent < 50) {
            body += `Step count is low—try a quick walk. `;
        }

        // Recovery/sleep
        if (health.sleep < 360) {
            outro = `Sleep was short last night. Prioritize rest tonight for better recovery.`;
        } else if (health.recoveryScore >= 80) {
            outro = `Recovery is excellent—you could push harder today if you want!`;
        } else {
            outro = `Keep listening to your body and staying consistent.`;
        }

        return `${intro}\n\n${body}\n\n${outro}`;
    };

    return (
        <Animated.View entering={FadeIn.duration(400)}>
            <View style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <LinearGradient
                    colors={[colors.accent, '#FF8A50']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.aiCardAccent}
                />
                <View style={styles.aiCardHeader}>
                    <MyMacroAIAvatar size="medium" />
                    <View>
                        <Text style={[styles.aiCardTitle, { color: colors.text }]}>MyMacro AI Summary</Text>
                        <Text style={[styles.aiCardDate, { color: colors.textMuted }]}>
                            {summary.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.aiCardText, { color: colors.text }]}>
                    {generateNarrative()}
                </Text>
            </View>
        </Animated.View>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIDailySummaryModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getColors(isDark);
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [completedRecs, setCompletedRecs] = useState<Set<string>>(new Set());

    const summary = useMemo(() => generateDailySummary(selectedDate), [selectedDate]);
    const recommendations = useMemo(() => {
        const recs = generateRecommendations(summary);
        return recs.map(rec => ({
            ...rec,
            isCompleted: completedRecs.has(rec.id),
        }));
    }, [summary, completedRecs]);

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleRecommendationAction = (rec: Recommendation) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (rec.actionRoute) {
            router.push(rec.actionRoute as any);
        } else {
            // Mark as completed for demo
            setCompletedRecs(prev => new Set([...prev, rec.id]));
        }
    };

    const { nutrition, health, activity } = summary;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <GradientMeshBackground variant="ai" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Summary</Text>
                    <View style={{ width: 44 }} />
                </Animated.View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Calendar Strip */}
                    <CalendarStrip
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        colors={colors}
                    />

                    {/* AI Summary Card */}
                    <AISummaryCard summary={summary} colors={colors} />

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
                                <View style={[styles.recBadge, { backgroundColor: colors.accentBg }]}>
                                    <Text style={[styles.recBadgeText, { color: colors.accent }]}>{recommendations.filter(r => !r.isCompleted).length} active</Text>
                                </View>
                            </View>
                            {recommendations.map((rec, index) => (
                                <RecommendationCard
                                    key={rec.id}
                                    recommendation={rec}
                                    index={index}
                                    colors={colors}
                                    onAction={handleRecommendationAction}
                                />
                            ))}
                        </View>
                    )}

                    {/* Nutrition Stats */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrition</Text>
                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Calories"
                                value={`${nutrition.calories.current.toLocaleString()}`}
                                subValue={`/ ${nutrition.calories.target.toLocaleString()} kcal`}
                                icon="🔥"
                                progress={(nutrition.calories.current / nutrition.calories.target) * 100}
                                color={colors.accent}
                                colors={colors}
                            />
                            <StatCard
                                label="Protein"
                                value={`${nutrition.protein.current}g`}
                                subValue={`/ ${nutrition.protein.target}g`}
                                icon="🥩"
                                progress={(nutrition.protein.current / nutrition.protein.target) * 100}
                                color="#22C55E"
                                colors={colors}
                            />
                            <StatCard
                                label="Water"
                                value={`${nutrition.water.current.toFixed(1)}L`}
                                subValue={`/ ${nutrition.water.target}L`}
                                icon="💧"
                                progress={(nutrition.water.current / nutrition.water.target) * 100}
                                color="#3B82F6"
                                colors={colors}
                            />
                            <StatCard
                                label="Carbs"
                                value={`${nutrition.carbs.current}g`}
                                subValue={`/ ${nutrition.carbs.target}g`}
                                icon="🍞"
                                progress={(nutrition.carbs.current / nutrition.carbs.target) * 100}
                                color="#A855F7"
                                colors={colors}
                            />
                        </View>
                    </View>

                    {/* Health Stats */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Health & Activity</Text>
                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Steps"
                                value={health.steps.toLocaleString()}
                                subValue={`/ ${health.stepsGoal.toLocaleString()}`}
                                icon="🚶"
                                progress={(health.steps / health.stepsGoal) * 100}
                                color="#22C55E"
                                colors={colors}
                            />
                            <StatCard
                                label="Sleep"
                                value={`${Math.floor(health.sleep / 60)}h ${health.sleep % 60}m`}
                                subValue={`/ ${Math.floor(health.sleepGoal / 60)}h goal`}
                                icon="😴"
                                progress={(health.sleep / health.sleepGoal) * 100}
                                color="#6366F1"
                                colors={colors}
                            />
                            <StatCard
                                label="Recovery"
                                value={`${health.recoveryScore}%`}
                                subValue={health.recoveryScore >= 80 ? 'Optimal' : health.recoveryScore >= 60 ? 'Moderate' : 'Low'}
                                icon="🔋"
                                progress={health.recoveryScore}
                                color={health.recoveryScore >= 70 ? '#22C55E' : '#F59E0B'}
                                colors={colors}
                            />
                            <StatCard
                                label="Active Min"
                                value={`${activity.activeMinutes}`}
                                subValue="minutes today"
                                icon="⚡"
                                color={colors.accent}
                                colors={colors}
                            />
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },

    content: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
    },

    // Calendar Strip
    calendarStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
        paddingVertical: SPACING.sm,
    },
    calendarDay: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        position: 'relative',
    },
    calendarDaySelected: {
        shadowColor: '#FF5C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    calendarDayName: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    calendarDayNum: {
        fontSize: 16,
        fontWeight: '700',
    },
    todayDot: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
    },

    // AI Card
    aiCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    aiCardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    aiCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: SPACING.md,
    },
    aiCardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    aiCardDate: {
        fontSize: 12,
        marginTop: 2,
    },
    aiCardText: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '500',
    },

    // Section
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    recBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    recBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statCard: {
        width: (SCREEN_WIDTH - SPACING.lg * 2 - 10) / 2,
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    statCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    statCardIcon: {
        fontSize: 14,
    },
    statCardLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    statCardValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    statCardSub: {
        fontSize: 12,
        marginTop: 2,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Recommendation Card
    recCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    recLeft: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    recIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recIconText: {
        fontSize: 20,
    },
    recContent: {
        flex: 1,
    },
    recTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    recTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    recDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    recAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    recActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
