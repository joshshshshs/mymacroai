/**
 * ConsistencyGrid - "The Consistency Chain" Calendar Heatmap
 *
 * A horizontally scrolling 30-day calendar showing streak history.
 * Interactive tooltips reveal day details on tap.
 *
 * Visual States:
 * - HIT: Vitamin Orange filled circle with checkmark
 * - PARTIAL: Pale orange (50% opacity) with half-fill effect
 * - MISS: Grey outline with subtle shimmer
 * - FROZEN: Ice blue cube with snowflake icon
 * - FUTURE: Empty placeholder
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { DayStatus, StreakDay } from '../../../hooks/useStreak';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../../design-system/tokens';

const { width } = Dimensions.get('window');
const DAY_SIZE = 48;
const DAY_GAP = 10;

interface ConsistencyGridProps {
    history: StreakDay[];
    onDayPress?: (day: StreakDay) => void;
}

// Enhanced color config with gradients
const STATUS_CONFIG: Record<DayStatus, {
    bg: string;
    border: string;
    gradient?: readonly [string, string, ...string[]];
    icon?: string;
    iconColor: string;
    glow?: string;
}> = {
    HIT: {
        bg: COLORS.gamification.vitaminOrange,
        border: COLORS.gamification.vitaminOrange,
        gradient: ['#FF6B00', '#FF5C00', '#FF4500'],
        icon: 'checkmark',
        iconColor: '#FFFFFF',
        glow: COLORS.gamification.orangeGlow,
    },
    PARTIAL: {
        bg: 'rgba(255, 92, 0, 0.35)',
        border: 'rgba(255, 92, 0, 0.6)',
        gradient: ['rgba(255, 107, 0, 0.4)', 'rgba(255, 92, 0, 0.25)'],
        icon: undefined,
        iconColor: '#FFFFFF',
    },
    MISS: {
        bg: 'transparent',
        border: 'rgba(150, 150, 150, 0.25)',
        icon: undefined,
        iconColor: 'rgba(150, 150, 150, 0.5)',
    },
    FROZEN: {
        bg: COLORS.gamification.iceBlueDim,
        border: COLORS.gamification.iceBlue,
        gradient: ['rgba(0, 210, 255, 0.3)', 'rgba(0, 191, 255, 0.15)'],
        icon: 'snow',
        iconColor: COLORS.gamification.iceBlue,
        glow: COLORS.gamification.iceGlow,
    },
    FUTURE: {
        bg: 'transparent',
        border: 'rgba(200, 200, 200, 0.15)',
        icon: undefined,
        iconColor: 'transparent',
    },
};

// Animated Day Circle Component
const AnimatedDayCircle: React.FC<{
    day: StreakDay;
    isToday: boolean;
    onPress: () => void;
    index: number;
}> = ({ day, isToday, onPress, index }) => {
    const config = STATUS_CONFIG[day.status];
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (isToday && day.status === 'HIT') {
            // Pulse animation for today's completed day
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [isToday, day.status]);

    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const getDayOfWeek = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    };

    return (
        <TouchableOpacity
            style={styles.dayContainer}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={day.status === 'FUTURE'}
        >
            <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                {getDayOfWeek(day.date)}
            </Text>

            <Animated.View style={circleStyle}>
                {/* Glow layer for HIT and FROZEN states */}
                {config.glow && (
                    <Animated.View
                        style={[
                            styles.glowLayer,
                            { backgroundColor: config.glow },
                            glowStyle,
                        ]}
                    />
                )}

                <View
                    style={[
                        styles.dayCircle,
                        {
                            backgroundColor: config.bg,
                            borderColor: config.border,
                            borderWidth: isToday ? 3 : 2,
                        },
                        isToday && styles.todayCircle,
                        day.status === 'HIT' && styles.hitCircle,
                        day.status === 'FROZEN' && styles.frozenCircle,
                    ]}
                >
                    {/* Gradient overlay for HIT and FROZEN */}
                    {config.gradient && (
                        <LinearGradient
                            colors={config.gradient}
                            style={styles.gradientOverlay}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                        />
                    )}

                    {/* Icon */}
                    {config.icon && (
                        <Ionicons
                            name={config.icon as any}
                            size={day.status === 'FROZEN' ? 18 : 20}
                            color={config.iconColor}
                        />
                    )}

                    {/* Partial fill indicator */}
                    {day.status === 'PARTIAL' && (
                        <View style={styles.partialContainer}>
                            <View style={styles.partialFill} />
                            <View style={styles.partialEmpty} />
                        </View>
                    )}
                </View>
            </Animated.View>

            <Text style={[styles.dateLabel, isToday && styles.todayLabel]}>
                {new Date(day.date).getDate()}
            </Text>
        </TouchableOpacity>
    );
};

export const ConsistencyGrid: React.FC<ConsistencyGridProps> = ({
    history,
    onDayPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scrollRef = useRef<ScrollView>(null);
    const [selectedDay, setSelectedDay] = useState<StreakDay | null>(null);

    const handleDayPress = (day: StreakDay) => {
        if (day.status === 'FUTURE') return;
        setSelectedDay(day);
        onDayPress?.(day);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    };

    const isToday = (dateStr: string) => {
        return dateStr === new Date().toISOString().split('T')[0];
    };

    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryText = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
    const cardBg = isDark ? 'rgba(30, 30, 35, 0.95)' : '#FFFFFF';

    // Calculate stats
    const hitDays = history.filter(d => d.status === 'HIT').length;
    const totalDays = history.filter(d => d.status !== 'FUTURE').length;
    const successRate = totalDays > 0 ? Math.round((hitDays / totalDays) * 100) : 0;

    return (
        <View style={styles.container}>
            {/* Header with stats */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: secondaryText }]}>
                        CONSISTENCY CHAIN
                    </Text>
                    <Text style={[styles.subtitle, { color: textColor }]}>
                        {successRate}% success rate
                    </Text>
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <LinearGradient
                            colors={['#FF6B00', '#FF5C00']}
                            style={styles.legendDot}
                        />
                        <Text style={[styles.legendText, { color: secondaryText }]}>Hit</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: 'rgba(255, 92, 0, 0.4)' }]} />
                        <Text style={[styles.legendText, { color: secondaryText }]}>Partial</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <LinearGradient
                            colors={['#00D2FF', '#00BFFF']}
                            style={styles.legendDot}
                        />
                        <Text style={[styles.legendText, { color: secondaryText }]}>Frozen</Text>
                    </View>
                </View>
            </View>

            {/* Scrollable calendar */}
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onContentSizeChange={() => {
                    scrollRef.current?.scrollToEnd({ animated: false });
                }}
            >
                {history.map((day, index) => (
                    <AnimatedDayCircle
                        key={day.date}
                        day={day}
                        isToday={isToday(day.date)}
                        onPress={() => handleDayPress(day)}
                        index={index}
                    />
                ))}
            </ScrollView>

            {/* Day Detail Modal */}
            <Modal
                visible={selectedDay !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedDay(null)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setSelectedDay(null)}
                >
                    {selectedDay && (
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(150)}
                        >
                            <BlurView
                                intensity={isDark ? 80 : 60}
                                tint={isDark ? 'dark' : 'light'}
                                style={styles.tooltipBlur}
                            >
                                <View style={[styles.tooltipCard, { backgroundColor: cardBg }]}>
                                    {/* Date header */}
                                    <View style={styles.tooltipHeader}>
                                        <Text style={[styles.tooltipDate, { color: textColor }]}>
                                            {formatDate(selectedDay.date)}
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor: STATUS_CONFIG[selectedDay.status].bg || 'rgba(150, 150, 150, 0.2)',
                                                    borderColor: STATUS_CONFIG[selectedDay.status].border,
                                                },
                                            ]}
                                        >
                                            {STATUS_CONFIG[selectedDay.status].icon && (
                                                <Ionicons
                                                    name={STATUS_CONFIG[selectedDay.status].icon as any}
                                                    size={12}
                                                    color={STATUS_CONFIG[selectedDay.status].iconColor}
                                                />
                                            )}
                                            <Text style={[
                                                styles.statusText,
                                                { color: selectedDay.status === 'MISS' ? secondaryText : '#FFFFFF' }
                                            ]}>
                                                {selectedDay.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Stats row */}
                                    {selectedDay.calories && (
                                        <View style={styles.statsRow}>
                                            <View style={styles.statItem}>
                                                <Ionicons name="flame" size={18} color={COLORS.gamification.vitaminOrange} />
                                                <View>
                                                    <Text style={[styles.statValue, { color: textColor }]}>
                                                        {selectedDay.calories.toLocaleString()}
                                                    </Text>
                                                    <Text style={[styles.statLabel, { color: secondaryText }]}>kcal</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Summary */}
                                    {selectedDay.summary && (
                                        <Text style={[styles.tooltipSummary, { color: secondaryText }]}>
                                            {selectedDay.summary}
                                        </Text>
                                    )}

                                    {/* Close button */}
                                    <TouchableOpacity
                                        style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                                        onPress={() => setSelectedDay(null)}
                                    >
                                        <Text style={[styles.closeText, { color: secondaryText }]}>Dismiss</Text>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    legend: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 10,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: SPACING.xl,
        gap: DAY_GAP,
    },
    dayContainer: {
        alignItems: 'center',
        width: DAY_SIZE,
    },
    dayLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(150, 150, 150, 0.6)',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    todayLabel: {
        color: COLORS.gamification.vitaminOrange,
        fontWeight: '800',
    },
    glowLayer: {
        position: 'absolute',
        width: DAY_SIZE + 12,
        height: DAY_SIZE + 12,
        borderRadius: (DAY_SIZE + 12) / 2,
        top: -6,
        left: -6,
    },
    dayCircle: {
        width: DAY_SIZE,
        height: DAY_SIZE,
        borderRadius: DAY_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    todayCircle: {
        ...SHADOWS.md,
        shadowColor: COLORS.gamification.vitaminOrange,
    },
    hitCircle: {
        ...SHADOWS.sm,
        shadowColor: COLORS.gamification.vitaminOrange,
    },
    frozenCircle: {
        ...SHADOWS.sm,
        shadowColor: COLORS.gamification.iceBlue,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: DAY_SIZE / 2,
    },
    partialContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: DAY_SIZE / 2,
    },
    partialFill: {
        flex: 1,
        backgroundColor: 'rgba(255, 92, 0, 0.5)',
    },
    partialEmpty: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dateLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(100, 100, 100, 0.7)',
        marginTop: 6,
    },
    // Modal styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tooltipBlur: {
        borderRadius: RADIUS['2xl'],
        overflow: 'hidden',
    },
    tooltipCard: {
        width: width - 60,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        ...SHADOWS.xl,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    tooltipDate: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    tooltipSummary: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: SPACING.lg,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
    },
    closeText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
