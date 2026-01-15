/**
 * Edit Profile Screen - "Live Preview Athlete Card"
 * Allows users to customize their public Athlete Card
 * Features: live preview, form fields, stat visibility toggles, social links
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { AthleteCard, StatChip, SocialLinkInput } from '@/src/components/profile';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING, COLORS } from '@/src/design-system/tokens';
import { AthleteProfile, StatVisibility, SocialLinks } from '@/src/types';

// Stat chip configuration
const STAT_CHIPS: { key: keyof StatVisibility; icon: string; label: string }[] = [
    { key: 'showStreak', icon: '🔥', label: 'Current Streak' },
    { key: 'showWeight', icon: '⚖️', label: 'Weight' },
    { key: 'showConsistency', icon: '🏆', label: 'Consistency Score' },
    { key: 'showBadges', icon: '👑', label: 'Pro Badge' },
    { key: 'showDeadliftPR', icon: '🏋️', label: 'Deadlift PR' },
];

const BIO_MAX_LENGTH = 140;

export default function EditProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { success, light } = useHaptics();

    // Store hooks
    const athleteProfile = useUserStore((s) => s.athleteProfile);
    const updateAthleteProfile = useUserStore((s) => s.updateAthleteProfile);
    const streak = useUserStore((s) => s.streak);
    const consistencyScore = useUserStore((s) => s.consistencyMetrics?.consistencyScore || 0);
    const weight = useUserStore((s) => s.healthMetrics?.weight);
    const isPro = useUserStore((s) => s.isPro);

    // Local form state (for live preview without committing to store)
    const [formState, setFormState] = useState<AthleteProfile>({
        displayName: athleteProfile?.displayName || '',
        handle: athleteProfile?.handle || '',
        bio: athleteProfile?.bio || '',
        avatarUri: athleteProfile?.avatarUri || null,
        statVisibility: athleteProfile?.statVisibility || {
            showStreak: true,
            showWeight: false,
            showConsistency: true,
            showBadges: true,
            showDeadliftPR: false,
        },
        socialLinks: athleteProfile?.socialLinks || {
            instagram: '',
            tiktok: '',
            website: '',
        },
    });

    // Handle availability state
    const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        inputBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        inputBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        accent: COLORS.gamification.vitaminOrange,
    };

    // Update form field
    const updateField = useCallback(<K extends keyof AthleteProfile>(
        key: K,
        value: AthleteProfile[K]
    ) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Toggle stat visibility
    const toggleStat = useCallback((key: keyof StatVisibility) => {
        setFormState((prev) => ({
            ...prev,
            statVisibility: {
                ...prev.statVisibility,
                [key]: !prev.statVisibility[key],
            },
        }));
    }, []);

    // Update social link
    const updateSocialLink = useCallback((platform: keyof SocialLinks, value: string) => {
        setFormState((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value,
            },
        }));
    }, []);

    // Handle avatar picker
    const handleAvatarPress = async () => {
        light();

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera roll permission is needed to change your avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            updateField('avatarUri', result.assets[0].uri);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        light();
        router.back();
    };

    // Handle save
    const handleSave = () => {
        success();
        updateAthleteProfile(formState);
        router.back();
    };

    // Check handle availability (debounced)
    const checkHandleAvailability = useCallback((handle: string) => {
        if (handle.length < 3) {
            setHandleStatus('idle');
            return;
        }

        setHandleStatus('checking');

        // Simulate API check (in real app, call backend)
        setTimeout(() => {
            const isTaken = handle.toLowerCase() === 'taken';
            setHandleStatus(isTaken ? 'taken' : 'available');
        }, 500);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Edit Identity',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerTitleStyle: { fontWeight: '700' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleCancel}>
                            <Text style={[styles.headerButton, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.saveButton, { backgroundColor: colors.accent }]}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Live Preview Card */}
                    <AthleteCard
                        profile={formState}
                        streak={streak}
                        consistencyScore={consistencyScore}
                        weight={weight}
                        isPro={isPro}
                        onAvatarPress={handleAvatarPress}
                    />

                    {/* Section: Core Identity */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            CORE IDENTITY
                        </Text>

                        {/* Display Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Display Name</Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: colors.inputBg,
                                        borderColor: colors.inputBorder,
                                        color: colors.text,
                                    }
                                ]}
                                value={formState.displayName}
                                onChangeText={(text) => updateField('displayName', text)}
                                placeholder="Josh Lifts"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Handle */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                Username (Handle)
                            </Text>
                            <View style={styles.handleInputRow}>
                                <Text style={[styles.handlePrefix, { color: colors.textSecondary }]}>@</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        styles.handleInput,
                                        {
                                            backgroundColor: colors.inputBg,
                                            borderColor: colors.inputBorder,
                                            color: colors.text,
                                        }
                                    ]}
                                    value={formState.handle}
                                    onChangeText={(text) => {
                                        const cleanText = text.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
                                        updateField('handle', cleanText);
                                        checkHandleAvailability(cleanText);
                                    }}
                                    placeholder="josh_lifts"
                                    placeholderTextColor={colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {handleStatus === 'available' && (
                                    <Text style={styles.handleStatusAvailable}>✓</Text>
                                )}
                                {handleStatus === 'taken' && (
                                    <Text style={styles.handleStatusTaken}>✗</Text>
                                )}
                            </View>
                        </View>

                        {/* Bio */}
                        <View style={styles.inputGroup}>
                            <View style={styles.bioHeader}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>The "Hype" Bio</Text>
                                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                                    {formState.bio.length}/{BIO_MAX_LENGTH}
                                </Text>
                            </View>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    styles.bioInput,
                                    {
                                        backgroundColor: colors.inputBg,
                                        borderColor: colors.inputBorder,
                                        color: colors.text,
                                    }
                                ]}
                                value={formState.bio}
                                onChangeText={(text) => {
                                    if (text.length <= BIO_MAX_LENGTH) {
                                        updateField('bio', text);
                                    }
                                }}
                                placeholder="What is your current mission?"
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Section: Showcase Stats (Flex Grid) */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            SHOWCASE STATS
                        </Text>
                        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                            Choose which stats appear on your public card
                        </Text>
                        <View style={styles.chipGrid}>
                            {STAT_CHIPS.map((chip) => (
                                <StatChip
                                    key={chip.key}
                                    icon={chip.icon}
                                    label={chip.label}
                                    isActive={formState.statVisibility[chip.key]}
                                    onToggle={() => toggleStat(chip.key)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Section: Social Battery */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            SOCIAL LINKS
                        </Text>
                        <SocialLinkInput
                            platform="instagram"
                            value={formState.socialLinks.instagram}
                            onChangeText={(text) => updateSocialLink('instagram', text)}
                        />
                        <SocialLinkInput
                            platform="tiktok"
                            value={formState.socialLinks.tiktok}
                            onChangeText={(text) => updateSocialLink('tiktok', text)}
                        />
                        <SocialLinkInput
                            platform="website"
                            value={formState.socialLinks.website}
                            onChangeText={(text) => updateSocialLink('website', text)}
                        />
                    </View>

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
    scrollContent: {
        paddingBottom: 40,
    },
    headerButton: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionHint: {
        fontSize: 13,
        marginBottom: 12,
        marginLeft: 4,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    textInput: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        fontWeight: '500',
    },
    handleInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    handlePrefix: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },
    handleInput: {
        flex: 1,
    },
    handleStatusAvailable: {
        marginLeft: 8,
        fontSize: 18,
        color: '#10B981',
        fontWeight: '700',
    },
    handleStatusTaken: {
        marginLeft: 8,
        fontSize: 18,
        color: '#EF4444',
        fontWeight: '700',
    },
    bioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    charCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    bioInput: {
        minHeight: 80,
        paddingTop: 12,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
