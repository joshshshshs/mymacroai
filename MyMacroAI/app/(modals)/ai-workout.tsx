/**
 * AI Workout Generator Modal
 * Generates context-aware workout suggestions based on:
 * - Previous workouts
 * - Training preferences
 * - Recovery status
 * - Time of day
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';
import { geminiService } from '@/src/services/ai/GeminiService';

// Workout exercise type
interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
}

interface Workout {
    title: string;
    duration: string;
    focus: string;
    warmup: string[];
    exercises: Exercise[];
    cooldown: string[];
    aiInsight: string;
}

export default function AIWorkoutModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [isLoading, setIsLoading] = useState(true);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { trainingStyles, healthMetrics } = useUserStore();

    const colors = {
        bg: isDark ? '#0F0F0F' : '#F8F9FA',
        card: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
        cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        textMuted: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
        accent: '#FF5C00',
        success: '#10B981',
    };

    // Generate workout based on context
    const generateWorkout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get time of day for context
            const hour = new Date().getHours();
            let timeContext = 'morning';
            if (hour >= 12 && hour < 17) timeContext = 'afternoon';
            else if (hour >= 17) timeContext = 'evening';

            // Build context for AI
            const trainingFocus = trainingStyles.length > 0
                ? trainingStyles.join(', ')
                : 'general fitness';

            const prompt = `Generate a ${timeContext} workout for someone focused on ${trainingFocus}.

Return a JSON object with this exact structure:
{
    "title": "Workout name",
    "duration": "30-45 min",
    "focus": "Main muscle groups",
    "warmup": ["Exercise 1", "Exercise 2"],
    "exercises": [
        {"name": "Exercise", "sets": 3, "reps": "8-12", "rest": "60s", "notes": "optional tip"}
    ],
    "cooldown": ["Stretch 1", "Stretch 2"],
    "aiInsight": "Brief motivation or tip"
}

Make it realistic with 4-6 main exercises. Only return the JSON, no other text.`;

            const response = await geminiService.chat(prompt, []);

            // Parse the JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedWorkout = JSON.parse(jsonMatch[0]);
                setWorkout(parsedWorkout);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Workout generation error:', err);
            setError('Unable to generate workout. Please try again.');

            // Fallback workout
            setWorkout({
                title: 'Full Body Power',
                duration: '35-40 min',
                focus: 'Full Body',
                warmup: ['5 min light cardio', 'Dynamic stretching'],
                exercises: [
                    { name: 'Squats', sets: 4, reps: '10-12', rest: '90s' },
                    { name: 'Push-ups', sets: 3, reps: '12-15', rest: '60s' },
                    { name: 'Dumbbell Rows', sets: 3, reps: '10-12 each', rest: '60s' },
                    { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '60s' },
                    { name: 'Plank', sets: 3, reps: '30-45s hold', rest: '45s' },
                ],
                cooldown: ['Hamstring stretch', 'Quad stretch', 'Child\'s pose'],
                aiInsight: 'Focus on controlled movements and proper form. Stay hydrated!',
            });
        } finally {
            setIsLoading(false);
        }
    }, [trainingStyles]);

    useEffect(() => {
        generateWorkout();
    }, []);

    const handleStartWorkout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // In a full implementation, this would start workout tracking
        router.back();
    };

    const handleRegenerate = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        generateWorkout();
    };

    const handleAskAI = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/(modals)/ai-chat' as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.headerButton, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Workout</Text>
                    <TouchableOpacity
                        onPress={handleRegenerate}
                        style={[styles.headerButton, { backgroundColor: colors.card }]}
                        disabled={isLoading}
                    >
                        <Ionicons name="refresh" size={20} color={isLoading ? colors.textMuted : colors.accent} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <MyMacroAIAvatar size="large" />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Generating your workout...
                            </Text>
                            <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
                        </View>
                    ) : workout ? (
                        <Animated.View entering={FadeIn.duration(300)}>
                            {/* Workout Title Card */}
                            <Animated.View
                                entering={FadeInDown.delay(100).springify()}
                                style={[styles.titleCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                            >
                                <View style={styles.titleHeader}>
                                    <View>
                                        <Text style={[styles.workoutTitle, { color: colors.text }]}>{workout.title}</Text>
                                        <Text style={[styles.workoutMeta, { color: colors.textSecondary }]}>
                                            {workout.duration} | {workout.focus}
                                        </Text>
                                    </View>
                                    <View style={[styles.durationBadge, { backgroundColor: `${colors.accent}15` }]}>
                                        <Ionicons name="time-outline" size={14} color={colors.accent} />
                                        <Text style={[styles.durationText, { color: colors.accent }]}>{workout.duration}</Text>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* AI Insight */}
                            <Animated.View
                                entering={FadeInDown.delay(200).springify()}
                                style={[styles.insightCard, { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}20` }]}
                            >
                                <MyMacroAIAvatar size="small" />
                                <Text style={[styles.insightText, { color: colors.text }]}>{workout.aiInsight}</Text>
                            </Animated.View>

                            {/* Warmup Section */}
                            <Animated.View entering={FadeInDown.delay(300).springify()}>
                                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>WARMUP</Text>
                                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                    {workout.warmup.map((item, index) => (
                                        <View key={index} style={styles.warmupItem}>
                                            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                                            <Text style={[styles.warmupText, { color: colors.text }]}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>

                            {/* Main Exercises */}
                            <Animated.View entering={FadeInDown.delay(400).springify()}>
                                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>EXERCISES</Text>
                                {workout.exercises.map((exercise, index) => (
                                    <View
                                        key={index}
                                        style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                    >
                                        <View style={styles.exerciseNumber}>
                                            <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                                        </View>
                                        <View style={styles.exerciseContent}>
                                            <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
                                            <View style={styles.exerciseDetails}>
                                                <View style={styles.exerciseDetail}>
                                                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Sets</Text>
                                                    <Text style={[styles.detailValue, { color: colors.text }]}>{exercise.sets}</Text>
                                                </View>
                                                <View style={styles.exerciseDetail}>
                                                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Reps</Text>
                                                    <Text style={[styles.detailValue, { color: colors.text }]}>{exercise.reps}</Text>
                                                </View>
                                                <View style={styles.exerciseDetail}>
                                                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Rest</Text>
                                                    <Text style={[styles.detailValue, { color: colors.text }]}>{exercise.rest}</Text>
                                                </View>
                                            </View>
                                            {exercise.notes && (
                                                <Text style={[styles.exerciseNotes, { color: colors.textSecondary }]}>
                                                    {exercise.notes}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </Animated.View>

                            {/* Cooldown Section */}
                            <Animated.View entering={FadeInDown.delay(500).springify()}>
                                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>COOLDOWN</Text>
                                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                    {workout.cooldown.map((item, index) => (
                                        <View key={index} style={styles.warmupItem}>
                                            <Ionicons name="leaf" size={18} color={colors.success} />
                                            <Text style={[styles.warmupText, { color: colors.text }]}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>

                            {/* Ask AI for modifications */}
                            <Animated.View entering={FadeInDown.delay(600).springify()}>
                                <TouchableOpacity
                                    style={[styles.askAIButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                    onPress={handleAskAI}
                                >
                                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
                                    <Text style={[styles.askAIText, { color: colors.textSecondary }]}>
                                        Ask AI for modifications or alternatives
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </TouchableOpacity>
                            </Animated.View>
                        </Animated.View>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
                            <TouchableOpacity
                                style={[styles.retryButton, { backgroundColor: colors.accent }]}
                                onPress={handleRegenerate}
                            >
                                <Text style={styles.retryText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Action */}
                {!isLoading && workout && (
                    <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.bg }]}>
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={handleStartWorkout}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#FF5C00', '#FF8A50']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.startGradient}
                            >
                                <Ionicons name="play" size={22} color="#FFF" />
                                <Text style={styles.startText}>Start Workout</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 20,
    },
    titleCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    titleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    workoutTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    workoutMeta: {
        fontSize: 14,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    durationText: {
        fontSize: 13,
        fontWeight: '600',
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    warmupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    warmupText: {
        fontSize: 15,
    },
    exerciseCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    exerciseNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF5C00',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    exerciseNumberText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
    exerciseContent: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    exerciseDetails: {
        flexDirection: 'row',
        gap: 20,
    },
    exerciseDetail: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    exerciseNotes: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
    },
    askAIButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 12,
    },
    askAIText: {
        flex: 1,
        fontSize: 14,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    startButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FF5C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    startGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    startText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});
