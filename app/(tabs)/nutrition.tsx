/**
 * Nutrition Screen - "Glass & Light" State of the Art Dashboard
 *
 * Theme: Biological Interface
 * - Mesh Gradient Background (Warm White → Soft Grey)
 * - PlasmaRing Hero with breathing glow
 * - Quick Action Buttons under the ring
 * - Silky meal cards
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useUserStore, useAdjustedDailyTarget } from '@/src/store/UserStore';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

// Import Feature Components
import {
    PlasmaRing,
    MealTimeline,
} from '@/src/components/features/nutrition';
import { RisingEmbers } from '@/src/components/animations';
import { GradientMeshBackground } from '@/src/components/ui/GradientMeshBackground';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Glass & Light Color Palette
const COLORS = {
    vitaminOrange: '#FF5C00',
    neonOrange: '#FF9E00',
    warmWhite: '#FFF5F0',
    softGrey: '#F2F2F7',
    voiceGreen: '#10B981',
    barcodeBlue: '#3B82F6',
    searchGray: '#64748B',
};

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

interface QuickActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
    isPrimary?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    icon,
    label,
    color,
    onPress,
    isPrimary = false,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scale = useSharedValue(1);

    const handlePress = () => {
        Haptics.impactAsync(isPrimary ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.92, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.actionButtonWrapper, animatedStyle]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.actionButtonTouchable}>
                {isPrimary ? (
                    <LinearGradient
                        colors={[COLORS.vitaminOrange, COLORS.neonOrange]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                    >
                        <Ionicons name={icon} size={26} color="#FFFFFF" />
                    </LinearGradient>
                ) : (
                    <View style={[
                        styles.actionButton,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }
                    ]}>
                        <Ionicons name={icon} size={22} color={color} />
                    </View>
                )}
                <Text style={[
                    styles.actionButtonLabel,
                    { color: isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93' }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// COMMUNITY KITCHEN BUTTON - Entry Point to Recipe Feed
// ============================================================================

const CommunityKitchenButton: React.FC<{ onPress: () => void; isDark: boolean }> = ({ onPress, isDark }) => {
    const scale = useSharedValue(1);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(0.96, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.communityKitchenWrapper, containerStyle]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <LinearGradient
                    colors={isDark
                        ? ['rgba(255,92,0,0.15)', 'rgba(255,158,0,0.1)']
                        : ['rgba(255,92,0,0.08)', 'rgba(255,158,0,0.05)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.communityKitchenCard}
                >
                    <View style={styles.communityKitchenContent}>
                        <View style={styles.communityKitchenLeft}>
                            <View style={[
                                styles.communityKitchenIconBg,
                                { backgroundColor: isDark ? 'rgba(255,92,0,0.2)' : 'rgba(255,92,0,0.15)' }
                            ]}>
                                <Ionicons name="restaurant" size={24} color={COLORS.vitaminOrange} />
                            </View>
                            <View style={styles.communityKitchenTextContainer}>
                                <Text style={[styles.communityKitchenTitle, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                                    Community Kitchen
                                </Text>
                                <Text style={[styles.communityKitchenSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' }]}>
                                    Discover & share recipes
                                </Text>
                            </View>
                        </View>
                        <View style={styles.communityKitchenRight}>
                            <View style={[
                                styles.communityKitchenBadge,
                                { backgroundColor: isDark ? 'rgba(255,92,0,0.2)' : 'rgba(255,92,0,0.1)' }
                            ]}>
                                <Text style={styles.communityKitchenBadgeText}>NEW</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
                            />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// EARN BAR - Database Contribution Entry Point
// ============================================================================

const EarnBar: React.FC<{ onPress: () => void; isDark: boolean }> = ({ onPress, isDark }) => {
    const shimmer = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -200 + shimmer.value * 400 }],
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(0.97, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.earnBarWrapper, containerStyle]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <BlurView
                    intensity={isDark ? 40 : 60}
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.earnBar}
                >
                    <View style={styles.earnBarContent}>
                        <Text style={styles.earnBarEmoji}>✨</Text>
                        <Text style={[styles.earnBarText, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                            Scan New Food & Earn <Text style={styles.earnBarCoins}>50 Coins</Text>
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
                    </View>
                    {/* Shimmer overlay */}
                    <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
                        <LinearGradient
                            colors={['transparent', 'rgba(255,215,0,0.15)', 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// CALORIE BADGE - TOP LEFT COUNTER WITH URGENCY ANIMATION
// ============================================================================

interface CalorieBadgeProps {
    consumed: number;
    target: number;
    isDark: boolean;
}

const CalorieBadge: React.FC<CalorieBadgeProps> = ({ consumed, target, isDark }) => {
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    // Calculate urgency level (0 = safe, 1 = approaching, 2 = at limit, 3 = over)
    const ratio = consumed / target;
    const urgencyLevel = ratio >= 1 ? 3 : ratio >= 0.9 ? 2 : ratio >= 0.75 ? 1 : 0;

    // Determine colors based on urgency
    const badgeColor = urgencyLevel >= 3 ? '#FF4757' :
        urgencyLevel >= 2 ? '#FF6B35' :
            COLORS.vitaminOrange;

    // Urgency animation - pulse faster as approaching limit
    useEffect(() => {
        if (urgencyLevel >= 2) {
            // Urgent pulse animation
            const pulseDuration = urgencyLevel >= 3 ? 500 : 800;
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.08, { duration: pulseDuration / 2, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: pulseDuration / 2, easing: Easing.in(Easing.ease) })
                ),
                -1,
                false
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: pulseDuration / 2, easing: Easing.out(Easing.ease) }),
                    withTiming(0.3, { duration: pulseDuration / 2, easing: Easing.in(Easing.ease) })
                ),
                -1,
                false
            );
        } else if (urgencyLevel === 1) {
            // Gentle pulse
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            glowOpacity.value = withTiming(0.2);
        } else {
            pulseScale.value = withTiming(1);
            glowOpacity.value = withTiming(0);
        }
    }, [urgencyLevel]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <Animated.View style={[styles.calorieBadgeContainer, animatedContainerStyle]}>
            {/* Glow ring for urgency */}
            <Animated.View
                style={[
                    styles.calorieBadgeGlow,
                    animatedGlowStyle,
                    {
                        backgroundColor: badgeColor,
                        shadowColor: badgeColor,
                    }
                ]}
            />
            <BlurView
                intensity={isDark ? 40 : 60}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    styles.calorieBadge,
                    {
                        borderColor: urgencyLevel >= 2 ? badgeColor : 'transparent',
                        borderWidth: urgencyLevel >= 2 ? 2 : 0,
                    }
                ]}
            >
                <Text style={[styles.calorieBadgeValue, { color: badgeColor }]}>
                    {consumed.toLocaleString()}
                </Text>
                <Text style={[styles.calorieBadgeLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                    kcal eaten
                </Text>
                {urgencyLevel >= 3 && (
                    <View style={styles.overBadge}>
                        <Text style={styles.overBadgeText}>OVER</Text>
                    </View>
                )}
            </BlurView>
        </Animated.View>
    );
};

// ============================================================================
// WATER BADGE - RIGHT SIDE WATER INTAKE TRACKER
// ============================================================================

const WATER_BLUE = '#00B4D8';

interface WaterBadgeProps {
    waterLiters: number;
    targetLiters: number;
    isDark: boolean;
}

const WaterBadge: React.FC<WaterBadgeProps> = ({ waterLiters, targetLiters, isDark }) => {
    return (
        <View style={styles.waterBadgeContainer}>
            <BlurView
                intensity={isDark ? 40 : 60}
                tint={isDark ? 'dark' : 'light'}
                style={styles.waterBadge}
            >
                <Text style={[styles.waterBadgeValue, { color: WATER_BLUE }]}>
                    {waterLiters.toFixed(1)}L
                </Text>
                <Text style={[styles.waterBadgeLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                    Water
                </Text>
            </BlurView>
        </View>
    );
};

// ============================================================================
// TEMPORAL NAVIGATION HEADER
// ============================================================================

const TemporalHeader: React.FC<{
    date: Date;
    onPrev: () => void;
    onNext: () => void;
    isDark: boolean;
}> = ({ date, onPrev, onNext, isDark }) => {
    const [showHeatmap, setShowHeatmap] = useState(false);

    const toggleHeatmap = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowHeatmap(!showHeatmap);
    };

    const formatDate = (d: Date) => {
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return isToday ? `Today, ${dateStr}` : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <View style={styles.headerContainer}>
            {/* Top Navigation Bar */}
            <View style={styles.headerBar}>
                {/* Left Arrow */}
                <TouchableOpacity
                    onPress={onPrev}
                    style={[styles.navButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}
                >
                    <Ionicons name="chevron-back" size={20} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>

                {/* Center Date */}
                <View style={styles.dateContainer}>
                    <Text style={[styles.dateText, { color: isDark ? '#FFF' : '#1A1A1A' }]}>
                        {formatDate(date)}
                    </Text>
                </View>

                {/* Right Arrow */}
                <TouchableOpacity
                    onPress={onNext}
                    style={[styles.navButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}
                >
                    <Ionicons name="chevron-forward" size={20} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>

                {/* Calendar Button */}
                <TouchableOpacity
                    onPress={toggleHeatmap}
                    style={[
                        styles.calendarButton,
                        {
                            backgroundColor: showHeatmap
                                ? `${COLORS.vitaminOrange}20`
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)')
                        }
                    ]}
                >
                    <Ionicons
                        name="calendar"
                        size={18}
                        color={showHeatmap ? COLORS.vitaminOrange : (isDark ? '#FFF' : '#1A1A1A')}
                    />
                </TouchableOpacity>
            </View>

            {/* Month Heatmap Dropdown */}
            {showHeatmap && (
                <BlurView intensity={80} tint="light" style={styles.heatmapDropdown}>
                    {/* Month/Year Header */}
                    <Text style={styles.heatmapMonth}>
                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>

                    {/* Weekday Labels */}
                    <View style={styles.weekdayLabels}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <Text key={i} style={styles.weekdayLabel}>{day}</Text>
                        ))}
                    </View>

                    {/* Calendar Grid with Day Numbers */}
                    <View style={styles.heatmapGrid}>
                        {(() => {
                            const year = date.getFullYear();
                            const month = date.getMonth();
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const today = new Date();
                            const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                            const currentDay = today.getDate();
                            const selectedDay = date.getDate();

                            const cells = [];
                            // Empty cells for days before first day
                            for (let i = 0; i < firstDay; i++) {
                                cells.push(<View key={`empty-${i}`} style={styles.heatmapDayEmpty} />);
                            }
                            // Day cells
                            for (let day = 1; day <= daysInMonth; day++) {
                                const isSelected = day === selectedDay;
                                const isToday = isCurrentMonth && day === currentDay;
                                const isSuccess = day % 4 === 0 && day <= (isCurrentMonth ? currentDay : daysInMonth);

                                cells.push(
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.heatmapDay,
                                            isSelected && styles.heatmapDotSelected,
                                            isSuccess && !isSelected && styles.heatmapDotSuccess,
                                            isToday && !isSelected && styles.heatmapDayToday,
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            const newDate = new Date(year, month, day);
                                            // Note: This would need to be lifted up to parent to actually change the date
                                        }}
                                    >
                                        <Text style={[
                                            styles.heatmapDayText,
                                            { color: isDark ? '#FFFFFF' : '#1A1A1A' },
                                            isSelected && styles.heatmapDayTextSelected,
                                            isToday && !isSelected && styles.heatmapDayTextToday,
                                        ]}>
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }
                            return cells;
                        })()}
                    </View>
                    <Text style={[styles.heatmapHint, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>Select a day to time travel</Text>
                </BlurView>
            )}
        </View>
    );
};

// ============================================================================
// MAIN NUTRITION SCREEN
// ============================================================================

export default function NutritionScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { dailyTarget, dailyIntakes, dailyLogs } = useUserStore();
    const adjustedTarget = useAdjustedDailyTarget();

    const [selectedDate, setSelectedDate] = useState(new Date());

    // Get date string for lookups (YYYY-MM-DD format)
    const dateString = selectedDate.toISOString().split('T')[0];

    // Get intake and logs for selected date
    const dateIntake = dailyIntakes[dateString] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const dateLogs = dailyLogs[dateString] || [];

    // Nutrition data for selected date
    const target = adjustedTarget.calories || dailyTarget.calories || 2500;
    const consumed = dateIntake.calories || 0;
    const burned = 450;
    const isFasted = false;

    const protein = { current: dateIntake.protein || 0, target: dailyTarget.protein || 180 };
    const carbs = { current: dateIntake.carbs || 0, target: dailyTarget.carbs || 250 };
    const fats = { current: dateIntake.fats || 0, target: dailyTarget.fats || 80 };

    // Meal type definition
    type MealTypeKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

    // Process meals from daily log for selected date
    // Uses the stored mealType field, falling back to timestamp-based guessing for legacy logs
    const meals = useMemo(() => {
        const map: Record<MealTypeKey, { type: MealTypeKey; items: any[]; totalCalories: number; totalProtein: number; totalCarbs: number; totalFats: number }> = {
            breakfast: { type: 'breakfast', items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
            lunch: { type: 'lunch', items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
            dinner: { type: 'dinner', items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
            snacks: { type: 'snacks', items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 },
        };

        dateLogs
            .filter(l => l.type === 'food' || l.type === 'nutrition')
            .forEach((l, index) => {
                // Use stored mealType if available, otherwise fall back to timestamp guessing
                let mealType: MealTypeKey = 'snacks';
                if (l.mealType && ['breakfast', 'lunch', 'dinner', 'snacks'].includes(l.mealType)) {
                    mealType = l.mealType as MealTypeKey;
                } else {
                    // Legacy fallback: guess from timestamp
                    const hour = new Date(l.timestamp || Date.now()).getHours();
                    if (hour >= 6 && hour < 11) mealType = 'breakfast';
                    else if (hour >= 11 && hour < 15) mealType = 'lunch';
                    else if (hour >= 17 && hour < 22) mealType = 'dinner';
                }

                map[mealType].items.push({
                    id: l.id || `${l.timestamp}-${index}`,
                    name: l.foodName || l.notes || 'Food item',
                    calories: l.calories || 0,
                    protein: l.protein || 0,
                    carbs: l.carbs || 0,
                    fats: l.fats || 0,
                    time: new Date(l.timestamp || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                });
                map[mealType].totalCalories += l.calories || 0;
                map[mealType].totalProtein += l.protein || 0;
                map[mealType].totalCarbs += l.carbs || 0;
                map[mealType].totalFats += l.fats || 0;
            });

        return Object.values(map);
    }, [dateLogs]);

    // Navigation handlers
    const handleDatePrev = () => {
        Haptics.selectionAsync();
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d);
    };

    const handleDateNext = () => {
        Haptics.selectionAsync();
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d);
    };

    // Navigation links
    const handleNavigate = (route: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(route as any);
    };

    // Goal celebration state
    const [showCelebration, setShowCelebration] = useState(false);
    const proteinGoalHit = protein.current >= protein.target * 0.95; // 95% of protein goal
    const calorieGoalHit = consumed >= target * 0.95 && consumed <= target * 1.05;

    // Trigger celebration when goals are hit
    useEffect(() => {
        if ((proteinGoalHit || calorieGoalHit) && !showCelebration) {
            setShowCelebration(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [proteinGoalHit, calorieGoalHit]);

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Goal Celebration - Rising Embers */}
            <RisingEmbers
                isActive={showCelebration}
                intensity="medium"
                onComplete={() => setShowCelebration(false)}
            />

            {/* Mesh Gradient Background - Glass & Light */}
            <GradientMeshBackground variant="nutrition" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Temporal Navigation Header */}
                <TemporalHeader
                    date={selectedDate}
                    onPrev={handleDatePrev}
                    onNext={handleDateNext}
                    isDark={isDark}
                />

                {/* Main Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Stat Badges Row - Calories left, Water right */}
                    <View style={styles.statBadgesRow}>
                        <CalorieBadge
                            consumed={consumed}
                            target={target}
                            isDark={isDark}
                        />
                        <WaterBadge
                            waterLiters={1.2}
                            targetLiters={2.5}
                            isDark={isDark}
                        />
                    </View>
                    {/* Hero: Plasma Ring Engine */}
                    <PlasmaRing
                        consumed={consumed}
                        target={target}
                        burned={burned}
                        isFasted={isFasted}
                        protein={protein}
                        carbs={carbs}
                        fats={fats}
                    />

                    {/* Quick Action Buttons */}
                    <View style={styles.quickActionsContainer}>
                        <QuickActionButton
                            icon="search"
                            label="Search Foods"
                            color={COLORS.searchGray}
                            onPress={() => handleNavigate('/(modals)/log-meal')}
                        />
                        <QuickActionButton
                            icon="barcode-outline"
                            label="Scan Barcode"
                            color={COLORS.barcodeBlue}
                            onPress={() => handleNavigate('/(modals)/barcode-scanner')}
                        />
                        <QuickActionButton
                            icon="camera"
                            label="Photo Estimate"
                            color={COLORS.vitaminOrange}
                            onPress={() => handleNavigate('/(modals)/food-camera')}
                        />
                        <QuickActionButton
                            icon="mic"
                            label="Voice Log"
                            color={COLORS.voiceGreen}
                            onPress={() => handleNavigate('/(modals)/voice-log')}
                        />
                    </View>

                    {/* Community Kitchen Entry Point */}
                    <CommunityKitchenButton
                        onPress={() => handleNavigate('/(tabs)/community')}
                        isDark={isDark}
                    />

                    {/* Smart Feed: Meal Timeline */}
                    <MealTimeline
                        meals={meals}
                        onMealPress={(mealType) => router.push(`/(modals)/log-meal?mealType=${mealType}` as any)}
                        onAddPress={(mealType) => router.push(`/(modals)/log-meal?mealType=${mealType}` as any)}
                    />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: SPACING.sm,
    },

    // Background
    backgroundBlob: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
    },

    // Header
    headerContainer: {
        zIndex: 10,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateContainer: {
        flex: 1,
        alignItems: 'center',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    calendarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.sm,
    },

    // Heatmap Dropdown
    heatmapDropdown: {
        marginHorizontal: SPACING.xl,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.lg,
        overflow: 'hidden',
        alignItems: 'center',
    },
    heatmapMonth: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: SPACING.sm,
    },
    weekdayLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 4,
        marginBottom: SPACING.sm,
    },
    weekdayLabel: {
        width: 36,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '600',
        color: '#8E8E93',
    },
    heatmapGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 4,
        marginBottom: SPACING.md,
        width: '100%',
    },
    heatmapDayEmpty: {
        width: 36,
        height: 36,
    },
    heatmapDay: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.04)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heatmapDayToday: {
        borderWidth: 2,
        borderColor: COLORS.vitaminOrange,
        backgroundColor: 'transparent',
    },
    heatmapDayText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4A4A4A',
    },
    heatmapDayTextSelected: {
        color: '#FFFFFF',
    },
    heatmapDayTextToday: {
        color: COLORS.vitaminOrange,
    },
    heatmapDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    heatmapDotSelected: {
        backgroundColor: COLORS.vitaminOrange,
    },
    heatmapDotSuccess: {
        backgroundColor: '#00D2FF',
    },
    heatmapHint: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
    },

    // Stat Badges Row (Calories left, Water right)
    statBadgesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        marginVertical: SPACING.sm,
    },

    // Calorie Badge - Left Side
    calorieBadgeContainer: {},
    calorieBadgeGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: RADIUS.xl + 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },
    calorieBadge: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        alignItems: 'center',
    },
    calorieBadgeValue: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -1,
    },
    calorieBadgeLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -2,
    },
    overBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FF4757',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    overBadgeText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    // Water Badge - Right Side
    waterBadgeContainer: {},
    waterBadge: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        alignItems: 'center',
    },
    waterBadgeValue: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -1,
    },
    waterBadgeLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -2,
    },

    // Calorie Summary Bar (unused, kept for backwards compatibility)
    calorieSummary: {
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    calorieSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    calorieItem: {
        alignItems: 'center',
        flex: 1,
    },
    calorieValue: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    calorieLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    calorieDivider: {
        height: 36,
        justifyContent: 'center',
    },
    dividerLine: {
        width: 1,
        height: 28,
    },
    calorieProgressTrack: {
        height: 6,
        borderRadius: 3,
        marginTop: SPACING.md,
        overflow: 'hidden',
    },
    calorieProgressFill: {
        height: '100%',
        borderRadius: 3,
    },

    // Quick Action Buttons
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.xl,
    },
    actionButtonWrapper: {
        alignItems: 'center',
    },
    actionButtonTouchable: {
        alignItems: 'center',
    },
    actionButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    actionButtonPrimary: {
        width: 64,
        height: 64,
        borderRadius: 20,
        shadowColor: COLORS.vitaminOrange,
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    actionButtonLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },

    // Earn Bar
    earnBarWrapper: {
        marginHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    earnBar: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 215, 0, 0.4)',
    },
    earnBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    earnBarEmoji: {
        fontSize: 16,
    },
    earnBarText: {
        fontSize: 14,
        fontWeight: '600',
    },
    earnBarCoins: {
        color: '#F59E0B',
        fontWeight: '700',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
        width: 200,
    },

    // Community Kitchen Button
    communityKitchenWrapper: {
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    communityKitchenCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,92,0,0.2)',
        overflow: 'hidden',
    },
    communityKitchenContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    communityKitchenLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    communityKitchenIconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    communityKitchenTextContainer: {
        gap: 2,
    },
    communityKitchenTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    communityKitchenSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    communityKitchenRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    communityKitchenBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    communityKitchenBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FF5C00',
        letterSpacing: 0.5,
    },
});
