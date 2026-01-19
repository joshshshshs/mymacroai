/**
 * FeatureRequestCard - Voting Board Card
 * 
 * Displays a feature request with voting controls.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { FeatureRequest, VoteType, STATUS_LABELS, FEATURE_CATEGORIES } from '@/src/services/supabase/featureVoting';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

interface FeatureRequestCardProps {
    request: FeatureRequest;
    onVote: (voteType: VoteType) => void;
    onPress?: () => void;
}

export const FeatureRequestCard: React.FC<FeatureRequestCardProps> = ({
    request,
    onVote,
    onPress,
}) => {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const themeColors = {
        bg: isDark ? '#1A1A1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        border: isDark ? '#2A2A2E' : '#E5E7EB',
    };

    const category = FEATURE_CATEGORIES.find(c => c.id === request.category);
    const status = STATUS_LABELS[request.status];

    const handleVote = (type: VoteType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onVote(type);
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Vote Controls */}
            <View style={styles.voteColumn}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        request.user_vote === 'up' && { backgroundColor: `${colors.primary}20` },
                    ]}
                    onPress={() => handleVote('up')}
                >
                    <Ionicons
                        name={request.user_vote === 'up' ? 'arrow-up' : 'arrow-up-outline'}
                        size={20}
                        color={request.user_vote === 'up' ? colors.primary : themeColors.textSecondary}
                    />
                </TouchableOpacity>

                <Text style={[
                    styles.scoreText,
                    { color: request.score > 0 ? colors.primary : themeColors.textSecondary },
                ]}>
                    {request.score}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        request.user_vote === 'down' && { backgroundColor: '#EF444420' },
                    ]}
                    onPress={() => handleVote('down')}
                >
                    <Ionicons
                        name={request.user_vote === 'down' ? 'arrow-down' : 'arrow-down-outline'}
                        size={20}
                        color={request.user_vote === 'down' ? '#EF4444' : themeColors.textSecondary}
                    />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Badges */}
                <View style={styles.badges}>
                    {category && (
                        <View style={[styles.badge, { backgroundColor: `${category.color}15` }]}>
                            <Text style={[styles.badgeText, { color: category.color }]}>
                                {category.label}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.badge, { backgroundColor: `${status.color}15` }]}>
                        <Text style={[styles.badgeText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={2}>
                    {request.title}
                </Text>

                {/* Description */}
                <Text style={[styles.description, { color: themeColors.textSecondary }]} numberOfLines={2}>
                    {request.description}
                </Text>

                {/* Dev Notes (if any) */}
                {request.dev_notes && (
                    <View style={[styles.devNotes, { backgroundColor: `${colors.primary}10` }]}>
                        <Ionicons name="chatbubble" size={12} color={colors.primary} />
                        <Text style={[styles.devNotesText, { color: colors.primary }]} numberOfLines={1}>
                            {request.dev_notes}
                        </Text>
                    </View>
                )}

                {/* Meta */}
                <View style={styles.meta}>
                    <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                        by @{request.author?.username || 'anonymous'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.sm,
    },
    voteColumn: {
        alignItems: 'center',
        marginRight: SPACING.md,
        width: 40,
    },
    voteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: '700',
        marginVertical: 4,
    },
    content: {
        flex: 1,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    badge: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    devNotes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    devNotesText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 11,
    },
});

export default FeatureRequestCard;
