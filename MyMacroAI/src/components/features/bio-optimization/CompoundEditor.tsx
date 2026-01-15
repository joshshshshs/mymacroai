/**
 * CompoundEditor - Add/edit individual compound entries
 *
 * Fields:
 * - name: TextInput (required)
 * - dosage: TextInput (required)
 * - frequency: Picker (daily, 2x/week, 3x/week, weekly, as needed)
 * - notes: Optional multiline TextInput
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ActiveCompound } from '@/src/types';
import { useTheme } from '@/hooks/useTheme';
import { SHADOWS } from '@/src/design-system/tokens';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: '2x/week', label: '2x per week' },
    { value: '3x/week', label: '3x per week' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as needed', label: 'As needed' },
];

interface CompoundEditorProps {
    visible: boolean;
    compound?: ActiveCompound; // undefined = adding new
    onSave: (compound: ActiveCompound) => void;
    onDelete?: (compoundId: string) => void;
    onClose: () => void;
}

export const CompoundEditor: React.FC<CompoundEditorProps> = ({
    visible,
    compound,
    onSave,
    onDelete,
    onClose,
}) => {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const isEditing = !!compound;

    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [notes, setNotes] = useState('');

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        accent: '#FF5C00',
        danger: '#EF4444',
    };

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            if (compound) {
                setName(compound.name);
                setDosage(compound.dosage);
                setFrequency(compound.frequency);
                setNotes(compound.notes || '');
            } else {
                setName('');
                setDosage('');
                setFrequency('daily');
                setNotes('');
            }
        }
    }, [visible, compound]);

    const handleSave = () => {
        if (!name.trim() || !dosage.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const newCompound: ActiveCompound = {
            id: compound?.id || Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            dosage: dosage.trim(),
            frequency,
            notes: notes.trim() || undefined,
            source: 'user_input',
        };

        onSave(newCompound);
        onClose();
    };

    const handleDelete = () => {
        if (compound && onDelete) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onDelete(compound.id);
            onClose();
        }
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    const isValid = name.trim().length > 0 && dosage.trim().length > 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.bg }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                            <Text style={[styles.headerButtonText, { color: colors.accent }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {isEditing ? 'Edit Compound' : 'Add Compound'}
                        </Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={styles.headerButton}
                            disabled={!isValid}
                        >
                            <Text
                                style={[
                                    styles.headerButtonText,
                                    { color: isValid ? colors.accent : colors.textSecondary },
                                ]}
                            >
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                COMPOUND NAME *
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="flask-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g., BPC-157, TB-500"
                                    placeholderTextColor={colors.textSecondary}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Dosage Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                DOSAGE *
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="eyedrop-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={dosage}
                                    onChangeText={setDosage}
                                    placeholder="e.g., 250mcg, 2mg"
                                    placeholderTextColor={colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Frequency Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                FREQUENCY
                            </Text>
                            <View style={styles.frequencyContainer}>
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.frequencyChip,
                                            {
                                                backgroundColor: frequency === option.value
                                                    ? colors.accent
                                                    : colors.card,
                                                borderColor: frequency === option.value
                                                    ? colors.accent
                                                    : colors.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setFrequency(option.value);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.frequencyChipText,
                                                {
                                                    color: frequency === option.value
                                                        ? '#FFFFFF'
                                                        : colors.text,
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Notes Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                NOTES (OPTIONAL)
                            </Text>
                            <View style={[styles.notesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.notesInput, { color: colors.text }]}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Any additional notes..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Delete Button (if editing) */}
                        {isEditing && onDelete && (
                            <TouchableOpacity
                                style={[styles.deleteButton, { borderColor: colors.danger }]}
                                onPress={handleDelete}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                <Text style={[styles.deleteText, { color: colors.danger }]}>
                                    Remove Compound
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Disclaimer */}
                        <View style={styles.disclaimer}>
                            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                                This information is stored locally and used only to personalize educational content.
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    headerButtonText: {
        fontSize: 17,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    frequencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    frequencyChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    frequencyChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    notesContainer: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        minHeight: 100,
    },
    notesInput: {
        fontSize: 16,
        lineHeight: 22,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 16,
    },
    deleteText: {
        fontSize: 16,
        fontWeight: '600',
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 24,
        paddingHorizontal: 4,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },
});

export default CompoundEditor;
