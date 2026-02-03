/**
 * Roadmap Screen - Feature Voting Board
 * 
 * Users can submit, view, and vote on feature requests.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
    ActivityIndicator,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { FeatureRequestCard } from '@/src/components/community/FeatureRequestCard';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import {
    FeatureVotingService,
    FeatureRequest,
    VoteType,
    FEATURE_CATEGORIES,
} from '@/src/services/supabase/featureVoting';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

type FilterType = 'top' | 'new' | 'planned' | 'completed';

export default function RoadmapScreen() {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [requests, setRequests] = useState<FeatureRequest[]>([]);
    const [filter, setFilter] = useState<FilterType>('top');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);

    // New request form state
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState<'feature' | 'improvement' | 'bug' | 'integration'>('feature');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const themeColors = {
        bg: isDark ? '#0A0A0C' : '#FFFFFF',
        surface: isDark ? '#1A1A1E' : '#F8F9FA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        border: isDark ? '#2A2A2E' : '#E5E7EB',
    };

    const fetchRequests = useCallback(async (refresh: boolean = false) => {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const data = await FeatureVotingService.getFeatureRequests(filter);
            setRequests(data);
        } catch (error) {
            console.error('[Roadmap] Error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const handleVote = async (requestId: string, voteType: VoteType) => {
        // Optimistic update
        setRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;

            const wasVoted = r.user_vote === voteType;
            let newUpvotes = r.upvote_count;
            let newDownvotes = r.downvote_count;

            // Remove previous vote
            if (r.user_vote === 'up') newUpvotes--;
            if (r.user_vote === 'down') newDownvotes--;

            // Apply new vote (unless toggling off)
            if (!wasVoted) {
                if (voteType === 'up') newUpvotes++;
                if (voteType === 'down') newDownvotes++;
            }

            return {
                ...r,
                user_vote: wasVoted ? null : voteType,
                upvote_count: newUpvotes,
                downvote_count: newDownvotes,
                score: newUpvotes - newDownvotes,
            };
        }));

        await FeatureVotingService.voteOnFeature(requestId, voteType);
    };

    const handleSubmitRequest = async () => {
        if (!newTitle.trim()) {
            Alert.alert('Required', 'Please enter a title');
            return;
        }
        if (!newDescription.trim()) {
            Alert.alert('Required', 'Please describe your request');
            return;
        }

        setIsSubmitting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const result = await FeatureVotingService.createFeatureRequest({
            title: newTitle.trim(),
            description: newDescription.trim(),
            category: newCategory,
        });

        setIsSubmitting(false);

        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setNewTitle('');
            setNewDescription('');
            setShowNewRequestForm(false);
            fetchRequests(true);
            Alert.alert('Submitted! 🎉', 'Your request is now open for voting.');
        } else {
            Alert.alert('Error', result.error || 'Failed to submit');
        }
    };

    const FILTERS: { id: FilterType; label: string }[] = [
        { id: 'top', label: '🔥 Top' },
        { id: 'new', label: '🆕 New' },
        { id: 'planned', label: '📋 Planned' },
        { id: 'completed', label: '✅ Done' },
    ];

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Title */}
            <View style={styles.titleRow}>
                <Text style={[styles.title, { color: themeColors.text }]}>
                    🗳️ Feature Voting
                </Text>
                <TouchableOpacity
                    style={[styles.newButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowNewRequestForm(true)}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.newButtonText}>Request</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Vote for features you want. Top voted each month gets built!
            </Text>

            {/* Filters */}
            <View style={styles.filters}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.id}
                        style={[
                            styles.filterChip,
                            { borderColor: themeColors.border },
                            filter === f.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => setFilter(f.id)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: themeColors.textSecondary },
                            filter === f.id && { color: '#FFF' },
                        ]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderNewRequestForm = () => (
        <View style={[styles.formOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <View style={[styles.form, { backgroundColor: themeColors.bg }]}>
                    <View style={styles.formHeader}>
                        <Text style={[styles.formTitle, { color: themeColors.text }]}>
                            New Feature Request
                        </Text>
                        <TouchableOpacity onPress={() => setShowNewRequestForm(false)}>
                            <Ionicons name="close" size={24} color={themeColors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Category Selection */}
                    <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {FEATURE_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    { borderColor: themeColors.border },
                                    newCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                                ]}
                                onPress={() => setNewCategory(cat.id as any)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    { color: themeColors.textSecondary },
                                    newCategory === cat.id && { color: '#FFF' },
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Title */}
                    <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border }]}
                        value={newTitle}
                        onChangeText={setNewTitle}
                        placeholder="What would you like to see?"
                        placeholderTextColor={themeColors.textSecondary}
                    />

                    {/* Description */}
                    <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border }]}
                        value={newDescription}
                        onChangeText={setNewDescription}
                        placeholder="Describe the feature and why it would be helpful..."
                        placeholderTextColor={themeColors.textSecondary}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                        onPress={handleSubmitRequest}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="send" size={18} color="#FFF" />
                                <Text style={styles.submitButtonText}>Submit Request</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Roadmap',
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerBlurEffect: isDark ? 'dark' : 'light',
                }}
            />

            <SoftDreamyBackground />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => fetchRequests(true)}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🗳️</Text>
                            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
                                No requests yet
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
                                Be the first to submit a feature request!
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <FeatureRequestCard
                            request={item}
                            onVote={(type) => handleVote(item.id, type)}
                        />
                    )}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
            )}

            {showNewRequestForm && renderNewRequestForm()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingTop: 100,
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: SPACING.md,
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: RADIUS.lg,
        gap: 4,
    },
    newButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    filters: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
    },
    // Form styles
    formOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    form: {
        padding: SPACING.lg,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: SPACING.lg,
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: 15,
        marginBottom: SPACING.md,
    },
    textArea: {
        minHeight: 100,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: 8,
        marginTop: SPACING.sm,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
