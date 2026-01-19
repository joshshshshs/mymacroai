/**
 * Profile Screen - Control Center
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

import { SPACING } from '@/src/design-system/tokens';
import { ProfileMenuItem } from '@/src/components/profile';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme, getThemeLabel } from '@/hooks/useTheme';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light } = useHaptics();
    const preferences = useUserStore(s => s.preferences);
    const { themePreference } = useTheme();

    // Mock user data
    const user = {
        name: 'Josh Lifts',
        email: 'josh@example.com',
        avatarUrl: null,
        isPro: false,
        memberSince: '2026',
    };

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        accent: '#FF5C00',
        gold: '#FFD700',
    };

    const navigate = (route: string) => {
        light();
        router.push(route as any);
    };

    // Pulse animation for Pro card
    const pulse = useSharedValue(1);
    const shimmer = useSharedValue(0);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
        shimmer.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: '',
                    headerTransparent: true,
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Hero Header */}
                    <View style={styles.heroSection}>
                        <View style={[styles.avatarRing, { borderColor: colors.accent }]}>
                            {user.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                                        {user.name.charAt(0)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.nameRow}>
                            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                            {user.isPro && (
                                <View style={[styles.proBadge, { backgroundColor: colors.gold }]}>
                                    <Ionicons name="star" size={10} color="#1A1A1A" />
                                    <Text style={styles.proBadgeText}>PRO</Text>
                                </View>
                            )}
                        </View>

                        <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
                            Member since {user.memberSince}
                        </Text>

                        <TouchableOpacity onPress={() => navigate('/(modals)/edit-profile')}>
                            <Text style={[styles.editProfile, { color: colors.accent }]}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Pro Upsell */}
                    {!user.isPro && (
                        <Animated.View style={pulseStyle}>
                            <TouchableOpacity onPress={() => navigate('/(modals)/premium')} activeOpacity={0.85}>
                                <LinearGradient
                                    colors={['#FFD700', '#FF8C00', '#FF5C00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.proCard}
                                >
                                    <View style={styles.proCardContent}>
                                        <View style={styles.proIconWrap}>
                                            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.proCardText}>
                                            <Text style={styles.proCardTitle}>Unlock MyMacro Pro</Text>
                                            <Text style={styles.proCardSubtitle}>
                                                AI Scans • Sleep Analysis • Coach Mode
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Menu Groups */}
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SETTINGS</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <ProfileMenuItem
                            icon="settings-outline"
                            label="Preferences & Tuning"
                            subtitle="Bio data, AI persona, theme"
                            onPress={() => navigate('/(modals)/settings')}
                        />
                        <ProfileMenuItem
                            icon="watch-outline"
                            label="My Devices"
                            subtitle="Connect Apple Health, Oura, Whoop"
                            onPress={() => navigate('/(modals)/features')}
                        />
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRIVACY</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <ProfileMenuItem
                            icon="shield-outline"
                            label="Data Vault & Privacy"
                            subtitle="Ghost mode, export, storage"
                            onPress={() => navigate('/(modals)/data-privacy')}
                        />
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SOCIAL</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <ProfileMenuItem
                            icon="people-outline"
                            label="Squad & Referrals"
                            subtitle="Invite friends, wagers"
                            onPress={() => navigate('/(modals)/referrals')}
                        />
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HELP</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <ProfileMenuItem
                            icon="help-circle-outline"
                            label="Support & About"
                            subtitle="Roadmap, legal, version"
                            onPress={() => navigate('/(modals)/support')}
                        />
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPEARANCE</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <ProfileMenuItem
                            icon="contrast-outline"
                            label="Theme"
                            subtitle={getThemeLabel(themePreference)}
                            onPress={() => navigate('/(modals)/edit-theme')}
                        />
                    </View>

                    {/* Sign Out */}
                    <View style={[styles.card, { backgroundColor: colors.card, marginTop: 24 }]}>
                        <ProfileMenuItem
                            icon="log-out-outline"
                            label="Sign Out"
                            danger
                            onPress={() => { }}
                        />
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
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
    closeButton: {
        padding: 8,
    },
    content: {
        padding: SPACING.lg,
        paddingTop: 60,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: '800',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    memberSince: {
        fontSize: 13,
        marginTop: 4,
    },
    editProfile: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
    },
    proCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 18,
        marginBottom: 8,
    },
    proCardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    proIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    proCardText: {
        flex: 1,
    },
    proCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    proCardSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
});
