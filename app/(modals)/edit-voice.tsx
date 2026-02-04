/**
 * Edit AI Voice Screen - Select AI coach voice persona with auto-sync
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
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING, COLORS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';

export type VoiceId = 'coach_alex' | 'coach_maya' | 'coach_marcus' | 'coach_sophia';

interface VoiceOption {
    id: VoiceId;
    name: string;
    gender: 'male' | 'female';
    personality: string;
    description: string;
    samplePhrase: string;
    gradientColors: [string, string];
    toneDescription: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
    {
        id: 'coach_alex',
        name: 'Coach Alex',
        gender: 'male',
        personality: 'Motivational & Direct',
        description: 'High-energy coach who pushes you to your limits with tough love',
        samplePhrase: '"No excuses. You\'ve got this. Let\'s crush today\'s protein goal!"',
        gradientColors: ['#3B82F6', '#1D4ED8'],
        toneDescription: 'Direct, no-nonsense, military-style motivation',
    },
    {
        id: 'coach_maya',
        name: 'Coach Maya',
        gender: 'female',
        personality: 'Supportive & Nurturing',
        description: 'Warm and encouraging with science-backed holistic advice',
        samplePhrase: '"You\'re doing great! Let\'s find a balanced snack to keep you on track."',
        gradientColors: ['#EC4899', '#BE185D'],
        toneDescription: 'Empathetic, patient, wellness-focused guidance',
    },
    {
        id: 'coach_marcus',
        name: 'Coach Marcus',
        gender: 'male',
        personality: 'Analytical & Strategic',
        description: 'Data-driven approach with precision focus on optimization',
        samplePhrase: '"Based on your macros, you need 45g protein. Here are the optimal options."',
        gradientColors: ['#10B981', '#047857'],
        toneDescription: 'Precise, metrics-focused, strategic planning',
    },
    {
        id: 'coach_sophia',
        name: 'Coach Sophia',
        gender: 'female',
        personality: 'Energetic & Fun',
        description: 'Upbeat coach who makes nutrition feel like an exciting adventure',
        samplePhrase: '"Ooh, nice choice! That\'s going to fuel your workout perfectly!"',
        gradientColors: ['#F59E0B', '#D97706'],
        toneDescription: 'Enthusiastic, playful, positive reinforcement',
    },
];

export default function EditVoiceScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const preferences = useUserStore(s => s.preferences);
    const updatePreferences = useUserStore(s => s.actions.updatePreferences);

    // Get current voice from preferences or default
    const currentVoice = (preferences as any)?.aiVoice || 'coach_maya';

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        cardSelected: isDark ? '#2C2C2E' : '#FAFAFA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: COLORS.gamification.vitaminOrange,
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    };

    // Auto-sync on selection
    const handleSelect = useCallback((voiceId: VoiceId) => {
        if (voiceId !== currentVoice) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            updatePreferences({ aiVoice: voiceId } as any);
        }
    }, [currentVoice, updatePreferences]);

    const selectedVoiceData = VOICE_OPTIONS.find(v => v.id === currentVoice);

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
                    <Text style={[styles.title, { color: colors.text }]}>AI Voice</Text>
                    <View style={styles.headerButton} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Choose your AI coach personality
                    </Text>

                    {/* Voice Cards */}
                    <View style={styles.voiceGrid}>
                        {VOICE_OPTIONS.map((voice, index) => {
                            const isSelected = currentVoice === voice.id;
                            return (
                                <Animated.View
                                    key={voice.id}
                                    entering={FadeInDown.delay(index * 80).duration(400)}
                                    style={styles.voiceCardWrapper}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.voiceCard,
                                            {
                                                backgroundColor: colors.card,
                                                borderColor: isSelected ? voice.gradientColors[0] : colors.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => handleSelect(voice.id)}
                                        activeOpacity={0.7}
                                    >
                                        {/* Avatar */}
                                        <LinearGradient
                                            colors={voice.gradientColors}
                                            style={styles.avatar}
                                        >
                                            <Ionicons
                                                name={voice.gender === 'male' ? 'person' : 'person'}
                                                size={28}
                                                color="#FFFFFF"
                                            />
                                        </LinearGradient>

                                        {/* Info */}
                                        <Text style={[styles.voiceName, { color: colors.text }]}>
                                            {voice.name}
                                        </Text>
                                        <Text style={[styles.voicePersonality, { color: voice.gradientColors[0] }]}>
                                            {voice.personality}
                                        </Text>

                                        {/* Gender Badge */}
                                        <View style={[styles.genderBadge, { backgroundColor: `${voice.gradientColors[0]}15` }]}>
                                            <Ionicons
                                                name={voice.gender === 'male' ? 'male' : 'female'}
                                                size={12}
                                                color={voice.gradientColors[0]}
                                            />
                                            <Text style={[styles.genderText, { color: voice.gradientColors[0] }]}>
                                                {voice.gender === 'male' ? 'Male' : 'Female'}
                                            </Text>
                                        </View>

                                        {/* Selection indicator */}
                                        {isSelected && (
                                            <View style={[styles.selectedBadge, { backgroundColor: voice.gradientColors[0] }]}>
                                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Preview Card */}
                    {selectedVoiceData && (
                        <Animated.View entering={FadeIn.duration(300)}>
                            <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.previewHeader}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
                                    <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                                        VOICE PREVIEW
                                    </Text>
                                    <View style={[styles.liveBadge, { backgroundColor: `${colors.accent}15` }]}>
                                        <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
                                        <Text style={[styles.liveText, { color: colors.accent }]}>ACTIVE</Text>
                                    </View>
                                </View>
                                <Text style={[styles.previewDescription, { color: colors.textSecondary }]}>
                                    {selectedVoiceData.description}
                                </Text>
                                <Text style={[styles.toneLabel, { color: colors.text }]}>
                                    Tone: {selectedVoiceData.toneDescription}
                                </Text>
                                <View style={[styles.sampleBubble, { backgroundColor: `${selectedVoiceData.gradientColors[0]}10` }]}>
                                    <Text style={[styles.sampleText, { color: colors.text }]}>
                                        {selectedVoiceData.samplePhrase}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}

                    {/* Info Card */}
                    <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.infoIcon, { backgroundColor: `${colors.accent}15` }]}>
                                <Ionicons name="sync-outline" size={20} color={colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>Auto-Sync Enabled</Text>
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    Your AI coach personality changes instantly
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
    voiceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    voiceCardWrapper: {
        width: '48%',
        marginBottom: 12,
    },
    voiceCard: {
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    voiceName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    voicePersonality: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    genderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    genderText: {
        fontSize: 10,
        fontWeight: '700',
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    previewLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        flex: 1,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    previewDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    toneLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 16,
    },
    sampleBubble: {
        borderRadius: 16,
        padding: 16,
    },
    sampleText: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 20,
        padding: 18,
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
