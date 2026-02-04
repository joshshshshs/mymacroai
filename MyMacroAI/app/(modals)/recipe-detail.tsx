/**
 * Recipe Detail Modal
 * 
 * Full view of a public recipe with reactions and author info.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ReactionBar } from '@/src/components/community';
import { RecipesService, PublicRecipe, ReactionType } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { recipeId } = useLocalSearchParams<{ recipeId: string }>();

    const [recipe, setRecipe] = useState<PublicRecipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const themeColors = {
        bg: isDark ? '#0A0A0C' : '#FFFFFF',
        surface: isDark ? '#1A1A1E' : '#F8F9FA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    };

    useEffect(() => {
        if (recipeId) {
            loadRecipe();
        }
    }, [recipeId]);

    const loadRecipe = async () => {
        setIsLoading(true);
        const data = await RecipesService.getRecipeById(recipeId!);
        setRecipe(data);
        setIsLoading(false);
    };

    const handleReaction = async (type: ReactionType) => {
        if (!recipe) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Optimistic update
        const wasReacted = recipe.user_reaction === type;
        setRecipe(prev => {
            if (!prev) return null;

            const newCounts = { ...prev };
            if (wasReacted) {
                // Removing reaction
                newCounts.user_reaction = null;
                if (type === 'heart') newCounts.heart_count--;
                else if (type === 'thumbs_up') newCounts.thumbs_up_count--;
                else newCounts.thumbs_down_count--;
            } else {
                // Adding/changing reaction
                if (prev.user_reaction) {
                    // Remove old reaction count
                    if (prev.user_reaction === 'heart') newCounts.heart_count--;
                    else if (prev.user_reaction === 'thumbs_up') newCounts.thumbs_up_count--;
                    else newCounts.thumbs_down_count--;
                }
                // Add new reaction count
                if (type === 'heart') newCounts.heart_count++;
                else if (type === 'thumbs_up') newCounts.thumbs_up_count++;
                else newCounts.thumbs_down_count++;
                newCounts.user_reaction = type;
            }
            return newCounts;
        });

        await RecipesService.reactToRecipe(recipeId!, type);
    };

    const handleAuthorPress = () => {
        if (!recipe?.author) return;
        router.push({
            pathname: '/(modals)/public-profile',
            params: { userId: recipe.author_id },
        } as any);
    };

    const handleReport = () => {
        if (!recipe) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
            pathname: '/(modals)/report-recipe',
            params: { recipeId: recipe.id, recipeName: recipe.name },
        } as any);
    };

    if (isLoading || !recipe) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: themeColors.bg }]}>
                <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

            <ScrollView bounces={false}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: recipe.image_url }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>

                    {/* Report button */}
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={handleReport}
                    >
                        <Ionicons name="flag-outline" size={20} color="#FFF" />
                    </TouchableOpacity>

                    {/* Macros overlay */}
                    <View style={styles.heroMacros}>
                        <Text style={styles.heroCalories}>{recipe.calories}</Text>
                        <Text style={styles.heroCaloriesLabel}>kcal</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title & Categories */}
                    <Text style={[styles.title, { color: themeColors.text }]}>
                        {recipe.name}
                    </Text>

                    {recipe.categories.length > 0 && (
                        <View style={styles.categories}>
                            {recipe.categories.map((cat, i) => (
                                <View key={i} style={[styles.categoryBadge, { backgroundColor: colors.surfaceTint }]}>
                                    <Text style={[styles.categoryText, { color: colors.primary }]}>{cat}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Author Card */}
                    {recipe.author && (
                        <TouchableOpacity
                            style={[styles.authorCard, { backgroundColor: themeColors.surface }]}
                            onPress={handleAuthorPress}
                        >
                            {recipe.author.avatar_url ? (
                                <Image
                                    source={{ uri: recipe.author.avatar_url }}
                                    style={styles.authorAvatar}
                                />
                            ) : (
                                <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                                    <Ionicons name="person" size={20} color="#FFF" />
                                </View>
                            )}
                            <View style={styles.authorInfo}>
                                <View style={styles.authorNameRow}>
                                    <Text style={[styles.authorName, { color: themeColors.text }]}>
                                        {recipe.author.display_name || recipe.author.username}
                                    </Text>
                                    {recipe.author.is_verified && (
                                        <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                                    )}
                                </View>
                                <Text style={[styles.authorUsername, { color: themeColors.textSecondary }]}>
                                    @{recipe.author.username} • {recipe.author.follower_count} followers
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
                        </TouchableOpacity>
                    )}

                    {/* Macros Grid */}
                    <View style={[styles.macrosGrid, { backgroundColor: themeColors.surface }]}>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: colors.macros.protein }]}>
                                {recipe.protein}g
                            </Text>
                            <Text style={[styles.macroLabel, { color: themeColors.textSecondary }]}>Protein</Text>
                        </View>
                        <View style={styles.macroDivider} />
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: colors.macros.carbs }]}>
                                {recipe.carbs}g
                            </Text>
                            <Text style={[styles.macroLabel, { color: themeColors.textSecondary }]}>Carbs</Text>
                        </View>
                        <View style={styles.macroDivider} />
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: colors.macros.fats }]}>
                                {recipe.fats}g
                            </Text>
                            <Text style={[styles.macroLabel, { color: themeColors.textSecondary }]}>Fats</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {recipe.description && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                                💡 The Hack
                            </Text>
                            <Text style={[styles.description, { color: themeColors.textSecondary }]}>
                                {recipe.description}
                            </Text>
                        </View>
                    )}

                    {/* Instructions */}
                    {recipe.instructions && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                                📝 Instructions
                            </Text>
                            <Text style={[styles.description, { color: themeColors.textSecondary }]}>
                                {recipe.instructions}
                            </Text>
                        </View>
                    )}

                    {/* Ingredients */}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                                🥗 Ingredients
                            </Text>
                            {recipe.ingredients.map((ing, i) => (
                                <View key={i} style={styles.ingredientRow}>
                                    <Text style={[styles.ingredientName, { color: themeColors.text }]}>
                                        {ing.name}
                                    </Text>
                                    <Text style={[styles.ingredientAmount, { color: themeColors.textSecondary }]}>
                                        {ing.amount} {ing.unit}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Reaction Bar */}
            <View style={[styles.reactionFooter, { backgroundColor: themeColors.bg }]}>
                <ReactionBar
                    heartCount={recipe.heart_count}
                    thumbsUpCount={recipe.thumbs_up_count}
                    thumbsDownCount={recipe.thumbs_down_count}
                    userReaction={recipe.user_reaction}
                    onReact={handleReaction}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContainer: {
        width,
        height: width,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reportButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroMacros: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    heroCalories: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
    },
    heroCaloriesLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: SPACING.lg,
    },
    categoryBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    authorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarPlaceholder: {
        backgroundColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    authorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    authorUsername: {
        fontSize: 13,
        marginTop: 2,
    },
    macrosGrid: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    macroItem: {
        flex: 1,
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 22,
        fontWeight: '700',
    },
    macroLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    macroDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    ingredientName: {
        fontSize: 15,
        fontWeight: '500',
    },
    ingredientAmount: {
        fontSize: 14,
    },
    reactionFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
});
