/**
 * Water Log Modal - "Hydration Station"
 *
 * Premium water tracking interface with:
 * - Animated water level visualization
 * - Quick-add glass buttons
 * - Custom amount input
 * - Daily progress ring
 * - Hydration history timeline
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    ScrollView,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    FadeIn,
    FadeInDown,
    SlideInUp,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useUserStore } from '@/src/store/UserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    waterBlue: '#3B82F6',
    waterBlueDark: '#1D4ED8',
    waterBlueLight: '#60A5FA',
    waterBluePale: '#DBEAFE',
    vitaminOrange: '#FF5C00',
    neonOrange: '#FF9E00',
    success: '#22C55E',
};

// Quick add options (ml)
const QUICK_ADD_OPTIONS = [
    { id: 'glass', label: 'Glass', amount: 250, icon: '🥛' },
    { id: 'bottle', label: 'Bottle', amount: 500, icon: '🍶' },
    { id: 'large', label: 'Large', amount: 750, icon: '🧴' },
    { id: 'custom', label: 'Custom', amount: 0, icon: '✏️' },
];

// Default daily goal in ml
const DEFAULT_WATER_GOAL = 2500;

// ============================================================================
// ANIMATED WATER WAVE COMPONENT
// ============================================================================

const AnimatedWave = ({ progress, color }: { progress: number; color: string }) => {
    const translateX = useSharedValue(0);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(-SCREEN_WIDTH, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const waveStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.waveContainer, { height: `${Math.min(progress * 100, 100)}%` }]}>
            <Animated.View style={[styles.wave, waveStyle]}>
                <Svg height="20" width={SCREEN_WIDTH * 2} viewBox={`0 0 ${SCREEN_WIDTH * 2} 20`}>
                    <Defs>
                        <SvgGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                            <Stop offset="100%" stopColor={color} stopOpacity="0.4" />
                        </SvgGradient>
                    </Defs>
                    {/* Simplified wave path using semicircles */}
                </Svg>
            </Animated.View>
            <LinearGradient
                colors={[`${color}CC`, `${color}99`]}
                style={StyleSheet.absoluteFillObject}
            />
        </View>
    );
};

// ============================================================================
// PROGRESS RING COMPONENT
// ============================================================================

const ProgressRing = ({ progress, size = 180 }: { progress: number; size?: number }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(progress, 1) * circumference);

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withSpring(progress, { damping: 15, stiffness: 80 });
    }, [progress]);

    const animatedProps = useAnimatedStyle(() => {
        const offset = circumference - (animatedProgress.value * circumference);
        return {
            strokeDashoffset: offset,
        };
    });

    return (
        <View style={[styles.ringContainer, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.ringSvg}>
                <Defs>
                    <SvgGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor={COLORS.waterBlueLight} />
                        <Stop offset="100%" stopColor={COLORS.waterBlue} />
                    </SvgGradient>
                </Defs>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(59, 130, 246, 0.15)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
        </View>
    );
};

// ============================================================================
// QUICK ADD BUTTON COMPONENT
// ============================================================================

interface QuickAddButtonProps {
    option: typeof QUICK_ADD_OPTIONS[0];
    onPress: () => void;
    isSelected: boolean;
    isDark: boolean;
    index: number;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({
    option,
    onPress,
    isSelected,
    isDark,
    index,
}) => {
    const scale = useSharedValue(1);
    const { light } = useHaptics();

    const handlePress = () => {
        light();
        scale.value = withSequence(
            withSpring(0.92, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const cardBg = isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
    const selectedBg = COLORS.waterBlue;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).springify()}
            style={animatedStyle}
        >
            <TouchableOpacity
                style={[
                    styles.quickAddButton,
                    {
                        backgroundColor: isSelected ? selectedBg : cardBg,
                        borderColor: isSelected ? COLORS.waterBlue : 'transparent',
                        borderWidth: isSelected ? 0 : (isDark ? 0 : 1),
                    },
                ]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <Text style={styles.quickAddEmoji}>{option.icon}</Text>
                <Text style={[
                    styles.quickAddLabel,
                    { color: isSelected ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#1A1A1A') }
                ]}>
                    {option.label}
                </Text>
                {option.amount > 0 && (
                    <Text style={[
                        styles.quickAddAmount,
                        { color: isSelected ? 'rgba(255,255,255,0.8)' : COLORS.waterBlue }
                    ]}>
                        {option.amount}ml
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// HISTORY ITEM COMPONENT
// ============================================================================

interface HistoryItem {
    id: string;
    amount: number;
    time: string;
    type: string;
}

const WaterHistoryItem: React.FC<{
    item: HistoryItem;
    isDark: boolean;
    onDelete: () => void;
}> = ({ item, isDark, onDelete }) => {
    const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const subtextColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';

    return (
        <View style={[styles.historyItem, { backgroundColor: cardBg }]}>
            <View style={styles.historyIcon}>
                <Ionicons name="water" size={18} color={COLORS.waterBlue} />
            </View>
            <View style={styles.historyInfo}>
                <Text style={[styles.historyAmount, { color: textColor }]}>
                    {item.amount}ml
                </Text>
                <Text style={[styles.historyTime, { color: subtextColor }]}>
                    {item.time} • {item.type}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.historyDelete}
                onPress={onDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="close-circle" size={20} color={subtextColor} />
            </TouchableOpacity>
        </View>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WaterLogModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { light, medium, success } = useHaptics();

    // Get water data from store
    const waterIntake = useUserStore((state) => state.waterIntake) ?? 0;
    const waterGoal = useUserStore((state) => state.waterGoal) ?? DEFAULT_WATER_GOAL;
    const waterHistory = useUserStore((state) => state.waterHistory) ?? [];
    const logWater = useUserStore((state) => state.logWater);

    // State
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Animations
    const celebrateScale = useSharedValue(1);

    // Calculate progress
    const progress = waterIntake / waterGoal;
    const remaining = Math.max(0, waterGoal - waterIntake);
    const glassesLogged = Math.floor(waterIntake / 250);

    // Colors
    const colors = {
        bg: isDark ? '#0A0A0C' : '#F8FAFC',
        surface: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    };

    // Handlers
    const handleClose = () => {
        light();
        router.back();
    };

    const handleQuickAdd = (option: typeof QUICK_ADD_OPTIONS[0]) => {
        if (option.id === 'custom') {
            setShowCustomInput(true);
            setSelectedOption('custom');
        } else {
            setSelectedOption(option.id);
            setShowCustomInput(false);
        }
    };

    const handleLogWater = () => {
        let amount = 0;

        if (selectedOption === 'custom') {
            amount = parseInt(customAmount) || 0;
        } else {
            const option = QUICK_ADD_OPTIONS.find(o => o.id === selectedOption);
            amount = option?.amount || 0;
        }

        if (amount > 0) {
            const type = selectedOption === 'custom' ? 'Custom' : QUICK_ADD_OPTIONS.find(o => o.id === selectedOption)?.label || 'Water';

            // Log to store (this handles adding to history)
            if (logWater) {
                logWater(amount, type);
            }

            // Celebrate if goal reached
            if (waterIntake + amount >= waterGoal && waterIntake < waterGoal) {
                success();
                celebrateScale.value = withSequence(
                    withSpring(1.2, { damping: 10 }),
                    withSpring(1, { damping: 12 })
                );
            } else {
                medium();
            }

            // Reset selection
            setSelectedOption(null);
            setCustomAmount('');
            setShowCustomInput(false);
        }
    };

    const celebrateStyle = useAnimatedStyle(() => ({
        transform: [{ scale: celebrateScale.value }],
    }));

    const canLog = selectedOption && (selectedOption !== 'custom' || parseInt(customAmount) > 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Gradient */}
            <LinearGradient
                colors={isDark
                    ? ['#0A0A0C', '#0F172A', '#0A0A0C']
                    : ['#F8FAFC', '#EFF6FF', '#F8FAFC']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerEmoji}>💧</Text>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                Hydration Station
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                {remaining > 0 ? `${remaining}ml to go` : 'Goal reached!'}
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

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Progress Ring Section */}
                    <Animated.View
                        entering={FadeInDown.delay(100).springify()}
                        style={[celebrateStyle, styles.progressSection]}
                    >
                        <View style={styles.ringWrapper}>
                            <ProgressRing progress={progress} size={180} />
                            <View style={styles.ringCenter}>
                                <Text style={[styles.progressValue, { color: COLORS.waterBlue }]}>
                                    {Math.round(waterIntake)}
                                </Text>
                                <Text style={[styles.progressUnit, { color: colors.textSecondary }]}>
                                    / {waterGoal}ml
                                </Text>
                                <Text style={[styles.progressPercent, { color: colors.text }]}>
                                    {Math.round(progress * 100)}%
                                </Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="water-outline" size={18} color={COLORS.waterBlue} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {glassesLogged}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    glasses
                                </Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Ionicons name="flag-outline" size={18} color={COLORS.success} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {waterGoal}ml
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    goal
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Quick Add Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            QUICK ADD
                        </Text>
                        <View style={styles.quickAddGrid}>
                            {QUICK_ADD_OPTIONS.map((option, index) => (
                                <QuickAddButton
                                    key={option.id}
                                    option={option}
                                    onPress={() => handleQuickAdd(option)}
                                    isSelected={selectedOption === option.id}
                                    isDark={isDark}
                                    index={index}
                                />
                            ))}
                        </View>

                        {/* Custom Amount Input */}
                        {showCustomInput && (
                            <Animated.View
                                entering={FadeInDown.springify()}
                                style={styles.customInputContainer}
                            >
                                <BlurView
                                    intensity={isDark ? 40 : 60}
                                    tint={isDark ? 'dark' : 'light'}
                                    style={[styles.customInputBlur, { borderColor: colors.border }]}
                                >
                                    <TextInput
                                        style={[styles.customInput, { color: colors.text }]}
                                        placeholder="Enter amount"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                        value={customAmount}
                                        onChangeText={setCustomAmount}
                                        autoFocus
                                    />
                                    <Text style={[styles.customInputUnit, { color: colors.textSecondary }]}>
                                        ml
                                    </Text>
                                </BlurView>
                            </Animated.View>
                        )}
                    </View>

                    {/* Today's History */}
                    {waterHistory.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                TODAY'S LOG
                            </Text>
                            {waterHistory.slice(0, 10).map((item) => (
                                <WaterHistoryItem
                                    key={item.id}
                                    item={item}
                                    isDark={isDark}
                                    onDelete={() => {}}
                                />
                            ))}
                        </View>
                    )}

                    {/* Tip */}
                    <View style={[styles.tipCard, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)' }]}>
                        <Ionicons name="bulb-outline" size={18} color={COLORS.waterBlue} />
                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                            Staying hydrated improves energy, focus, and helps your body recover faster after workouts.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Log Button */}
            {canLog && (
                <Animated.View
                    entering={SlideInUp.springify()}
                    style={[styles.logDock, { paddingBottom: insets.bottom + 8 }]}
                >
                    <BlurView
                        intensity={isDark ? 60 : 80}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.logDockBlur, { borderColor: colors.border }]}
                    >
                        <TouchableOpacity
                            style={styles.logButton}
                            onPress={handleLogWater}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[COLORS.waterBlue, COLORS.waterBlueDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logButtonGradient}
                            >
                                <Ionicons name="water" size={20} color="#FFFFFF" />
                                <Text style={styles.logButtonText}>
                                    Log {selectedOption === 'custom'
                                        ? `${customAmount || 0}ml`
                                        : `${QUICK_ADD_OPTIONS.find(o => o.id === selectedOption)?.amount || 0}ml`
                                    }
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: 120,
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

    // Progress Section
    progressSection: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    ringWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringSvg: {
        position: 'absolute',
    },
    ringCenter: {
        position: 'absolute',
        alignItems: 'center',
    },
    progressValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    progressUnit: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: -2,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        gap: SPACING.xl,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: 40,
    },

    // Wave
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    wave: {
        position: 'absolute',
        top: 0,
        left: 0,
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

    // Quick Add
    quickAddGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    quickAddButton: {
        flex: 1,
        minWidth: '45%',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    quickAddEmoji: {
        fontSize: 28,
        marginBottom: SPACING.xs,
    },
    quickAddLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    quickAddAmount: {
        fontSize: 13,
        fontWeight: '500',
    },

    // Custom Input
    customInputContainer: {
        marginTop: SPACING.md,
    },
    customInputBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
    customInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
    },
    customInputUnit: {
        fontSize: 16,
        fontWeight: '600',
    },

    // History
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    historyIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(59,130,246,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    historyInfo: {
        flex: 1,
    },
    historyAmount: {
        fontSize: 15,
        fontWeight: '600',
    },
    historyTime: {
        fontSize: 12,
        marginTop: 2,
    },
    historyDelete: {
        padding: 4,
    },

    // Tip
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

    // Log Dock
    logDock: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.xl,
    },
    logDockBlur: {
        borderRadius: RADIUS['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
        padding: SPACING.md,
    },
    logButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    logButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        gap: SPACING.sm,
    },
    logButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
