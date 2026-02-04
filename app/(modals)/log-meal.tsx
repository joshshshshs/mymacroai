/**
 * Log Meal Modal - Premium Food Logging Experience
 * 
 * State-of-the-art food search with:
 * - Instant search with smart suggestions
 * - Quick actions: Barcode, Camera AI, Voice
 * - Recent foods with AI predictions
 * - Beautiful modern UI with haptic feedback
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    ScrollView,
    Keyboard,
    ActivityIndicator,
    Dimensions,
    Platform,
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
    withTiming,
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    SlideInDown,
    SlideOutDown,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { FoodSearchService, SearchResult } from '@/src/services/food/FoodSearchService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
    // Primary brand
    primary: '#FF5C00',
    primaryLight: '#FF8C40',
    primaryDark: '#E04500',
    
    // Macros
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
    calories: '#FF5C00',
    
    // Semantic
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    aiGold: '#FFD700',
    
    // Neutral
    white: '#FFFFFF',
    black: '#000000',
};

const MEAL_CONFIG: Record<string, { 
    title: string; 
    subtitle: string; 
    icon: string;
    gradient: [string, string];
}> = {
    breakfast: { 
        title: 'Breakfast', 
        subtitle: 'Start your day right', 
        icon: '🌅',
        gradient: ['#FF9500', '#FF5E3A'],
    },
    lunch: { 
        title: 'Lunch', 
        subtitle: 'Midday fuel', 
        icon: '☀️',
        gradient: ['#FFCC00', '#FF9500'],
    },
    dinner: { 
        title: 'Dinner', 
        subtitle: 'Evening recovery', 
        icon: '🌙',
        gradient: ['#5856D6', '#AF52DE'],
    },
    snacks: { 
        title: 'Snack', 
        subtitle: 'Quick energy', 
        icon: '🍿',
        gradient: ['#34C759', '#30D158'],
    },
};

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

interface QuickActionProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
    delay?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, onPress, delay = 0 }) => {
    const scale = useSharedValue(1);
    
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(0.9, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    
    return (
        <Animated.View entering={FadeInUp.delay(delay).springify()} style={animatedStyle}>
            <TouchableOpacity style={styles.quickAction} onPress={handlePress} activeOpacity={0.8}>
                <LinearGradient
                    colors={[color, `${color}CC`]}
                    style={styles.quickActionGradient}
                >
                    <Ionicons name={icon} size={24} color={COLORS.white} />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// FOOD RESULT CARD
// ============================================================================

interface FoodCardProps {
    food: SearchResult;
    isSelected: boolean;
    onToggle: () => void;
    onPress: () => void;
    index: number;
    isDark: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({ 
    food, 
    isSelected, 
    onToggle, 
    onPress,
    index, 
    isDark 
}) => {
    const scale = useSharedValue(1);
    const checkScale = useSharedValue(isSelected ? 1 : 0);
    
    useEffect(() => {
        checkScale.value = withSpring(isSelected ? 1 : 0, { damping: 15 });
    }, [isSelected]);
    
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.97, { damping: 20 }),
            withSpring(1, { damping: 15 })
        );
        onPress();
    };
    
    const handleToggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(0.95, { damping: 20 }),
            withSpring(1, { damping: 15 })
        );
        onToggle();
    };
    
    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    
    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
        opacity: checkScale.value,
    }));
    
    const cardBg = isDark ? 'rgba(255,255,255,0.06)' : COLORS.white;
    const textColor = isDark ? COLORS.white : '#1A1A1A';
    const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';
    
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 40).springify()}
            style={cardStyle}
        >
            <TouchableOpacity
                style={[
                    styles.foodCard,
                    { 
                        backgroundColor: cardBg,
                        borderColor: isSelected ? COLORS.primary : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                    },
                ]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Food Icon Circle */}
                <View style={[styles.foodIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F5F5F7' }]}>
                    <Text style={styles.foodIconEmoji}>
                        {getFoodEmoji(food.name)}
                    </Text>
                </View>
                
                {/* Food Info */}
                <View style={styles.foodInfo}>
                    <View style={styles.foodNameRow}>
                        <Text style={[styles.foodName, { color: textColor }]} numberOfLines={1}>
                            {food.name}
                        </Text>
                        {food.isVerified && (
                            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        )}
                    </View>
                    
                    <Text style={[styles.foodServing, { color: subtextColor }]}>
                        {food.servingSize} {food.servingUnit}
                    </Text>
                    
                    {/* Macro Pills */}
                    <View style={styles.macroPills}>
                        <View style={[styles.macroPill, { backgroundColor: `${COLORS.protein}20` }]}>
                            <Text style={[styles.macroPillText, { color: COLORS.protein }]}>
                                P {food.protein}g
                            </Text>
                        </View>
                        <View style={[styles.macroPill, { backgroundColor: `${COLORS.carbs}20` }]}>
                            <Text style={[styles.macroPillText, { color: COLORS.carbs }]}>
                                C {food.carbs}g
                            </Text>
                        </View>
                        <View style={[styles.macroPill, { backgroundColor: `${COLORS.fats}20` }]}>
                            <Text style={[styles.macroPillText, { color: COLORS.fats }]}>
                                F {food.fat}g
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Calories + Add Button */}
                <View style={styles.foodActions}>
                    <Text style={[styles.foodCalories, { color: COLORS.primary }]}>
                        {food.calories}
                    </Text>
                    <Text style={[styles.foodCaloriesUnit, { color: subtextColor }]}>kcal</Text>
                    
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            {
                                backgroundColor: isSelected 
                                    ? COLORS.primary 
                                    : (isDark ? 'rgba(255,255,255,0.1)' : `${COLORS.primary}15`),
                            },
                        ]}
                        onPress={handleToggle}
                        activeOpacity={0.8}
                    >
                        {isSelected ? (
                            <Animated.View style={checkStyle}>
                                <Ionicons name="checkmark" size={20} color={COLORS.white} />
                            </Animated.View>
                        ) : (
                            <Ionicons name="add" size={20} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Helper to get food emoji
function getFoodEmoji(name: string): string {
    const lowerName = name.toLowerCase();
    const emojiMap: Record<string, string> = {
        'egg': '🥚', 'chicken': '🍗', 'rice': '🍚', 'banana': '🍌',
        'yogurt': '🥛', 'oatmeal': '🥣', 'oats': '🥣', 'salmon': '🐟',
        'avocado': '🥑', 'almond': '🥜', 'sweet potato': '🍠',
        'broccoli': '🥦', 'protein': '💪', 'bread': '🍞', 'apple': '🍎',
        'cottage': '🧀', 'beans': '🫘', 'spinach': '🥬', 'olive': '🫒',
        'turkey': '🦃', 'tuna': '🐟', 'beef': '🥩', 'shrimp': '🦐',
        'tofu': '🧈', 'milk': '🥛', 'cheese': '🧀', 'quinoa': '🌾',
        'pasta': '🍝', 'bagel': '🥯', 'orange': '🍊', 'strawberr': '🍓',
        'blueberr': '🫐', 'mango': '🥭', 'carrot': '🥕', 'pepper': '🫑',
        'cucumber': '🥒', 'tomato': '🍅', 'bar': '🍫', 'hummus': '🧆',
        'chocolate': '🍫', 'pancake': '🥞', 'waffle': '🧇', 'bacon': '🥓',
        'coffee': '☕', 'trail': '🥜', 'nut': '🥜',
    };
    
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (lowerName.includes(key)) return emoji;
    }
    return '🍽️';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LogMealModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ mealType?: string }>();
    const searchInputRef = useRef<TextInput>(null);
    
    const mealType = (params.mealType || 'snacks') as keyof typeof MEAL_CONFIG;
    const mealConfig = MEAL_CONFIG[mealType] || MEAL_CONFIG.snacks;
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedFoods, setSelectedFoods] = useState<Map<string, SearchResult>>(new Map());
    const [showKeyboard, setShowKeyboard] = useState(false);
    
    // Suggestions based on meal type
    const suggestions = useMemo(() => 
        FoodSearchService.getSuggestions(mealType as any), 
    [mealType]);
    
    // Popular foods
    const popularFoods = useMemo(() => 
        FoodSearchService.getPopularFoods().slice(0, 6), 
    []);
    
    // Colors
    const colors = useMemo(() => ({
        bg: isDark ? '#0A0A0C' : '#F5F5F7',
        surface: isDark ? 'rgba(255,255,255,0.06)' : COLORS.white,
        text: isDark ? COLORS.white : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    }), [isDark]);
    
    // Computed
    const totalCalories = useMemo(() => {
        return Array.from(selectedFoods.values()).reduce((sum, f) => sum + f.calories, 0);
    }, [selectedFoods]);
    
    const totalSelectedCount = selectedFoods.size;
    
    // Search with debounce
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        
        setIsSearching(true);
        const timeoutId = setTimeout(async () => {
            const results = await FoodSearchService.search(searchQuery);
            setSearchResults(results);
            setIsSearching(false);
        }, 150);
        
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    
    // Handlers
    const handleClose = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    }, [router]);
    
    const handleToggleFood = useCallback((food: SearchResult) => {
        setSelectedFoods(prev => {
            const newMap = new Map(prev);
            if (newMap.has(food.id)) {
                newMap.delete(food.id);
            } else {
                newMap.set(food.id, food);
            }
            return newMap;
        });
    }, []);
    
    const handleFoodPress = useCallback((food: SearchResult) => {
        // Navigate to food detail
        router.push({
            pathname: '/(modals)/food-detail',
            params: { foodId: food.id, mealType },
        } as any);
    }, [router, mealType]);
    
    const handleLogMeal = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const { logFood } = useUserStore.getState();
        const normalizedMealType = (['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType) 
            ? mealType 
            : 'snacks') as 'breakfast' | 'lunch' | 'dinner' | 'snacks';
        
        selectedFoods.forEach(food => {
            logFood(
                food.calories,
                food.protein,
                food.carbs,
                food.fat,
                food.name,
                normalizedMealType
            );
        });
        
        router.back();
    }, [selectedFoods, mealType, router]);
    
    const handleQuickAction = useCallback((type: 'barcode' | 'camera' | 'voice') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        switch (type) {
            case 'barcode':
                router.push('/(modals)/barcode-scanner' as any);
                break;
            case 'camera':
                router.push({
                    pathname: '/(modals)/food-camera',
                    params: { mealType },
                } as any);
                break;
            case 'voice':
                router.push('/(modals)/voice-log' as any);
                break;
        }
    }, [router, mealType]);
    
    const handleSearchFocus = useCallback(() => {
        setShowKeyboard(true);
    }, []);
    
    const handleSearchBlur = useCallback(() => {
        if (!searchQuery.trim()) {
            setShowKeyboard(false);
        }
    }, [searchQuery]);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Background Gradient */}
            <LinearGradient
                colors={isDark 
                    ? ['#0A0A0C', '#121215', '#0A0A0C'] 
                    : ['#F5F5F7', '#FFFFFF', '#F5F5F7']
                }
                style={StyleSheet.absoluteFillObject}
            />
            
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.mealIconContainer}>
                            <LinearGradient
                                colors={mealConfig.gradient}
                                style={styles.mealIconGradient}
                            >
                                <Text style={styles.mealIcon}>{mealConfig.icon}</Text>
                            </LinearGradient>
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                {mealConfig.title}
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                {mealConfig.subtitle}
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                </Animated.View>
                
                {/* Search Bar */}
                <Animated.View 
                    entering={FadeInDown.delay(100).springify()} 
                    style={styles.searchContainer}
                >
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            ref={searchInputRef}
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search foods..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        {isSearching ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </Animated.View>
                
                {/* Quick Actions */}
                {!showKeyboard && !searchQuery && (
                    <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.quickActions}>
                        <QuickAction 
                            icon="barcode-outline" 
                            label="Scan" 
                            color="#007AFF"
                            onPress={() => handleQuickAction('barcode')}
                            delay={0}
                        />
                        <QuickAction 
                            icon="camera-outline" 
                            label="Photo AI" 
                            color={COLORS.primary}
                            onPress={() => handleQuickAction('camera')}
                            delay={50}
                        />
                        <QuickAction 
                            icon="mic-outline" 
                            label="Voice" 
                            color="#AF52DE"
                            onPress={() => handleQuickAction('voice')}
                            delay={100}
                        />
                    </Animated.View>
                )}
                
                {/* Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={[
                        styles.contentContainer,
                        { paddingBottom: totalSelectedCount > 0 ? 140 : 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Search Results */}
                    {searchQuery.trim() ? (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                {isSearching ? 'SEARCHING...' : `RESULTS (${searchResults.length})`}
                            </Text>
                            {searchResults.length > 0 ? (
                                searchResults.map((food, index) => (
                                    <FoodCard
                                        key={food.id}
                                        food={food}
                                        isSelected={selectedFoods.has(food.id)}
                                        onToggle={() => handleToggleFood(food)}
                                        onPress={() => handleFoodPress(food)}
                                        index={index}
                                        isDark={isDark}
                                    />
                                ))
                            ) : !isSearching && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
                                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                        No results for "{searchQuery}"
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.emptyStateButton}
                                        onPress={() => handleQuickAction('camera')}
                                    >
                                        <Ionicons name="camera" size={18} color={COLORS.white} />
                                        <Text style={styles.emptyStateButtonText}>Use Photo AI</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ) : (
                        <>
                            {/* Suggestions for meal */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                    ✨ SUGGESTED FOR {mealConfig.title.toUpperCase()}
                                </Text>
                                {suggestions.map((food, index) => (
                                    <FoodCard
                                        key={food.id}
                                        food={food}
                                        isSelected={selectedFoods.has(food.id)}
                                        onToggle={() => handleToggleFood(food)}
                                        onPress={() => handleFoodPress(food)}
                                        index={index}
                                        isDark={isDark}
                                    />
                                ))}
                            </View>
                            
                            {/* Popular Foods */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                    🔥 POPULAR FOODS
                                </Text>
                                {popularFoods.map((food, index) => (
                                    <FoodCard
                                        key={food.id}
                                        food={food}
                                        isSelected={selectedFoods.has(food.id)}
                                        onToggle={() => handleToggleFood(food)}
                                        onPress={() => handleFoodPress(food)}
                                        index={index + suggestions.length}
                                        isDark={isDark}
                                    />
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
            
            {/* Bottom Cart */}
            {totalSelectedCount > 0 && (
                <Animated.View
                    entering={SlideInDown.springify()}
                    exiting={SlideOutDown.springify()}
                    style={[styles.cart, { paddingBottom: insets.bottom + 8 }]}
                >
                    <BlurView
                        intensity={isDark ? 60 : 90}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.cartBlur, { borderColor: colors.border }]}
                    >
                        <View style={styles.cartContent}>
                            <View style={styles.cartInfo}>
                                <Text style={[styles.cartCount, { color: colors.text }]}>
                                    {totalSelectedCount} item{totalSelectedCount !== 1 ? 's' : ''} selected
                                </Text>
                                <View style={styles.cartCalories}>
                                    <Text style={styles.cartCaloriesValue}>{totalCalories}</Text>
                                    <Text style={[styles.cartCaloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity
                                style={styles.logButton}
                                onPress={handleLogMeal}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primaryLight]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.logButtonGradient}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                                    <Text style={styles.logButtonText}>Log Meal</Text>
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    mealIconContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    mealIconGradient: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mealIcon: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 22,
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
        marginBottom: SPACING.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.xl,
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    quickAction: {
        alignItems: 'center',
        gap: SPACING.xs,
    },
    quickActionGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
    },
    
    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: SPACING.xl,
    },
    
    // Section
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    foodIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    foodIconEmoji: {
        fontSize: 22,
    },
    foodInfo: {
        flex: 1,
    },
    foodNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    foodName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    foodServing: {
        fontSize: 12,
        marginTop: 2,
        marginBottom: 6,
    },
    macroPills: {
        flexDirection: 'row',
        gap: 6,
    },
    macroPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    macroPillText: {
        fontSize: 10,
        fontWeight: '700',
    },
    foodActions: {
        alignItems: 'flex-end',
        marginLeft: SPACING.sm,
    },
    foodCalories: {
        fontSize: 18,
        fontWeight: '800',
    },
    foodCaloriesUnit: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyStateText: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.xl,
        gap: SPACING.xs,
    },
    emptyStateButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
    },
    
    // Cart
    cart: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
    },
    cartBlur: {
        borderRadius: RADIUS['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
    },
    cartContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    cartInfo: {
        flex: 1,
    },
    cartCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    cartCalories: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 2,
    },
    cartCaloriesValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    cartCaloriesUnit: {
        fontSize: 12,
        fontWeight: '500',
    },
    logButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    logButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        gap: SPACING.xs,
    },
    logButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
});
