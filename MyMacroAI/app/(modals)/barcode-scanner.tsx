/**
 * BarcodeScannerScreen - Dedicated Barcode Scanner
 * 
 * Scans product barcodes and navigates directly to FoodDetailScreen.
 * Skips the search list for instant product lookup.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { FoodDataService } from '@/src/services/food/FoodDataService';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { MacroCoinIcon } from '@/src/components/ui/MacroCoinIcon';

const { width } = Dimensions.get('window');

export default function BarcodeScannerScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const scanLinePosition = useSharedValue(0);

    useEffect(() => {
        scanLinePosition.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const scanLineStyle = useAnimatedStyle(() => ({
        top: `${scanLinePosition.value * 100}%`,
    }));

    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (!isScanning || isProcessing) return;

        setIsScanning(false);
        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            // Use Hybrid Food Engine to look up barcode
            // Tier 1: Checks local USDA database first
            // Tier 2: Falls back to OpenFoodFacts API
            const food = await FoodDataService.getByBarcode(data);

            if (food) {
                // Found - navigate to food detail
                router.replace({
                    pathname: '/(modals)/food-detail',
                    params: { foodId: food.id },
                } as any);
            } else {
                // Not found in any database - offer Bounty Hunter Protocol
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setTimeout(() => {
                    router.replace({
                        pathname: '/(modals)/food-contribute',
                        params: { barcode: data },
                    } as any);
                }, 1500);
            }
        } catch (error) {
            console.error('[BarcodeScanner] Lookup failed:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            // On error, redirect to manual search
            setTimeout(() => {
                router.replace({
                    pathname: '/(modals)/log-meal',
                } as any);
            }, 1500);
        }
    };

    const handleClose = () => {
        router.back();
    };

    const handleManualSearch = () => {
        router.replace('/(modals)/log-meal' as any);
    };

    // Permission handling
    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="barcode-outline" size={64} color="#8E8E93" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need camera access to scan barcodes
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Camera */}
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                }}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Darkened edges */}
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddle}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scanArea}>
                        {/* Corner brackets */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />

                        {/* Scanning line */}
                        {isScanning && (
                            <Animated.View style={[styles.scanLine, scanLineStyle]}>
                                <LinearGradient
                                    colors={['transparent', '#3B82F6', 'transparent']}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={styles.scanLineGradient}
                                />
                            </Animated.View>
                        )}
                    </View>
                    <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom} />
            </View>

            {/* Header */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Barcode</Text>
                <View style={{ width: 44 }} />
            </SafeAreaView>

            {/* Footer */}
            <SafeAreaView style={styles.footer} edges={['bottom']}>
                {isProcessing ? (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.processingText}>Looking up product...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.instructionText}>
                            Point the camera at a barcode
                        </Text>
                        <TouchableOpacity onPress={handleManualSearch} style={styles.manualButton}>
                            <Ionicons name="search" size={18} color="#FFF" />
                            <Text style={styles.manualButtonText}>Search Manually</Text>
                        </TouchableOpacity>

                        {/* Contribute Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/(modals)/food-contribute' as any)}
                            style={styles.contributeButton}
                        >
                            <View style={styles.contributeContent}>
                                <Text style={styles.contributeTitle}>Can't find what you're looking for?</Text>
                                <View style={styles.contributeRow}>
                                    <Text style={styles.contributeSubtitle}>Add it in 3 easy steps</Text>
                                    <View style={styles.contributeReward}>
                                        <MacroCoinIcon size={14} />
                                        <Text style={styles.rewardText}>+50</Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </>
                )}
            </SafeAreaView>
        </View>
    );
}

const SCAN_AREA_SIZE = width * 0.75;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    // Permission
    permissionContainer: {
        flex: 1,
        backgroundColor: '#0A0A0C',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
        marginTop: SPACING.xl,
    },
    permissionText: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: SPACING.md,
    },
    permissionButton: {
        marginTop: SPACING.xl,
        backgroundColor: '#3B82F6',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.lg,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },

    // Overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
        height: SCAN_AREA_SIZE,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        position: 'relative',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },

    // Corners
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#3B82F6',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },

    // Scan line
    scanLine: {
        position: 'absolute',
        left: 10,
        right: 10,
        height: 3,
    },
    scanLineGradient: {
        flex: 1,
        borderRadius: 2,
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    instructionText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: SPACING.lg,
    },
    manualButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.xl,
        gap: 8,
    },
    manualButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    processingContainer: {
        alignItems: 'center',
    },
    processingText: {
        fontSize: 16,
        color: '#FFF',
        marginTop: SPACING.md,
    },
    contributeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        width: '100%',
    },
    contributeContent: {
        flex: 1,
    },
    contributeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    contributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    contributeSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    contributeReward: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 3,
    },
    rewardText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#F59E0B',
    },
});
