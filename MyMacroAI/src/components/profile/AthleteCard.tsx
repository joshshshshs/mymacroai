/**
 * AthleteCard - Live Preview Card for Edit Profile
 * Shows the user's public profile as others will see it
 * Features: glassmorphic design, avatar, name, bio, visible stats
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SoftGlassCard } from '../ui/SoftGlassCard';
import { AthleteProfile, StatVisibility } from '../../types';
import { SPACING, RADIUS, COLORS } from '../../design-system/tokens';

interface AthleteCardProps {
    profile: AthleteProfile;
    streak?: number;
    consistencyScore?: number;
    weight?: number | null;
    isPro?: boolean;
    onAvatarPress?: () => void;
}

/**
 * Helper to get initials from display name
 */
const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() || '')
        .join('');
};

/**
 * Build visible stats string based on visibility settings
 */
const buildStatsRow = (
    visibility: StatVisibility,
    streak: number,
    consistencyScore: number,
    weight: number | null
): string[] => {
    const stats: string[] = [];

    if (visibility.showStreak && streak > 0) {
        stats.push(`🔥 ${streak} Day Streak`);
    }
    if (visibility.showConsistency && consistencyScore > 0) {
        stats.push(`💪 ${consistencyScore}% Consistency`);
    }
    if (visibility.showWeight && weight) {
        stats.push(`⚖️ ${weight}kg`);
    }
    if (visibility.showBadges) {
        stats.push(`🏆 Pro`);
    }

    return stats;
};

export const AthleteCard: React.FC<AthleteCardProps> = ({
    profile,
    streak = 0,
    consistencyScore = 0,
    weight = null,
    isPro = false,
    onAvatarPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: COLORS.gamification.vitaminOrange,
    };

    const stats = buildStatsRow(profile.statVisibility, streak, consistencyScore, weight);

    return (
        <SoftGlassCard variant="alpha" style={styles.card}>
            <View style={styles.content}>
                {/* Avatar */}
                <TouchableOpacity
                    onPress={onAvatarPress}
                    activeOpacity={0.8}
                    style={styles.avatarContainer}
                >
                    {profile.avatarUri ? (
                        <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
                    ) : (
                        <LinearGradient
                            colors={['#F3F4F6', '#D1D5DB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarInitials}>
                                {getInitials(profile.displayName)}
                            </Text>
                        </LinearGradient>
                    )}
                    {/* Edit indicator */}
                    <View style={styles.editBadge}>
                        <Text style={styles.editBadgeText}>📷</Text>
                    </View>
                </TouchableOpacity>

                {/* Name & Badge */}
                <View style={styles.nameRow}>
                    <Text style={[styles.displayName, { color: colors.text }]}>
                        {profile.displayName || 'Your Name'}
                    </Text>
                    {isPro && profile.statVisibility.showBadges && (
                        <Text style={styles.proBadge}>👑</Text>
                    )}
                </View>

                {/* Handle */}
                {profile.handle && (
                    <Text style={[styles.handle, { color: colors.textSecondary }]}>
                        @{profile.handle}
                    </Text>
                )}

                {/* Bio */}
                {profile.bio ? (
                    <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>
                        {profile.bio}
                    </Text>
                ) : (
                    <Text style={[styles.bioPlaceholder, { color: colors.textSecondary }]}>
                        What is your current mission?
                    </Text>
                )}

                {/* Stats Row */}
                {stats.length > 0 && (
                    <View style={styles.statsRow}>
                        {stats.slice(0, 3).map((stat, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <Text style={styles.statDivider}>|</Text>}
                                <Text style={[styles.stat, { color: colors.text }]}>{stat}</Text>
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </View>
        </SoftGlassCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.md,
    },
    content: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
    },
    avatarInitials: {
        fontSize: 36,
        fontWeight: '800',
        color: '#4B5563',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    editBadgeText: {
        fontSize: 14,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    displayName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    proBadge: {
        fontSize: 18,
    },
    handle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    bio: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: SPACING.sm,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
    bioPlaceholder: {
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'italic',
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.lg,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    stat: {
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 8,
    },
    statDivider: {
        fontSize: 12,
        color: '#D1D5DB',
    },
});

export default AthleteCard;
