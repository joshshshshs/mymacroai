import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';

// Utils
import { haptics } from '@/src/utils/haptics';

interface ShopItem {
    id: string;
    name: string;
    price: number;
    icon: string;
    type: 'skin' | 'freeze' | 'intel';
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 'skin_neon', name: 'Neon Samurai', price: 500, icon: 'color-palette-outline', type: 'skin' },
    { id: 'skin_stealth', name: 'Stealth Ops', price: 500, icon: 'contrast-outline', type: 'skin' },
    { id: 'freeze_1', name: '1-Day Freeze', price: 100, icon: 'snow-outline', type: 'freeze' },
    { id: 'freeze_3', name: '3-Day Freeze', price: 250, icon: 'snow', type: 'freeze' },
    { id: 'intel_report', name: 'Deep Intel', price: 1000, icon: 'document-text-outline', type: 'intel' },
];

interface HiddenStoreModalProps {
    visible: boolean;
    onClose: () => void;
    coinBalance?: number;
}

export const HiddenStoreModal: React.FC<HiddenStoreModalProps> = ({ visible, onClose, coinBalance = 150 }) => {

    const handleBuy = (item: ShopItem) => {
        if (coinBalance >= item.price) {
            haptics.heavy();
            // Trigger generic success feedback visually (omitted for brevity)
            console.log(`Bought ${item.name}`);
        } else {
            haptics.error();
            console.log("Not enough funds");
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Cyberpunk Background - Approximated with dark gradient/color */}
                <View style={[StyleSheet.absoluteFill, styles.cyberBg]} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#06B6D4" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CYBER_VEND_v1.0</Text>
                    <View style={styles.coinBadge}>
                        <Text style={styles.coinText}>🪙 {coinBalance}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.grid}>
                    {SHOP_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemCard}
                            onPress={() => handleBuy(item)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.itemIconContainer}>
                                <Ionicons name={item.icon as any} size={32} color={item.type === 'skin' ? '#F472B6' : '#06B6D4'} />
                            </View>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{item.price} 🪙</Text>
                            <View style={styles.scanLine} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    cyberBg: {
        backgroundColor: '#050505',
        // In a real app, add a subtle grid image or gradient
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#06B6D4',
        backgroundColor: '#09090b',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#06B6D4', // Cyan
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 2,
    },
    coinBadge: {
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#06B6D4',
    },
    coinText: {
        color: '#FCD34D',
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        gap: 16,
    },
    itemCard: {
        width: '47%', // 2-col
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    itemIconContainer: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    itemName: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    itemPrice: {
        color: '#FCD34D',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
