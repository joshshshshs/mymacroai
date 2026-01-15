import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInRight, SlideOutRight, FadeIn, FadeOut } from 'react-native-reanimated';

// UI
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { haptics } from '@/src/utils/haptics';

interface ProfileDrawerProps {
    visible: boolean;
    onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ visible, onClose }) => {
    // Mock States
    const [notifications, setNotifications] = useState(true);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);

    if (!visible) return null;

    const handleImportCSV = () => {
        haptics.medium();
        Alert.alert("Legacy Bridge", "Importing MyFitnessPal CSV... (Mock)");
    };

    const handleNukeData = () => {
        haptics.error();
        Alert.alert(
            "SPARTAN PROTOCOL",
            "Are you sure you want to nuke all your data? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "NUKE IT", style: "destructive", onPress: () => { /* TODO: Implement data deletion */ } }
            ]
        );
    };

    return (
        <View style={styles.overlay}>
            {/* Backdrop */}
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

            {/* Drawer */}
            <Animated.View
                entering={SlideInRight.springify().damping(20)}
                exiting={SlideOutRight}
                style={styles.drawer}
            >
                <SafeAreaView style={styles.drawerContent} edges={['top', 'bottom']}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#F1F5F9" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Bio-Data Section */}
                        <Text style={styles.sectionTitle}>BIO-DATA</Text>
                        <SoftGlassCard style={styles.sectionCard} variant="soft">
                            <View style={styles.row}>
                                <Text style={styles.label}>Height</Text>
                                <Text style={styles.value}>180 cm</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <Text style={styles.label}>Weight</Text>
                                <Text style={styles.value}>75 kg</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <Text style={styles.label}>Goal</Text>
                                <Text style={styles.value}>Hypertrophy</Text>
                            </View>
                        </SoftGlassCard>

                        {/* App Settings */}
                        <Text style={styles.sectionTitle}>SYSTEM</Text>
                        <SoftGlassCard style={styles.sectionCard} variant="soft">
                            <View style={styles.row}>
                                <Text style={styles.label}>Notifications</Text>
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: '#333', true: '#10B981' }}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <Text style={styles.label}>Haptics</Text>
                                <Switch
                                    value={hapticsEnabled}
                                    onValueChange={setHapticsEnabled}
                                    trackColor={{ false: '#333', true: '#10B981' }}
                                />
                            </View>
                        </SoftGlassCard>

                        {/* Legacy Bridge */}
                        <Text style={styles.sectionTitle}>LEGACY BRIDGE</Text>
                        <TouchableOpacity onPress={handleImportCSV} activeOpacity={0.8}>
                            <SoftGlassCard style={styles.actionCard} variant="medium">
                                <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Import MyFitnessPal CSV</Text>
                                    <Text style={styles.actionSub}>Transfer your legacy data securely.</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                            </SoftGlassCard>
                        </TouchableOpacity>

                        {/* Data Privacy (Danger Zone) */}
                        <Text style={[styles.sectionTitle, { color: '#EF4444', marginTop: 30 }]}>DANGER ZONE</Text>
                        <TouchableOpacity onPress={handleNukeData} activeOpacity={0.8}>
                            <View style={styles.nukeButton}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                <Text style={styles.nukeText}>Nuke My Data</Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.version}>v2.1.0 (Soft-Spartan)</Text>
                        <View style={{ height: 50 }} />
                    </ScrollView>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

// Need to import SafeAreaView locally or from library if not using the wrapper
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100, // Top of everything
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '85%',
        backgroundColor: '#0F172A',
        shadowColor: "#000",
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
    },
    drawerContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    closeBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
    },
    sectionCard: {
        marginBottom: 24,
        paddingVertical: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    label: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        color: '#94A3B8',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        marginBottom: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        color: '#F1F5F9',
        fontWeight: '600',
        fontSize: 14,
    },
    actionSub: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 2,
    },
    nukeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    nukeText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 14,
    },
    version: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 32,
        marginBottom: 20,
    },
});
