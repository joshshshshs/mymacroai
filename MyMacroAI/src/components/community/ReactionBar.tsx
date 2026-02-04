/**
 * ReactionBar - Community Kitchen Reactions
 * 
 * Displays heart, thumbs up, thumbs down with counts.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ReactionType } from '@/src/services/supabase/recipes';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

interface ReactionBarProps {
    heartCount: number;
    thumbsUpCount: number;
    thumbsDownCount: number;
    userReaction?: ReactionType | null;
    onReact: (type: ReactionType) => void;
    disabled?: boolean;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
    heartCount,
    thumbsUpCount,
    thumbsDownCount,
    userReaction,
    onReact,
    disabled = false,
}) => {
    const handleReact = (type: ReactionType) => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onReact(type);
    };

    return (
        <View style={styles.container}>
            {/* Heart */}
            <TouchableOpacity
                style={[
                    styles.button,
                    userReaction === 'heart' && styles.activeButton,
                ]}
                onPress={() => handleReact('heart')}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={userReaction === 'heart' ? 'heart' : 'heart-outline'}
                    size={22}
                    color={userReaction === 'heart' ? '#FF6B6B' : '#6B7280'}
                />
                <Text style={[
                    styles.count,
                    userReaction === 'heart' && styles.activeCount,
                ]}>
                    {heartCount}
                </Text>
            </TouchableOpacity>

            {/* Thumbs Up */}
            <TouchableOpacity
                style={[
                    styles.button,
                    userReaction === 'thumbs_up' && styles.activeButton,
                ]}
                onPress={() => handleReact('thumbs_up')}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={userReaction === 'thumbs_up' ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={20}
                    color={userReaction === 'thumbs_up' ? '#10B981' : '#6B7280'}
                />
                <Text style={[
                    styles.count,
                    userReaction === 'thumbs_up' && { color: '#10B981' },
                ]}>
                    {thumbsUpCount}
                </Text>
            </TouchableOpacity>

            {/* Thumbs Down */}
            <TouchableOpacity
                style={[
                    styles.button,
                    userReaction === 'thumbs_down' && styles.activeButton,
                ]}
                onPress={() => handleReact('thumbs_down')}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={userReaction === 'thumbs_down' ? 'thumbs-down' : 'thumbs-down-outline'}
                    size={20}
                    color={userReaction === 'thumbs_down' ? '#EF4444' : '#6B7280'}
                />
                <Text style={[
                    styles.count,
                    userReaction === 'thumbs_down' && { color: '#EF4444' },
                ]}>
                    {thumbsDownCount}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: RADIUS.lg,
        backgroundColor: 'rgba(0,0,0,0.03)',
        gap: 6,
    },
    activeButton: {
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    count: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeCount: {
        color: '#FF6B6B',
    },
});

export default ReactionBar;
