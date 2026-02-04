import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

// UI
import { GlassButton } from '@/src/components/ui/GlassButton';

// Utils
import { haptics } from '@/src/utils/haptics';

const { width, height } = Dimensions.get('window');

interface HunterCameraProps {
    onClose: () => void;
    onScanSuccess: (data: any) => void;
}

export const HunterCamera: React.FC<HunterCameraProps> = ({ onClose, onScanSuccess }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [mode, setMode] = useState<'barcode' | 'vision'>('barcode');
    const cameraRef = useRef<CameraView>(null);

    // Animation for Reticle
    const reticleScale = useSharedValue(1);
    const reticleOpacity = useSharedValue(1);

    useEffect(() => {
        // Breathing animation for reticle
        reticleScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const reticleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: reticleScale.value }],
        opacity: reticleOpacity.value
    }));

    if (!permission) {
        // Camera permissions are still loading
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Hunter Vision requires camera access.</Text>
                <GlassButton onPress={requestPermission} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#fff' }}>Grant Permission</Text>
                </GlassButton>
                <TouchableOpacity onPress={onClose} style={{ marginTop: 30 }}>
                    <Text style={{ color: '#94A3B8' }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned || mode !== 'barcode') return;

        setScanned(true);
        haptics.heavy();

        // Mock OpenFoodFacts Lookup
        Alert.alert(
            "Barcode Detected",
            `Identity: Oreo Cookies\nCalories: 140kcal\nData: ${data}`,
            [
                {
                    text: "Log It", onPress: () => {
                        onScanSuccess({ name: "Oreo Cookies", calories: 140, type: 'barcode' });
                        setScanned(false);
                    }
                },
                { text: "Cancel", style: "cancel", onPress: () => setScanned(false) }
            ]
        );
    };

    const handleVisionSnap = async () => {
        haptics.medium();
        if (cameraRef.current) {
            try {
                // In a real app, we capture the photo and send to Gemini
                // const photo = await cameraRef.current.takePictureAsync({ base64: true });

                // Mock Gemini Analysis
                haptics.success();
                Alert.alert(
                    "Hunter Vision Analysis",
                    "Detected: Grilled Salmon Salad\nEst. Calories: 450kcal\nProtein: 35g",
                    [
                        { text: "Log It", onPress: () => onScanSuccess({ name: "Grilled Salmon Salad", calories: 450, type: 'vision' }) },
                        { text: "Retry", style: "cancel" }
                    ]
                );
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={mode === 'barcode' ? handleBarcodeScanned : undefined}
                ref={cameraRef}
            >
                {/* HUD Overlay */}
                <View style={styles.overlay}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.modePill}>
                            <Text style={styles.modeText}>HUNTER_VISION_v1.0</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="flash-off" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Reticle Area */}
                    <View style={styles.reticleContainer}>
                        <Animated.View style={[styles.reticle, reticleStyle]}>
                            {/* Corner Markers */}
                            <View style={[styles.corner, styles.tl]} />
                            <View style={[styles.corner, styles.tr]} />
                            <View style={[styles.corner, styles.bl]} />
                            <View style={[styles.corner, styles.br]} />

                            {/* Scanning Line (if barcode) */}
                            {mode === 'barcode' && (
                                <View style={styles.scanLine} />
                            )}
                        </Animated.View>
                        <Text style={styles.hintText}>
                            {mode === 'barcode' ? "Align barcode within frame" : "Capture food for AI analysis"}
                        </Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        {/* Mode Switcher */}
                        <View style={styles.modeSwitch}>
                            <TouchableOpacity
                                style={[styles.modeOption, mode === 'barcode' && styles.modeActive]}
                                onPress={() => { haptics.selection(); setMode('barcode'); }}
                            >
                                <Ionicons name="barcode-outline" size={20} color={mode === 'barcode' ? '#06B6D4' : '#64748B'} />
                                <Text style={[styles.modeLabel, mode === 'barcode' && styles.modeLabelActive]}>SCAN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modeOption, mode === 'vision' && styles.modeActive]}
                                onPress={() => { haptics.selection(); setMode('vision'); }}
                            >
                                <Ionicons name="eye-outline" size={20} color={mode === 'vision' ? '#F472B6' : '#64748B'} />
                                <Text style={[styles.modeLabel, mode === 'vision' && styles.modeLabelActive]}>VISION</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Capture Button (Vision Mode) */}
                        {mode === 'vision' && (
                            <TouchableOpacity onPress={handleVisionSnap} style={styles.captureButton}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>
                        )}
                        {mode === 'barcode' && <View style={{ height: 80 }} />}
                    </View>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        color: '#F1F5F9',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 50,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight dim
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modePill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.5)',
    },
    modeText: {
        color: '#06B6D4',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    reticleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    reticle: {
        width: width * 0.7,
        height: width * 0.7,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#06B6D4',
        borderWidth: 2,
    },
    tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
    tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
    bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
    br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#F472B6',
        opacity: 0.8,
    },
    hintText: {
        color: '#E2E8F0',
        marginTop: 20,
        fontSize: 14,
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    controls: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    modeSwitch: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 30,
        padding: 4,
        marginBottom: 30,
    },
    modeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,
        gap: 6,
    },
    modeActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    modeLabel: {
        color: '#64748B',
        fontWeight: '700',
        fontSize: 12,
    },
    modeLabelActive: {
        color: '#F1F5F9',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
    },
});
