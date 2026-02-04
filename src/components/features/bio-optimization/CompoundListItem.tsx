/**
 * CompoundListItem - Display row for a single compound
 * Shows: name, dosage, frequency
 * Right element: edit/delete actions
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ActiveCompound } from '@/src/types';
import { useTheme } from '@/hooks/useTheme';
import { SHADOWS } from '@/src/design-system/tokens';

interface CompoundListItemProps {
    compound: ActiveCompound;
    onEdit: (compound: ActiveCompound) => void;
    onDelete: (compoundId: string) => void;
}

export const CompoundListItem: React.FC<CompoundListItemProps> = ({
    compound,
    onEdit,
    onDelete,
}) => {
    const { isDark } = useTheme();

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        iconBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        accent: '#FF5C00',
        danger: '#EF4444',
    };

    const handleEdit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onEdit(compound);
    };

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Remove Compound',
            `Are you sure you want to remove ${compound.name} from your tracked protocols?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => onDelete(compound.id),
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="flask-outline" size={20} color={colors.accent} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.name, { color: colors.text }]}>
                    {compound.name}
                </Text>
                <Text style={[styles.details, { color: colors.textSecondary }]}>
                    {compound.dosage} · {compound.frequency}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleEdit}
                    activeOpacity={0.7}
                >
                    <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        ...SHADOWS.soft,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    details: {
        fontSize: 13,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CompoundListItem;
