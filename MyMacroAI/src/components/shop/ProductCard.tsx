/**
 * ProductCard - Clean Commerce Shop Item
 * Supports both light and dark mode
 */

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreItem } from '@/src/types';
import { SPACING } from '@/src/design-system/tokens';

const COIN_ICON = require('../../../assets/coin_gold.png');

interface ProductCardProps {
    item: StoreItem;
    canAfford: boolean;
    onPress: (item: StoreItem) => void;
}

// Icon mapping based on item ID or category
const getItemIcon = (id: string, category: string, isDark: boolean): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    if (id.includes('freeze')) return { name: 'snow', color: '#0EA5E9', bg: isDark ? 'rgba(14, 165, 233, 0.15)' : '#E0F2FE' };
    if (id.includes('restore')) return { name: 'refresh', color: '#F97316', bg: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED' };
    if (id.includes('ghost')) return { name: 'eye-off', color: '#8B5CF6', bg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#F3E8FF' };
    if (id.includes('pro')) return { name: 'trophy', color: '#EAB308', bg: isDark ? 'rgba(234, 179, 8, 0.15)' : '#FEF9C3' };
    if (id.includes('dark')) return { name: 'moon', color: isDark ? '#9CA3AF' : '#1F2937', bg: isDark ? 'rgba(156, 163, 175, 0.15)' : '#F3F4F6' };

    // Default fallbacks
    switch (category) {
        case 'utility': return { name: 'shield-checkmark', color: '#10B981', bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' };
        case 'cosmetic': return { name: 'color-palette', color: '#EC4899', bg: isDark ? 'rgba(236, 72, 153, 0.15)' : '#FCE7F3' };
        default: return { name: 'cube', color: '#6B7280', bg: isDark ? 'rgba(107, 114, 128, 0.15)' : '#F9FAFB' };
    }
};

export const ProductCard: React.FC<ProductCardProps> = ({
    item,
    canAfford,
    onPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const iconData = getItemIcon(item.id, item.category || 'utility', isDark);

    const colors = {
        card: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
        title: isDark ? '#FFFFFF' : '#1A1A1A',
        description: isDark ? 'rgba(255, 255, 255, 0.5)' : '#9CA3AF',
        pricePill: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6',
        pricePillDisabled: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
        priceText: isDark ? '#FFFFFF' : '#111827',
        priceTextDisabled: isDark ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF',
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => onPress(item)}
            activeOpacity={0.9}
        >
            {/* Icon Area */}
            <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                <Ionicons name={iconData.name} size={32} color={iconData.color} />
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.title }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.description, { color: colors.description }]} numberOfLines={2}>
                    {item.description}
                </Text>

                {/* Price Pill */}
                <View style={styles.priceContainer}>
                    <View style={[
                        styles.pricePill,
                        { backgroundColor: canAfford ? colors.pricePill : colors.pricePillDisabled },
                        !canAfford && styles.pricePillDisabled
                    ]}>
                        <Text style={[
                            styles.priceText,
                            { color: canAfford ? colors.priceText : colors.priceTextDisabled }
                        ]}>
                            {item.price.toLocaleString()}
                        </Text>
                        <Image source={COIN_ICON} style={styles.coinIcon} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: SPACING.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: SPACING.md,
        lineHeight: 16,
        height: 32, // Fixed height for 2 lines
    },
    priceContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    pricePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    pricePillDisabled: {
        opacity: 0.7,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
    },
    coinIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
});

export default ProductCard;
