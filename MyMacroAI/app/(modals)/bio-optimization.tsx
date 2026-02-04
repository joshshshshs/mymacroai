/**
 * Bio-Optimization Settings Screen
 * Main modal for peptide protocol tracking configuration
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import {
    useUserStore,
    useBioOptimizationProfile,
    usePeptideDisclaimerAcknowledged,
} from '@/src/store/UserStore';
import { ActiveCompound, PeptideStatus } from '@/src/types';
import { SHADOWS } from '@/src/design-system/tokens';
import {
    PeptideDisclaimer,
    CompoundEditor,
    CompoundListItem,
} from '@/src/components/features/bio-optimization';

export default function BioOptimizationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();

    // Store state
    const bioProfile = useBioOptimizationProfile();
    const disclaimerAcknowledged = usePeptideDisclaimerAcknowledged();

    // Store actions
    const acknowledgePeptideDisclaimer = useUserStore((s) => s.acknowledgePeptideDisclaimer);
    const setPeptideStatus = useUserStore((s) => s.setPeptideStatus);
    const addActiveCompound = useUserStore((s) => s.addActiveCompound);
    const removeActiveCompound = useUserStore((s) => s.removeActiveCompound);
    const updateActiveCompound = useUserStore((s) => s.updateActiveCompound);

    // Local state
    const [showDisclaimer, setShowDisclaimer] = useState(!disclaimerAcknowledged);
    const [showCompoundEditor, setShowCompoundEditor] = useState(false);
    const [editingCompound, setEditingCompound] = useState<ActiveCompound | undefined>();

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: '#FF5C00',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleDisclaimerAccept = () => {
        acknowledgePeptideDisclaimer();
        setShowDisclaimer(false);
    };

    const handleDisclaimerDecline = () => {
        router.back();
    };

    const handleToggleActive = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (value) {
            // Default to undisclosed when first enabling
            setPeptideStatus('ACTIVE_UNDISCLOSED');
        } else {
            setPeptideStatus('NONE');
        }
    };

    const handleDisclosureChange = (disclosed: boolean) => {
        Haptics.selectionAsync();
        setPeptideStatus(disclosed ? 'ACTIVE_DISCLOSED' : 'ACTIVE_UNDISCLOSED');
    };

    const handleAddCompound = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEditingCompound(undefined);
        setShowCompoundEditor(true);
    };

    const handleEditCompound = (compound: ActiveCompound) => {
        setEditingCompound(compound);
        setShowCompoundEditor(true);
    };

    const handleSaveCompound = (compound: ActiveCompound) => {
        if (editingCompound) {
            updateActiveCompound(compound.id, compound);
        } else {
            addActiveCompound(compound);
        }
    };

    const handleDeleteCompound = (compoundId: string) => {
        removeActiveCompound(compoundId);
    };

    const isActive = bioProfile.peptideStatus === 'ACTIVE_DISCLOSED' ||
        bioProfile.peptideStatus === 'ACTIVE_UNDISCLOSED';

    const isDisclosed = bioProfile.peptideStatus === 'ACTIVE_DISCLOSED';

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Bio-Optimization',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                            <Ionicons name="chevron-back" size={24} color={colors.accent} />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Disclaimer Modal */}
            <PeptideDisclaimer
                visible={showDisclaimer}
                onAccept={handleDisclaimerAccept}
                onDecline={handleDisclaimerDecline}
            />

            {/* Compound Editor Modal */}
            <CompoundEditor
                visible={showCompoundEditor}
                compound={editingCompound}
                onSave={handleSaveCompound}
                onDelete={handleDeleteCompound}
                onClose={() => setShowCompoundEditor(false)}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Card */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 92, 0, 0.08)', borderColor: 'rgba(255, 92, 0, 0.2)' }]}>
                        <Ionicons name="information-circle" size={20} color={colors.accent} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            Track your protocols for personalized educational content. All data stays on your device.
                        </Text>
                    </View>
                </Animated.View>

                {/* Current Status Section */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    CURRENT STATUS
                </Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleContent}>
                            <Ionicons name="flask-outline" size={22} color={colors.accent} />
                            <View style={styles.toggleText}>
                                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                                    Peptide Protocols
                                </Text>
                                <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                                    Are you currently utilizing any protocols?
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isActive}
                            onValueChange={handleToggleActive}
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Disclosure Options (if active) */}
                {isActive && (
                    <Animated.View entering={FadeInDown.delay(150).springify()}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            DISCLOSURE LEVEL
                        </Text>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <TouchableOpacity
                                style={styles.optionRow}
                                onPress={() => handleDisclosureChange(false)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionContent}>
                                    <Ionicons
                                        name="eye-off-outline"
                                        size={22}
                                        color={!isDisclosed ? colors.accent : colors.textSecondary}
                                    />
                                    <View style={styles.optionText}>
                                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                                            Keep Details Private
                                        </Text>
                                        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                                            AI knows you're enhanced but won't ask specifics
                                        </Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.radioOuter,
                                    { borderColor: !isDisclosed ? colors.accent : colors.border }
                                ]}>
                                    {!isDisclosed && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
                                </View>
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <TouchableOpacity
                                style={styles.optionRow}
                                onPress={() => handleDisclosureChange(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionContent}>
                                    <Ionicons
                                        name="list-outline"
                                        size={22}
                                        color={isDisclosed ? colors.accent : colors.textSecondary}
                                    />
                                    <View style={styles.optionText}>
                                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                                            List My Protocols
                                        </Text>
                                        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                                            Get more specific educational content
                                        </Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.radioOuter,
                                    { borderColor: isDisclosed ? colors.accent : colors.border }
                                ]}>
                                    {isDisclosed && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {/* Compound List (if disclosed) */}
                {isDisclosed && (
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                                ACTIVE COMPOUNDS
                            </Text>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: colors.accent }]}
                                onPress={handleAddCompound}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={18} color="#FFFFFF" />
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        {bioProfile.activeCompounds.length > 0 ? (
                            <View style={styles.compoundList}>
                                {bioProfile.activeCompounds.map((compound, index) => (
                                    <Animated.View
                                        key={compound.id}
                                        entering={FadeInDown.delay(250 + index * 50).springify()}
                                    >
                                        <CompoundListItem
                                            compound={compound}
                                            onEdit={handleEditCompound}
                                            onDelete={handleDeleteCompound}
                                        />
                                    </Animated.View>
                                ))}
                            </View>
                        ) : (
                            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                                <Ionicons name="flask-outline" size={40} color={colors.textSecondary} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                    No Compounds Added
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                    Tap "Add" to track your first protocol
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Educational Footer */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <View style={styles.footer}>
                        <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            All information is for educational purposes only. Consult healthcare professionals for medical advice.
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    card: {
        borderRadius: 14,
        marginBottom: 24,
        ...SHADOWS.soft,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    toggleText: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    toggleSubtitle: {
        fontSize: 13,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 12,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    compoundList: {
        gap: 12,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 14,
        ...SHADOWS.soft,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 4,
    },
    footerText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },
});
