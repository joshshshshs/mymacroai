import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming, FadeIn } from 'react-native-reanimated';

// Store & Utils
import { useUserStore, useMacroCoins } from '@/src/store/UserStore';
import { useTabBarStore } from '@/src/store/tabBarStore';
import { haptics } from '@/src/utils/haptics';

interface ShopItem {
    id: string;
    name: string;
    price: number;
    icon: string;
    type: 'skin' | 'freeze' | 'intel';
    description: string;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 'skin_neon', name: 'Neon Samurai', price: 500, icon: 'color-palette-outline', type: 'skin', description: 'Cyberpunk theme with neon accents' },
    { id: 'skin_stealth', name: 'Stealth Ops', price: 500, icon: 'contrast-outline', type: 'skin', description: 'Dark tactical minimal theme' },
    { id: 'freeze_1', name: '1-Day Freeze', price: 100, icon: 'snow-outline', type: 'freeze', description: 'Protect your streak for 1 day' },
    { id: 'freeze_3', name: '3-Day Freeze', price: 250, icon: 'snow', type: 'freeze', description: 'Protect your streak for 3 days' },
    { id: 'intel_report', name: 'Deep Intel', price: 1000, icon: 'document-text-outline', type: 'intel', description: 'Detailed AI analysis of your progress' },
];

interface HiddenStoreModalProps {
    visible: boolean;
    onClose: () => void;
}

export const HiddenStoreModal: React.FC<HiddenStoreModalProps> = ({ visible, onClose }) => {
    const coinBalance = useMacroCoins();
    const purchaseItem = useUserStore(state => state.purchaseItem);
    const addStreakFreeze = useUserStore(state => state.addStreakFreeze);
    const { hideTabBar, showTabBar } = useTabBarStore();

    // Animated scan line
    const scanY = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            hideTabBar();
            scanY.value = withRepeat(
                withSequence(
                    withTiming(100, { duration: 2000 }),
                    withTiming(0, { duration: 2000 })
                ),
                -1,
                false
            );
        } else {
            showTabBar();
        }
    }, [visible, hideTabBar, showTabBar, scanY]);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanY.value }],
    }));

    const handleBuy = (item: ShopItem) => {
        if (coinBalance < item.price) {
            haptics.error();
            Alert.alert(
                'Insufficient Funds',
                `You need ${item.price - coinBalance} more coins to purchase ${item.name}.`,
                [{ text: 'OK' }]
            );
            return;
        }

        // Confirm purchase
        Alert.alert(
            `Purchase ${item.name}?`,
            `This will cost ${item.price} MacroCoins.\n\n${item.description}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Buy',
                    style: 'default',
                    onPress: () => {
                        const success = purchaseItem({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            type: item.type,
                            isPurchased: false,
                        });

                        if (success) {
                            haptics.success();

                            // Handle item-specific logic
                            if (item.type === 'freeze') {
                                const days = item.id === 'freeze_1' ? 1 : 3;
                                const expiresAt = new Date();
                                expiresAt.setDate(expiresAt.getDate() + 30); // Freeze valid for 30 days

                                addStreakFreeze({
                                    id: `freeze_${Date.now()}`,
                                    days,
                                    purchasedAt: new Date().toISOString(),
                                    expiresAt: expiresAt.toISOString(),
                                    used: false,
                                });
                            }

                            Alert.alert(
                                'Purchase Complete',
                                `${item.name} has been added to your inventory.`,
                                [{ text: 'Nice!' }]
                            );
                        } else {
                            haptics.error();
                            Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Cyberpunk Background */}
                <View style={[StyleSheet.absoluteFill, styles.cyberBg]} />

                {/* Animated Scan Line */}
                <Animated.View style={[styles.scanLineOverlay, scanLineStyle]} pointerEvents="none" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#06B6D4" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CYBER_VEND_v1.0</Text>
                    <View style={styles.coinBadge}>
                        <Text style={styles.coinText}>{coinBalance}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                    {SHOP_ITEMS.map((item, index) => {
                        const canAfford = coinBalance >= item.price;

                        return (
                            <Animated.View
                                key={item.id}
                                entering={FadeIn.delay(index * 100).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.itemCard,
                                        !canAfford && styles.itemCardDisabled
                                    ]}
                                    onPress={() => handleBuy(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[
                                        styles.itemIconContainer,
                                        { borderColor: item.type === 'skin' ? '#F472B6' : '#06B6D4' }
                                    ]}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={32}
                                            color={item.type === 'skin' ? '#F472B6' : '#06B6D4'}
                                        />
                                    </View>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={[
                                        styles.itemPrice,
                                        !canAfford && styles.itemPriceDisabled
                                    ]}>
                                        {item.price}
                                    </Text>
                                    <View style={styles.cardScanLine} />
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
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
    },
    scanLineOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(6, 182, 212, 0.3)',
        zIndex: 10,
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
        color: '#06B6D4',
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 2,
    },
    coinBadge: {
        backgroundColor: 'rgba(252, 211, 77, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    coinText: {
        color: '#FCD34D',
        fontWeight: '700',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        gap: 16,
        paddingBottom: 100,
    },
    itemCard: {
        width: 160,
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    itemCardDisabled: {
        opacity: 0.5,
    },
    itemIconContainer: {
        marginBottom: 12,
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 50,
        borderWidth: 1,
    },
    itemName: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    itemPrice: {
        color: '#FCD34D',
        fontSize: 16,
        fontWeight: '800',
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    itemPriceDisabled: {
        color: '#6B7280',
    },
    cardScanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
    },
});
