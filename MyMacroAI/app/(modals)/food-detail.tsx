/**
 * FoodDetailScreen - "The Nutrient Lab"
 * 
 * A digital, interactive Nutrition Label for viewing and logging foods.
 * Features: Quantity slider, macro rings, micro-matrix grid, log button.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    useColorScheme,
    Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import { FoodItem, NutrientData, calculatePortionNutrients } from '@/src/types/food';
import { getFoodById } from '@/src/data/mockFoodDB';
import { useUserStore } from '@/src/store/UserStore';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { FoodIcon } from '@/src/components/food/FoodIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// MACRO RING COMPONENT
// ============================================================================

interface MacroRingProps {
    label: string;
    value: number;
    color: string;
    size?: number;
}

const MacroRing: React.FC<MacroRingProps> = ({ label, value, color, size = 80 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / 100, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={styles.macroRing}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={[styles.macroRingCenter, { width: size, height: size }]}>
                <Text style={[styles.macroRingValue, { color }]}>{value}g</Text>
                <Text style={styles.macroRingLabel}>{label}</Text>
            </View>
        </View>
    );
};

// ============================================================================
// NUTRIENT ROW COMPONENT WITH DV BAR
// ============================================================================

const NUTRIENT_BAR_COLORS = {
    vitamin: '#10B981', // Green
    mineral: '#3B82F6', // Blue
    other: '#8B5CF6',   // Purple
};

interface NutrientRowProps {
    nutrient: NutrientData;
    isDark: boolean;
}

const NutrientRow: React.FC<NutrientRowProps> = ({ nutrient, isDark }) => {
    const isHighValue = (nutrient.dailyValuePercentage ?? 0) >= 20;
    const dvPercent = Math.min(nutrient.dailyValuePercentage ?? 0, 100);
    const barColor = NUTRIENT_BAR_COLORS[nutrient.category || 'other'];

    return (
        <View style={[
            styles.nutrientRow,
            { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
        ]}>
            <View style={styles.nutrientContent}>
                <View style={styles.nutrientInfo}>
                    <Text style={[
                        styles.nutrientName,
                        { color: isDark ? '#FFF' : '#1A1A1A' },
                        isHighValue && styles.nutrientNameHighlight
                    ]}>
                        {nutrient.name}
                    </Text>
                    {isHighValue && (
                        <View style={styles.highBadge}>
                            <Text style={styles.highBadgeText}>High</Text>
                        </View>
                    )}
                </View>
                <View style={styles.nutrientValues}>
                    <Text style={[styles.nutrientAmount, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                        {nutrient.amount}{nutrient.unit}
                    </Text>
                    {nutrient.dailyValuePercentage !== undefined && (
                        <Text style={styles.nutrientDV}>
                            {nutrient.dailyValuePercentage}% DV
                        </Text>
                    )}
                </View>
            </View>
            {/* DV Progress Bar */}
            {nutrient.dailyValuePercentage !== undefined && (
                <View style={[styles.dvBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                    <View
                        style={[
                            styles.dvBarFill,
                            {
                                width: `${dvPercent}%`,
                                backgroundColor: barColor,
                            }
                        ]}
                    />
                </View>
            )}
        </View>
    );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function FoodDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ foodId: string; mealType?: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { logFood, addCoins } = useUserStore();

    const [portionSize, setPortionSize] = useState(100);
    const [unit, setUnit] = useState<'g' | 'oz' | 'serving'>('g');

    // Get base food data
    const baseFood = useMemo(() => {
        if (!params.foodId) return null;
        return getFoodById(params.foodId);
    }, [params.foodId]);

    // Calculate adjusted nutrients based on portion
    const food = useMemo(() => {
        if (!baseFood) return null;
        return calculatePortionNutrients(baseFood, portionSize);
    }, [baseFood, portionSize]);

    const handleClose = () => {
        router.back();
    };

    const handleLog = () => {
        if (!food) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Log to store
        logFood(
            food.macros.calories,
            food.macros.protein,
            food.macros.carbs,
            food.macros.fat,
            food.name
        );

        // Navigate back
        router.back();
    };

    const handlePortionChange = (value: number) => {
        const rounded = Math.round(value / 10) * 10;
        if (rounded !== portionSize) {
            Haptics.selectionAsync();
            setPortionSize(rounded);
        }
    };

    // Group micronutrients by category
    const groupedNutrients = useMemo(() => {
        if (!food) return { vitamins: [], minerals: [], other: [] };

        return {
            vitamins: food.micronutrients.filter(n => n.category === 'vitamin'),
            minerals: food.micronutrients.filter(n => n.category === 'mineral'),
            other: food.micronutrients.filter(n => n.category === 'other'),
        };
    }, [food]);

    if (!food) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0C' : '#F5F5F7' }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.errorContainer} edges={['top']}>
                    <Ionicons name="alert-circle" size={48} color="#8E8E93" />
                    <Text style={styles.errorText}>Food not found</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0C' : '#F5F5F7' }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    {food.imageUrl ? (
                        <Image source={{ uri: food.imageUrl }} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroPlaceholder, { backgroundColor: isDark ? '#1A1A1E' : '#E5E5EA' }]}>
                            <FoodIcon foodName={food.name} size="large" />
                        </View>
                    )}
                    <LinearGradient
                        colors={['transparent', isDark ? '#0A0A0C' : '#F5F5F7']}
                        style={styles.heroGradient}
                    />

                    {/* Close Button */}
                    <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <BlurView intensity={40} tint="dark" style={styles.closeButtonBlur}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </BlurView>
                        </TouchableOpacity>

                        {food.isVerified && (
                            <View style={styles.verifiedTag}>
                                <BlurView intensity={40} tint="dark" style={styles.verifiedTagBlur}>
                                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                                    <Text style={styles.verifiedTagText}>Verified</Text>
                                </BlurView>
                            </View>
                        )}
                    </SafeAreaView>
                </View>

                {/* Food Title */}
                <View style={styles.titleSection}>
                    <Text style={[styles.foodName, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                        {food.name}
                    </Text>
                    {food.brand && (
                        <Text style={styles.brandName}>{food.brand}</Text>
                    )}
                </View>

                {/* Portion Control */}
                <BlurView
                    intensity={isDark ? 30 : 60}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.portionCard}
                >
                    <View style={styles.portionHeader}>
                        <Text style={[styles.portionTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                            Portion Size
                        </Text>
                        <View style={styles.unitToggle}>
                            {(['g', 'oz', 'serving'] as const).map((u) => (
                                <TouchableOpacity
                                    key={u}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setUnit(u);
                                    }}
                                    style={[
                                        styles.unitButton,
                                        unit === u && styles.unitButtonActive,
                                    ]}
                                >
                                    <Text style={[
                                        styles.unitButtonText,
                                        { color: unit === u ? '#FFF' : '#8E8E93' }
                                    ]}>
                                        {u === 'serving' ? 'Srv' : u}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Text style={styles.portionValue}>{portionSize}g</Text>

                    <Slider
                        style={styles.slider}
                        minimumValue={10}
                        maximumValue={500}
                        value={portionSize}
                        onValueChange={handlePortionChange}
                        minimumTrackTintColor="#FF5C00"
                        maximumTrackTintColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                        thumbTintColor="#FF5C00"
                    />

                    <View style={styles.portionScale}>
                        <Text style={styles.portionScaleText}>10g</Text>
                        <Text style={styles.portionScaleText}>500g</Text>
                    </View>
                </BlurView>

                {/* Calories */}
                <View style={styles.calorieSection}>
                    <Text style={styles.calorieValue}>{food.macros.calories}</Text>
                    <Text style={styles.calorieLabel}>calories</Text>
                </View>

                {/* Macro Triad - Correct Colors */}
                <View style={styles.macroTriad}>
                    <MacroRing label="Protein" value={food.macros.protein} color="#3B82F6" />
                    <MacroRing label="Carbs" value={food.macros.carbs} color="#22C55E" />
                    <MacroRing label="Fats" value={food.macros.fat} color="#F59E0B" />
                </View>

                {/* Micro-Matrix */}
                <View style={styles.microSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                        Micronutrients
                    </Text>

                    {/* Vitamins */}
                    {groupedNutrients.vitamins.length > 0 && (
                        <View style={styles.nutrientGroup}>
                            <Text style={styles.nutrientGroupTitle}>Vitamins</Text>
                            {groupedNutrients.vitamins.map((nutrient) => (
                                <NutrientRow key={nutrient.id} nutrient={nutrient} isDark={isDark} />
                            ))}
                        </View>
                    )}

                    {/* Minerals */}
                    {groupedNutrients.minerals.length > 0 && (
                        <View style={styles.nutrientGroup}>
                            <Text style={styles.nutrientGroupTitle}>Minerals</Text>
                            {groupedNutrients.minerals.map((nutrient) => (
                                <NutrientRow key={nutrient.id} nutrient={nutrient} isDark={isDark} />
                            ))}
                        </View>
                    )}

                    {/* Other */}
                    {groupedNutrients.other.length > 0 && (
                        <View style={styles.nutrientGroup}>
                            <Text style={styles.nutrientGroupTitle}>Other</Text>
                            {groupedNutrients.other.map((nutrient) => (
                                <NutrientRow key={nutrient.id} nutrient={nutrient} isDark={isDark} />
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Log Button */}
            <SafeAreaView style={styles.logButtonContainer} edges={['bottom']}>
                <TouchableOpacity onPress={handleLog} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#FF5C00', '#FF8C00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.logButton}
                    >
                        <Text style={styles.logButtonText}>
                            Log to {params.mealType || 'Diary'} • {food.macros.calories} kcal
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Error
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    errorText: {
        fontSize: 18,
        color: '#8E8E93',
        marginTop: SPACING.md,
    },
    errorButton: {
        marginTop: SPACING.xl,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        backgroundColor: '#FF5C00',
        borderRadius: RADIUS.lg,
    },
    errorButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },

    // Hero
    heroContainer: {
        height: 280,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.lg,
    },
    closeButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    closeButtonBlur: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedTag: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    verifiedTagBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 4,
    },
    verifiedTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3B82F6',
    },

    // Title
    titleSection: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    foodName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    brandName: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 4,
    },

    // Portion
    portionCard: {
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        overflow: 'hidden',
    },
    portionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    portionTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: RADIUS.md,
        padding: 2,
    },
    unitButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: RADIUS.sm,
    },
    unitButtonActive: {
        backgroundColor: '#FF5C00',
    },
    unitButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    portionValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FF5C00',
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    portionScale: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -SPACING.sm,
    },
    portionScaleText: {
        fontSize: 12,
        color: '#8E8E93',
    },

    // Calories
    calorieSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    calorieValue: {
        fontSize: 56,
        fontWeight: '800',
        color: '#FF5C00',
        letterSpacing: -2,
    },
    calorieLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // Macros
    macroTriad: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    macroRing: {
        alignItems: 'center',
    },
    macroRingCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroRingValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    macroRingLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 2,
    },

    // Micronutrients
    microSection: {
        paddingHorizontal: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: SPACING.lg,
    },
    nutrientGroup: {
        marginBottom: SPACING.lg,
    },
    nutrientGroupTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
    },
    nutrientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nutrientName: {
        fontSize: 14,
        fontWeight: '500',
    },
    nutrientNameHighlight: {
        fontWeight: '700',
    },
    highBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    highBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#10B981',
    },
    nutrientValues: {
        alignItems: 'flex-end',
    },
    nutrientAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    nutrientDV: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 1,
    },
    nutrientContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    dvBarTrack: {
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    dvBarFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Log Button
    logButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
        backgroundColor: 'transparent',
    },
    logButton: {
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
    },
    logButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});
