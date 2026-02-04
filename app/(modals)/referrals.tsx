/**
 * Referrals Modal - Referral Hub with sharing, pending, and verified referrals
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Share,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { referralService, Referral } from '@/src/services/social/ReferralService';

export default function ReferralsModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);
    const [verifiedReferrals, setVerifiedReferrals] = useState<Referral[]>([]);
    const [referralCode, setReferralCode] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    const colors = {
        bg: isDark ? '#121214' : '#F2F2F4',
        card: isDark ? '#1E1E20' : '#FFFFFF',
        cardAlt: isDark ? '#2C2C2E' : '#E8E8EA',
        glass: isDark ? 'rgba(30, 30, 32, 0.65)' : 'rgba(255, 255, 255, 0.65)',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        accent: '#FF5C00', // Vitamin Orange - consistent with app design
        success: '#10B981',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const userName = user?.name || 'User';
        const userId = user?.id || 'user_id';
        const code = referralService.getReferralCode(userName, userId);
        setReferralCode(code.code);
        setShareLink(code.shareLink);
        setPendingReferrals(referralService.getPendingReferrals());
        setVerifiedReferrals(referralService.getVerifiedReferrals());
    };

    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(shareLink);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            const message = referralService.getShareMessage(referralCode, user?.name || 'User');
            await Share.share({
                message,
                title: 'Join MyMacro AI',
            });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleNudge = async (referralId: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const success = await referralService.nudgeReferral(referralId);
        if (success) {
            loadData();
            Alert.alert('Nudge Sent!', 'We\'ve reminded your friend to join.');
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    };

    const stats = referralService.getReferralStats();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Referrals</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <View style={styles.heroSection}>
                            <Text style={[styles.heroLabel, { color: colors.accent }]}>SQUAD GROWTH</Text>
                            <Text style={[styles.heroTitle, { color: colors.text }]}>
                                Expand your{'\n'}circle.
                            </Text>
                            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                                Stronger together. Refer a friend and unlock a{' '}
                                <Text style={{ color: colors.accent, fontWeight: '700' }}>$5 credit</Text>.
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Add Friend Icons */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <View style={styles.friendIconsRow}>
                            <View style={[styles.dashedCircle, { borderColor: colors.textSecondary }]}>
                                <Ionicons name="person-outline" size={28} color={colors.textSecondary} />
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: colors.accent }]}
                                onPress={handleShare}
                            >
                                <Ionicons name="gift" size={36} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View style={[styles.dashedCircle, { borderColor: colors.textSecondary }]}>
                                <Ionicons name="person-outline" size={28} color={colors.textSecondary} />
                            </View>
                        </View>
                    </Animated.View>

                    {/* Referral Link Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <View style={[styles.glassCard, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                            <LinearGradient
                                colors={[`${colors.accent}15`, 'transparent']}
                                start={{ x: 1, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                            />
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Referral Link</Text>
                                <View style={[styles.badge, { backgroundColor: `${colors.success}15`, borderColor: `${colors.success}30` }]}>
                                    <Text style={[styles.badgeText, { color: colors.success }]}>GET $5 OFF</Text>
                                </View>
                            </View>

                            <View style={[styles.linkBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.linkContent}>
                                    <Text style={[styles.linkLabel, { color: colors.textSecondary }]}>YOUR LINK</Text>
                                    <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>
                                        mymacro.ai/u/{user?.name?.toLowerCase().replace(/\s/g, '') || 'user'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.copyButton, { backgroundColor: colors.cardAlt }]}
                                    onPress={handleCopyCode}
                                >
                                    <Ionicons
                                        name={copied ? 'checkmark' : 'copy-outline'}
                                        size={20}
                                        color={copied ? colors.success : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.shareButton, { backgroundColor: colors.accent }]}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.shareButtonText}>Share Invite</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Stats Row */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                                <View style={[styles.statIcon, { backgroundColor: '#3B82F615' }]}>
                                    <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                                </View>
                                <Text style={[styles.statTitle, { color: colors.text }]}>Verified</Text>
                                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>Invitees only</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.glass, borderColor: colors.border }]}>
                                <View style={[styles.statIcon, { backgroundColor: '#8B5CF615' }]}>
                                    <Ionicons name="infinite" size={20} color="#8B5CF6" />
                                </View>
                                <Text style={[styles.statTitle, { color: colors.text }]}>Unlimited</Text>
                                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>No cap on credits</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Pending Referrals */}
                    {pendingReferrals.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PENDING REFERRALS</Text>
                                    <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                                        {pendingReferrals.length} Pending
                                    </Text>
                                </View>
                                {pendingReferrals.map((referral) => (
                                    <View
                                        key={referral.id}
                                        style={[styles.referralCard, { backgroundColor: colors.card }]}
                                    >
                                        <View style={styles.referralLeft}>
                                            <View style={[styles.referralAvatar, { backgroundColor: colors.cardAlt }]}>
                                                <Text style={[styles.referralInitial, { color: colors.textSecondary }]}>
                                                    {referral.referredName?.charAt(0) || '?'}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.referralName, { color: colors.text }]}>
                                                    {referral.referredName || 'Unknown'}
                                                </Text>
                                                <View style={styles.referralStatus}>
                                                    <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                                                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                                                        {referral.nudgeCount > 0
                                                            ? `Link sent ${getTimeAgo(referral.lastNudgeAt || referral.createdAt)}`
                                                            : 'Waiting to join'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.nudgeButton, { backgroundColor: colors.cardAlt }]}
                                            onPress={() => handleNudge(referral.id)}
                                        >
                                            <Text style={[styles.nudgeText, { color: colors.text }]}>Nudge</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    {/* Verified Referrals */}
                    {verifiedReferrals.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>VERIFIED REFERRALS</Text>
                                    <Text style={[styles.sectionCount, { color: colors.success }]}>
                                        ${verifiedReferrals.length * 5} Earned
                                    </Text>
                                </View>
                                {verifiedReferrals.map((referral) => (
                                    <View
                                        key={referral.id}
                                        style={[styles.referralCard, { backgroundColor: colors.card }]}
                                    >
                                        <View style={styles.referralLeft}>
                                            <View style={[styles.referralAvatar, { backgroundColor: `${colors.success}15` }]}>
                                                <Ionicons name="checkmark" size={18} color={colors.success} />
                                            </View>
                                            <View>
                                                <Text style={[styles.referralName, { color: colors.text }]}>
                                                    {referral.referredName || 'Unknown'}
                                                </Text>
                                                <View style={styles.referralStatus}>
                                                    <Text style={[styles.statusText, { color: colors.success }]}>
                                                        Joined {getTimeAgo(referral.verifiedAt || referral.createdAt)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.creditBadge, { backgroundColor: `${colors.success}15` }]}>
                                            <Text style={[styles.creditText, { color: colors.success }]}>+$5</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    {/* Empty State */}
                    {pendingReferrals.length === 0 && verifiedReferrals.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No referrals yet</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                Share your link to start earning credits!
                            </Text>
                        </View>
                    )}

                    {/* Bottom spacing */}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: SPACING.lg,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    heroLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    friendIconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginBottom: SPACING.xl,
    },
    dashedCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    addButton: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF5C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    glassCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    linkBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    linkContent: {
        flex: 1,
        marginRight: 12,
    },
    linkLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '700',
    },
    copyButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#FF5C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statTitle: {
        fontSize: 12,
        fontWeight: '700',
    },
    statSubtitle: {
        fontSize: 10,
        marginTop: 2,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    sectionCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    referralCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
    },
    referralLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    referralAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    referralInitial: {
        fontSize: 18,
        fontWeight: '600',
    },
    referralName: {
        fontSize: 14,
        fontWeight: '600',
    },
    referralStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
    },
    nudgeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    nudgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    creditBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    creditText: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
});
