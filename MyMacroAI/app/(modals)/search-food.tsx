/**
 * SearchFoodScreen - "Omni-Search"
 * 
 * High-speed, auto-completing search engine with verified food database.
 * Features: Glass capsule search bar, debounced input, verified badges.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    useColorScheme,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { FoodItem } from '@/src/types/food';
import { searchFoods, MOCK_FOOD_DB } from '@/src/data/mockFoodDB';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { FoodIcon } from '@/src/components/food/FoodIcon';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onBarcodePress: () => void;
    onVoicePress: () => void;
    isDark: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    onBarcodePress,
    onVoicePress,
    isDark,
}) => {
    const cursorPulse = useSharedValue(1);

    useEffect(() => {
        cursorPulse.value = withRepeat(
            withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    return (
        <BlurView
            intensity={isDark ? 40 : 80}
            tint={isDark ? 'dark' : 'light'}
            style={styles.searchBarContainer}
        >
            <View style={[styles.searchBar, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                <Ionicons name="search" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                <TextInput
                    style={[styles.searchInput, { color: isDark ? '#FFF' : '#1A1A1A' }]}
                    placeholder="Search foods..."
                    placeholderTextColor="#8E8E93"
                    value={value}
                    onChangeText={onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                <View style={styles.searchActions}>
                    <TouchableOpacity onPress={onBarcodePress} style={styles.searchActionButton}>
                        <Ionicons name="barcode-outline" size={22} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onVoicePress} style={styles.searchActionButton}>
                        <Ionicons name="mic-outline" size={22} color="#10B981" />
                    </TouchableOpacity>
                </View>
            </View>
        </BlurView>
    );
};

// ============================================================================
// FOOD ITEM CARD
// ============================================================================

interface FoodCardProps {
    food: FoodItem;
    onCardPress: () => void;
    onQuickAdd: () => void;
    isTopHit: boolean;
    isDark: boolean;
    index: number;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onCardPress, onQuickAdd, isTopHit, isDark, index }) => {
    const scale = useSharedValue(1);
    const addButtonScale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15 });
    };

    const handleQuickAdd = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addButtonScale.value = withSpring(0.8, { damping: 10 });
        setTimeout(() => {
            addButtonScale.value = withSpring(1, { damping: 10 });
        }, 100);
        onQuickAdd();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const addButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: addButtonScale.value }],
    }));

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(300)}
            style={animatedStyle}
        >
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onCardPress();
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <BlurView
                    intensity={isDark ? 30 : 60}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                        styles.foodCard,
                        isTopHit && styles.foodCardTopHit,
                        { borderColor: isTopHit ? 'rgba(245, 158, 11, 0.4)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') },
                    ]}
                >
                    {/* Food Icon */}
                    <View style={styles.foodImageContainer}>
                        <FoodIcon
                            foodName={food.name}
                            size="medium"
                            isVerified={food.isVerified}
                        />
                    </View>

                    {/* Food Info */}
                    <View style={styles.foodInfo}>
                        <View style={styles.foodTitleRow}>
                            <Text style={[styles.foodName, { color: isDark ? '#FFF' : '#1A1A1A' }]} numberOfLines={1}>
                                {food.name}
                            </Text>
                            {food.isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.foodMeta}>
                            {food.servingDescription || `${food.servingSize}${food.servingUnit}`} • {food.macros.calories} kcal
                        </Text>
                        <View style={styles.macroPreview}>
                            <Text style={styles.macroChip}>P: {food.macros.protein}g</Text>
                            <Text style={styles.macroChip}>C: {food.macros.carbs}g</Text>
                            <Text style={styles.macroChip}>F: {food.macros.fat}g</Text>
                        </View>
                    </View>

                    {/* Quick Add Button - Instant Log */}
                    <Animated.View style={addButtonAnimatedStyle}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleQuickAdd}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="add" size={24} color="#FF5C00" />
                        </TouchableOpacity>
                    </Animated.View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function SearchFoodScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>(MOCK_FOOD_DB);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSearching(true);
            const searchResults = searchFoods(query);
            setResults(searchResults);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleFoodPress = useCallback((food: FoodItem) => {
        Keyboard.dismiss();
        router.push({
            pathname: '/(modals)/food-detail',
            params: { foodId: food.id },
        } as any);
    }, [router]);

    const handleQuickAdd = useCallback((food: FoodItem) => {
        // Import and use the logFood from store
        const { logFood } = require('@/src/store/UserStore').useUserStore.getState();
        logFood(
            food.macros.calories,
            food.macros.protein,
            food.macros.carbs,
            food.macros.fat,
            `${food.name} (${food.servingSize}${food.servingUnit})`
        );
    }, []);

    const handleBarcodePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(modals)/barcode-scanner' as any);
    };

    const handleVoicePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(modals)/voice-log' as any);
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0C' : '#F5F5F7' }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="chevron-back" size={28} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                        Search Foods
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Search Bar */}
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    onBarcodePress={handleBarcodePress}
                    onVoicePress={handleVoicePress}
                    isDark={isDark}
                />

                {/* Results */}
                {isSearching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF5C00" />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <FoodCard
                                food={item}
                                onCardPress={() => handleFoodPress(item)}
                                onQuickAdd={() => handleQuickAdd(item)}
                                isTopHit={index === 0 && query.length > 0}
                                isDark={isDark}
                                index={index}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={48} color="#8E8E93" />
                                <Text style={styles.emptyText}>No foods found</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

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
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },

    // Search Bar
    searchBarContainer: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderWidth: 1,
        borderRadius: RADIUS.xl,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    searchActions: {
        flexDirection: 'row',
        gap: 4,
    },
    searchActionButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
    },

    // Food Card
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    foodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
    foodCardTopHit: {
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    foodImageContainer: {
        marginRight: SPACING.md,
    },
    foodImage: {
        width: 56,
        height: 56,
        borderRadius: 16,
    },
    foodImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foodInfo: {
        flex: 1,
    },
    foodTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '600',
        flexShrink: 1,
    },
    verifiedBadge: {
        marginLeft: 2,
    },
    foodMeta: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 2,
    },
    macroPreview: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    macroChip: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8E8E93',
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 92, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Loading & Empty
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: SPACING.md,
    },
});
