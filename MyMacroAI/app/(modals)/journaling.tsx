/**
 * Journaling Feature - Daily reflections and mood tracking
 * Features:
 * - Manual text entry
 * - Voice dictation (mic button)
 * - Day rating (1-5 stars or emojis)
 * - Quick mood selection
 * - Past entries view
 * - Share context with AI toggle
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';

import { MyMacroAIAvatar } from '@/src/components/ui/MyMacroAIAvatar';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useJournal } from '@/hooks/useJournal';

const MOODS = [
    { emoji: '😊', label: 'Great', color: '#10B981' },
    { emoji: '🙂', label: 'Good', color: '#3B82F6' },
    { emoji: '😐', label: 'Okay', color: '#F59E0B' },
    { emoji: '😔', label: 'Low', color: '#9CA3AF' },
    { emoji: '😤', label: 'Stressed', color: '#EF4444' },
];

const PROMPTS = [
    "What's on your mind today?",
    "How are you feeling right now?",
    "What are you grateful for today?",
    "What challenged you today?",
    "What's one win from today?",
];

export default function JournalingScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { todayEntry, saveEntry, getTodayDate } = useJournal();

    const [journalText, setJournalText] = useState('');
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [dayRating, setDayRating] = useState(0);
    const [shareWithAI, setShareWithAI] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load existing entry for today if it exists
    useEffect(() => {
        if (todayEntry) {
            setJournalText(todayEntry.text || '');
            setSelectedMood(todayEntry.mood);
            setDayRating(todayEntry.dayRating || 0);
            setShareWithAI(todayEntry.shareWithAI ?? true);
        }
    }, [todayEntry]);

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1E1E20' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: '#FF5C00',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        inputBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    };

    // Get random prompt
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

    const handleMoodSelect = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedMood(index);
    };

    const handleStarPress = (rating: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setDayRating(rating);
    };

    const handleMicPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRecording(!isRecording);
        // Voice recording can be integrated with expo-av when ready
    };

    const handleSave = async () => {
        if (isSaving) return;

        // Require at least some content
        if (!journalText.trim() && selectedMood === null && dayRating === 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
        }

        setIsSaving(true);
        try {
            await saveEntry({
                date: getTodayDate(),
                text: journalText.trim(),
                mood: selectedMood,
                dayRating,
                shareWithAI,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (__DEV__) console.error('Failed to save journal:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Daily Journal',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={[styles.saveButtonText, { color: colors.accent }]}>Save</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Date Header */}
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>

                    {/* Mood Selection */}
                    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>How are you feeling?</Text>
                        <View style={styles.moodRow}>
                            {MOODS.map((mood, index) => (
                                <TouchableOpacity
                                    key={mood.label}
                                    style={[
                                        styles.moodButton,
                                        selectedMood === index && { backgroundColor: `${mood.color}20`, borderColor: mood.color },
                                    ]}
                                    onPress={() => handleMoodSelect(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.moodLabel,
                                            { color: selectedMood === index ? mood.color : colors.textSecondary },
                                        ]}
                                    >
                                        {mood.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Day Rating */}
                    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rate your day</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => handleStarPress(star)} activeOpacity={0.7}>
                                    <Ionicons
                                        name={star <= dayRating ? 'star' : 'star-outline'}
                                        size={36}
                                        color={star <= dayRating ? '#F59E0B' : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Journal Entry */}
                    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.entryHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Journal Entry</Text>
                            <TouchableOpacity
                                style={[styles.micButton, isRecording && { backgroundColor: '#EF444420' }]}
                                onPress={handleMicPress}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isRecording ? 'mic' : 'mic-outline'}
                                    size={22}
                                    color={isRecording ? '#EF4444' : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.promptText, { color: colors.textSecondary }]}>{prompt}</Text>
                        <TextInput
                            style={[
                                styles.journalInput,
                                { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Start writing..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            textAlignVertical="top"
                            value={journalText}
                            onChangeText={setJournalText}
                        />
                    </View>

                    {/* Share with AI Toggle */}
                    <TouchableOpacity
                        style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setShareWithAI(!shareWithAI);
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.toggleInfo}>
                            <MyMacroAIAvatar size="small" />
                            <View style={styles.toggleTextContainer}>
                                <Text style={[styles.toggleTitle, { color: colors.text }]}>Share with MyMacro AI</Text>
                                <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                                    AI can consider your journal for insights
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.toggleSwitch, shareWithAI && { backgroundColor: colors.accent }]}>
                            <View style={[styles.toggleThumb, shareWithAI && styles.toggleThumbActive]} />
                        </View>
                    </TouchableOpacity>

                    {/* Past Entries Link */}
                    <TouchableOpacity
                        style={[styles.pastEntriesButton, { borderColor: colors.border }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/(modals)/journal-history' as any);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="book-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.pastEntriesText, { color: colors.textSecondary }]}>
                            View Past Entries
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    sectionCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.xs,
    },
    moodButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    moodEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    micButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(128,128,128,0.1)',
    },
    promptText: {
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
    },
    journalInput: {
        minHeight: 150,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.md,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggleSubtitle: {
        fontSize: 11,
        marginTop: 2,
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(128,128,128,0.3)',
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    pastEntriesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        gap: SPACING.sm,
        borderStyle: 'dashed',
    },
    pastEntriesText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
