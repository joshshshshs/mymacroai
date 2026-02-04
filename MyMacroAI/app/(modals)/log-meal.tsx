/**
 * Log Meal Modal - "Smart Buffet" Meal Builder
 * 
 * Premium cart-style interface for logging meals with:
 * - Dynamic context header based on meal type
 * - Omni-Search bar with barcode/voice/camera
 * - Smart tabs (History, Favorites, My Meals)
 * - AI-predicted foods with gold glow
 * - Multi-select food items with animated checkmarks
 * - Floating "Plate" dock for cart summary
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    FadeIn,
    FadeInDown,
    SlideInDown,
} from 'react-native-reanimated';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useUserStore } from '@/src/store/UserStore';
import { searchFoods, MOCK_FOOD_DB } from '@/src/data/mockFoodDB';
import { searchFoodsAPI } from '@/src/services/foodApiService';
import { FoodItem as DBFoodItem } from '@/src/types/food';
import { FoodIcon } from '@/src/components/food/FoodIcon';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    vitaminOrange: '#FF5C00',
    neonOrange: '#FF9E00',
    warmWhite: '#FFF5F0',
    softGrey: '#F2F2F7',
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
    aiGold: '#FFD700',
    favoriteRed: '#FF3B5C',
};

const MEAL_CONFIG: Record<string, { title: string; subtitle: string; icon: string }> = {
    breakfast: { title: 'Breakfast', subtitle: '600 - 800 kcal', icon: '🌅' },
    lunch: { title: 'Lunch', subtitle: '700 - 900 kcal', icon: '☀️' },
    dinner: { title: 'Dinner', subtitle: '600 - 800 kcal', icon: '🌙' },
    snacks: { title: 'Snacks', subtitle: '150 - 300 kcal', icon: '🍿' },
};

// Tabs: Search, History, Favorites, My Meals
const SMART_TABS = ['Search', 'History', 'Favorites', 'My Meals'];

// Mock food data - History (recent foods)
const HISTORY_FOODS = [
    { id: 'h1', name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 22, fats: 4, isPredicted: true, time: '2 hours ago' },
    { id: 'h2', name: 'Scrambled Eggs (2)', calories: 200, protein: 14, carbs: 2, fats: 15, isPredicted: true, time: 'Yesterday' },
    { id: 'h3', name: 'Whole Wheat Toast', calories: 120, protein: 4, carbs: 22, fats: 2, isPredicted: false, time: 'Yesterday' },
    { id: 'h4', name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0, isPredicted: false, time: '2 days ago' },
    { id: 'h5', name: 'Oatmeal with Honey', calories: 220, protein: 6, carbs: 40, fats: 4, isPredicted: false, time: '2 days ago' },
    { id: 'h6', name: 'Avocado Toast', calories: 280, protein: 8, carbs: 26, fats: 18, isPredicted: false, time: '3 days ago' },
];

// Mock food data - Favorites (starred foods)
const FAVORITE_FOODS = [
    { id: 'f1', name: 'Protein Smoothie', calories: 320, protein: 30, carbs: 35, fats: 8, emoji: '🥤' },
    { id: 'f2', name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 4, emoji: '🍗' },
    { id: 'f3', name: 'Salmon Fillet', calories: 280, protein: 25, carbs: 0, fats: 18, emoji: '🐟' },
    { id: 'f4', name: 'Greek Salad', calories: 150, protein: 5, carbs: 12, fats: 10, emoji: '🥗' },
    { id: 'f5', name: 'Almonds (1oz)', calories: 160, protein: 6, carbs: 6, fats: 14, emoji: '🥜' },
];

// Mock food data - My Meals (saved combinations)
const MY_MEALS = [
    { id: 'm1', name: 'Standard Oats', foods: ['Oatmeal', 'Banana', 'Honey', 'Almond Milk'], calories: 380, emoji: '🥣' },
    { id: 'm2', name: 'Power Breakfast', foods: ['Eggs (3)', 'Avocado Toast', 'Orange Juice'], calories: 520, emoji: '💪' },
    { id: 'm3', name: 'Quick Protein', foods: ['Protein Shake', 'Banana'], calories: 350, emoji: '⚡' },
    { id: 'm4', name: 'Lean Lunch', foods: ['Grilled Chicken', 'Brown Rice', 'Broccoli'], calories: 450, emoji: '🥦' },
    { id: 'm5', name: 'Post-Workout', foods: ['Whey Protein', 'Peanut Butter', 'Oats'], calories: 480, emoji: '🏋️' },
];

// ============================================================================
// FOOD ITEM CARD COMPONENT
// ============================================================================

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    isPredicted?: boolean;
    time?: string;
    emoji?: string;
}

interface FoodItemCardProps {
    item: FoodItem;
    isSelected: boolean;
    onToggle: () => void;
    index: number;
    isDark: boolean;
    showTime?: boolean;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, isSelected, onToggle, index, isDark, showTime }) => {
    const scale = useSharedValue(1);
    const { light } = useHaptics();

    const handlePress = () => {
        light();
        scale.value = withSequence(
            withSpring(0.95, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onToggle();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const cardBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            style={animatedStyle}
        >
            <TouchableOpacity
                style={[
                    styles.foodCard,
                    {
                        backgroundColor: cardBg,
                        borderColor: item.isPredicted ? `${COLORS.aiGold}40` : 'transparent',
                        borderWidth: item.isPredicted ? 1.5 : 0,
                    },
                ]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* AI Predicted Glow */}
                {item.isPredicted && (
                    <View style={styles.predictedGlow}>
                        <LinearGradient
                            colors={['rgba(255,215,0,0.15)', 'transparent']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>
                )}

                {/* Food Icon */}
                <View style={styles.foodImage}>
                    <FoodIcon foodName={item.name} size="medium" />
                </View>

                {/* Food Info */}
                <View style={styles.foodInfo}>
                    <View style={styles.foodNameRow}>
                        <Text style={[styles.foodName, { color: textColor }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.isPredicted && (
                            <View style={styles.aiTag}>
                                <Text style={styles.aiTagText}>AI</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.foodMeta}>
                        {showTime && item.time ? (
                            <Text style={[styles.foodServing, { color: subtextColor }]}>{item.time}</Text>
                        ) : (
                            <Text style={[styles.foodServing, { color: subtextColor }]}>1 serving</Text>
                        )}
                        <View style={styles.macroDots}>
                            <View style={[styles.macroDot, { backgroundColor: COLORS.protein }]} />
                            <View style={[styles.macroDot, { backgroundColor: COLORS.carbs }]} />
                            <View style={[styles.macroDot, { backgroundColor: COLORS.fats }]} />
                        </View>
                    </View>
                </View>

                {/* Calories */}
                <Text style={[styles.foodCalories, { color: COLORS.vitaminOrange }]}>
                    {item.calories}
                </Text>

                {/* Add/Selected Button */}
                <TouchableOpacity
                    style={[
                        styles.addButton,
                        {
                            backgroundColor: isSelected
                                ? COLORS.vitaminOrange
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,92,0,0.1)'),
                        },
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={20}
                        color={isSelected ? '#FFFFFF' : COLORS.vitaminOrange}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// FAVORITE CARD COMPONENT
// ============================================================================

interface FavoriteCardProps {
    item: typeof FAVORITE_FOODS[0];
    isSelected: boolean;
    onToggle: () => void;
    index: number;
    isDark: boolean;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ item, isSelected, onToggle, index, isDark }) => {
    const scale = useSharedValue(1);
    const { light } = useHaptics();

    const handlePress = () => {
        light();
        scale.value = withSequence(
            withSpring(0.95, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onToggle();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const cardBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 60).springify()}
            style={animatedStyle}
        >
            <TouchableOpacity
                style={[styles.favoriteCard, { backgroundColor: cardBg }]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Heart Icon */}
                <View style={styles.favoriteHeart}>
                    <Ionicons name="heart" size={12} color={COLORS.favoriteRed} />
                </View>

                {/* Food Icon */}
                <FoodIcon foodName={item.name} size="large" />

                {/* Name */}
                <Text style={[styles.favoriteName, { color: textColor }]} numberOfLines={2}>
                    {item.name}
                </Text>

                {/* Calories */}
                <Text style={[styles.favoriteCalories, { color: COLORS.vitaminOrange }]}>
                    {item.calories} kcal
                </Text>

                {/* Macros */}
                <View style={styles.favoriteMacros}>
                    <Text style={[styles.favoriteMacroText, { color: subtextColor }]}>
                        P:{item.protein}g
                    </Text>
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={[
                        styles.favoriteAddButton,
                        {
                            backgroundColor: isSelected
                                ? COLORS.vitaminOrange
                                : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,92,0,0.1)'),
                        },
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={18}
                        color={isSelected ? '#FFFFFF' : COLORS.vitaminOrange}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// MY MEAL CARD COMPONENT
// ============================================================================

interface MyMealCardProps {
    meal: typeof MY_MEALS[0];
    isSelected: boolean;
    onToggle: () => void;
    index: number;
    isDark: boolean;
}

const MyMealCard: React.FC<MyMealCardProps> = ({ meal, isSelected, onToggle, index, isDark }) => {
    const scale = useSharedValue(1);
    const { light } = useHaptics();

    const handlePress = () => {
        light();
        scale.value = withSequence(
            withSpring(0.95, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onToggle();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const cardBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 70).springify()}
            style={animatedStyle}
        >
            <TouchableOpacity
                style={[styles.myMealCard, { backgroundColor: cardBg }]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Left: Food Icon */}
                <FoodIcon foodName={meal.name} size="medium" />

                {/* Middle: Info */}
                <View style={styles.myMealInfo}>
                    <Text style={[styles.myMealName, { color: textColor }]}>{meal.name}</Text>
                    <Text style={[styles.myMealFoods, { color: subtextColor }]} numberOfLines={1}>
                        {meal.foods.join(' • ')}
                    </Text>
                    <View style={styles.myMealStats}>
                        <View style={styles.myMealCalorieBadge}>
                            <Text style={styles.myMealCalorieText}>{meal.calories} kcal</Text>
                        </View>
                        <Text style={[styles.myMealItemCount, { color: subtextColor }]}>
                            {meal.foods.length} items
                        </Text>
                    </View>
                </View>

                {/* Right: Add Button */}
                <TouchableOpacity
                    style={[
                        styles.myMealAddButton,
                        {
                            backgroundColor: isSelected
                                ? COLORS.vitaminOrange
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,92,0,0.1)'),
                        },
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={22}
                        color={isSelected ? '#FFFFFF' : COLORS.vitaminOrange}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LogMealModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { light, medium } = useHaptics();
    const params = useLocalSearchParams<{ mealType?: string }>();

    const mealType = params.mealType || 'breakfast';
    const mealConfig = MEAL_CONFIG[mealType] || MEAL_CONFIG.breakfast;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(1); // Default to History
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [apiSearchResults, setApiSearchResults] = useState<DBFoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Local database search results (instant)
    const localSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return searchFoods(searchQuery).slice(0, 5);
    }, [searchQuery]);

    // Debounced API search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setApiSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const { foods } = await searchFoodsAPI(searchQuery, 1, 15);
                setApiSearchResults(foods);
            } catch (error) {
                console.error('API search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Combined search results (local first, then API)
    const searchResults = useMemo(() => {
        const localIds = new Set(localSearchResults.map(f => f.id));
        const apiFiltered = apiSearchResults.filter(f => !localIds.has(f.id));
        return [...localSearchResults, ...apiFiltered];
    }, [localSearchResults, apiSearchResults]);

    // Auto-switch to Search tab when typing
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (text.trim() && activeTab !== 0) {
            setActiveTab(0); // Switch to Search tab
        }
    };

    // Colors
    const colors = {
        bg: isDark ? '#0A0A0C' : COLORS.warmWhite,
        surface: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    };

    // Computed values
    const totalCalories = useMemo(() => {
        let total = 0;
        // Add calories from selected food items
        [...HISTORY_FOODS, ...FAVORITE_FOODS].forEach(f => {
            if (selectedItems.includes(f.id)) total += f.calories;
        });
        // Add calories from selected meals
        MY_MEALS.forEach(m => {
            if (selectedMeals.includes(m.id)) total += m.calories;
        });
        return total;
    }, [selectedItems, selectedMeals]);

    const totalSelectedCount = selectedItems.length + selectedMeals.length;

    const predictedFoods = useMemo(() => HISTORY_FOODS.filter(f => f.isPredicted), []);
    const recentFoods = useMemo(() => HISTORY_FOODS.filter(f => !f.isPredicted), []);

    // Handlers
    const handleClose = () => {
        light();
        router.back();
    };

    const handleToggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleToggleMeal = (id: string) => {
        setSelectedMeals(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const handleLogMeal = () => {
        medium();

        // Get the logFood function from store
        const { logFood } = useUserStore.getState();

        // Normalize mealType to match the expected type
        const normalizedMealType = (mealType === 'snacks' || mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner')
            ? mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks'
            : 'snacks';

        // Log each selected food item with the correct meal type
        [...HISTORY_FOODS, ...FAVORITE_FOODS].forEach(food => {
            if (selectedItems.includes(food.id)) {
                logFood(
                    food.calories,
                    food.protein,
                    food.carbs,
                    food.fats,
                    food.name,
                    normalizedMealType
                );
            }
        });

        // Log each selected meal (as a single combined entry) with the correct meal type
        MY_MEALS.forEach(meal => {
            if (selectedMeals.includes(meal.id)) {
                // For meal combos, we estimate macros based on calorie ratio
                const estimatedProtein = Math.round(meal.calories * 0.25 / 4); // 25% from protein
                const estimatedCarbs = Math.round(meal.calories * 0.45 / 4); // 45% from carbs
                const estimatedFats = Math.round(meal.calories * 0.30 / 9); // 30% from fats

                logFood(
                    meal.calories,
                    estimatedProtein,
                    estimatedCarbs,
                    estimatedFats,
                    meal.name,
                    normalizedMealType
                );
            }
        });

        router.back();
    };

    const handleTabPress = (index: number) => {
        light();
        setActiveTab(index);
    };

    const handleSearchIcon = (type: 'barcode' | 'voice' | 'camera') => {
        light();
        switch (type) {
            case 'barcode':
                router.push('/(modals)/scan' as any);
                break;
            case 'voice':
                router.push('/(modals)/voice-log' as any);
                break;
            case 'camera':
                router.push('/(modals)/scan' as any);
                break;
        }
    };

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Search (Database Results)
                return (
                    <View style={styles.section}>
                        {searchQuery.trim() ? (
                            <>
                                <View style={styles.searchHeaderRow}>
                                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                        🔍 SEARCH RESULTS
                                    </Text>
                                    {isSearching && (
                                        <ActivityIndicator size="small" color={COLORS.vitaminOrange} />
                                    )}
                                </View>
                                {searchResults.length > 0 ? (
                                    searchResults.map((food, index) => (
                                        <TouchableOpacity
                                            key={food.id}
                                            onPress={() => {
                                                light();
                                                router.push({
                                                    pathname: '/(modals)/food-detail-modal',
                                                    params: { foodId: food.id, mealType }
                                                } as any);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <FoodItemCard
                                                item={{
                                                    id: food.id,
                                                    name: food.name,
                                                    calories: food.macros.calories,
                                                    protein: food.macros.protein,
                                                    carbs: food.macros.carbs,
                                                    fats: food.macros.fat,
                                                    isPredicted: false,
                                                    emoji: food.isVerified ? '✅' : '🍽️',
                                                }}
                                                isSelected={selectedItems.includes(food.id)}
                                                onToggle={() => handleToggleItem(food.id)}
                                                index={index}
                                                isDark={isDark}
                                            />
                                        </TouchableOpacity>
                                    ))
                                ) : isSearching ? (
                                    <View style={styles.emptyHint}>
                                        <ActivityIndicator size="large" color={COLORS.vitaminOrange} />
                                        <Text style={[styles.emptyHintText, { color: colors.textSecondary }]}>
                                            Searching foods...
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.emptyHint}>
                                        <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
                                        <Text style={[styles.emptyHintText, { color: colors.textSecondary }]}>
                                            No results for "{searchQuery}"
                                        </Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.emptyHint}>
                                <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
                                <Text style={[styles.emptyHintText, { color: colors.textSecondary }]}>
                                    Type to search verified foods
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 1: // History
                return (
                    <>
                        {/* Predicted Section */}
                        {predictedFoods.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: COLORS.aiGold }]}>
                                    ✨ Predicted for You
                                </Text>
                                {predictedFoods.map((item, index) => (
                                    <FoodItemCard
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedItems.includes(item.id)}
                                        onToggle={() => handleToggleItem(item.id)}
                                        index={index}
                                        isDark={isDark}
                                        showTime
                                    />
                                ))}
                            </View>
                        )}

                        {/* Recent History Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                RECENT HISTORY
                            </Text>
                            {recentFoods.map((item, index) => (
                                <FoodItemCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedItems.includes(item.id)}
                                    onToggle={() => handleToggleItem(item.id)}
                                    index={index + predictedFoods.length}
                                    isDark={isDark}
                                    showTime
                                />
                            ))}
                        </View>
                    </>
                );

            case 2: // Favorites
                return (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            ❤️ YOUR FAVORITES
                        </Text>
                        <View style={styles.favoritesGrid}>
                            {FAVORITE_FOODS.map((item, index) => (
                                <FavoriteCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedItems.includes(item.id)}
                                    onToggle={() => handleToggleItem(item.id)}
                                    index={index}
                                    isDark={isDark}
                                />
                            ))}
                        </View>

                        {/* Empty state hint */}
                        <View style={styles.emptyHint}>
                            <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.emptyHintText, { color: colors.textSecondary }]}>
                                Tap the heart on any food to add it here
                            </Text>
                        </View>
                    </View>
                );

            case 3: // My Meals
                return (
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                🍽️ SAVED MEALS
                            </Text>
                            <TouchableOpacity style={styles.createMealButton}>
                                <Ionicons name="add-circle" size={18} color={COLORS.vitaminOrange} />
                                <Text style={styles.createMealText}>Create New</Text>
                            </TouchableOpacity>
                        </View>

                        {MY_MEALS.map((meal, index) => (
                            <MyMealCard
                                key={meal.id}
                                meal={meal}
                                isSelected={selectedMeals.includes(meal.id)}
                                onToggle={() => handleToggleMeal(meal.id)}
                                index={index}
                                isDark={isDark}
                            />
                        ))}

                        {/* Tip */}
                        <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                            <Ionicons name="bulb-outline" size={18} color={COLORS.aiGold} />
                            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                Save your common combinations as "Meals" for quick one-tap logging.
                            </Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Mesh Gradient Background */}
            <LinearGradient
                colors={isDark
                    ? ['#0A0A0C', '#121214', '#0A0A0C']
                    : [COLORS.warmWhite, COLORS.softGrey, '#FFFFFF']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Context Header */}
                <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerEmoji}>{mealConfig.icon}</Text>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                {mealConfig.title}
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                Target: {mealConfig.subtitle} kcal
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Omni-Search Bar */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.searchContainer}>
                    <BlurView
                        intensity={isDark ? 40 : 60}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.searchBar, { borderColor: colors.border }]}
                    >
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={`Search eggs, oats, coffee...`}
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                        />
                        <View style={styles.searchIcons}>
                            <TouchableOpacity
                                style={styles.searchIconButton}
                                onPress={() => handleSearchIcon('barcode')}
                            >
                                <Ionicons name="barcode-outline" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.searchIconButton}
                                onPress={() => handleSearchIcon('voice')}
                            >
                                <Ionicons name="mic-outline" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.searchIconButton}
                                onPress={() => handleSearchIcon('camera')}
                            >
                                <Ionicons name="camera-outline" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>

                {/* Smart Tabs */}
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                    >
                        {SMART_TABS.map((tab, index) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    {
                                        backgroundColor: activeTab === index
                                            ? COLORS.vitaminOrange
                                            : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                                    },
                                ]}
                                onPress={() => handleTabPress(index)}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        {
                                            color: activeTab === index
                                                ? '#FFFFFF'
                                                : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Tab Content */}
                <ScrollView
                    style={styles.foodList}
                    contentContainerStyle={[
                        styles.foodListContent,
                        { paddingBottom: totalSelectedCount > 0 ? 120 : 40 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {renderTabContent()}
                </ScrollView>
            </SafeAreaView>

            {/* Plate Dock (Cart) */}
            {totalSelectedCount > 0 && (
                <Animated.View
                    entering={SlideInDown.springify()}
                    style={[styles.plateDock, { paddingBottom: insets.bottom + 8 }]}
                >
                    <BlurView
                        intensity={isDark ? 60 : 80}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.plateDockBlur, { borderColor: colors.border }]}
                    >
                        <View style={styles.plateDockContent}>
                            <View style={styles.plateInfo}>
                                <Text style={[styles.plateCount, { color: colors.text }]}>
                                    {totalSelectedCount} item{totalSelectedCount !== 1 ? 's' : ''} selected
                                </Text>
                                <Text style={[styles.plateCalories, { color: colors.textSecondary }]}>
                                    {totalCalories} kcal
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.logButton}
                                onPress={handleLogMeal}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={[COLORS.vitaminOrange, COLORS.neonOrange]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.logButtonGradient}
                                >
                                    <Text style={styles.logButtonText}>Log {totalCalories} kcal</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>
            )}
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    headerEmoji: {
        fontSize: 32,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Search
    searchContainer: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: SPACING.sm,
        paddingVertical: 4,
    },
    searchIcons: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    searchIconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Tabs
    tabsContainer: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.md,
        gap: SPACING.sm,
    },
    tab: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Food List
    foodList: {
        flex: 1,
    },
    foodListContent: {
        paddingHorizontal: SPACING.xl,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
    },
    searchHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },

    // Food Card
    foodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    predictedGlow: {
        ...StyleSheet.absoluteFillObject,
    },
    foodImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    foodEmoji: {
        fontSize: 24,
    },
    foodInfo: {
        flex: 1,
    },
    foodNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    foodName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    aiTag: {
        backgroundColor: COLORS.aiGold,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    aiTagText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#000',
    },
    foodMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginTop: 4,
    },
    foodServing: {
        fontSize: 12,
    },
    macroDots: {
        flexDirection: 'row',
        gap: 3,
    },
    macroDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    foodCalories: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: SPACING.md,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Favorites Grid
    favoritesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: -SPACING.xs,
    },
    favoriteCard: {
        width: '47%',
        marginHorizontal: '1.5%',
        marginBottom: SPACING.md,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        position: 'relative',
    },
    favoriteHeart: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
    },
    favoriteEmoji: {
        fontSize: 36,
        marginBottom: SPACING.sm,
    },
    favoriteName: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    favoriteCalories: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    favoriteMacros: {
        flexDirection: 'row',
        gap: 4,
    },
    favoriteMacroText: {
        fontSize: 11,
        fontWeight: '500',
    },
    favoriteAddButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.sm,
    },
    emptyHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    emptyHintText: {
        fontSize: 13,
        fontWeight: '500',
    },

    // My Meals
    myMealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    myMealEmoji: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    myMealEmojiText: {
        fontSize: 28,
    },
    myMealInfo: {
        flex: 1,
    },
    myMealName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    myMealFoods: {
        fontSize: 12,
        marginBottom: 6,
    },
    myMealStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    myMealCalorieBadge: {
        backgroundColor: `${COLORS.vitaminOrange}15`,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    myMealCalorieText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.vitaminOrange,
    },
    myMealItemCount: {
        fontSize: 11,
    },
    myMealAddButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createMealButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    createMealText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.vitaminOrange,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginTop: SPACING.md,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },

    // Plate Dock
    plateDock: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.xl,
    },
    plateDockBlur: {
        borderRadius: RADIUS['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
    },
    plateDockContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    plateInfo: {
        flex: 1,
    },
    plateCount: {
        fontSize: 15,
        fontWeight: '600',
    },
    plateCalories: {
        fontSize: 12,
        marginTop: 2,
    },
    logButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    logButtonGradient: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    logButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
