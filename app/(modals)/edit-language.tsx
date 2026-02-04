/**
 * Language Selection Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/src/hooks/useTranslation';
import { SupportedLanguage } from '@/src/i18n';

export default function EditLanguageScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { t, locale, changeLanguage, languages } = useTranslation();

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        accent: '#FF5C00',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    };

    const handleSelectLanguage = async (language: SupportedLanguage) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await changeLanguage(language);
        router.back();
    };

    const languageEntries = Object.entries(languages) as [SupportedLanguage, typeof languages[SupportedLanguage]][];

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('settings.language'),
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {t('settings.languageDescription')}
                </Text>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {languageEntries.map(([code, lang], index) => (
                        <TouchableOpacity
                            key={code}
                            style={[
                                styles.languageRow,
                                index < languageEntries.length - 1 && {
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                },
                            ]}
                            onPress={() => handleSelectLanguage(code)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={styles.flag}>{lang.flag}</Text>
                                <View style={styles.languageText}>
                                    <Text style={[styles.nativeName, { color: colors.text }]}>
                                        {lang.nativeName}
                                    </Text>
                                    <Text style={[styles.englishName, { color: colors.textSecondary }]}>
                                        {lang.name}
                                    </Text>
                                </View>
                            </View>
                            {locale === code && (
                                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.note, { color: colors.textSecondary }]}>
                    {t('settings.languageNote')}
                </Text>
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
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: SPACING.lg,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    languageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        fontSize: 28,
        marginRight: 14,
    },
    languageText: {
        gap: 2,
    },
    nativeName: {
        fontSize: 16,
        fontWeight: '600',
    },
    englishName: {
        fontSize: 13,
    },
    note: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: SPACING.lg,
        textAlign: 'center',
    },
});
