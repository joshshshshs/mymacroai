/**
 * ProfileMenuItem - Reusable menu row component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: 'chevron' | 'toggle' | 'badge';
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
    badgeText?: string;
    danger?: boolean;
}

export const ProfileMenuItem: React.FC<Props> = ({
    icon,
    iconColor,
    label,
    subtitle,
    onPress,
    rightElement = 'chevron',
    toggleValue,
    onToggle,
    badgeText,
    danger,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: danger ? '#EF4444' : isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        iconBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        accent: '#FF5C00',
    };

    const handlePress = () => {
        if (onPress) {
            light();
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.bg }]}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={rightElement === 'toggle'}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor || colors.accent} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                )}
            </View>

            {rightElement === 'chevron' && (
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            )}

            {rightElement === 'toggle' && (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.iconBg, true: colors.accent }}
                    ios_backgroundColor={colors.iconBg}
                />
            )}

            {rightElement === 'badge' && badgeText && (
                <View style={[styles.badge, { backgroundColor: `${colors.accent}15` }]}>
                    <Text style={[styles.badgeText, { color: colors.accent }]}>{badgeText}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 2,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
