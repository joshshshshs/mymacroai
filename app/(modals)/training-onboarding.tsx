/**
 * Training Onboarding Modal - "Define Your Training DNA"
 * 
 * Multi-select grid for training styles. Users can pick 1 or ALL.
 * If > 1 selected, they're labeled as a "Hybrid Athlete".
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    Easing,
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore, TRAINING_STYLES, TrainingStyle } from '@/src/store/UserStore';

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    neonOrange: '#FF5C00',
    warmWhite: '#FFF5F0',
    success: '#34C759',
};

// ============================================================================
// TRAINING STYLE CARD
// ============================================================================

interface TrainingCardProps {
    id: TrainingStyle;
    label: string;
    icon: string;
    focus: string;
    isSelected: boolean;
    onPress: () => void;
    isDark: boolean;
    index: number;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
    id,
    label,
    icon,
    focus,
    isSelected,
    onPress,
    isDark,
    index,
}) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        glowOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    }, [isSelected]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(0.95, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).springify()}
            style={[styles.cardWrapper, animatedStyle]}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                style={styles.cardTouchable}
            >
                {/* Glow Effect */}
                <Animated.View
                    style={[
                        styles.cardGlow,
                        glowStyle,
                        { backgroundColor: COLORS.neonOrange }
                    ]}
                />

                <BlurView
                    intensity={isDark ? 40 : 60}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                        styles.card,
                        {
                            borderColor: isSelected ? COLORS.neonOrange : 'transparent',
                            borderWidth: isSelected ? 2 : 0,
                        }
                    ]}
                >
                    {/* Checkmark */}
                    {isSelected && (
                        <View style={styles.checkmark}>
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                    )}

                    <Text style={styles.cardIcon}>{icon}</Text>
                    <Text style={[styles.cardLabel, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                        {label}
                    </Text>
                    <Text style={[styles.cardFocus, { color: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93' }]}>
                        {focus}
                    </Text>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function TrainingOnboardingModal() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Store
    const currentStyles = useUserStore(s => s.trainingStyles);
    const setTrainingStyles = useUserStore(s => s.setTrainingStyles);

    // Local state (for optimistic UI)
    const [selectedStyles, setSelectedStyles] = useState<TrainingStyle[]>(currentStyles || []);

    const colors = {
        bg: isDark ? '#0A0A0C' : COLORS.warmWhite,
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        surface: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    };

    const isHybrid = selectedStyles.length > 1;

    const handleToggleStyle = (styleId: TrainingStyle) => {
        setSelectedStyles(prev => {
            if (prev.includes(styleId)) {
                return prev.filter(s => s !== styleId);
            } else {
                return [...prev, styleId];
            }
        });
    };

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTrainingStyles(selectedStyles);
        router.back();
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleClose}
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSave}
                        style={[
                            styles.saveButton,
                            {
                                backgroundColor: selectedStyles.length > 0
                                    ? COLORS.neonOrange
                                    : colors.surface,
                            }
                        ]}
                        disabled={selectedStyles.length === 0}
                    >
                        <Text style={[
                            styles.saveButtonText,
                            {
                                color: selectedStyles.length > 0
                                    ? '#FFFFFF'
                                    : colors.textSecondary,
                            }
                        ]}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Title Section */}
                <Animated.View
                    entering={FadeIn.delay(100)}
                    style={styles.titleSection}
                >
                    <Text style={[styles.title, { color: colors.text }]}>
                        Define Your Training DNA
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Select all that apply. The AI adapts its advice to your specific mix.
                    </Text>

                    {/* Hybrid Badge */}
                    {isHybrid && (
                        <Animated.View
                            entering={FadeIn}
                            style={styles.hybridBadge}
                        >
                            <Text style={styles.hybridBadgeText}>⚡ HYBRID ATHLETE</Text>
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Grid */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {TRAINING_STYLES.map((style, index) => (
                        <TrainingCard
                            key={style.id}
                            id={style.id}
                            label={style.label}
                            icon={style.icon}
                            focus={style.focus}
                            isSelected={selectedStyles.includes(style.id)}
                            onPress={() => handleToggleStyle(style.id)}
                            isDark={isDark}
                            index={index}
                        />
                    ))}
                </ScrollView>

                {/* Selection Counter */}
                <View style={[styles.footer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        {selectedStyles.length === 0
                            ? 'Select at least one training style'
                            : `${selectedStyles.length} style${selectedStyles.length > 1 ? 's' : ''} selected`
                        }
                    </Text>
                </View>
            </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.pill,
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    titleSection: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    hybridBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.neonOrange,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.pill,
        marginTop: SPACING.md,
    },
    hybridBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
    },
    cardWrapper: {
        width: '47%',
    },
    cardTouchable: {
        width: '100%',
    },
    cardGlow: {
        position: 'absolute',
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
        borderRadius: RADIUS.xl + 3,
        opacity: 0.3,
    },
    card: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        minHeight: 140,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    checkmark: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.neonOrange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardIcon: {
        fontSize: 36,
        marginBottom: SPACING.sm,
    },
    cardLabel: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardFocus: {
        fontSize: 11,
        textAlign: 'center',
    },
    footer: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
