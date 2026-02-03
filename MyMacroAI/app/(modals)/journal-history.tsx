/**
 * Journal History - View past journal entries
 * Shows entries chronologically with mood and rating
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SPACING, RADIUS } from '@/src/design-system/tokens';

interface JournalEntry {
    id: string;
    date: Date;
    mood: { emoji: string; label: string; color: string };
    rating: number;
    text: string;
    sharedWithAI: boolean;
}

export default function JournalHistoryScreen() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1E1E20' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: '#FF5C00',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Journal History',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/(modals)/journaling' as any);
                            }}
                        >
                            <Ionicons name="add-circle" size={28} color={colors.accent} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {entries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Journal Entries</Text>
                        <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                            Start journaling to track your thoughts and progress
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyStateCTA, { backgroundColor: colors.accent }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/(modals)/journaling' as any);
                            }}
                        >
                            <Text style={styles.emptyStateCTAText}>Write Your First Entry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Stats Summary */}
                        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{entries.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Entries</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {entries.length > 0 ? (entries.reduce((acc, e) => acc + e.rating, 0) / entries.length).toFixed(1) : '-'}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Rating</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>-</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Top Mood</Text>
                            </View>
                        </View>

                        {/* Entries List */}
                        {entries.map((entry, index) => (
                    <Animated.View
                        key={entry.id}
                        entering={FadeInDown.delay(index * 80).springify()}
                    >
                        <TouchableOpacity
                            style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            activeOpacity={0.7}
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        >
                            {/* Header Row */}
                            <View style={styles.entryHeader}>
                                <View style={styles.entryDateRow}>
                                    <Text style={[styles.entryDate, { color: colors.text }]}>
                                        {formatDate(entry.date)}
                                    </Text>
                                    {entry.sharedWithAI && (
                                        <View style={[styles.aiTag, { backgroundColor: `${colors.accent}15` }]}>
                                            <Ionicons name="sparkles" size={10} color={colors.accent} />
                                            <Text style={[styles.aiTagText, { color: colors.accent }]}>AI</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.moodRating}>
                                    <Text style={styles.moodEmoji}>{entry.mood.emoji}</Text>
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={star <= entry.rating ? 'star' : 'star-outline'}
                                                size={12}
                                                color={star <= entry.rating ? '#F59E0B' : colors.textSecondary}
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Entry Text */}
                            <Text
                                style={[styles.entryText, { color: colors.textSecondary }]}
                                numberOfLines={3}
                            >
                                {entry.text}
                            </Text>

                            {/* Chevron */}
                            <View style={styles.chevron}>
                                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                        ))}

                        {/* Bottom Padding */}
                        <View style={{ height: 100 }} />
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    statsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 32,
    },
    entryCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        marginBottom: SPACING.md,
        position: 'relative',
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    entryDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    entryDate: {
        fontSize: 15,
        fontWeight: '600',
    },
    aiTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 3,
    },
    aiTagText: {
        fontSize: 9,
        fontWeight: '700',
    },
    moodRating: {
        alignItems: 'flex-end',
        gap: 4,
    },
    moodEmoji: {
        fontSize: 20,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    entryText: {
        fontSize: 14,
        lineHeight: 20,
    },
    chevron: {
        position: 'absolute',
        right: SPACING.md,
        top: '50%',
        marginTop: -8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyStateCTA: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
    },
    emptyStateCTAText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
