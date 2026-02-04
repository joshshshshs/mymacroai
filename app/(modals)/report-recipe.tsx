/**
 * Report Recipe Modal
 * 
 * Allows users to report inappropriate content for moderation.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { getSupabase } from '@/src/lib/supabase';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const REPORT_REASONS = [
    { id: 'spam', label: 'Spam or misleading', icon: 'alert-circle' },
    { id: 'inappropriate', label: 'Inappropriate content', icon: 'eye-off' },
    { id: 'harassment', label: 'Harassment or bullying', icon: 'hand-left' },
    { id: 'false_info', label: 'False information', icon: 'warning' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['id'];

export default function ReportRecipeScreen() {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { recipeId, recipeName } = useLocalSearchParams<{ recipeId: string; recipeName?: string }>();

    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const themeColors = {
        bg: isDark ? '#0A0A0C' : '#FFFFFF',
        surface: isDark ? '#1A1A1E' : '#F8F9FA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        border: isDark ? '#2A2A2E' : '#E5E7EB',
        danger: '#EF4444',
    };

    const handleReasonSelect = (reason: ReportReason) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedReason(reason);
    };

    const handleSubmit = async () => {
        if (!selectedReason) {
            Alert.alert('Select a reason', 'Please select why you are reporting this content.');
            return;
        }

        setIsSubmitting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            // Get current user
            const { data: { user } } = await getSupabase().auth.getUser();
            if (!user) {
                Alert.alert('Error', 'You must be logged in to report content.');
                return;
            }

            // Insert report into database
            const { error } = await getSupabase()
                .from('reports')
                .insert({
                    reporter_id: user.id,
                    recipe_id: recipeId,
                    reason: selectedReason,
                    additional_info: additionalInfo.trim() || null,
                });

            if (error) {
                // If reports table doesn't exist yet, just flag the recipe
                if (error.code === '42P01') {
                    // Table doesn't exist - just flag the recipe directly
                    await getSupabase()
                        .from('public_recipes')
                        .update({ is_flagged: true })
                        .eq('id', recipeId);
                } else {
                    throw error;
                }
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                'Report Submitted',
                'Thank you for helping keep our community safe. We\'ll review this content shortly.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('[Report] Error:', error);
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Report Content',
                    presentation: 'modal',
                    headerStyle: { backgroundColor: themeColors.bg },
                    headerTintColor: themeColors.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color={themeColors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="flag" size={32} color={themeColors.danger} />
                    <Text style={[styles.title, { color: themeColors.text }]}>
                        Report this recipe
                    </Text>
                    {recipeName && (
                        <Text style={[styles.recipeName, { color: themeColors.textSecondary }]}>
                            "{recipeName}"
                        </Text>
                    )}
                </View>

                {/* Reason Selection */}
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                    Why are you reporting this?
                </Text>

                <View style={styles.reasonList}>
                    {REPORT_REASONS.map((reason) => (
                        <TouchableOpacity
                            key={reason.id}
                            style={[
                                styles.reasonItem,
                                {
                                    backgroundColor: themeColors.surface,
                                    borderColor: selectedReason === reason.id ? colors.primary : themeColors.border,
                                    borderWidth: selectedReason === reason.id ? 2 : 1,
                                },
                            ]}
                            onPress={() => handleReasonSelect(reason.id)}
                        >
                            <Ionicons
                                name={reason.icon as any}
                                size={20}
                                color={selectedReason === reason.id ? colors.primary : themeColors.textSecondary}
                            />
                            <Text style={[
                                styles.reasonText,
                                { color: selectedReason === reason.id ? colors.primary : themeColors.text },
                            ]}>
                                {reason.label}
                            </Text>
                            {selectedReason === reason.id && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Additional Info */}
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                    Additional details (optional)
                </Text>
                <TextInput
                    style={[
                        styles.textArea,
                        {
                            backgroundColor: themeColors.surface,
                            color: themeColors.text,
                            borderColor: themeColors.border,
                        },
                    ]}
                    value={additionalInfo}
                    onChangeText={setAdditionalInfo}
                    placeholder="Provide any additional context..."
                    placeholderTextColor={themeColors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: themeColors.danger },
                        !selectedReason && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting || !selectedReason}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="send" size={18} color="#FFF" />
                            <Text style={styles.submitButtonText}>Submit Report</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Privacy Note */}
                <Text style={[styles.privacyNote, { color: themeColors.textSecondary }]}>
                    Reports are reviewed by our moderation team. Your identity will remain anonymous to the content creator.
                </Text>
            </View>
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
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: SPACING.sm,
    },
    recipeName: {
        fontSize: 14,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: SPACING.sm,
    },
    reasonList: {
        gap: 8,
        marginBottom: SPACING.lg,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        gap: 12,
    },
    reasonText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    textArea: {
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: 15,
        minHeight: 100,
        marginBottom: SPACING.lg,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    privacyNote: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: SPACING.lg,
        lineHeight: 18,
    },
});
