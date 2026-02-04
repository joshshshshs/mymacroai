/**
 * MealTimeline - Smart Feed with Silky Cards
 *
 * State of the Art Features:
 * - Ghost cards with dashed borders and shimmer animation
 * - Silky white cards for logged meals (borderRadius: 20, soft shadow)
 * - Macro dots indicator
 * - Smooth enter animations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';

// Glass & Light Color Palette
const COLORS = {
    vitaminOrange: '#FF5C00',
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
};

interface MealItem {
    id: string;
    name: string;
    calories: number;
    time: string;
    protein?: number;
    carbs?: number;
    fats?: number;
}

interface Meal {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    items: MealItem[];
    totalCalories: number;
}

interface Props {
    meals: Meal[];
    onMealPress: (mealType: string) => void;
    onAddPress: (mealType: string) => void;
}

const MEAL_CONFIG = {
    breakfast: { icon: '🌅', label: 'Breakfast', time: '6am - 10am' },
    lunch: { icon: '☀️', label: 'Lunch', time: '11am - 2pm' },
    dinner: { icon: '🌙', label: 'Dinner', time: '5pm - 9pm' },
    snacks: { icon: '🍿', label: 'Snacks', time: 'Anytime' },
};

// Ghost Card - Empty meal slot with dashed border
const GhostCard: React.FC<{
    mealType: keyof typeof MEAL_CONFIG;
    onPress: () => void;
    index: number;
}> = ({ mealType, onPress, index }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const config = MEAL_CONFIG[mealType];
    const shimmer = useSharedValue(0);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        opacity: 0.4 + shimmer.value * 0.2,
    }));

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.98, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).springify()}
            style={scaleStyle}
        >
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <Animated.View
                    style={[
                        styles.ghostCard,
                        {
                            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
                        },
                        shimmerStyle,
                    ]}
                >
                    <View style={styles.ghostContent}>
                        <View style={[styles.ghostIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                            <Text style={styles.mealIcon}>{config.icon}</Text>
                        </View>
                        <View style={styles.ghostText}>
                            <Text style={[styles.ghostLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
                                {config.label}
                            </Text>
                            <Text style={[styles.ghostHint, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }]}>
                                Tap to log
                            </Text>
                        </View>
                        <View style={[styles.addIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                            <Ionicons
                                name="add"
                                size={20}
                                color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                            />
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Macro Dots - Small colored indicators for P/C/F
const MacroDots: React.FC = () => (
    <View style={styles.macroDots}>
        <View style={[styles.macroDot, { backgroundColor: COLORS.protein }]} />
        <View style={[styles.macroDot, { backgroundColor: COLORS.carbs }]} />
        <View style={[styles.macroDot, { backgroundColor: COLORS.fats }]} />
    </View>
);

// Silky Meal Card - Logged meal with glass effect
const MealCard: React.FC<{
    meal: Meal;
    onPress: () => void;
    index: number;
}> = ({ meal, onPress, index }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const config = MEAL_CONFIG[meal.type];
    const scale = useSharedValue(1);

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.98, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).springify()}
            style={scaleStyle}
        >
            <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
                {/* Silky Card */}
                <View style={[
                    styles.silkyCard,
                    {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                        shadowColor: isDark ? '#000' : COLORS.vitaminOrange,
                    }
                ]}>
                    {/* Subtle gradient overlay for depth */}
                    {!isDark && (
                        <LinearGradient
                            colors={['rgba(255,255,255,0)', 'rgba(255,92,0,0.02)']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    )}

                    {/* Header */}
                    <View style={styles.mealHeader}>
                        <View style={styles.mealHeaderLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,92,0,0.08)' }]}>
                                <Text style={styles.mealIcon}>{config.icon}</Text>
                            </View>
                            <View>
                                <Text style={[styles.mealLabel, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                                    {config.label}
                                </Text>
                                <View style={styles.mealMeta}>
                                    <Text style={[styles.mealItemCount, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                                        {meal.items.length} item{meal.items.length !== 1 ? 's' : ''}
                                    </Text>
                                    <MacroDots />
                                </View>
                            </View>
                        </View>

                        {/* Calories Badge */}
                        <View style={styles.caloriesBadge}>
                            <Text style={styles.caloriesValue}>{meal.totalCalories}</Text>
                            <Text style={[styles.caloriesUnit, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                                kcal
                            </Text>
                        </View>
                    </View>

                    {/* Items Preview */}
                    {meal.items.length > 0 && (
                        <View style={[styles.itemsPreview, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                            {meal.items.slice(0, 2).map((item) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text
                                        style={[styles.itemName, { color: isDark ? 'rgba(255,255,255,0.7)' : '#4B5563' }]}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text style={[styles.itemCalories, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>
                                        {item.calories}
                                    </Text>
                                </View>
                            ))}
                            {meal.items.length > 2 && (
                                <Text style={styles.moreItems}>
                                    +{meal.items.length - 2} more
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Chevron indicator */}
                    <View style={styles.chevronContainer}>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const MealTimeline: React.FC<Props> = ({
    meals,
    onMealPress,
    onAddPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // All meal slots
    const allSlots: (keyof typeof MEAL_CONFIG)[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,255,255,0.4)' : '#8E8E93' }]}>
                TODAY'S MEALS
            </Text>

            {allSlots.map((slotType, index) => {
                const meal = meals.find(m => m.type === slotType);

                if (meal && meal.items.length > 0) {
                    return (
                        <MealCard
                            key={slotType}
                            meal={meal}
                            onPress={() => onMealPress(slotType)}
                            index={index}
                        />
                    );
                }

                return (
                    <GhostCard
                        key={slotType}
                        mealType={slotType}
                        onPress={() => onAddPress(slotType)}
                        index={index}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
    },

    // Ghost Card Styles
    ghostCard: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },
    ghostContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ghostIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    ghostText: {
        flex: 1,
    },
    ghostLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    ghostHint: {
        fontSize: 13,
        marginTop: 2,
    },
    addIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Silky Card Styles
    silkyCard: {
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mealHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mealIcon: {
        fontSize: 24,
    },
    mealLabel: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    mealMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    mealItemCount: {
        fontSize: 13,
        fontWeight: '500',
    },
    macroDots: {
        flexDirection: 'row',
        gap: 4,
    },
    macroDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    caloriesBadge: {
        alignItems: 'flex-end',
    },
    caloriesValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.vitaminOrange,
        letterSpacing: -1,
    },
    caloriesUnit: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -2,
    },
    itemsPreview: {
        paddingTop: SPACING.md,
        marginTop: SPACING.md,
        borderTopWidth: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        marginRight: SPACING.md,
    },
    itemCalories: {
        fontSize: 13,
        fontWeight: '600',
    },
    moreItems: {
        fontSize: 13,
        color: COLORS.vitaminOrange,
        fontWeight: '600',
        marginTop: 4,
    },
    chevronContainer: {
        position: 'absolute',
        right: SPACING.md,
        top: '50%',
        marginTop: -8,
    },
});

export default MealTimeline;
