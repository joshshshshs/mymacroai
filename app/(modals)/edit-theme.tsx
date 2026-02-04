/**
 * Edit Theme Screen - Theme selector dropdown
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useTheme, ThemeMode } from '@/hooks/useTheme';

interface ThemeOption {
    id: ThemeMode;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    preview: {
        bg: string;
        card: string;
        text: string;
    };
}

const THEME_OPTIONS: ThemeOption[] = [
    {
        id: 'light',
        label: 'Light',
        description: 'Bright and clean interface',
        icon: 'sunny',
        preview: {
            bg: '#F5F5F7',
            card: '#FFFFFF',
            text: '#1A1A1A',
        },
    },
    {
        id: 'dark',
        label: 'Dark',
        description: 'Easy on the eyes at night',
        icon: 'moon',
        preview: {
            bg: '#121214',
            card: '#1C1C1E',
            text: '#FFFFFF',
        },
    },
    {
        id: 'system',
        label: 'System',
        description: 'Match your device settings',
        icon: 'phone-portrait-outline',
        preview: {
            bg: 'linear',
            card: 'linear',
            text: '#888888',
        },
    },
];

export default function EditThemeScreen() {
    const router = useRouter();
    const { themePreference, setTheme, isDark } = useTheme();

    const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themePreference as ThemeMode);
    const hasChanged = selectedTheme !== themePreference;

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        cardSelected: isDark ? '#2C2C2E' : '#FFF5F0',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: '#FF5C00',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderSelected: '#FF5C00',
    };

    const handleSelect = (theme: ThemeMode) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTheme(theme);
    };

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTheme(selectedTheme);
        router.back();
    };

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
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[
                            styles.headerButton,
                            { backgroundColor: hasChanged ? colors.accent : colors.card },
                        ]}
                        disabled={!hasChanged}
                    >
                        <Ionicons
                            name="checkmark"
                            size={24}
                            color={hasChanged ? '#FFFFFF' : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Choose your preferred appearance
                    </Text>

                    {THEME_OPTIONS.map((option, index) => {
                        const isSelected = selectedTheme === option.id;
                        return (
                            <Animated.View
                                key={option.id}
                                entering={FadeInDown.delay(index * 100).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.themeCard,
                                        {
                                            backgroundColor: isSelected ? colors.cardSelected : colors.card,
                                            borderColor: isSelected ? colors.borderSelected : colors.border,
                                        },
                                    ]}
                                    onPress={() => handleSelect(option.id)}
                                    activeOpacity={0.7}
                                >
                                    {/* Preview Box */}
                                    {option.id === 'system' ? (
                                        <View style={styles.systemPreview}>
                                            <View style={[styles.previewHalf, { backgroundColor: '#F5F5F7' }]}>
                                                <View style={[styles.previewMiniCard, { backgroundColor: '#FFFFFF' }]} />
                                            </View>
                                            <View style={[styles.previewHalf, { backgroundColor: '#121214' }]}>
                                                <View style={[styles.previewMiniCard, { backgroundColor: '#1C1C1E' }]} />
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={[styles.previewBox, { backgroundColor: option.preview.bg }]}>
                                            <View style={[styles.previewCard, { backgroundColor: option.preview.card }]} />
                                            <View style={[styles.previewLine, { backgroundColor: option.preview.text, opacity: 0.3 }]} />
                                            <View style={[styles.previewLineShort, { backgroundColor: option.preview.text, opacity: 0.2 }]} />
                                        </View>
                                    )}

                                    {/* Info */}
                                    <View style={styles.themeInfo}>
                                        <View style={styles.labelRow}>
                                            <Ionicons
                                                name={option.icon}
                                                size={20}
                                                color={isSelected ? colors.accent : colors.textSecondary}
                                            />
                                            <Text style={[styles.themeLabel, { color: colors.text }]}>
                                                {option.label}
                                            </Text>
                                        </View>
                                        <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
                                            {option.description}
                                        </Text>
                                    </View>

                                    {/* Radio */}
                                    <View style={[
                                        styles.radioOuter,
                                        { borderColor: isSelected ? colors.accent : colors.border },
                                    ]}>
                                        {isSelected && (
                                            <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
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
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 16,
    },
    previewBox: {
        width: 64,
        height: 64,
        borderRadius: 12,
        padding: 8,
        marginRight: 16,
    },
    previewCard: {
        width: '100%',
        height: 24,
        borderRadius: 6,
        marginBottom: 6,
    },
    previewLine: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        marginBottom: 4,
    },
    previewLineShort: {
        width: '60%',
        height: 4,
        borderRadius: 2,
    },
    systemPreview: {
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        marginRight: 16,
    },
    previewHalf: {
        flex: 1,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewMiniCard: {
        width: '90%',
        height: '50%',
        borderRadius: 4,
    },
    themeInfo: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    themeLabel: {
        fontSize: 17,
        fontWeight: '700',
    },
    themeDescription: {
        fontSize: 13,
    },
    radioOuter: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});
