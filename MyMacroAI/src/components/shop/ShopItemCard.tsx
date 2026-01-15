/**
 * ShopItemCard - Premium glass card for shop items
 * Features: glass aesthetic, category icons, long-press purchase, owned badge
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useHaptics } from '@/hooks/useHaptics';
import { COLORS, SPACING, RADIUS, MOTION } from '@/src/design-system/tokens';
import { StoreItem } from '@/src/types';

interface ShopItemCardProps {
    item: StoreItem;
    isOwned: boolean;
    canAfford: boolean;
    onPurchase: (item: StoreItem) => void;
}

// Category-specific icon mapping
const CATEGORY_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    utility: { icon: 'shield-checkmark', color: '#3B82F6' },
    social: { icon: 'people', color: '#A78BFA' },
    aesthetics: { icon: 'color-palette', color: '#F59E0B' },
    featured: { icon: 'star', color: '#FF5C00' },
};

// Item-specific icons
const ITEM_ICONS: Record<string, { icon: string; color: string }> = {
    streak_freeze_7: { icon: '❄️', color: '#00BFFF' },
    streak_freeze_3: { icon: '❄️', color: '#00BFFF' },
    ghost_mode: { icon: '👻', color: '#A78BFA' },
    frame_molten: { icon: '🔥', color: '#FF5C00' },
    frame_frost: { icon: '🧊', color: '#00BFFF' },
    frame_void: { icon: '🌑', color: '#1F1F1F' },
    theme_obsidian: { icon: '🌙', color: '#1F1F1F' },
    icon_gold: { icon: '✨', color: '#FFD700' },
};

const LONG_PRESS_DURATION = 800; // ms

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
    item,
    isOwned,
    canAfford,
    onPurchase,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { heavy, medium, triggerPurchaseSuccess } = useHaptics();

    const [isPressing, setIsPressing] = useState(false);
    const scale = useSharedValue(1);
    const progress = useSharedValue(0);

    const colors = {
        cardBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: COLORS.gamification.vitaminOrange,
        price: COLORS.gamification.vitaminOrange,
        disabled: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
    };

    const itemIcon = ITEM_ICONS[item.id] || CATEGORY_ICONS[item.category] || { icon: '📦', color: '#6B7280' };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const handlePressIn = useCallback(() => {
        if (isOwned || !canAfford) return;

        setIsPressing(true);
        scale.value = withSpring(0.98, MOTION.spring.snappy);

        // Start progress animation
        progress.value = withTiming(1, { duration: LONG_PRESS_DURATION }, (finished) => {
            if (finished) {
                // Trigger haptic sequence: Heavy -> Heavy -> Medium
                runOnJS(heavy)();
                setTimeout(() => {
                    heavy();
                    setTimeout(() => {
                        medium();
                        onPurchase(item);
                    }, 100);
                }, 100);
            }
        });
    }, [isOwned, canAfford, heavy, medium, onPurchase, item, scale, progress]);

    const handlePressOut = useCallback(() => {
        setIsPressing(false);
        scale.value = withSpring(1, MOTION.spring.bouncy);
        progress.value = withTiming(0, { duration: 100 });
    }, [scale, progress]);

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.card, animatedStyle]}
            disabled={isOwned}
        >
            {/* Glass Background */}
            <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cardBg }]} />

            {/* Border */}
            <View style={[styles.border, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

            {/* Content */}
            <View style={styles.content}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' }]}>
                    {typeof itemIcon.icon === 'string' && itemIcon.icon.length <= 2 ? (
                        <Text style={styles.emojiIcon}>{itemIcon.icon}</Text>
                    ) : (
                        <Ionicons name={itemIcon.icon as any} size={28} color={itemIcon.color} />
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>

                {/* Price / Status */}
                <View style={styles.priceContainer}>
                    {isOwned ? (
                        <View style={styles.ownedBadge}>
                            <Text style={styles.ownedText}>OWNED</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.price, { color: canAfford ? colors.price : colors.disabled }]}>
                                {item.price}
                            </Text>
                            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>COINS</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Long Press Progress Bar */}
            {isPressing && !isOwned && canAfford && (
                <View style={styles.progressContainer}>
                    <Animated.View style={[styles.progressBar, progressStyle]} />
                </View>
            )}

            {/* Owned Overlay */}
            {isOwned && (
                <View style={styles.ownedOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        minHeight: 180,
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        pointerEvents: 'none',
    },
    content: {
        padding: SPACING.md,
        flex: 1,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    emojiIcon: {
        fontSize: 28,
    },
    info: {
        flex: 1,
        marginBottom: SPACING.sm,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },
    priceContainer: {
        alignItems: 'flex-start',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    ownedBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ownedText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#10B981',
        letterSpacing: 1,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.gamification.vitaminOrange,
    },
    ownedOverlay: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
    },
});

export default ShopItemCard;
