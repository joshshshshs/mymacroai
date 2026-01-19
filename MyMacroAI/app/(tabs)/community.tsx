/**
 * Community Tab - "The Refuge"
 * 
 * Public recipe feed with category filtering and discovery.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { RecipeCard, CategoryFilter } from '@/src/components/community';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { RecipesService, PublicRecipe, RecipeCategory } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING } from '@/src/design-system/tokens';

export default function CommunityScreen() {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
    const [randomPicks, setRandomPicks] = useState<PublicRecipe[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);

    // Fetch feed
    const fetchFeed = useCallback(async (refresh: boolean = false) => {
        if (refresh) {
            setIsRefreshing(true);
            setPage(0);
        }

        try {
            const [feedData, randomData] = await Promise.all([
                RecipesService.getPublicFeed(
                    { category: selectedCategory || undefined },
                    refresh ? 0 : page
                ),
                refresh || page === 0 ? RecipesService.getRandomTopRecipes(3) : Promise.resolve([]),
            ]);

            if (refresh || page === 0) {
                setRecipes(feedData);
                setRandomPicks(randomData);
            } else {
                setRecipes(prev => [...prev, ...feedData]);
            }
        } catch (error) {
            console.error('[Community] Feed error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedCategory, page]);

    useEffect(() => {
        fetchFeed(true);
    }, [selectedCategory]);

    const handleRefresh = () => {
        fetchFeed(true);
    };

    const handleLoadMore = () => {
        if (!isLoading && recipes.length >= 20) {
            setPage(prev => prev + 1);
            fetchFeed(false);
        }
    };

    const handleRecipePress = (recipe: PublicRecipe) => {
        router.push({
            pathname: '/(modals)/recipe-detail',
            params: { recipeId: recipe.id },
        } as any);
    };

    const handleAuthorPress = (authorId: string) => {
        router.push({
            pathname: '/(modals)/public-profile',
            params: { userId: authorId },
        } as any);
    };

    // Render header with random picks
    const renderHeader = () => (
        <View>
            {/* Random Picks - "Dice Roll" */}
            {randomPicks.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                        🎲 Lucky Picks
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                        Curated surprises from the community
                    </Text>
                    <View style={styles.randomRow}>
                        {randomPicks.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onPress={() => handleRecipePress(recipe)}
                                onAuthorPress={() => handleAuthorPress(recipe.author_id)}
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* Category Filters */}
            <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {/* Feed Title */}
            <View style={styles.feedHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                    {selectedCategory || '🍴 All Recipes'}
                </Text>
            </View>
        </View>
    );

    // Empty state
    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🍳</Text>
                <Text style={styles.emptyTitle}>No recipes yet</Text>
                <Text style={styles.emptySubtitle}>
                    Be the first to share a meal!
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Community Kitchen',
                    headerLargeTitle: true,
                    headerTransparent: true,
                    headerBlurEffect: isDark ? 'dark' : 'light',
                }}
            />

            <SoftDreamyBackground />

            {isLoading && page === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    renderItem={({ item }) => (
                        <RecipeCard
                            recipe={item}
                            onPress={() => handleRecipePress(item)}
                            onAuthorPress={() => handleAuthorPress(item.author_id)}
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingTop: 100, // For large title header
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: SPACING.md,
    },
    randomRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    feedHeader: {
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
});
