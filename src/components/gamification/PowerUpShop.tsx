/**
 * PowerUpShop - "The MacroCoin Exchange" Utility Shop
 *
 * A horizontal carousel where users spend earned MacroCoins on app utilities.
 * Items: Streak Freeze, Theme Unlocks, Ghost Mode, Double XP
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../design-system/tokens';
import { MacroCoinIcon } from '../ui/MacroCoinIcon';

const ITEM_WIDTH = 155;

interface PowerUp {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    gradient: readonly [string, string, ...string[]];
    iconColor: string;
}

const POWER_UPS: PowerUp[] = [
    {
        id: 'streak-freeze',
        name: 'Streak Freeze',
        description: 'Protect your streak for 1 day',
        cost: 500,
        icon: 'snow',
        gradient: ['#E0F2FE', '#BAE6FD', '#7DD3FC'],
        iconColor: '#0EA5E9',
    },
    {
        id: 'ghost-mode',
        name: 'Ghost Mode',
        description: 'Hide from Leaderboard 24h',
        cost: 200,
        icon: 'eye-off',
        gradient: ['#F3E8FF', '#E9D5FF', '#D8B4FE'],
        iconColor: '#8B5CF6',
    },
    {
        id: 'double-xp',
        name: 'Double XP',
        description: '2x MacroCoins for 24h',
        cost: 750,
        icon: 'flash',
        gradient: ['#FEF9C3', '#FDE68A', '#FCD34D'],
        iconColor: '#F59E0B',
    },
    {
        id: 'theme-obsidian',
        name: 'Obsidian Theme',
        description: 'Dark Mode: Obsidian',
        cost: 1000,
        icon: 'color-palette',
        gradient: ['#F3F4F6', '#E5E7EB', '#D1D5DB'],
        iconColor: '#374151',
    },
];

interface Props {
    coins: number;
    onPurchase: (itemId: string, cost: number) => boolean;
    ownedFreezes?: number;
}

// Animated Power-Up Card
const PowerUpCard: React.FC<{
    item: PowerUp;
    canAfford: boolean;
    onPress: () => void;
}> = ({ item, canAfford, onPress }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const handlePress = () => {
        if (canAfford) {
            scale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 150 })
            );
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        onPress();
    };

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.cardWrapper, cardStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
            >
                <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, !canAfford && styles.cardDisabled]}
                >
                    {/* Icon container */}
                    <View style={styles.iconContainer}>
                        <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
                    </View>

                    {/* Item name */}
                    <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                    </Text>

                    {/* Description */}
                    <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                    </Text>

                    {/* Price tag */}
                    <View style={[styles.priceTag, !canAfford && styles.priceTagDisabled]}>
                        <MacroCoinIcon size={14} />
                        <Text style={[styles.priceText, !canAfford && styles.priceTextDisabled]}>
                            {item.cost.toLocaleString()}
                        </Text>
                    </View>

                    {/* Locked overlay */}
                    {!canAfford && (
                        <View style={styles.lockedOverlay}>
                            <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.6)" />
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const PowerUpShop: React.FC<Props> = ({
    coins,
    onPurchase,
    ownedFreezes = 0,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryText = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    const cardBg = isDark ? 'rgba(30, 30, 35, 0.6)' : 'rgba(255, 255, 255, 0.85)';

    const handlePurchase = (item: PowerUp) => {
        if (coins < item.cost) {
            Alert.alert(
                'Insufficient Coins',
                `You need ${item.cost - coins} more MacroCoins to purchase ${item.name}.`,
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Confirm Purchase',
            `Spend ${item.cost} MacroCoins on ${item.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Buy',
                    onPress: () => {
                        const success = onPurchase(item.id, item.cost);
                        if (success) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: cardBg }]}>
            {/* Header with coin balance */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: secondaryText }]}>
                        MACROCOIN EXCHANGE
                    </Text>
                    <Text style={[styles.subtitle, { color: textColor }]}>
                        Spend your earned coins
                    </Text>
                </View>

                {/* Coin balance */}
                <View style={styles.coinBalance}>
                    <LinearGradient
                        colors={['#FFF5F0', '#FFE4D6']}
                        style={styles.coinBadge}
                    >
                        <MacroCoinIcon size={18} />
                        <Text style={styles.coinAmount}>{coins.toLocaleString()}</Text>
                    </LinearGradient>
                </View>
            </View>

            {/* Owned freezes indicator */}
            {ownedFreezes > 0 && (
                <View style={styles.ownedIndicator}>
                    <Ionicons name="snow" size={14} color={COLORS.gamification.iceBlue} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.gamification.iceBlue }}>
                        {ownedFreezes} Freezes owned
                    </Text>
                </View>
            )}

            {/* Horizontal scroll of power-ups */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToInterval={ITEM_WIDTH + SPACING.md}
            >
                {POWER_UPS.map((item) => (
                    <PowerUpCard
                        key={item.id}
                        item={item}
                        canAfford={coins >= item.cost}
                        onPress={() => handlePurchase(item)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        marginHorizontal: SPACING.xl,
        marginVertical: SPACING.lg,
        ...SHADOWS.soft,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    coinBalance: {
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    coinBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: 5,
    },
    coinAmount: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    ownedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    scrollContent: {
        paddingTop: SPACING.sm,
        gap: SPACING.md,
    },
    cardWrapper: {
        width: ITEM_WIDTH,
    },
    card: {
        width: ITEM_WIDTH,
        height: 175,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        justifyContent: 'space-between',
        ...SHADOWS.md,
    },
    cardDisabled: {
        opacity: 0.7,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: SPACING.sm,
    },
    itemDescription: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 14,
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        gap: 4,
    },
    priceTagDisabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    priceText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    priceTextDisabled: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
