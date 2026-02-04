/**
 * Delete Account Modal
 * 
 * Apple App Store requires the ability to delete user accounts.
 * This screen handles account deletion with proper warnings and confirmation.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/src/lib/supabase';
import { useUserStore, storage } from '@/src/store/UserStore';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const CONFIRMATION_TEXT = 'DELETE';

export default function DeleteAccountModal() {
    const { isDark } = useTheme();
    const { colors } = useCombinedTheme();
    const router = useRouter();
    const user = useUserStore((s) => s.user);

    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDelete = confirmText.toUpperCase() === CONFIRMATION_TEXT;

    const handleDeleteAccount = async () => {
        if (!canDelete) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        Alert.alert(
            'Final Confirmation',
            'This action is PERMANENT and cannot be undone. All your data will be deleted immediately.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        setError(null);

                        try {
                            // 1. Sign out from Supabase (this triggers RLS cascade if configured)
                            if (supabase) {
                                const { error: signOutError } = await supabase.auth.signOut();
                                if (signOutError) {
                                    console.warn('Sign out error:', signOutError);
                                }
                            }

                            // 2. Clear all local data
                            storage.instance?.clearAll();

                            // 3. Navigate to welcome/auth screen
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            router.replace('/(auth)/welcome');
                        } catch (err) {
                            setError('Failed to delete account. Please try again or contact support.');
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const themeColors = {
        bg: isDark ? '#0D0D0F' : '#F8F8FA',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        danger: '#FF3B30',
        dangerBg: isDark ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.1)',
        inputBg: isDark ? '#2C2C2E' : '#F2F2F7',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Delete Account',
                    headerStyle: { backgroundColor: themeColors.bg },
                    headerTintColor: themeColors.text,
                    headerShadowVisible: false,
                }}
            />

            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Warning Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: themeColors.dangerBg }]}>
                        <Ionicons name="warning" size={48} color={themeColors.danger} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: themeColors.danger }]}>
                        Delete Your Account
                    </Text>

                    {/* Description */}
                    <Text style={[styles.description, { color: themeColors.textMuted }]}>
                        Deleting your account is permanent and cannot be undone. This will:
                    </Text>

                    {/* Consequences List */}
                    <View style={[styles.consequencesCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                        <ConsequenceItem
                            icon="person-remove"
                            text="Remove your profile and personal data"
                            color={themeColors.text}
                        />
                        <ConsequenceItem
                            icon="restaurant"
                            text="Delete all logged meals and nutrition history"
                            color={themeColors.text}
                        />
                        <ConsequenceItem
                            icon="trophy"
                            text="Erase your streak, achievements, and MacroCoins"
                            color={themeColors.text}
                        />
                        <ConsequenceItem
                            icon="cloud-offline"
                            text="Remove community posts and saved recipes"
                            color={themeColors.text}
                        />
                        <ConsequenceItem
                            icon="card"
                            text="Cancel any active subscriptions"
                            color={themeColors.text}
                        />
                    </View>

                    {/* Current Account Info */}
                    <View style={[styles.accountInfo, { backgroundColor: themeColors.inputBg }]}>
                        <Ionicons name="mail-outline" size={18} color={themeColors.textMuted} />
                        <Text style={[styles.accountEmail, { color: themeColors.text }]}>
                            {user?.email || 'your account'}
                        </Text>
                    </View>

                    {/* Confirmation Input */}
                    <Text style={[styles.confirmLabel, { color: themeColors.text }]}>
                        Type <Text style={{ fontWeight: '800', color: themeColors.danger }}>{CONFIRMATION_TEXT}</Text> to confirm:
                    </Text>

                    <TextInput
                        style={[
                            styles.confirmInput,
                            {
                                backgroundColor: themeColors.inputBg,
                                color: themeColors.text,
                                borderColor: confirmText.length > 0
                                    ? canDelete
                                        ? '#34C759'
                                        : themeColors.danger
                                    : themeColors.border,
                            },
                        ]}
                        placeholder={CONFIRMATION_TEXT}
                        placeholderTextColor={themeColors.textMuted}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        autoComplete="off"
                    />

                    {/* Error Message */}
                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[
                            styles.deleteButton,
                            !canDelete && styles.deleteButtonDisabled,
                        ]}
                        onPress={handleDeleteAccount}
                        disabled={!canDelete || isDeleting}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={canDelete ? ['#FF3B30', '#D32F2F'] : ['#555', '#444']}
                            style={styles.deleteButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {isDeleting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="trash" size={20} color="#FFF" />
                                    <Text style={styles.deleteButtonText}>
                                        Delete My Account Forever
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Alternative Actions */}
                    <View style={styles.alternativeActions}>
                        <TouchableOpacity
                            style={styles.alternativeButton}
                            onPress={() => router.push('/(modals)/support')}
                        >
                            <Text style={[styles.alternativeText, { color: colors.primary }]}>
                                Contact Support Instead
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.alternativeButton}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.alternativeText, { color: themeColors.textMuted }]}>
                                Keep My Account
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const ConsequenceItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    color: string;
}> = ({ icon, text, color }) => (
    <View style={styles.consequenceItem}>
        <View style={styles.consequenceBullet}>
            <Ionicons name={icon} size={18} color="#FF3B30" />
        </View>
        <Text style={[styles.consequenceText, { color }]}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    consequencesCard: {
        width: '100%',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
    },
    consequenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    consequenceBullet: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,59,48,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    consequenceText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    accountEmail: {
        fontSize: 14,
        fontWeight: '500',
    },
    confirmLabel: {
        fontSize: 15,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    confirmInput: {
        width: '100%',
        height: 50,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        borderWidth: 2,
        marginBottom: SPACING.lg,
        letterSpacing: 2,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    deleteButton: {
        width: '100%',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    deleteButtonDisabled: {
        opacity: 0.5,
    },
    deleteButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    alternativeActions: {
        alignItems: 'center',
        gap: SPACING.md,
    },
    alternativeButton: {
        paddingVertical: SPACING.sm,
    },
    alternativeText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
