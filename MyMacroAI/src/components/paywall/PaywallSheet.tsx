import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// UI
import { GlassButton } from '../ui/GlassButton';

// Services
import { revenueCatService } from '@/src/services/paywall/RevenueCat';
import { founderService } from '@/src/services/founder/FounderService';
import { useUserStore } from '@/src/store/UserStore';
import { useTabBarStore } from '@/src/store/tabBarStore';
import { haptics } from '@/src/utils/haptics';

interface PaywallSheetProps {
    visible: boolean;
    onClose: () => void;
}

export const PaywallSheet: React.FC<PaywallSheetProps> = ({ visible, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { setProStatus, setFounderStatus } = useUserStore();
    const { hideTabBar, showTabBar } = useTabBarStore();

    // Hide tab bar when sheet opens, show when it closes
    useEffect(() => {
        if (visible) {
            hideTabBar();
        } else {
            showTabBar();
        }
    }, [visible, hideTabBar, showTabBar]);

    const handlePurchase = async () => {
        setIsLoading(true);
        haptics.selection();

        try {
            const offerings = await revenueCatService.getOfferings();

            if (offerings && offerings.availablePackages.length > 0) {
                const packageToBuy = offerings.availablePackages[0];
                const result = await revenueCatService.purchasePackage(packageToBuy);

                if (result.success) {
                    haptics.success();
                    setProStatus(true);

                    // Claim Founder Status
                    const dummyEmail = "user@example.com";
                    await founderService.claimFounderStatus(dummyEmail);

                    Alert.alert(
                        "WELCOME FOUNDER",
                        "You have joined the Inner Circle. Check your email for your unique ID.",
                        [{ text: "Let's Go", onPress: onClose }]
                    );
                } else if (result.userCancelled) {
                    // User cancelled - no alert needed
                } else {
                    haptics.error();
                    Alert.alert("Purchase Failed", result.error || "Please try again.");
                }
            } else {
                Alert.alert("Setup Required", "Please configure RevenueCat offerings.");
            }

        } catch (error) {
            haptics.error();
            Alert.alert("Error", "Transaction failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async () => {
        setIsLoading(true);
        haptics.selection();

        const result = await revenueCatService.restorePurchases();
        setIsLoading(false);

        if (result.success && result.hasActiveSubscription) {
            haptics.success();
            setProStatus(true);
            Alert.alert("Restored", "Welcome back, Pro.");
            onClose();
        } else if (result.success) {
            Alert.alert("Nothing to Restore", "No active subscriptions found.");
        } else {
            haptics.error();
            Alert.alert("Restore Failed", result.error || "Please try again.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.container}>
                <BlurView intensity={80} style={styles.blur} tint="dark">
                    <LinearGradient
                        colors={['rgba(6, 182, 212, 0.1)', 'rgba(15, 23, 42, 0.9)']}
                        style={styles.gradient}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Ionicons name="diamond" size={64} color="#22D3EE" />
                            <Text style={styles.title}>MYMACRO AI <Text style={styles.proText}>PRO</Text></Text>

                            <View style={styles.features}>
                                <FeatureItem icon="scan" text="Unlimited Hunter Vision" />
                                <FeatureItem icon="infinite" text="Unlimited AI Logging" />
                                <FeatureItem icon="analytics" text="Advanced Biometrics" />
                                <FeatureItem icon="star" text="Founder's Club Access" />
                            </View>

                            <View style={styles.spacer} />

                            <GlassButton
                                onPress={handlePurchase}
                                style={styles.mainButton}
                            >
                                <Text style={styles.buttonText}>
                                    {isLoading ? "PROCESSING..." : "JOIN THE INNER CIRCLE"}
                                </Text>
                            </GlassButton>
                            <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
                                <Text style={styles.restoreText}>Restore Purchases</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </BlurView>
            </View>
        </Modal>
    );
};

const FeatureItem = ({ icon, text }: { icon: any, text: string }) => (
    <View style={styles.featureRow}>
        <Ionicons name={icon} size={20} color="#22D3EE" />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blur: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: 'flex-end',
        marginTop: 40,
    },
    closeBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginTop: 20,
        marginBottom: 40,
        letterSpacing: 1,
    },
    proText: {
        color: '#22D3EE',
    },
    features: {
        width: '100%',
        gap: 20,
        marginBottom: 40,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    featureText: {
        color: '#E2E8F0',
        fontSize: 16,
        fontWeight: '600',
    },
    spacer: {
        flex: 1,
    },
    mainButton: {
        width: '100%',
        height: 60,
        backgroundColor: '#0891B2',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    restoreBtn: {
        marginTop: 16,
        padding: 10,
    },
    restoreText: {
        color: '#94A3B8',
        fontSize: 14,
    }
});
