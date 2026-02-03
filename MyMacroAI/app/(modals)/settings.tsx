/**
 * Settings Screen - Preferences & Tuning
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';
import { ProfileMenuItem } from '@/src/components/profile';
import { useUserStore, TRAINING_STYLES, useBioOptimizationProfile, useCoachIntensity } from '@/src/store/UserStore';
import { useTheme } from '@/hooks/useTheme';
import { PeptideStatus } from '@/src/types';
import { useTranslation } from '@/src/hooks/useTranslation';

// Helper function for peptide status label
const getPeptideStatusLabel = (status: PeptideStatus, compoundCount: number): string => {
    switch (status) {
        case 'ACTIVE_DISCLOSED':
            return compoundCount > 0 ? `Active (${compoundCount} compound${compoundCount > 1 ? 's' : ''})` : 'Active (Disclosed)';
        case 'ACTIVE_UNDISCLOSED':
            return 'Active (Private)';
        case 'NONE':
            return 'Not using';
        case 'PREFER_NOT_TO_SAY':
        default:
            return 'Not configured';
    }
};

// Helper for goal label
const getGoalLabel = (goals: string[] | undefined): string => {
    if (!goals || goals.length === 0) return 'Not set';
    const goalLabels: Record<string, string> = {
        'fat_loss': 'Fat Loss',
        'muscle_gain': 'Muscle Gain',
        'maintenance': 'Maintenance',
        'recomp': 'Body Recomposition',
        'performance': 'Athletic Performance',
    };
    return goalLabels[goals[0]] || 'Not set';
};

// Helper for diet label
const getDietLabel = (diets: string[] | undefined): string => {
    if (!diets || diets.length === 0) return 'Balanced';
    const dietLabels: Record<string, string> = {
        'balanced': 'Balanced',
        'high_protein': 'High Protein',
        'low_carb': 'Low Carb',
        'keto': 'Ketogenic',
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan',
        'mediterranean': 'Mediterranean',
    };
    return dietLabels[diets[0]] || 'Balanced';
};

// Helper for voice label
const getVoiceLabel = (voice: string | undefined): string => {
    const voiceLabels: Record<string, string> = {
        'coach_alex': 'Coach Alex (Male)',
        'coach_maya': 'Coach Maya (Female)',
        'coach_marcus': 'Coach Marcus (Male)',
        'coach_sophia': 'Coach Sophia (Female)',
    };
    return voiceLabels[voice || 'coach_maya'] || 'Coach Maya (Female)';
};

export default function SettingsScreen() {
    const router = useRouter();
    const { isDark, themePreference, colors: themeColors } = useTheme();
    const { t, locale, changeLanguage, languages } = useTranslation();
    const preferences = useUserStore(s => s.preferences);
    const healthMetrics = useUserStore(s => s.healthMetrics);
    const trainingStyles = useUserStore(s => s.trainingStyles) || [];
    const bioProfile = useBioOptimizationProfile();
    const updatePreferences = useUserStore(s => s.actions.updatePreferences);

    // Get display text for training styles
    const trainingStylesText = trainingStyles.length === 0
        ? 'Not set'
        : trainingStyles.length > 1
            ? `Hybrid (${trainingStyles.length} styles)`
            : TRAINING_STYLES.find(s => s.id === trainingStyles[0])?.label || 'Not set';

    // Coach Intensity from store (0-100)
    const coachIntensity = useCoachIntensity();
    const setCoachIntensity = useUserStore(s => s.setCoachIntensity);

    // Local haptics state that syncs with preferences
    const [hapticsEnabled, setHapticsEnabled] = useState(preferences?.haptics !== false);

    // Sync haptics toggle with store
    const handleHapticsToggle = (value: boolean) => {
        setHapticsEnabled(value);
        updatePreferences({ haptics: value });
        if (value) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    // Get intensity label for display
    const getIntensityLabel = (val: number): string => {
        if (val < 20) return "Zen Monk";
        if (val < 40) return "Supportive";
        if (val < 60) return "Balanced";
        if (val < 80) return "Intense";
        return "Spartan";
    };

    // Format measurements for display
    const weightDisplay = healthMetrics?.weight
        ? preferences?.measurementSystem === 'imperial'
            ? `${Math.round(healthMetrics.weight * 2.205)} lbs`
            : `${healthMetrics.weight} kg`
        : 'Not set';

    const heightDisplay = healthMetrics?.height
        ? preferences?.measurementSystem === 'imperial'
            ? `${Math.floor(healthMetrics.height / 2.54 / 12)}'${Math.round((healthMetrics.height / 2.54) % 12)}"`
            : `${healthMetrics.height} cm`
        : 'Not set';

    const ageDisplay = healthMetrics?.age ? `${healthMetrics.age} years` : 'Not set';

    const unitsDisplay = preferences?.measurementSystem === 'imperial' ? 'Imperial (lbs, ft)' : 'Metric (kg, cm)';

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        accent: '#FF5C00',
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Settings',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Biological Profile */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>BIOLOGICAL PROFILE</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="body-outline"
                        label="Weight"
                        subtitle={weightDisplay}
                        onPress={() => router.push('/(modals)/edit-weight')}
                    />
                    <ProfileMenuItem
                        icon="resize-outline"
                        label="Height"
                        subtitle={heightDisplay}
                        onPress={() => router.push('/(modals)/edit-height')}
                    />
                    <ProfileMenuItem
                        icon="calendar-outline"
                        label="Age"
                        subtitle={ageDisplay}
                        onPress={() => router.push('/(modals)/edit-age')}
                    />
                </View>

                {/* Nutrition Strategy */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NUTRITION STRATEGY</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="trending-down-outline"
                        label="Goal"
                        subtitle={getGoalLabel(preferences?.fitnessGoals)}
                        onPress={() => router.push('/(modals)/edit-goal')}
                    />
                    <ProfileMenuItem
                        icon="leaf-outline"
                        label="Diet Style"
                        subtitle={getDietLabel(preferences?.dietaryPreferences)}
                        onPress={() => router.push('/(modals)/edit-diet-style')}
                    />
                </View>

                {/* Training Protocol */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TRAINING PROTOCOL</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="barbell-outline"
                        label="Training DNA"
                        subtitle={trainingStylesText}
                        onPress={() => router.push('/(modals)/training-onboarding')}
                    />
                </View>

                {/* Bio-Optimization */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>BIO-OPTIMIZATION</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="flask-outline"
                        label="Peptide Protocols"
                        subtitle={getPeptideStatusLabel(bioProfile.peptideStatus, bioProfile.activeCompounds.length)}
                        onPress={() => router.push('/(modals)/bio-optimization')}
                    />
                </View>

                {/* AI Persona */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AI PERSONA</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.sliderRow}>
                        <View style={styles.sliderHeader}>
                            <Text style={[styles.sliderLabel, { color: colors.text }]}>Coach Intensity</Text>
                            <Text style={[styles.intensityBadge, { color: colors.accent }]}>
                                {getIntensityLabel(coachIntensity)}
                            </Text>
                        </View>
                        <View style={styles.sliderContainer}>
                            <Text style={[styles.sliderEnd, { color: colors.textSecondary }]}>Gentle</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={coachIntensity}
                                onSlidingComplete={(val) => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setCoachIntensity(val);
                                }}
                                minimumTrackTintColor={colors.accent}
                                maximumTrackTintColor={colors.textSecondary}
                                thumbTintColor={colors.accent}
                            />
                            <Text style={[styles.sliderEnd, { color: colors.textSecondary }]}>Spartan</Text>
                        </View>
                        <Text style={[styles.sliderHint, { color: colors.textSecondary }]}>
                            Syncs instantly with AI
                        </Text>
                    </View>
                    <ProfileMenuItem
                        icon="volume-high-outline"
                        label="Voice"
                        subtitle={getVoiceLabel(preferences?.aiVoice)}
                        onPress={() => router.push('/(modals)/edit-voice')}
                    />
                </View>

                {/* Data & Devices */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA & DEVICES</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="watch-outline"
                        label="Connected Devices"
                        subtitle="Wearables & Health Sources"
                        onPress={() => router.push('/(modals)/wearable-sync')}
                    />
                    <ProfileMenuItem
                        icon="cloud-upload-outline"
                        label="Import Data"
                        subtitle="MyFitnessPal, Apple Health, CSV"
                        onPress={() => router.push('/(modals)/import')}
                    />
                </View>

                {/* App Experience */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('settings.appExperience')}</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="language-outline"
                        label={t('settings.language')}
                        subtitle={`${languages[locale].flag} ${languages[locale].nativeName}`}
                        onPress={() => router.push('/(modals)/edit-language')}
                    />
                    <ProfileMenuItem
                        icon="scale-outline"
                        label={t('settings.units')}
                        subtitle={unitsDisplay}
                        onPress={() => router.push('/(modals)/edit-units')}
                    />
                    <ProfileMenuItem
                        icon="phone-portrait-outline"
                        label={t('settings.haptics')}
                        rightElement="toggle"
                        toggleValue={hapticsEnabled}
                        onToggle={handleHapticsToggle}
                    />
                </View>

                {/* Account Management */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="log-out-outline"
                        label="Sign Out"
                        onPress={() => router.push('/(modals)/sign-out')}
                    />
                    <ProfileMenuItem
                        icon="trash-outline"
                        label="Delete Account"
                        subtitle="Permanently delete your data"
                        onPress={() => router.push('/(modals)/delete-account')}
                    />
                </View>

                <View style={{ height: 40 }} />
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
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    sliderRow: {
        padding: 14,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sliderLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    intensityBadge: {
        fontSize: 13,
        fontWeight: '700',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    slider: {
        flex: 1,
        marginHorizontal: 8,
    },
    sliderEnd: {
        fontSize: 11,
        fontWeight: '500',
    },
    sliderHint: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
    },
});
