import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { PASTEL_COLORS, SOFT_RADIUS, SOFT_TYPOGRAPHY } from '@/src/design-system/aesthetics';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { ThemedText } from '@/src/components/ui/ThemedText';

const { width } = Dimensions.get('window');

export default function ProfileModal() {
    const router = useRouter();
    const { light } = useHaptics();

    // Mock data falling back to store later
    const userName = "Joshua";
    const joinDate = "Member since Jan 2024";
    const { streak, coins } = useUserStore(state => ({
        streak: state.streak,
        coins: state.coins
    }));

    const handleClose = () => {
        light();
        router.back();
    };

    const handleSettings = () => {
        light();
        router.push('/(modals)/settings');
    };

    const menuItems = [
        { icon: 'settings-outline', label: 'Settings', action: handleSettings, color: '#64748B' },
        { icon: 'person-outline', label: 'Edit Profile', action: () => light(), color: '#64748B' },
        { icon: 'help-circle-outline', label: 'Help & Support', action: () => light(), color: '#64748B' },
        { icon: 'star-outline', label: 'Rate App', action: () => light(), color: '#64748B' },
    ];

    return (
        <View style={styles.container}>
            <SoftDreamyBackground />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={32} color="rgba(0,0,0,0.5)" />
                </TouchableOpacity>
                <ThemedText variant="h3" style={styles.headerTitle}>Profile</ThemedText>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <SoftGlassCard variant="prominent" gradient="purpleDream" style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#E0C3FC', '#8EC5FC']}
                            style={styles.avatarPlaceholder}
                        >
                            <ThemedText variant="h1" style={styles.avatarInitials}>{userName.charAt(0)}</ThemedText>
                        </LinearGradient>
                        <View style={styles.proBadge}>
                            <ThemedText variant="caption" style={styles.proText}>PRO</ThemedText>
                        </View>
                    </View>

                    <ThemedText variant="h2" style={styles.userName}>{userName}</ThemedText>
                    <Text style={styles.joinDate}>{joinDate}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{streak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{coins}</Text>
                            <Text style={styles.statLabel}>MacroCoins</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Workouts</Text>
                        </View>
                    </View>
                </SoftGlassCard>

                {/* Menu Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} activeOpacity={0.7} onPress={item.action}>
                            <SoftGlassCard variant="soft" style={styles.menuItem}>
                                <View style={styles.menuLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.3)" />
                            </SoftGlassCard>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity activeOpacity={0.7} onPress={() => light()} style={styles.signOutButton}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 2.1.0 (Beta)</Text>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'rgba(0,0,0,0.8)',
    },
    content: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 40,
    },
    profileCard: {
        alignItems: 'center',
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        borderRadius: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    avatarInitials: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFF',
    },
    proBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    proText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    joinDate: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.5)',
        marginBottom: SPACING.xl,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingVertical: SPACING.md,
        borderRadius: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(0,0,0,0.5)',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
    },
    menuContainer: {
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderRadius: 20,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    signOutButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        marginTop: SPACING.md,
    },
    signOutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        marginTop: SPACING.lg,
        color: 'rgba(0,0,0,0.3)',
        fontSize: 12,
    },
});
