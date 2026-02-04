/**
 * RecipeCard - Community Kitchen Feed Card
 *
 * Enhanced card with achievement badges, custom reactions,
 * and exciting visual elements.
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { PublicRecipe } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

// Achievement badge configs
const BADGES = {
    proteinKing: { emoji: '👑', color: '#FFD93D', label: '50g+' },
    quickMeal: { emoji: '⚡', color: '#A78BFA', label: 'Quick' },
    lowCal: { emoji: '🎯', color: '#4ECDC4', label: 'Light' },
    trending: { emoji: '📈', color: '#FF6B35', label: 'Hot' },
};

// Category to gradient mapping
const CATEGORY_GRADIENTS: Record<string, string[]> = {
    'High Protein': ['#FF6B6B', '#EE5A5A'],
    'Low Carb': ['#4ECDC4', '#2AB7A9'],
    'Budget Friendly': ['#FFD93D', '#FFC107'],
    'Quick Prep': ['#A78BFA', '#8B5CF6'],
    'Meal Prep': ['#FB923C', '#F97316'],
    'Keto': ['#F59E0B', '#D97706'],
    'Vegetarian': ['#4ADE80', '#22C55E'],
    'Clean Bulk': ['#34D399', '#10B981'],
};

interface RecipeCardProps {
    recipe: PublicRecipe;
    onPress: () => void;
    onAuthorPress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    onPress,
    onAuthorPress,
}) => {
    const { colors } = useCombinedTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Subtle glow animation for trending items
    useEffect(() => {
        if (recipe.heart_count > 50) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [recipe.heart_count]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    // Determine badges
    const cardBadges: (keyof typeof BADGES)[] = [];
    if (recipe.protein >= 50) cardBadges.push('proteinKing');
    if (recipe.prep_time_minutes && recipe.prep_time_minutes <= 15) cardBadges.push('quickMeal');
    if (recipe.calories < 400) cardBadges.push('lowCal');
    if (recipe.heart_count > 50) cardBadges.push('trending');

    // Get category gradient
    const categoryGradient = recipe.categories?.[0]
        ? CATEGORY_GRADIENTS[recipe.categories[0]] || ['#6B7280', '#4B5563']
        : ['#6B7280', '#4B5563'];

    // Generate demo reactions
    const reactions = {
        fire: Math.floor(Math.random() * 20) + 5,
        heart: recipe.heart_count || Math.floor(Math.random() * 30) + 10,
        muscle: Math.floor(Math.random() * 15) + 3,
    };
    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={handlePress}
                activeOpacity={0.95}
            >
                {/* Image Container */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: recipe.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Gradient overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageGradient}
                    />

                    {/* Category accent bar */}
                    <LinearGradient
                        colors={categoryGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.categoryBar}
                    />

                    {/* Badges */}
                    {cardBadges.length > 0 && (
                        <View style={styles.badgesContainer}>
                            {cardBadges.slice(0, 2).map((badge) => (
                                <View
                                    key={badge}
                                    style={[styles.badge, { backgroundColor: `${BADGES[badge].color}20` }]}
                                >
                                    <Text style={styles.badgeEmoji}>{BADGES[badge].emoji}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Calories overlay */}
                    <View style={styles.caloriesOverlay}>
                        <Text style={styles.caloriesText}>{recipe.calories}</Text>
                        <Text style={styles.caloriesLabel}>kcal</Text>
                    </View>

                    {/* Reactions stack */}
                    {totalReactions > 0 && (
                        <View style={styles.reactionsOverlay}>
                            <View style={styles.reactionsStack}>
                                <View style={[styles.reactionBubble, { backgroundColor: '#FF6B35' }]}>
                                    <Text style={styles.reactionBubbleEmoji}>🔥</Text>
                                </View>
                                <View style={[styles.reactionBubble, { backgroundColor: '#FF6B6B', marginLeft: -6 }]}>
                                    <Text style={styles.reactionBubbleEmoji}>❤️</Text>
                                </View>
                                <View style={[styles.reactionBubble, { backgroundColor: '#6BCB77', marginLeft: -6 }]}>
                                    <Text style={styles.reactionBubbleEmoji}>💪</Text>
                                </View>
                            </View>
                            <Text style={styles.reactionsCount}>{totalReactions}</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                        {recipe.name}
                    </Text>

                    {/* Macro pills */}
                    <View style={styles.macroPills}>
                        <View style={[styles.macroPill, { backgroundColor: 'rgba(107, 203, 119, 0.15)' }]}>
                            <Text style={[styles.macroPillText, { color: '#6BCB77' }]}>P {recipe.protein}g</Text>
                        </View>
                        <View style={[styles.macroPill, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
                            <Text style={[styles.macroPillText, { color: '#60A5FA' }]}>C {recipe.carbs}g</Text>
                        </View>
                        <View style={[styles.macroPill, { backgroundColor: 'rgba(251, 146, 60, 0.15)' }]}>
                            <Text style={[styles.macroPillText, { color: '#FB923C' }]}>F {recipe.fats}g</Text>
                        </View>
                    </View>

                    {/* Author row */}
                    {recipe.author && (
                        <TouchableOpacity
                            style={styles.authorRow}
                            onPress={onAuthorPress}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={['#FF6B35', '#FFD93D']}
                                style={styles.authorAvatarRing}
                            >
                                <View style={[styles.authorAvatarInner, { backgroundColor: colors.surface }]}>
                                    {recipe.author.avatar_url ? (
                                        <Image
                                            source={{ uri: recipe.author.avatar_url }}
                                            style={styles.authorAvatarImage}
                                        />
                                    ) : (
                                        <Text style={[styles.authorInitial, { color: colors.primary }]}>
                                            {recipe.author.username.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                            </LinearGradient>
                            <Text style={[styles.authorName, { color: colors.textMuted }]} numberOfLines={1}>
                                @{recipe.author.username}
                            </Text>
                            {recipe.author.is_verified && (
                                <Ionicons name="checkmark-circle" size={12} color="#4ECDC4" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        marginBottom: SPACING.md,
    },
    card: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH * 1.1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    categoryBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    badgesContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        gap: 4,
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeEmoji: {
        fontSize: 12,
    },
    caloriesOverlay: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    caloriesText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    caloriesLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    reactionsOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reactionsStack: {
        flexDirection: 'row',
    },
    reactionBubble: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.2)',
    },
    reactionBubbleEmoji: {
        fontSize: 10,
    },
    reactionsCount: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    content: {
        padding: SPACING.sm,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
        marginBottom: 8,
    },
    macroPills: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    macroPill: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: RADIUS.sm,
    },
    macroPillText: {
        fontSize: 9,
        fontWeight: '700',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    authorAvatarRing: {
        width: 22,
        height: 22,
        borderRadius: 11,
        padding: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorAvatarInner: {
        width: 17,
        height: 17,
        borderRadius: 8.5,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    authorAvatarImage: {
        width: '100%',
        height: '100%',
    },
    authorInitial: {
        fontSize: 9,
        fontWeight: '700',
    },
    authorName: {
        fontSize: 11,
        flex: 1,
    },
});

export default RecipeCard;
