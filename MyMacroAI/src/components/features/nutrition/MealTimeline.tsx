/**
 * MealTimeline - Premium Meal Cards
 *
 * Redesigned Features:
 * - Solid cards with gradient backgrounds (no transparency when empty)
 * - Better Ionicons instead of emojis
 * - Time-based headers with visual indicators
 * - Improved layout and spacing
 * - Smooth animations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';

// Color Palette
const COLORS = {
    vitaminOrange: '#FF5C00',
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
};

// Meal configuration with proper icons and themed colors
const MEAL_CONFIG = {
    breakfast: {
        icon: 'sunny' as const,
        label: 'Breakfast',
        time: '6am - 10am',
        gradient: ['#FEF3C7', '#FDE68A'] as const,
        gradientDark: ['#451A03', '#78350F'] as const,
        iconColor: '#F59E0B',
        iconBg: 'rgba(245, 158, 11, 0.15)',
    },
    lunch: {
        icon: 'restaurant' as const,
        label: 'Lunch',
        time: '11am - 2pm',
        gradient: ['#DBEAFE', '#BFDBFE'] as const,
        gradientDark: ['#1E3A5F', '#1E40AF'] as const,
        iconColor: '#3B82F6',
        iconBg: 'rgba(59, 130, 246, 0.15)',
    },
    dinner: {
        icon: 'moon' as const,
        label: 'Dinner',
        time: '5pm - 9pm',
        gradient: ['#EDE9FE', '#DDD6FE'] as const,
        gradientDark: ['#2E1065', '#4C1D95'] as const,
        iconColor: '#8B5CF6',
        iconBg: 'rgba(139, 92, 246, 0.15)',
    },
    snacks: {
        icon: 'nutrition' as const,
        label: 'Snacks',
        time: 'Anytime',
        gradient: ['#FCE7F3', '#FBCFE8'] as const,
        gradientDark: ['#500724', '#831843'] as const,
        iconColor: '#EC4899',
        iconBg: 'rgba(236, 72, 153, 0.15)',
    },
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
    totalProtein?: number;
    totalCarbs?: number;
    totalFats?: number;
}

interface Props {
    meals: Meal[];
    onMealPress: (mealType: string) => void;
    onAddPress: (mealType: string) => void;
}

// Empty Meal Card - Solid design with invitation to log
const EmptyMealCard: React.FC<{
    mealType: keyof typeof MEAL_CONFIG;
    onPress: () => void;
    index: number;
}> = ({ mealType, onPress, index }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const config = MEAL_CONFIG[mealType];
    const scale = useSharedValue(1);

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.97, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
            <Animated.View style={scaleStyle}>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                    <View style={styles.cardContainer}>
                        <LinearGradient
                            colors={isDark ? config.gradientDark : config.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.emptyCard}
                        >
                            <View style={styles.emptyContent}>
                                {/* Icon */}
                                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)' }]}>
                                    <Ionicons name={config.icon} size={24} color={config.iconColor} />
                                </View>

                                {/* Text */}
                                <View style={styles.emptyTextContainer}>
                                    <Text style={[styles.mealLabel, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                                        {config.label}
                                    </Text>
                                    <Text style={[styles.timeRange, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
                                        {config.time}
                                    </Text>
                                </View>

                                {/* Add Button */}
                                <TouchableOpacity
                                    style={[styles.addButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)' }]}
                                    onPress={handlePress}
                                >
                                    <Ionicons name="add" size={22} color={config.iconColor} />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};

// Macro Pills - Visual macro breakdown
const MacroPills: React.FC<{ protein?: number; carbs?: number; fats?: number }> = ({ protein = 0, carbs = 0, fats = 0 }) => (
    <View style={styles.macroPills}>
        <View style={[styles.pill, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
            <Text style={[styles.pillText, { color: COLORS.protein }]}>P {protein}g</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
            <Text style={[styles.pillText, { color: COLORS.carbs }]}>C {carbs}g</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
            <Text style={[styles.pillText, { color: COLORS.fats }]}>F {fats}g</Text>
        </View>
    </View>
);

// Logged Meal Card - Shows items under correct meal
const LoggedMealCard: React.FC<{
    meal: Meal;
    onPress: () => void;
    onAddPress: () => void;
    index: number;
}> = ({ meal, onPress, onAddPress, index }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const config = MEAL_CONFIG[meal.type];
    const scale = useSharedValue(1);

    // Use meal-level totals or calculate from items
    const totalProtein = meal.totalProtein ?? meal.items.reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalCarbs = meal.totalCarbs ?? meal.items.reduce((sum, item) => sum + (item.carbs || 0), 0);
    const totalFats = meal.totalFats ?? meal.items.reduce((sum, item) => sum + (item.fats || 0), 0);

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
        <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
            <Animated.View style={scaleStyle}>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
                    <View style={[
                        styles.loggedCard,
                        {
                            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                            shadowColor: isDark ? '#000' : config.iconColor,
                        }
                    ]}>
                        {/* Accent bar */}
                        <View style={[styles.accentBar, { backgroundColor: config.iconColor }]} />

                        {/* Header */}
                        <View style={styles.loggedHeader}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.iconCircleSmall, { backgroundColor: config.iconBg }]}>
                                    <Ionicons name={config.icon} size={18} color={config.iconColor} />
                                </View>
                                <View>
                                    <Text style={[styles.mealLabel, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                                        {config.label}
                                    </Text>
                                    <Text style={[styles.itemCount, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                                        {meal.items.length} item{meal.items.length !== 1 ? 's' : ''} • {config.time}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.headerRight}>
                                <Text style={[styles.caloriesLarge, { color: config.iconColor }]}>{meal.totalCalories}</Text>
                                <Text style={[styles.caloriesUnit, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>kcal</Text>
                            </View>
                        </View>

                        {/* Macro Pills */}
                        <MacroPills protein={totalProtein} carbs={totalCarbs} fats={totalFats} />

                        {/* Items List */}
                        <View style={[styles.itemsList, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                            {meal.items.slice(0, 3).map((item, idx) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={styles.itemDot} />
                                    <Text
                                        style={[styles.itemName, { color: isDark ? 'rgba(255,255,255,0.8)' : '#374151' }]}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text style={[styles.itemCals, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>
                                        {item.calories} kcal
                                    </Text>
                                </View>
                            ))}
                            {meal.items.length > 3 && (
                                <Text style={[styles.moreText, { color: config.iconColor }]}>
                                    +{meal.items.length - 3} more items
                                </Text>
                            )}
                        </View>

                        {/* Add More Button */}
                        <TouchableOpacity
                            style={[styles.addMoreButton, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onAddPress();
                            }}
                        >
                            <Ionicons name="add-circle" size={18} color={config.iconColor} />
                            <Text style={[styles.addMoreText, { color: config.iconColor }]}>Add more</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
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

    // All meal slots in order
    const allSlots: (keyof typeof MEAL_CONFIG)[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="calendar-outline" size={16} color={isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93'} />
                    <Text style={[styles.sectionLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                        TODAY'S MEALS
                    </Text>
                </View>
            </View>

            {allSlots.map((slotType, index) => {
                const meal = meals.find(m => m.type === slotType);

                if (meal && meal.items.length > 0) {
                    return (
                        <LoggedMealCard
                            key={slotType}
                            meal={meal}
                            onPress={() => onMealPress(slotType)}
                            onAddPress={() => onAddPress(slotType)}
                            index={index}
                        />
                    );
                }

                return (
                    <EmptyMealCard
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
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    sectionHeader: {
        marginBottom: SPACING.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
    },

    // Card container with shadow
    cardContainer: {
        borderRadius: 20,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    // Empty Card
    emptyCard: {
        borderRadius: 20,
        padding: SPACING.lg,
        overflow: 'hidden',
    },
    emptyContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    emptyTextContainer: {
        flex: 1,
    },
    mealLabel: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    timeRange: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },

    // Logged Card
    loggedCard: {
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        overflow: 'hidden',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    loggedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconCircleSmall: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemCount: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    caloriesLarge: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -1,
    },
    caloriesUnit: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -3,
    },

    // Macro Pills
    macroPills: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.md,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '700',
    },

    // Items List
    itemsList: {
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.vitaminOrange,
        marginRight: 10,
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    itemCals: {
        fontSize: 13,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 16,
    },

    // Add More Button
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        marginTop: SPACING.sm,
        borderTopWidth: 1,
        borderRadius: 12,
    },
    addMoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default MealTimeline;
