/**
 * FoodContributeScreen - Database Contribution 3-Step Wizard
 * 
 * Users scan missing foods to update the database and earn MacroCoins.
 * Steps: PACKAGING → LABEL → BARCODE → UPLOADING → SUCCESS
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withRepeat,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useUserStore } from '@/src/store/UserStore';
import { MacroCoinIcon } from '@/src/components/ui/MacroCoinIcon';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width, height } = Dimensions.get('window');

type CaptureStep = 'PACKAGING' | 'LABEL' | 'BARCODE' | 'UPLOADING' | 'SUCCESS';

interface StepConfig {
    title: string;
    subtitle: string;
    icon: string;
    guideType: 'rectangle' | 'grid' | 'barcode';
}

const STEP_CONFIG: Record<Exclude<CaptureStep, 'UPLOADING' | 'SUCCESS'>, StepConfig> = {
    PACKAGING: {
        title: 'Capture the Front',
        subtitle: 'Center the product name in the frame',
        icon: 'cube-outline',
        guideType: 'rectangle',
    },
    LABEL: {
        title: 'Nutrition Label',
        subtitle: 'Capture the nutrition facts grid',
        icon: 'grid-outline',
        guideType: 'grid',
    },
    BARCODE: {
        title: 'Scan Barcode',
        subtitle: 'Point at the product barcode',
        icon: 'barcode-outline',
        guideType: 'barcode',
    },
};

// ============================================================================
// CAPTURE GUIDE OVERLAY
// ============================================================================

const CaptureGuide: React.FC<{ type: 'rectangle' | 'grid' | 'barcode' }> = ({ type }) => {
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    if (type === 'rectangle') {
        return (
            <Animated.View style={[styles.guideOverlay, pulseStyle]}>
                <View style={styles.rectangleGuide}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                </View>
            </Animated.View>
        );
    }

    if (type === 'grid') {
        return (
            <Animated.View style={[styles.guideOverlay, pulseStyle]}>
                <View style={styles.gridGuide}>
                    <View style={styles.gridLine} />
                    <View style={[styles.gridLine, styles.gridLineVertical]} />
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                </View>
            </Animated.View>
        );
    }

    // Barcode
    return (
        <Animated.View style={[styles.guideOverlay, pulseStyle]}>
            <View style={styles.barcodeGuide}>
                <View style={styles.barcodeLine} />
            </View>
        </Animated.View>
    );
};

// ============================================================================
// SUCCESS COIN ANIMATION
// ============================================================================

const SuccessAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const coinScale = useSharedValue(0);
    const coinRotate = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Coin appears and spins
        coinScale.value = withSpring(1, { damping: 8, stiffness: 100 });
        coinRotate.value = withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            3,
            false
        );

        // Text fades in
        setTimeout(() => {
            textOpacity.value = withTiming(1, { duration: 500 });
        }, 500);

        // Complete after animation
        setTimeout(() => {
            onComplete();
        }, 4000);
    }, []);

    const coinStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: coinScale.value },
            { rotateY: `${coinRotate.value}deg` },
        ],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <View style={styles.successContainer}>
            <LinearGradient
                colors={['#0A0A0C', '#1A1A1E']}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View style={[styles.coinContainer, coinStyle]}>
                <MacroCoinIcon size={120} />
            </Animated.View>

            <Animated.View style={[styles.successTextContainer, textStyle]}>
                <Text style={styles.successTitle}>Database Updated!</Text>
                <View style={styles.rewardBadge}>
                    <MacroCoinIcon size={24} />
                    <Text style={styles.rewardText}>+50 Coins Added</Text>
                </View>
            </Animated.View>
        </View>
    );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function FoodContributeScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [step, setStep] = useState<CaptureStep>('PACKAGING');
    const cameraRef = useRef<CameraView>(null);
    const { addCoins } = useUserStore();

    const captureScale = useSharedValue(1);

    // Handle capture
    const handleCapture = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        captureScale.value = withSequence(
            withSpring(0.9, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );

        // Simulate capture
        if (step === 'PACKAGING') {
            setTimeout(() => setStep('LABEL'), 800);
        } else if (step === 'LABEL') {
            setTimeout(() => setStep('BARCODE'), 800);
        } else if (step === 'BARCODE') {
            setStep('UPLOADING');
            // Simulate upload
            setTimeout(() => {
                addCoins(50);
                setStep('SUCCESS');
            }, 1500);
        }
    };

    const captureButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: captureScale.value }],
    }));

    const handleClose = () => {
        router.back();
    };

    const handleSuccessComplete = () => {
        router.back();
    };

    // Permission handling
    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="camera-outline" size={64} color="#8E8E93" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need camera access to scan food products
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Success state
    if (step === 'SUCCESS') {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SuccessAnimation onComplete={handleSuccessComplete} />
            </View>
        );
    }

    // Uploading state
    if (step === 'UPLOADING') {
        return (
            <View style={styles.uploadingContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#FF5C00" />
                <Text style={styles.uploadingText}>Processing...</Text>
                <Text style={styles.uploadingSubtext}>Extracting nutrition data</Text>
            </View>
        );
    }

    const config = STEP_CONFIG[step];

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Camera */}
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
            />

            {/* Overlay Guide */}
            <CaptureGuide type={config.guideType} />

            {/* Header */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>

                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                    {['PACKAGING', 'LABEL', 'BARCODE'].map((s, i) => (
                        <View
                            key={s}
                            style={[
                                styles.stepDot,
                                step === s && styles.stepDotActive,
                                ['LABEL', 'BARCODE'].indexOf(step) > i && styles.stepDotComplete,
                            ]}
                        />
                    ))}
                </View>

                <View style={{ width: 44 }} />
            </SafeAreaView>

            {/* Bottom Controls */}
            <SafeAreaView style={styles.bottomControls} edges={['bottom']}>
                <View style={styles.instructionCard}>
                    <Ionicons name={config.icon as any} size={24} color="#FF5C00" />
                    <View style={styles.instructionText}>
                        <Text style={styles.instructionTitle}>{config.title}</Text>
                        <Text style={styles.instructionSubtitle}>{config.subtitle}</Text>
                    </View>
                </View>

                <Animated.View style={captureButtonStyle}>
                    <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

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
        backgroundColor: '#FF5C00',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.lg,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    stepIndicator: {
        flexDirection: 'row',
        gap: 8,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    stepDotActive: {
        backgroundColor: '#FF5C00',
        width: 24,
    },
    stepDotComplete: {
        backgroundColor: '#10B981',
    },

    // Guide Overlay
    guideOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rectangleGuide: {
        width: width * 0.8,
        height: width * 0.5,
        position: 'relative',
    },
    gridGuide: {
        width: width * 0.75,
        height: width * 0.9,
        position: 'relative',
    },
    barcodeGuide: {
        width: width * 0.85,
        height: 120,
        borderWidth: 2,
        borderColor: 'rgba(255,92,0,0.6)',
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    barcodeLine: {
        width: '90%',
        height: 2,
        backgroundColor: '#FF5C00',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#FF5C00',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    gridLine: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,92,0,0.3)',
        top: '50%',
    },
    gridLineVertical: {
        width: 1,
        height: '100%',
        left: '50%',
        top: 0,
    },

    // Bottom Controls
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: SPACING.xl,
    },
    instructionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    instructionText: {
        alignItems: 'flex-start',
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    instructionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
    },

    // Uploading
    uploadingContainer: {
        flex: 1,
        backgroundColor: '#0A0A0C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        marginTop: SPACING.xl,
    },
    uploadingSubtext: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: SPACING.sm,
    },

    // Success
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coinContainer: {
        marginBottom: SPACING.xl,
    },
    successTextContainer: {
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: SPACING.lg,
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.xl,
        gap: SPACING.sm,
    },
    rewardText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F59E0B',
    },
});
