/**
 * ManageWidgetsSheet - Bottom sheet for widget customization
 */

import React, { useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { WIDGET_REGISTRY, isWidgetUnlocked, getRequirementText } from '@/src/config/widgetRegistry';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';
import { useConnectedDevices } from '@/hooks/useConnectedDevices';
import { useHaptics } from '@/hooks/useHaptics';
import { useTabBarStore } from '@/src/store/tabBarStore';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const ManageWidgetsSheet: React.FC<Props> = ({ visible, onClose }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();
    const { preferences, toggleWidget } = useWidgetPreferences();
    const { connectedDevices } = useConnectedDevices();
    const { hideTabBar, showTabBar } = useTabBarStore();

    // Hide tab bar when sheet opens, show when it closes
    useEffect(() => {
        if (visible) {
            hideTabBar();
        } else {
            showTabBar();
        }
    }, [visible, hideTabBar, showTabBar]);

    const colors = {
        bg: isDark ? '#1C1C1E' : '#FFFFFF',
        overlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        accent: '#FF5C00',
        switchTrack: isDark ? '#39393D' : '#E5E5EA',
    };

    const handleToggle = useCallback((widgetId: string) => {
        light();
        toggleWidget(widgetId);
    }, [toggleWidget, light]);

    // Group widgets by category
    const groupedWidgets = useMemo(() => {
        const groups: { [key: string]: typeof WIDGET_REGISTRY } = {};
        WIDGET_REGISTRY.forEach(widget => {
            if (!groups[widget.category]) {
                groups[widget.category] = [];
            }
            groups[widget.category].push(widget);
        });
        return groups;
    }, []);

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'vital': return 'Vitals';
            case 'recovery': return 'Recovery';
            case 'hormonal': return 'Hormonal';
            case 'activity': return 'Activity';
            default: return category;
        }
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Backdrop */}
            <Animated.View
                entering={FadeIn.duration(200)}
                style={[styles.backdrop, { backgroundColor: colors.overlay }]}
            >
                <TouchableOpacity style={styles.backdropTouch} onPress={onClose} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                entering={SlideInDown.springify().damping(20)}
                style={styles.sheetContainer}
            >
                <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
                    <View style={[styles.sheet, { backgroundColor: colors.bg }]}>
                        {/* Handle */}
                        <View style={styles.handleContainer}>
                            <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text }]}>Manage Widgets</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {Object.entries(groupedWidgets).map(([category, widgets]) => (
                                <View key={category} style={styles.section}>
                                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                                        {getCategoryLabel(category).toUpperCase()}
                                    </Text>

                                    {widgets.map(widget => {
                                        const isVisible = preferences.visibleWidgets.includes(widget.id);
                                        const isUnlocked = isWidgetUnlocked(widget, connectedDevices);

                                        return (
                                            <View
                                                key={widget.id}
                                                style={[styles.widgetRow, { borderBottomColor: colors.border }]}
                                            >
                                                <View style={styles.widgetInfo}>
                                                    <View style={styles.widgetHeader}>
                                                        <Text style={[styles.widgetName, { color: colors.text }]}>
                                                            {widget.name}
                                                        </Text>
                                                        {!isUnlocked && (
                                                            <View style={styles.lockBadge}>
                                                                <Ionicons name="lock-closed" size={10} color={colors.textSecondary} />
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={[styles.widgetDesc, { color: colors.textSecondary }]}>
                                                        {isUnlocked ? widget.description : `Requires ${getRequirementText(widget)}`}
                                                    </Text>
                                                </View>

                                                <Switch
                                                    value={isVisible}
                                                    onValueChange={() => handleToggle(widget.id)}
                                                    trackColor={{ false: colors.switchTrack, true: colors.accent }}
                                                    ios_backgroundColor={colors.switchTrack}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </BlurView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropTouch: {
        flex: 1,
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '75%',
    },
    blur: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        opacity: 0.3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    widgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    widgetInfo: {
        flex: 1,
        marginRight: 16,
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    widgetName: {
        fontSize: 15,
        fontWeight: '600',
    },
    lockBadge: {
        backgroundColor: 'rgba(150,150,150,0.2)',
        padding: 3,
        borderRadius: 4,
    },
    widgetDesc: {
        fontSize: 12,
        marginTop: 2,
    },
});
