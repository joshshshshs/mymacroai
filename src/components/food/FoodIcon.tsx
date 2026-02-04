/**
 * FoodIcon - Simple Vector Emoji Food Icon Component
 * 
 * A reusable component that displays food icons as simple emojis
 * with pastel background containers. Matches foods by name/type.
 * 
 * Style: Clean, minimalist, friendly emoji aesthetic
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { RADIUS } from '@/src/design-system/tokens';

// ============================================================================
// FOOD EMOJI MAPPING
// ============================================================================

interface FoodEmojiConfig {
    emoji: string;
    bgColor: string;  // Pastel background
}

const FOOD_EMOJI_MAP: Record<string, FoodEmojiConfig> = {
    // Proteins
    chicken: { emoji: '🍗', bgColor: '#FFECD2' },
    'chicken breast': { emoji: '🍗', bgColor: '#FFECD2' },
    'grilled chicken': { emoji: '🍗', bgColor: '#FFECD2' },
    beef: { emoji: '🥩', bgColor: '#FFE4E1' },
    steak: { emoji: '🥩', bgColor: '#FFE4E1' },
    salmon: { emoji: '🐟', bgColor: '#E0F4FF' },
    fish: { emoji: '🐟', bgColor: '#E0F4FF' },
    egg: { emoji: '🥚', bgColor: '#FFF8E7' },
    eggs: { emoji: '🍳', bgColor: '#FFF8E7' },
    'scrambled eggs': { emoji: '🍳', bgColor: '#FFF8E7' },

    // Dairy
    yogurt: { emoji: '🥛', bgColor: '#F5F5FF' },
    'greek yogurt': { emoji: '🥛', bgColor: '#F5F5FF' },
    milk: { emoji: '🥛', bgColor: '#F5F5FF' },
    cheese: { emoji: '🧀', bgColor: '#FFF9E6' },

    // Fruits
    apple: { emoji: '🍎', bgColor: '#FFE5E5' },
    banana: { emoji: '🍌', bgColor: '#FFF9E0' },
    orange: { emoji: '🍊', bgColor: '#FFF0E0' },
    berries: { emoji: '🫐', bgColor: '#F0E8FF' },
    avocado: { emoji: '🥑', bgColor: '#E8FFE8' },

    // Vegetables
    spinach: { emoji: '🥬', bgColor: '#E5FFE5' },
    broccoli: { emoji: '🥦', bgColor: '#E8FFE8' },
    salad: { emoji: '🥗', bgColor: '#E5FFE5' },
    'greek salad': { emoji: '🥗', bgColor: '#E5FFE5' },
    carrot: { emoji: '🥕', bgColor: '#FFE8D5' },

    // Grains
    oats: { emoji: '🥣', bgColor: '#F5EFE0' },
    oatmeal: { emoji: '🥣', bgColor: '#F5EFE0' },
    rice: { emoji: '🍚', bgColor: '#FFF8F0' },
    bread: { emoji: '🍞', bgColor: '#F5EBD5' },
    toast: { emoji: '🍞', bgColor: '#F5EBD5' },
    'whole wheat toast': { emoji: '🍞', bgColor: '#F5EBD5' },
    pasta: { emoji: '🍝', bgColor: '#FFF5E5' },

    // Beverages
    coffee: { emoji: '☕', bgColor: '#F5EBE0' },
    tea: { emoji: '🍵', bgColor: '#E8FFE8' },
    juice: { emoji: '🧃', bgColor: '#FFF0E0' },
    'orange juice': { emoji: '🧃', bgColor: '#FFF0E0' },
    smoothie: { emoji: '🥤', bgColor: '#FFE0F0' },
    'protein smoothie': { emoji: '🥤', bgColor: '#E0E8FF' },
    'protein shake': { emoji: '🥤', bgColor: '#E0E8FF' },

    // Nuts & Seeds
    almonds: { emoji: '🥜', bgColor: '#F5EBD5' },
    nuts: { emoji: '🥜', bgColor: '#F5EBD5' },
    'peanut butter': { emoji: '🥜', bgColor: '#F5E0D0' },

    // Snacks
    cookie: { emoji: '🍪', bgColor: '#F5EBD5' },
    chips: { emoji: '🍟', bgColor: '#FFF5E0' },
    popcorn: { emoji: '🍿', bgColor: '#FFF8E0' },

    // Meals
    pizza: { emoji: '🍕', bgColor: '#FFE5E0' },
    burger: { emoji: '🍔', bgColor: '#F5EBD5' },
    sandwich: { emoji: '🥪', bgColor: '#F5EBD5' },
    sushi: { emoji: '🍣', bgColor: '#FFE5E5' },
    soup: { emoji: '🍲', bgColor: '#FFF0E0' },

    // Sweet
    honey: { emoji: '🍯', bgColor: '#FFF5D5' },
    chocolate: { emoji: '🍫', bgColor: '#F5E0D5' },
    cake: { emoji: '🍰', bgColor: '#FFE5F0' },
    ice_cream: { emoji: '🍦', bgColor: '#FFF0F5' },

    // Default
    default: { emoji: '🍽️', bgColor: '#F5F5F5' },
    verified: { emoji: '✅', bgColor: '#E5FFE5' },
};

// ============================================================================
// HELPER FUNCTION
// ============================================================================

function getFoodConfig(foodName: string): FoodEmojiConfig {
    const lowerName = foodName.toLowerCase();

    // Direct match
    if (FOOD_EMOJI_MAP[lowerName]) {
        return FOOD_EMOJI_MAP[lowerName];
    }

    // Partial match - check if any key is contained in the food name
    for (const [key, config] of Object.entries(FOOD_EMOJI_MAP)) {
        if (lowerName.includes(key) || key.includes(lowerName)) {
            return config;
        }
    }

    // Category-based fallback
    if (lowerName.includes('protein') || lowerName.includes('whey')) {
        return { emoji: '💪', bgColor: '#E0E8FF' };
    }
    if (lowerName.includes('vitamin') || lowerName.includes('supplement')) {
        return { emoji: '💊', bgColor: '#E0FFE0' };
    }

    return FOOD_EMOJI_MAP.default;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface FoodIconProps {
    foodName: string;
    size?: 'small' | 'medium' | 'large';
    isVerified?: boolean;
    style?: ViewStyle;
}

const SIZES = {
    small: { container: 36, emoji: 18, radius: 10 },
    medium: { container: 50, emoji: 24, radius: 14 },
    large: { container: 64, emoji: 32, radius: 18 },
};

export const FoodIcon: React.FC<FoodIconProps> = ({
    foodName,
    size = 'medium',
    isVerified = false,
    style,
}) => {
    const config = getFoodConfig(foodName);
    const dimensions = SIZES[size];

    return (
        <View
            style={[
                styles.container,
                {
                    width: dimensions.container,
                    height: dimensions.container,
                    borderRadius: dimensions.radius,
                    backgroundColor: config.bgColor,
                },
                style,
            ]}
        >
            <Text style={{ fontSize: dimensions.emoji }}>{config.emoji}</Text>
            {isVerified && (
                <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedEmoji}>✓</Text>
                </View>
            )}
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedEmoji: {
        fontSize: 8,
        color: '#FFF',
        fontWeight: '700',
    },
});

export default FoodIcon;
