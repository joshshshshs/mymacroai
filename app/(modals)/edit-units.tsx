/**
 * Edit Units Screen - Select measurement system with auto-sync
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING, COLORS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';

type MeasurementSystem = 'metric' | 'imperial';

interface UnitOption {
    id: MeasurementSystem;
    label: string;
    description: string;
    examples: string[];
    icon: keyof typeof Ionicons.glyphMap;
}

const UNIT_OPTIONS: UnitOption[] = [
    {
        id: 'metric',
        label: 'Metric',
        description: 'International standard',
        examples: ['kg', 'cm', 'g', '°C'],
        icon: 'globe-outline',
    },
    {
        id: 'imperial',
        label: 'Imperial',
        description: 'US customary units',
        examples: ['lbs', 'ft/in', 'oz', '°F'],
        icon: 'flag-outline',
    },
];

export default function EditUnitsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const preferences = useUserStore(s => s.preferences);
    const updatePreferences = useUserStore(s => s.actions.updatePreferences);

    const currentSystem = preferences?.measurementSystem || 'metric';

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        cardSelected: isDark ? '#2C2C2E' : '#FFF5F0',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: COLORS.gamification.vitaminOrange,
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderSelected: COLORS.gamification.vitaminOrange,
    };

    // Auto-sync on selection
    const handleSelect = useCallback((system: MeasurementSystem) => {
        if (system !== currentSystem) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            updatePreferences({ measurementSystem: system });
        }
    }, [currentSystem, updatePreferences]);

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
                    <Text style={[styles.title, { color: colors.text }]}>Units</Text>
                    <View style={styles.headerButton} />
                </View>

                <View style={styles.content}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Choose your preferred measurement system
                    </Text>

                    {UNIT_OPTIONS.map((option, index) => {
                        const isSelected = currentSystem === option.id;
                        return (
                            <Animated.View
                                key={option.id}
                                entering={FadeInDown.delay(index * 100).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.unitCard,
                                        {
                                            backgroundColor: isSelected ? colors.cardSelected : colors.card,
                                            borderColor: isSelected ? colors.borderSelected : colors.border,
                                        },
                                    ]}
                                    onPress={() => handleSelect(option.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        { backgroundColor: isSelected ? `${colors.accent}20` : `${colors.textSecondary}10` },
                                    ]}>
                                        <Ionicons
                                            name={option.icon}
                                            size={28}
                                            color={isSelected ? colors.accent : colors.textSecondary}
                                        />
                                    </View>
                                    <View style={styles.unitInfo}>
                                        <Text style={[styles.unitLabel, { color: colors.text }]}>
                                            {option.label}
                                        </Text>
                                        <Text style={[styles.unitDescription, { color: colors.textSecondary }]}>
                                            {option.description}
                                        </Text>
                                        <View style={styles.examplesRow}>
                                            {option.examples.map((example, i) => (
                                                <View
                                                    key={i}
                                                    style={[styles.exampleChip, { backgroundColor: `${colors.accent}10` }]}
                                                >
                                                    <Text style={[styles.exampleText, { color: colors.accent }]}>
                                                        {example}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
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

                    {/* Live Sync Badge */}
                    <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.infoIcon, { backgroundColor: `${colors.accent}15` }]}>
                                <Ionicons name="sync-outline" size={20} color={colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoTitle, { color: colors.text }]}>Auto-Sync Enabled</Text>
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    All data converts automatically when you change units
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
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
    unitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        marginBottom: 16,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    unitInfo: {
        flex: 1,
    },
    unitLabel: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    unitDescription: {
        fontSize: 14,
        marginBottom: 12,
    },
    examplesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    exampleChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    exampleText: {
        fontSize: 12,
        fontWeight: '700',
    },
    radioOuter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 20,
        padding: 18,
        marginTop: SPACING.lg,
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
