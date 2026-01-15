/**
 * ProductCard - Clean Commerce Shop Item
 * Light mode aesthetic with pastel icon backgrounds
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
import { SPACING, RADIUS, SHADOWS } from '@/src/design-system/tokens';

const COIN_ICON = require('../../../assets/coin_gold.png');

interface ProductCardProps {
    item: StoreItem;
    canAfford: boolean;
    onPress: (item: StoreItem) => void;
}

// Icon mapping based on item ID or category
const getItemIcon = (id: string, category: string): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    if (id.includes('freeze')) return { name: 'snow', color: '#0EA5E9', bg: '#E0F2FE' }; // Sky Blue
    if (id.includes('restore')) return { name: 'refresh', color: '#F97316', bg: '#FFF7ED' }; // Orange
    if (id.includes('ghost')) return { name: 'eye-off', color: '#8B5CF6', bg: '#F3E8FF' }; // Purple
    if (id.includes('pro')) return { name: 'trophy', color: '#EAB308', bg: '#FEF9C3' }; // Yellow
    if (id.includes('dark')) return { name: 'moon', color: '#1F2937', bg: '#F3F4F6' }; // Dark Grey

    // Default fallbacks
    switch (category) {
        case 'utility': return { name: 'shield-checkmark', color: '#10B981', bg: '#ECFDF5' };
        case 'cosmetic': return { name: 'color-palette', color: '#EC4899', bg: '#FCE7F3' };
        default: return { name: 'cube', color: '#6B7280', bg: '#F9FAFB' };
    }
};

export const ProductCard: React.FC<ProductCardProps> = ({
    item,
    canAfford,
    onPress,
}) => {
    const iconData = getItemIcon(item.id, item.category);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item)}
            activeOpacity={0.9}
        >
            {/* Icon Area */}
            <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                <Ionicons name={iconData.name} size={32} color={iconData.color} />
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                {/* Price Pill */}
                <View style={styles.priceContainer}>
                    <View style={[styles.pricePill, !canAfford && styles.pricePillDisabled]}>
                        <Text style={[styles.priceText, !canAfford && styles.priceTextDisabled]}>
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
        backgroundColor: '#FFFFFF',
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
        color: '#1A1A1A',
        marginBottom: 4,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        fontWeight: '400',
        color: '#9CA3AF',
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
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    pricePillDisabled: {
        backgroundColor: '#F9FAFB',
        opacity: 0.7,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    priceTextDisabled: {
        color: '#9CA3AF',
    },
    coinIcon: {
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },
});

export default ProductCard;
