/**
 * Community Kitchen - Exciting Social Feed
 *
 * A vibrant, alive recipe discovery hub with custom reactions,
 * milestone achievements, trending indicators, and dynamic visuals.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    TextInput,
    Animated,
    Easing,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RecipeCard } from '@/src/components/community';
import { GradientMeshBackground } from '@/src/components/ui/GradientMeshBackground';
import { RecipesService, PublicRecipe, RecipeCategory, RECIPE_CATEGORIES } from '@/src/services/supabase/recipes';
import { getSampleRecipes, getRandomSampleRecipes, getSampleRecipesByCategory } from '@/src/data/sampleRecipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS, SHADOWS } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.82;
const GOAL_CARD_WIDTH = 110;

// Custom reaction emojis with meanings
const REACTIONS = [
    { id: 'fire', emoji: '🔥', label: 'Fire!', color: '#FF6B35' },
    { id: 'chef', emoji: '👨‍🍳', label: "Chef's Kiss", color: '#FFD93D' },
    { id: 'muscle', emoji: '💪', label: 'Gains!', color: '#6BCB77' },
    { id: 'heart', emoji: '❤️', label: 'Love it', color: '#FF6B6B' },
    { id: 'drool', emoji: '🤤', label: 'Drooling', color: '#4ECDC4' },
    { id: 'mindblown', emoji: '🤯', label: 'Mind Blown', color: '#A78BFA' },
];

// Achievement badges for milestone recipes
const ACHIEVEMENT_BADGES = {
    trending: { icon: '📈', label: 'Trending', gradient: ['#FF6B35', '#FF8C5A'] },
    viral: { icon: '🚀', label: 'Viral', gradient: ['#A78BFA', '#C4B5FD'] },
    staffPick: { icon: '⭐', label: 'Staff Pick', gradient: ['#FFD93D', '#FFE66D'] },
    proteinKing: { icon: '👑', label: '50g+ Protein', gradient: ['#6BCB77', '#98D8AA'] },
    quickMeal: { icon: '⚡', label: 'Under 15min', gradient: ['#4ECDC4', '#7EDCE0'] },
    lowCal: { icon: '🎯', label: 'Under 400cal', gradient: ['#FF6B6B', '#FF9494'] },
    newCreator: { icon: '✨', label: 'New Creator', gradient: ['#FFB6C1', '#FFC8DD'] },
};

// Goal config with vibrant designs
const GOAL_CONFIG: Record<string, { gradient: string[]; emoji: string; bgPattern: string }> = {
    'High Protein': { gradient: ['#FF6B6B', '#EE5A5A'], emoji: '💪', bgPattern: '◆' },
    'Low Carb': { gradient: ['#4ECDC4', '#2AB7A9'], emoji: '🥬', bgPattern: '○' },
    'Budget Friendly': { gradient: ['#FFD93D', '#FFC107'], emoji: '💰', bgPattern: '◇' },
    'Quick Prep': { gradient: ['#A78BFA', '#8B5CF6'], emoji: '⚡', bgPattern: '△' },
    'Meal Prep': { gradient: ['#FB923C', '#F97316'], emoji: '📦', bgPattern: '▢' },
    'Strict Cut': { gradient: ['#F87171', '#DC2626'], emoji: '🔥', bgPattern: '✦' },
    'Clean Bulk': { gradient: ['#34D399', '#10B981'], emoji: '📈', bgPattern: '◈' },
    'Maintenance': { gradient: ['#60A5FA', '#3B82F6'], emoji: '⚖️', bgPattern: '◎' },
    'Vegetarian': { gradient: ['#4ADE80', '#22C55E'], emoji: '🥗', bgPattern: '✿' },
    'Keto': { gradient: ['#F59E0B', '#D97706'], emoji: '🥓', bgPattern: '◐' },
};

// Animated pulse component
const PulsingDot: React.FC<{ color: string; size?: number }> = ({ color, size = 8 }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, easing: Easing.ease, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.pulsingDot,
                { backgroundColor: color, width: size, height: size, borderRadius: size / 2, transform: [{ scale: pulseAnim }] },
            ]}
        />
    );
};

// Floating particles for excitement
const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(floatAnim, { toValue: -30, duration: 2000, useNativeDriver: true }),
                        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.timing(opacityAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
                        Animated.timing(opacityAnim, { toValue: 0.2, duration: 3000, useNativeDriver: true }),
                    ]),
                ])
            ).start();
        }, delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    return (
        <Animated.Text
            style={[styles.floatingParticle, { opacity: opacityAnim, transform: [{ translateY: floatAnim }] }]}
        >
            ✨
        </Animated.Text>
    );
};

// Reaction bar with custom icons
const ReactionBar: React.FC<{
    reactions: Record<string, number>;
    userReaction?: string;
    onReact: (id: string) => void;
    compact?: boolean;
}> = ({ reactions, userReaction, onReact, compact }) => {
    const scaleAnims = useRef(REACTIONS.map(() => new Animated.Value(1))).current;

    const handlePress = (id: string, index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.sequence([
            Animated.timing(scaleAnims[index], { toValue: 1.5, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnims[index], { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();
        onReact(id);
    };

    if (compact) {
        const topReactions = REACTIONS.filter(r => (reactions[r.id] || 0) > 0).slice(0, 3);
        const totalCount = Object.values(reactions).reduce((a, b) => a + b, 0);
        return (
            <View style={styles.compactReactions}>
                <View style={styles.reactionStack}>
                    {topReactions.map((r, i) => (
                        <View key={r.id} style={[styles.stackedEmoji, { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i }]}>
                            <Text style={styles.stackedEmojiText}>{r.emoji}</Text>
                        </View>
                    ))}
                </View>
                {totalCount > 0 && <Text style={styles.reactionCount}>{totalCount}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.reactionBar}>
            {REACTIONS.map((reaction, index) => {
                const count = reactions[reaction.id] || 0;
                const isSelected = userReaction === reaction.id;
                return (
                    <TouchableOpacity
                        key={reaction.id}
                        onPress={() => handlePress(reaction.id, index)}
                        style={[styles.reactionButton, isSelected && { backgroundColor: `${reaction.color}30` }]}
                    >
                        <Animated.Text style={[styles.reactionEmoji, { transform: [{ scale: scaleAnims[index] }] }]}>
                            {reaction.emoji}
                        </Animated.Text>
                        {count > 0 && (
                            <Text style={[styles.reactionButtonCount, { color: reaction.color }]}>{count}</Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// Achievement badge component
const AchievementBadge: React.FC<{ type: keyof typeof ACHIEVEMENT_BADGES; small?: boolean }> = ({ type, small }) => {
    const badge = ACHIEVEMENT_BADGES[type];
    if (!badge) return null;

    return (
        <LinearGradient
            colors={badge.gradient as any}
            style={[styles.achievementBadge, small && styles.achievementBadgeSmall]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Text style={[styles.badgeIcon, small && styles.badgeIconSmall]}>{badge.icon}</Text>
            {!small && <Text style={styles.badgeLabel}>{badge.label}</Text>}
        </LinearGradient>
    );
};

// Trending indicator
const TrendingIndicator: React.FC<{ rank: number }> = ({ rank }) => (
    <View style={styles.trendingIndicator}>
        <PulsingDot color="#FF6B35" />
        <Text style={styles.trendingText}>#{rank} Trending</Text>
    </View>
);

// Enhanced featured recipe card
const FeaturedRecipeCard: React.FC<{
    recipe: PublicRecipe;
    onPress: () => void;
    index: number;
}> = ({ recipe, onPress, index }) => {
    const { colors } = useCombinedTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: true })
        ).start();
    }, []);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-FEATURED_CARD_WIDTH, FEATURED_CARD_WIDTH],
    });

    // Determine badges based on recipe data
    const badges: (keyof typeof ACHIEVEMENT_BADGES)[] = [];
    if (recipe.protein >= 50) badges.push('proteinKing');
    if (recipe.prep_time_minutes && recipe.prep_time_minutes <= 15) badges.push('quickMeal');
    if (recipe.calories < 400) badges.push('lowCal');
    if (recipe.heart_count > 100) badges.push('viral');
    if (index === 0) badges.push('staffPick');

    const demoReactions = {
        fire: Math.floor(Math.random() * 50) + 10,
        chef: Math.floor(Math.random() * 30) + 5,
        muscle: Math.floor(Math.random() * 40) + 15,
        heart: recipe.heart_count || Math.floor(Math.random() * 60) + 20,
    };

    return (
        <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            activeOpacity={0.95}
        >
            {/* Background image */}
            <Image source={{ uri: recipe.image_url }} style={styles.featuredImage} resizeMode="cover" />

            {/* Shimmer effect */}
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                />
            </Animated.View>

            {/* Gradient overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                style={styles.featuredGradient}
            />

            {/* Floating particles */}
            <View style={styles.particlesContainer}>
                <FloatingParticle delay={0} />
                <FloatingParticle delay={500} />
                <FloatingParticle delay={1000} />
            </View>

            {/* Top badges row */}
            <View style={styles.badgesRow}>
                {badges.slice(0, 2).map((badge) => (
                    <AchievementBadge key={badge} type={badge} />
                ))}
            </View>

            {/* Trending indicator */}
            {index < 3 && (
                <View style={styles.trendingContainer}>
                    <TrendingIndicator rank={index + 1} />
                </View>
            )}

            {/* Content */}
            <View style={styles.featuredContent}>
                {/* Category pill */}
                {recipe.categories?.[0] && (
                    <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillEmoji}>
                            {GOAL_CONFIG[recipe.categories[0]]?.emoji || '🍽️'}
                        </Text>
                        <Text style={styles.categoryPillText}>{recipe.categories[0]}</Text>
                    </View>
                )}

                <Text style={styles.featuredTitle} numberOfLines={2}>{recipe.name}</Text>

                {/* Macro stats with visual bars */}
                <View style={styles.macroStats}>
                    <View style={styles.macroStat}>
                        <View style={styles.macroStatHeader}>
                            <Text style={styles.macroValue}>{recipe.calories}</Text>
                            <Text style={styles.macroUnit}>kcal</Text>
                        </View>
                        <View style={[styles.macroBar, { backgroundColor: 'rgba(255,107,53,0.3)' }]}>
                            <View style={[styles.macroBarFill, { width: `${Math.min(recipe.calories / 8, 100)}%`, backgroundColor: '#FF6B35' }]} />
                        </View>
                    </View>
                    <View style={styles.macroStat}>
                        <View style={styles.macroStatHeader}>
                            <Text style={styles.macroValue}>{recipe.protein}g</Text>
                            <Text style={styles.macroUnit}>protein</Text>
                        </View>
                        <View style={[styles.macroBar, { backgroundColor: 'rgba(107,203,119,0.3)' }]}>
                            <View style={[styles.macroBarFill, { width: `${Math.min(recipe.protein * 2, 100)}%`, backgroundColor: '#6BCB77' }]} />
                        </View>
                    </View>
                    <View style={styles.macroStat}>
                        <View style={styles.macroStatHeader}>
                            <Text style={styles.macroValue}>{recipe.prep_time_minutes || 15}</Text>
                            <Text style={styles.macroUnit}>mins</Text>
                        </View>
                        <View style={[styles.macroBar, { backgroundColor: 'rgba(167,139,250,0.3)' }]}>
                            <View style={[styles.macroBarFill, { width: `${Math.min((recipe.prep_time_minutes || 15) * 3, 100)}%`, backgroundColor: '#A78BFA' }]} />
                        </View>
                    </View>
                </View>

                {/* Reactions */}
                <ReactionBar reactions={demoReactions} onReact={() => { }} compact />

                {/* Author */}
                {recipe.author && (
                    <View style={styles.featuredAuthor}>
                        <View style={styles.authorAvatarContainer}>
                            <LinearGradient colors={['#FF6B35', '#FFD93D']} style={styles.authorAvatarRing}>
                                <View style={styles.authorAvatarInner}>
                                    <Text style={styles.authorInitial}>{recipe.author.username.charAt(0).toUpperCase()}</Text>
                                </View>
                            </LinearGradient>
                        </View>
                        <View style={styles.authorInfo}>
                            <View style={styles.authorNameRow}>
                                <Text style={styles.authorName}>@{recipe.author.username}</Text>
                                {recipe.author.is_verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#4ECDC4" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.authorFollowers}>
                                {recipe.author.follower_count?.toLocaleString() || '1.2k'} followers
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

// Goal card with pattern
const GoalCard: React.FC<{
    category: RecipeCategory;
    isSelected: boolean;
    onPress: () => void;
    recipeCount?: number;
}> = ({ category, isSelected, onPress, recipeCount = 0 }) => {
    const config = GOAL_CONFIG[category] || { gradient: ['#6B7280', '#4B5563'], emoji: '🍽️', bgPattern: '◆' };
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        onPress();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={config.gradient as any}
                    style={styles.goalGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Background pattern */}
                    <Text style={styles.goalPattern}>{config.bgPattern.repeat(6)}</Text>

                    <Text style={styles.goalEmoji}>{config.emoji}</Text>
                    <Text style={styles.goalLabel} numberOfLines={1}>{category}</Text>

                    {isSelected && (
                        <View style={styles.goalSelectedIndicator}>
                            <Ionicons name="checkmark" size={14} color="#FFF" />
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Creator card with ring
const CreatorCard: React.FC<{
    creator: any;
    onPress: () => void;
    colors: any;
    rank?: number;
}> = ({ creator, onPress, colors, rank }) => {
    const ringColors = rank === 1 ? ['#FFD700', '#FFA500'] : rank === 2 ? ['#C0C0C0', '#A0A0A0'] : rank === 3 ? ['#CD7F32', '#8B4513'] : ['#4ECDC4', '#2AB7A9'];

    return (
        <TouchableOpacity
            style={[styles.creatorCard, { backgroundColor: colors.surface }]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            activeOpacity={0.85}
        >
            {rank && rank <= 3 && (
                <View style={styles.creatorRank}>
                    <Text style={styles.creatorRankText}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</Text>
                </View>
            )}

            <LinearGradient colors={ringColors as any} style={styles.creatorAvatarRing}>
                <View style={[styles.creatorAvatarInner, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.creatorInitial, { color: colors.primary }]}>
                        {creator.displayName.charAt(0)}
                    </Text>
                </View>
            </LinearGradient>

            {creator.verified && (
                <View style={styles.creatorVerifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4ECDC4" />
                </View>
            )}

            <Text style={[styles.creatorName, { color: colors.textPrimary }]} numberOfLines={1}>
                {creator.displayName}
            </Text>

            <View style={styles.creatorStatsRow}>
                <Text style={[styles.creatorStatHighlight, { color: colors.primary }]}>
                    {creator.recipeCount}
                </Text>
                <Text style={[styles.creatorStatLabel, { color: colors.textMuted }]}> recipes</Text>
            </View>

            <View style={[styles.creatorSpecialty, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={styles.creatorSpecialtyEmoji}>
                    {GOAL_CONFIG[creator.specialty]?.emoji || '🍽️'}
                </Text>
                <Text style={[styles.creatorSpecialtyText, { color: colors.primary }]} numberOfLines={1}>
                    {creator.specialty}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// Live activity banner
const LiveActivityBanner: React.FC<{ colors: any }> = ({ colors }) => {
    const activities = [
        { user: 'mike_fit', action: 'just cooked', recipe: 'Greek Power Bowl', emoji: '🔥' },
        { user: 'sarah_gains', action: 'loved', recipe: 'Protein Pancakes', emoji: '❤️' },
        { user: 'keto_king', action: 'shared', recipe: 'Avocado Toast', emoji: '📤' },
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const activity = activities[currentIndex];

    return (
        <Animated.View style={[styles.liveActivityBanner, { backgroundColor: colors.surface, opacity: fadeAnim }]}>
            <View style={styles.liveIndicator}>
                <PulsingDot color="#FF6B35" size={6} />
                <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>@{activity.user}</Text>
                {' '}{activity.action}{' '}
                <Text style={{ fontWeight: '600' }}>{activity.recipe}</Text>
                {' '}{activity.emoji}
            </Text>
        </Animated.View>
    );
};

// Sample creators
const SAMPLE_CREATORS = [
    { id: 'creator-1', username: 'fitchef_mike', displayName: 'Chef Mike', recipeCount: 24, followers: 12500, verified: true, specialty: 'High Protein' },
    { id: 'creator-2', username: 'protein_queen', displayName: 'Sarah Gains', recipeCount: 18, followers: 8200, verified: true, specialty: 'Meal Prep' },
    { id: 'creator-3', username: 'keto_king', displayName: 'Kevin Keto', recipeCount: 32, followers: 15800, verified: true, specialty: 'Keto' },
    { id: 'creator-4', username: 'clean_eats_jen', displayName: 'Jen Clean', recipeCount: 21, followers: 9300, verified: true, specialty: 'Clean Bulk' },
    { id: 'creator-5', username: 'fitnessfoodie', displayName: 'Emma Fit', recipeCount: 15, followers: 11400, verified: true, specialty: 'Low Carb' },
];

export default function CommunityScreen() {
    const { colors, isDark } = useCombinedTheme();

    const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
    const [randomPicks, setRandomPicks] = useState<PublicRecipe[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const searchInputRef = useRef<TextInput>(null);

    const fetchFeed = useCallback(async (refresh: boolean = false) => {
        if (refresh) {
            setIsRefreshing(true);
            setPage(0);
        }

        try {
            const [feedData, randomData] = await Promise.all([
                RecipesService.getPublicFeed({ category: selectedCategory || undefined }, refresh ? 0 : page),
                refresh || page === 0 ? RecipesService.getRandomTopRecipes(4) : Promise.resolve([]),
            ]);

            if ((refresh || page === 0) && feedData.length === 0) {
                const sampleFeed = selectedCategory ? getSampleRecipesByCategory(selectedCategory) : getSampleRecipes();
                setRecipes(sampleFeed);
                setRandomPicks(getRandomSampleRecipes(4));
            } else if (refresh || page === 0) {
                setRecipes(feedData);
                setRandomPicks(randomData.length > 0 ? randomData : getRandomSampleRecipes(4));
            } else {
                setRecipes(prev => [...prev, ...feedData]);
            }
        } catch (error) {
            const sampleFeed = selectedCategory ? getSampleRecipesByCategory(selectedCategory) : getSampleRecipes();
            setRecipes(sampleFeed);
            setRandomPicks(getRandomSampleRecipes(4));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedCategory, page]);

    useEffect(() => {
        fetchFeed(true);
    }, [selectedCategory]);

    const handleRefresh = () => fetchFeed(true);
    const handleLoadMore = () => {
        if (!isLoading && recipes.length >= 20) {
            setPage(prev => prev + 1);
            fetchFeed(false);
        }
    };

    const handleRecipePress = (recipe: PublicRecipe) => {
        router.push({ pathname: '/(modals)/recipe-detail', params: { recipeId: recipe.id } } as any);
    };

    const handleAuthorPress = (authorId: string) => {
        router.push({ pathname: '/(modals)/public-profile', params: { userId: authorId } } as any);
    };

    const handlePublish = () => {
        router.push('/(modals)/publish-recipe' as any);
    };

    const handleCategorySelect = (category: RecipeCategory | null) => {
        setSelectedCategory(prev => prev === category ? null : category);
    };

    const filteredRecipes = searchQuery
        ? recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        : recipes;

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Hero */}
            <View style={styles.heroSection}>
                <View style={styles.heroTitleRow}>
                    <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Community</Text>
                    <Text style={styles.heroTitleEmoji}>🍳</Text>
                </View>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                    Where gains are made & shared
                </Text>
            </View>

            {/* Live Activity */}
            <LiveActivityBanner colors={colors} />

            {/* Search */}
            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="search" size={20} color={colors.textMuted} />
                <TextInput
                    ref={searchInputRef}
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Search recipes, creators..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
                <TouchableOpacity
                    style={[styles.quickActionPrimary]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handlePublish(); }}
                >
                    <LinearGradient colors={['#FF6B35', '#FF8C5A']} style={styles.quickActionGradient}>
                        <Ionicons name="add" size={22} color="#FFF" />
                        <Text style={styles.quickActionPrimaryText}>Share Recipe</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickActionSecondary, { backgroundColor: colors.surface }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(modals)/saved-recipes' as any); }}
                >
                    <Ionicons name="bookmark" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickActionSecondary, { backgroundColor: colors.surface }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(modals)/my-recipes' as any); }}
                >
                    <Ionicons name="restaurant" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Browse by Goal */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Browse by Goal</Text>
                    {selectedCategory && (
                        <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                            <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.goalsScroll}>
                    {RECIPE_CATEGORIES.map((category) => (
                        <GoalCard
                            key={category}
                            category={category}
                            isSelected={selectedCategory === category}
                            onPress={() => handleCategorySelect(category)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Trending Now */}
            {randomPicks.length > 0 && !searchQuery && (
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.fireEmoji}>🔥</Text>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trending Now</Text>
                            <PulsingDot color="#FF6B35" size={6} />
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredScroll}
                        decelerationRate="fast"
                        snapToInterval={FEATURED_CARD_WIDTH + SPACING.md}
                    >
                        {randomPicks.map((recipe, index) => (
                            <FeaturedRecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onPress={() => handleRecipePress(recipe)}
                                index={index}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Top Creators */}
            {!searchQuery && (
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.fireEmoji}>👨‍🍳</Text>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Top Creators</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorsScroll}>
                        {SAMPLE_CREATORS.map((creator, index) => (
                            <CreatorCard
                                key={creator.id}
                                creator={creator}
                                onPress={() => handleAuthorPress(creator.id)}
                                colors={colors}
                                rank={index + 1}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* All Recipes Header */}
            <View style={styles.allRecipesHeader}>
                <View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        {selectedCategory || (searchQuery ? 'Search Results' : 'Latest Recipes')}
                    </Text>
                    <Text style={[styles.recipeCount, { color: colors.textSecondary }]}>
                        {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity style={[styles.sortButton, { backgroundColor: colors.surface }]}>
                    <Ionicons name="funnel" size={16} color={colors.textSecondary} />
                    <Text style={[styles.sortButtonText, { color: colors.textSecondary }]}>Filter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🍳</Text>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                    {searchQuery ? 'No recipes found' : 'No recipes yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    {searchQuery ? 'Try different keywords' : 'Be the first to share!'}
                </Text>
                {!searchQuery && (
                    <TouchableOpacity style={styles.emptyButton} onPress={handlePublish}>
                        <LinearGradient colors={['#FF6B35', '#FF8C5A']} style={styles.emptyButtonGradient}>
                            <Ionicons name="add" size={20} color="#FFF" />
                            <Text style={styles.emptyButtonText}>Share Recipe</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <GradientMeshBackground variant="community" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {isLoading && page === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading deliciousness...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRecipes}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={renderEmpty}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
                        renderItem={({ item }) => (
                            <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} onAuthorPress={() => handleAuthorPress(item.author_id)} />
                        )}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
    loadingText: { fontSize: 14 },
    listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 120 },
    row: { justifyContent: 'space-between' },
    headerContainer: { paddingTop: SPACING.md },

    // Hero
    heroSection: { marginBottom: SPACING.md },
    heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
    heroTitleEmoji: { fontSize: 28 },
    heroSubtitle: { fontSize: 15, marginTop: 4 },

    // Live Activity
    liveActivityBanner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.lg, marginBottom: SPACING.md, gap: 10 },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    liveText: { fontSize: 10, fontWeight: '800', color: '#FF6B35' },
    activityText: { fontSize: 13, flex: 1 },

    // Pulsing dot
    pulsingDot: {},

    // Floating particles
    floatingParticle: { position: 'absolute', fontSize: 12 },
    particlesContainer: { position: 'absolute', top: 20, right: 20, width: 40, height: 40 },

    // Search
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 12, borderRadius: RADIUS.xl, marginBottom: SPACING.md, gap: SPACING.sm, ...SHADOWS.sm },
    searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },

    // Quick Actions
    quickActionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
    quickActionPrimary: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.md },
    quickActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
    quickActionPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    quickActionSecondary: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },

    // Section
    sectionContainer: { marginBottom: SPACING.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
    fireEmoji: { fontSize: 20 },
    clearText: { fontSize: 14, fontWeight: '600' },
    seeAllText: { fontSize: 14, fontWeight: '600' },

    // Goal Cards
    goalsScroll: { paddingRight: SPACING.lg, gap: SPACING.sm },
    goalCard: { width: GOAL_CARD_WIDTH, height: 72, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.md },
    goalCardSelected: { borderWidth: 2, borderColor: '#FFF' },
    goalGradient: { flex: 1, padding: SPACING.sm, justifyContent: 'flex-end', overflow: 'hidden' },
    goalPattern: { position: 'absolute', top: -5, right: -10, fontSize: 20, opacity: 0.15, color: '#FFF', letterSpacing: 4 },
    goalEmoji: { fontSize: 22, marginBottom: 4 },
    goalLabel: { fontSize: 11, fontWeight: '700', color: '#FFF' },
    goalSelectedIndicator: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },

    // Featured Cards
    featuredScroll: { paddingRight: SPACING.lg },
    featuredCard: { width: FEATURED_CARD_WIDTH, height: 320, borderRadius: RADIUS.xl, overflow: 'hidden', marginRight: SPACING.md, ...SHADOWS.lg },
    featuredImage: { width: '100%', height: '100%', position: 'absolute' },
    featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' },
    shimmer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 100 },
    shimmerGradient: { flex: 1 },
    badgesRow: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
    trendingContainer: { position: 'absolute', top: 12, right: 12 },
    featuredContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.md },
    categoryPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.lg, gap: 4, marginBottom: 8 },
    categoryPillEmoji: { fontSize: 12 },
    categoryPillText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
    featuredTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    macroStats: { flexDirection: 'row', gap: SPACING.md, marginBottom: 12 },
    macroStat: { flex: 1 },
    macroStatHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 4 },
    macroValue: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    macroUnit: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
    macroBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
    macroBarFill: { height: '100%', borderRadius: 2 },
    featuredAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    authorAvatarContainer: {},
    authorAvatarRing: { width: 36, height: 36, borderRadius: 18, padding: 2, alignItems: 'center', justifyContent: 'center' },
    authorAvatarInner: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
    authorInitial: { fontSize: 14, fontWeight: '700', color: '#FFF' },
    authorInfo: {},
    authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    authorName: { color: '#FFF', fontSize: 13, fontWeight: '600' },
    verifiedBadge: {},
    authorFollowers: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },

    // Reactions
    reactionBar: { flexDirection: 'row', gap: 6 },
    reactionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.lg, gap: 4 },
    reactionEmoji: { fontSize: 18 },
    reactionButtonCount: { fontSize: 12, fontWeight: '600' },
    compactReactions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reactionStack: { flexDirection: 'row' },
    stackedEmoji: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    stackedEmojiText: { fontSize: 14 },
    reactionCount: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },

    // Achievement badges
    achievementBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.md, gap: 4 },
    achievementBadgeSmall: { paddingHorizontal: 6, paddingVertical: 3 },
    badgeIcon: { fontSize: 12 },
    badgeIconSmall: { fontSize: 10 },
    badgeLabel: { color: '#FFF', fontSize: 10, fontWeight: '700' },

    // Trending indicator
    trendingIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.lg, gap: 6 },
    trendingText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

    // Creators
    creatorsScroll: { paddingRight: SPACING.lg, gap: SPACING.sm },
    creatorCard: { width: 120, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.lg, alignItems: 'center', ...SHADOWS.sm },
    creatorRank: { position: 'absolute', top: -4, left: -4, zIndex: 1 },
    creatorRankText: { fontSize: 20 },
    creatorAvatarRing: { width: 56, height: 56, borderRadius: 28, padding: 3, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
    creatorAvatarInner: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    creatorInitial: { fontSize: 20, fontWeight: '700' },
    creatorVerifiedBadge: { position: 'absolute', top: 50, right: 28, backgroundColor: '#FFF', borderRadius: 10, padding: 1 },
    creatorName: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
    creatorStatsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.sm },
    creatorStatHighlight: { fontSize: 16, fontWeight: '800' },
    creatorStatLabel: { fontSize: 11 },
    creatorSpecialty: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, gap: 4 },
    creatorSpecialtyEmoji: { fontSize: 10 },
    creatorSpecialtyText: { fontSize: 10, fontWeight: '600' },

    // All Recipes Header
    allRecipesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, paddingTop: SPACING.sm },
    recipeCount: { fontSize: 13, marginTop: 2 },
    sortButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.md, gap: 6 },
    sortButtonText: { fontSize: 13, fontWeight: '500' },

    // Empty
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
    emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    emptySubtitle: { fontSize: 14, marginBottom: SPACING.lg },
    emptyButton: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, gap: 8 },
    emptyButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
