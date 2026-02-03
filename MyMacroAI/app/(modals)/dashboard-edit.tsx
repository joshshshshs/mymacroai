/**
 * Dashboard Edit Mode - Customize quick actions and layout
 * Features:
 * - Custom quick action buttons
 * - Widget visibility toggles
 * - List reordering (simplified without drag)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';

const QUICK_ACTIONS = [
    { id: 'workout', icon: 'barbell-outline', label: 'Workout', color: '#FF5C00' },
    { id: 'meal', icon: 'restaurant-outline', label: 'Meal', color: '#F59E0B' },
    { id: 'water', icon: 'water-outline', label: 'Water', color: '#3B82F6' },
    { id: 'voice', icon: 'mic-outline', label: 'Voice Log', color: '#FF5C00' },
    { id: 'scan', icon: 'scan-outline', label: 'Scan', color: '#22C55E' },
    { id: 'weight', icon: 'scale-outline', label: 'Weight', color: '#8B5CF6' },
    { id: 'journal', icon: 'book-outline', label: 'Journal', color: '#EC4899' },
    { id: 'sleep', icon: 'moon-outline', label: 'Sleep', color: '#6366F1' },
];

const WIDGETS = [
    { id: 'macro-ring', label: 'Macro Ring', enabled: true },
    { id: 'ai-summary', label: 'AI Summary', enabled: true },
    { id: 'quick-actions', label: 'Quick Actions', enabled: true },
    { id: 'activity-cards', label: 'Activity Cards', enabled: true },
];

export default function DashboardEditScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { preferences, setQuickActions, toggleWidget: persistToggleWidget, isWidgetVisible } = useWidgetPreferences();

    const [selectedActions, setSelectedActions] = useState<string[]>(preferences.quickActions || ['workout', 'meal', 'water', 'voice']);
    const [widgets, setWidgets] = useState(() =>
        WIDGETS.map(w => ({ ...w, enabled: isWidgetVisible(w.id) }))
    );

    // Sync with persisted preferences when they load
    useEffect(() => {
        if (preferences.quickActions) {
            setSelectedActions(preferences.quickActions);
        }
        setWidgets(WIDGETS.map(w => ({ ...w, enabled: isWidgetVisible(w.id) })));
    }, [preferences, isWidgetVisible]);

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1E1E20' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: '#FF5C00',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        success: '#22C55E',
    };

    const toggleAction = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (selectedActions.includes(id)) {
            setSelectedActions(selectedActions.filter(a => a !== id));
        } else if (selectedActions.length < 4) {
            setSelectedActions([...selectedActions, id]);
        }
    };

    const toggleWidget = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setWidgets(widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
        // Persist widget visibility
        persistToggleWidget(id);
    };

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Persist quick actions
        setQuickActions(selectedActions);
        // Widget toggles are persisted individually via toggleWidget
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Customize Dashboard',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={[styles.saveButtonText, { color: colors.accent }]}>Done</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions Section */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                    <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                        Choose up to 4 actions for your dashboard
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.actionsGrid}>
                            {QUICK_ACTIONS.map((action) => {
                                const isSelected = selectedActions.includes(action.id);
                                return (
                                    <TouchableOpacity
                                        key={action.id}
                                        style={[
                                            styles.actionItem,
                                            isSelected && { backgroundColor: `${action.color}15`, borderColor: action.color },
                                        ]}
                                        onPress={() => toggleAction(action.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.actionIcon, { backgroundColor: isSelected ? `${action.color}20` : colors.border }]}>
                                            <Ionicons
                                                name={action.icon as any}
                                                size={20}
                                                color={isSelected ? action.color : colors.textSecondary}
                                            />
                                        </View>
                                        <Text style={[styles.actionLabel, { color: isSelected ? action.color : colors.textSecondary }]}>
                                            {action.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={[styles.checkBadge, { backgroundColor: action.color }]}>
                                                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </Animated.View>

                {/* Widgets Section */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.xl }]}>Widgets</Text>
                    <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                        Toggle visibility of dashboard sections
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {widgets.map((widget, index) => (
                            <View
                                key={widget.id}
                                style={[
                                    styles.widgetRow,
                                    index < widgets.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.widgetLabel, { color: colors.text }]}>{widget.label}</Text>
                                <Switch
                                    value={widget.enabled}
                                    onValueChange={() => toggleWidget(widget.id)}
                                    trackColor={{ false: colors.border, true: `${colors.accent}50` }}
                                    thumbColor={widget.enabled ? colors.accent : '#F4F3F4'}
                                />
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Selected Preview */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.xl }]}>Preview</Text>
                    <View style={styles.previewRow}>
                        {selectedActions.slice(0, 4).map((id) => {
                            const action = QUICK_ACTIONS.find(a => a.id === id);
                            if (!action) return null;
                            return (
                                <View key={id} style={styles.previewItem}>
                                    <View style={[styles.previewIcon, { backgroundColor: `${action.color}15` }]}>
                                        <Ionicons name={action.icon as any} size={24} color={action.color} />
                                    </View>
                                    <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                                        {action.label}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
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
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    sectionHint: {
        fontSize: 13,
        marginBottom: SPACING.md,
    },
    card: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        padding: SPACING.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    actionItem: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    widgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
    },
    widgetLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SPACING.lg,
    },
    previewItem: {
        alignItems: 'center',
    },
    previewIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    previewLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
});
