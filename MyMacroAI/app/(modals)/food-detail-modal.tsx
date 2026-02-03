/**
 * Food Detail Modal - MyFitnessPal-style Food View
 * 
 * Premium food detail page with:
 * - Quantity/serving size editor
 * - Macro rings visualization
 * - Full micronutrient list with daily values
 * - Quick log button with meal type selection
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    useColorScheme,
    Image,
    StatusBar,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { getFoodByIdAPI } from '@/src/services/foodApiService';
import { getFoodById, MOCK_FOOD_DB } from '@/src/data/mockFoodDB';
import { FoodItem } from '@/src/types/food';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    vitaminOrange: '#FF5C00',
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
    fiber: '#8B5CF6',
    success: '#22C55E',
};

const MEAL_OPTIONS = [
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny' },
    { id: 'lunch', label: 'Lunch', icon: 'restaurant' },
    { id: 'dinner', label: 'Dinner', icon: 'moon' },
    { id: 'snacks', label: 'Snack', icon: 'nutrition' },
] as const;

const SERVING_UNITS = [
    { id: 'g', label: 'grams', multiplier: 1 },
    { id: 'oz', label: 'ounces', multiplier: 28.35 },
    { id: 'serving', label: 'serving', multiplier: 100 },
];

// ============================================================================
// MACRO RING COMPONENT
// ============================================================================

const MacroRing: React.FC<{
    label: string;
    value: number;
    unit: string;
    color: string;
    percentage: number;
}> = ({ label, value, unit, color, percentage }) => {
    const size = 70;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(percentage / 100, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={styles.macroRing}>
            <Svg width={size} height={size}>
                {/* Background ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.macroRingContent}>
                <Text style={[styles.macroValue, { color }]}>{value}{unit}</Text>
            </View>
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    );
};

// ============================================================================
// NUTRIENT ROW COMPONENT
// ============================================================================

const NutrientRow: React.FC<{
    name: string;
    amount: number;
    unit: string;
    dailyValue?: number;
    isDark: boolean;
    isSubItem?: boolean;
}> = ({ name, amount, unit, dailyValue, isDark, isSubItem }) => (
    <View style={[styles.nutrientRow, isSubItem && styles.nutrientSubRow]}>
        <Text style={[
            styles.nutrientName,
            { color: isDark ? '#FFFFFF' : '#1A1A1A' },
            isSubItem && styles.nutrientSubName,
        ]}>
            {name}
        </Text>
        <View style={styles.nutrientValues}>
            <Text style={[styles.nutrientAmount, { color: isDark ? 'rgba(255,255,255,0.7)' : '#4B5563' }]}>
                {amount.toFixed(1)}{unit}
            </Text>
            {dailyValue !== undefined && dailyValue > 0 && (
                <Text style={[styles.nutrientDV, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>
                    {dailyValue}%
                </Text>
            )}
        </View>
    </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FoodDetailModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ foodId: string; mealType?: string }>();

    const { logFood, addCoins } = useUserStore();

    const [food, setFood] = useState<FoodItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState('100');
    const [selectedUnit, setSelectedUnit] = useState('g');
    const [selectedMeal, setSelectedMeal] = useState(params.mealType || 'snacks');
    const [showMealPicker, setShowMealPicker] = useState(false);

    // Load food data
    React.useEffect(() => {
        loadFood();
    }, [params.foodId]);

    const loadFood = async () => {
        if (!params.foodId) {
            router.back();
            return;
        }

        setIsLoading(true);

        // Try local mock DB first
        let foundFood: FoodItem | null = getFoodById(params.foodId) ?? null;

        // If not found, try API
        if (!foundFood && params.foodId.startsWith('off-')) {
            foundFood = await getFoodByIdAPI(params.foodId);
        }

        setFood(foundFood);
        setIsLoading(false);
    };

    const colors = {
        bg: isDark ? '#121214' : '#FAFAFA',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        input: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7',
    };

    // Calculate adjusted macros based on quantity
    const adjustedMacros = useMemo(() => {
        if (!food) return null;

        const unit = SERVING_UNITS.find(u => u.id === selectedUnit);
        const qty = parseFloat(quantity) || 0;
        const grams = selectedUnit === 'serving'
            ? food.servingSize * qty
            : qty * (unit?.multiplier || 1);
        const multiplier = grams / 100; // All values are per 100g

        return {
            calories: Math.round(food.macros.calories * multiplier),
            protein: Math.round(food.macros.protein * multiplier),
            carbs: Math.round(food.macros.carbs * multiplier),
            fat: Math.round(food.macros.fat * multiplier),
            fiber: Math.round((food.macros.fiber || 0) * multiplier),
            sugar: Math.round((food.macros.sugar || 0) * multiplier),
            saturatedFat: Math.round((food.macros.saturatedFat || 0) * multiplier),
        };
    }, [food, quantity, selectedUnit]);

    // Calculate adjusted micronutrients
    const adjustedMicros = useMemo(() => {
        if (!food?.micronutrients) return [];

        const unit = SERVING_UNITS.find(u => u.id === selectedUnit);
        const qty = parseFloat(quantity) || 0;
        const grams = selectedUnit === 'serving'
            ? food.servingSize * qty
            : qty * (unit?.multiplier || 1);
        const multiplier = grams / 100;

        return food.micronutrients.map(micro => ({
            ...micro,
            amount: micro.amount * multiplier,
            dailyValuePercentage: micro.dailyValuePercentage
                ? Math.round(micro.dailyValuePercentage * multiplier)
                : undefined,
        }));
    }, [food, quantity, selectedUnit]);

    const handleLog = () => {
        if (!food || !adjustedMacros) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        logFood(
            adjustedMacros.calories,
            adjustedMacros.protein,
            adjustedMacros.carbs,
            adjustedMacros.fat,
            food.name,
            selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snacks'
        );

        // Award coins for logging
        addCoins(5);

        router.back();
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
            </View>
        );
    }

    if (!food) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Food not found</Text>
                <TouchableOpacity onPress={handleClose} style={styles.backButtonAlt}>
                    <Text style={{ color: COLORS.vitaminOrange }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Calculate macro percentages for rings
    const totalCals = adjustedMacros?.calories || 1;
    const proteinCals = (adjustedMacros?.protein || 0) * 4;
    const carbsCals = (adjustedMacros?.carbs || 0) * 4;
    const fatCals = (adjustedMacros?.fat || 0) * 9;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header with Image */}
                    <Animated.View entering={FadeIn.duration(400)}>
                        <LinearGradient
                            colors={isDark ? ['#FF5C00', '#FF8C00'] : ['#FF6B00', '#FF9500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerGradient}
                        >
                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <BlurView intensity={40} tint="dark" style={styles.closeButtonBlur}>
                                    <Ionicons name="close" size={20} color="#FFFFFF" />
                                </BlurView>
                            </TouchableOpacity>

                            {/* Food Image or Icon */}
                            <View style={styles.foodImageContainer}>
                                {food.imageUrl ? (
                                    <Image source={{ uri: food.imageUrl }} style={styles.foodImage} />
                                ) : (
                                    <View style={styles.foodImagePlaceholder}>
                                        <Ionicons name="nutrition" size={60} color="rgba(255,255,255,0.8)" />
                                    </View>
                                )}
                            </View>

                            {/* Food Name & Brand */}
                            <Text style={styles.foodName}>{food.name}</Text>
                            {food.brand && (
                                <Text style={styles.foodBrand}>{food.brand}</Text>
                            )}

                            {/* Verified Badge */}
                            {food.isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </Animated.View>

                    {/* Quantity Editor */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Serving Size</Text>

                            <View style={styles.quantityRow}>
                                <TextInput
                                    style={[styles.quantityInput, { backgroundColor: colors.input, color: colors.text }]}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="decimal-pad"
                                    selectTextOnFocus
                                />

                                <View style={styles.unitSelector}>
                                    {SERVING_UNITS.map(unit => (
                                        <TouchableOpacity
                                            key={unit.id}
                                            style={[
                                                styles.unitButton,
                                                selectedUnit === unit.id && styles.unitButtonActive,
                                            ]}
                                            onPress={() => {
                                                Haptics.selectionAsync();
                                                setSelectedUnit(unit.id);
                                            }}
                                        >
                                            <Text style={[
                                                styles.unitButtonText,
                                                selectedUnit === unit.id && styles.unitButtonTextActive,
                                            ]}>
                                                {unit.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <Text style={[styles.servingNote, { color: colors.textSecondary }]}>
                                1 serving = {food.servingSize}{food.servingUnit} ({food.servingDescription})
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Meal Type Selector */}
                    <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add to Meal</Text>

                            <View style={styles.mealGrid}>
                                {MEAL_OPTIONS.map(meal => (
                                    <TouchableOpacity
                                        key={meal.id}
                                        style={[
                                            styles.mealOption,
                                            { borderColor: colors.border },
                                            selectedMeal === meal.id && styles.mealOptionActive,
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedMeal(meal.id);
                                        }}
                                    >
                                        <Ionicons
                                            name={meal.icon as any}
                                            size={20}
                                            color={selectedMeal === meal.id ? COLORS.vitaminOrange : colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.mealOptionText,
                                            { color: selectedMeal === meal.id ? COLORS.vitaminOrange : colors.text },
                                        ]}>
                                            {meal.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Macro Rings */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                            <View style={styles.caloriesHeader}>
                                <Text style={[styles.caloriesValue, { color: COLORS.vitaminOrange }]}>
                                    {adjustedMacros?.calories || 0}
                                </Text>
                                <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
                            </View>

                            <View style={styles.macroRingsRow}>
                                <MacroRing
                                    label="Protein"
                                    value={adjustedMacros?.protein || 0}
                                    unit="g"
                                    color={COLORS.protein}
                                    percentage={(proteinCals / totalCals) * 100}
                                />
                                <MacroRing
                                    label="Carbs"
                                    value={adjustedMacros?.carbs || 0}
                                    unit="g"
                                    color={COLORS.carbs}
                                    percentage={(carbsCals / totalCals) * 100}
                                />
                                <MacroRing
                                    label="Fat"
                                    value={adjustedMacros?.fat || 0}
                                    unit="g"
                                    color={COLORS.fats}
                                    percentage={(fatCals / totalCals) * 100}
                                />
                            </View>
                        </View>
                    </Animated.View>

                    {/* Detailed Nutrition */}
                    <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrition Facts</Text>

                            <View style={[styles.nutrientDivider, { backgroundColor: colors.border }]} />

                            {/* Macros */}
                            <NutrientRow name="Calories" amount={adjustedMacros?.calories || 0} unit="" dailyValue={Math.round((adjustedMacros?.calories || 0) / 2000 * 100)} isDark={isDark} />
                            <NutrientRow name="Total Fat" amount={adjustedMacros?.fat || 0} unit="g" dailyValue={Math.round((adjustedMacros?.fat || 0) / 78 * 100)} isDark={isDark} />
                            <NutrientRow name="Saturated Fat" amount={adjustedMacros?.saturatedFat || 0} unit="g" dailyValue={Math.round((adjustedMacros?.saturatedFat || 0) / 20 * 100)} isDark={isDark} isSubItem />
                            <NutrientRow name="Total Carbs" amount={adjustedMacros?.carbs || 0} unit="g" dailyValue={Math.round((adjustedMacros?.carbs || 0) / 275 * 100)} isDark={isDark} />
                            <NutrientRow name="Fiber" amount={adjustedMacros?.fiber || 0} unit="g" dailyValue={Math.round((adjustedMacros?.fiber || 0) / 28 * 100)} isDark={isDark} isSubItem />
                            <NutrientRow name="Sugars" amount={adjustedMacros?.sugar || 0} unit="g" isDark={isDark} isSubItem />
                            <NutrientRow name="Protein" amount={adjustedMacros?.protein || 0} unit="g" dailyValue={Math.round((adjustedMacros?.protein || 0) / 50 * 100)} isDark={isDark} />

                            {/* Micronutrients */}
                            {adjustedMicros.length > 0 && (
                                <>
                                    <View style={[styles.nutrientDivider, { backgroundColor: colors.border, marginTop: 16 }]} />
                                    <Text style={[styles.microTitle, { color: colors.textSecondary }]}>VITAMINS & MINERALS</Text>

                                    {adjustedMicros.map((micro, index) => (
                                        <NutrientRow
                                            key={micro.id || index}
                                            name={micro.name}
                                            amount={micro.amount}
                                            unit={micro.unit}
                                            dailyValue={micro.dailyValuePercentage}
                                            isDark={isDark}
                                        />
                                    ))}
                                </>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Fixed Log Button */}
                <Animated.View
                    entering={SlideInDown.delay(300).springify()}
                    style={[styles.logButtonContainer, { paddingBottom: insets.bottom + 16 }]}
                >
                    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.logButtonBlur}>
                        <TouchableOpacity
                            style={styles.logButton}
                            onPress={handleLog}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FF5C00', '#FF8C00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.logButtonGradient}
                            >
                                <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                                <Text style={styles.logButtonText}>
                                    Log {adjustedMacros?.calories || 0} kcal
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </BlurView>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    loadingText: { fontSize: 16 },
    backButtonAlt: { marginTop: 16, padding: 12 },

    // Header
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    closeButtonBlur: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    foodImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    foodImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    foodImagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foodName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    foodBrand: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Section Card
    sectionCard: {
        margin: SPACING.md,
        marginTop: 0,
        padding: SPACING.lg,
        borderRadius: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },

    // Quantity Editor
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityInput: {
        width: 80,
        height: 48,
        borderRadius: 12,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    unitSelector: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(128,128,128,0.1)',
        alignItems: 'center',
    },
    unitButtonActive: {
        backgroundColor: COLORS.vitaminOrange,
    },
    unitButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
    },
    unitButtonTextActive: {
        color: '#FFFFFF',
    },
    servingNote: {
        fontSize: 12,
        marginTop: 12,
    },

    // Meal Selector
    mealGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    mealOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 4,
    },
    mealOptionActive: {
        borderColor: COLORS.vitaminOrange,
        backgroundColor: 'rgba(255, 92, 0, 0.08)',
    },
    mealOptionText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Calories Header
    caloriesHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 4,
    },
    caloriesValue: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -2,
    },
    caloriesUnit: {
        fontSize: 18,
        fontWeight: '600',
    },

    // Macro Rings
    macroRingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    macroRing: {
        alignItems: 'center',
    },
    macroRingContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    macroLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 6,
    },

    // Nutrients
    nutrientDivider: {
        height: 1,
        marginVertical: 8,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    nutrientSubRow: {
        paddingLeft: 16,
    },
    nutrientName: {
        fontSize: 14,
        fontWeight: '600',
    },
    nutrientSubName: {
        fontWeight: '400',
    },
    nutrientValues: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    nutrientAmount: {
        fontSize: 14,
        fontWeight: '500',
        minWidth: 60,
        textAlign: 'right',
    },
    nutrientDV: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 35,
        textAlign: 'right',
    },
    microTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 8,
        marginBottom: 8,
    },

    // Log Button
    logButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    logButtonBlur: {
        paddingHorizontal: SPACING.lg,
        paddingTop: 16,
    },
    logButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    logButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    logButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
