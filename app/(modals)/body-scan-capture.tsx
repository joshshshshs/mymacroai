/**
 * Body Scan Capture Screen - 3-Step guided camera sequence
 * State machine: FRONT -> SIDE -> BACK with ghost overlay guidance
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    runOnJS,
} from 'react-native-reanimated';

import { ScanGhostOverlay, ScanStep } from '@/src/components/features/bodyscan/ScanGhostOverlay';
import { GyroLeveler } from '@/src/components/features/bodyscan/GyroLeveler';
import { ScanReviewModal } from '@/src/components/features/bodyscan/ScanReviewModal';

const { width, height } = Dimensions.get('window');

interface CapturedPhoto {
    uri: string;
    step: ScanStep;
    timestamp: number;
}

const STEP_CONFIG: Record<ScanStep, { instruction: string; voiceGuide: string }> = {
    FRONT: {
        instruction: 'Face the camera.\nFeet shoulder-width apart.\nArms relaxed at sides.',
        voiceGuide: 'Face the camera. Arms at your sides.',
    },
    SIDE: {
        instruction: 'Turn 90° to the right.\nRaise arms to shoulder height.\nLook straight ahead.',
        voiceGuide: 'Turn to the side. Raise your arms.',
    },
    BACK: {
        instruction: 'Turn around.\nFeet shoulder-width apart.\nFlex lats slightly (optional).',
        voiceGuide: 'Turn around. Back to camera.',
    },
};

const STEP_ORDER: ScanStep[] = ['FRONT', 'SIDE', 'BACK'];

export default function BodyScanCaptureScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

    const [permission, requestPermission] = useCameraPermissions();
    const [currentStep, setCurrentStep] = useState<ScanStep>('FRONT');
    const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
    const [isAligned, setIsAligned] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [processing, setProcessing] = useState(false);

    const flashOpacity = useSharedValue(0);

    // Request camera permission
    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    // Play countdown beep
    const playBeep = useCallback(async (isClick: boolean = false) => {
        try {
            // Use haptic as audio fallback
            if (isClick) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        } catch (error) {
            console.warn('Haptic error:', error);
        }
    }, []);

    // Flash animation for capture feedback
    const triggerFlash = useCallback(() => {
        flashOpacity.value = withSequence(
            withTiming(1, { duration: 50 }),
            withTiming(0, { duration: 150 })
        );
    }, []);

    const flashStyle = useAnimatedStyle(() => ({
        opacity: flashOpacity.value,
    }));

    // Handle countdown and capture
    const startCountdown = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // 5 second countdown
        for (let i = 5; i >= 1; i--) {
            setCountdown(i);
            await playBeep(false);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setCountdown(null);
        await capturePhoto();
    }, [currentStep]);

    // Capture photo
    const capturePhoto = useCallback(async () => {
        if (!cameraRef.current) return;

        try {
            await playBeep(true);
            triggerFlash();

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });

            if (photo) {
                const newPhoto: CapturedPhoto = {
                    uri: photo.uri,
                    step: currentStep,
                    timestamp: Date.now(),
                };

                setPhotos(prev => {
                    const filtered = prev.filter(p => p.step !== currentStep);
                    return [...filtered, newPhoto];
                });

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Auto-advance to next step or show review
                const currentIndex = STEP_ORDER.indexOf(currentStep);
                if (currentIndex < STEP_ORDER.length - 1) {
                    setCurrentStep(STEP_ORDER[currentIndex + 1]);
                } else {
                    // All photos captured - show review
                    setTimeout(() => setShowReview(true), 500);
                }
            }
        } catch (error) {
            console.error('Photo capture error:', error);
            Alert.alert('Capture Error', 'Could not take photo. Please try again.');
        }
    }, [currentStep, triggerFlash, playBeep]);

    // Handle retake from review modal
    const handleRetake = useCallback((step: ScanStep) => {
        setShowReview(false);
        setCurrentStep(step);
        setPhotos(prev => prev.filter(p => p.step !== step));
    }, []);

    // Handle process scan
    const handleProcess = useCallback(async () => {
        if (photos.length < 3) {
            Alert.alert('Incomplete', 'Please capture all three photos.');
            return;
        }

        setProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessing(false);
        setShowReview(false);

        // Navigate to results
        router.replace('/(modals)/ai-protocol-result' as any);
    }, [photos, router]);

    // Handle alignment callback
    const handleAlignmentChange = useCallback((aligned: boolean) => {
        setIsAligned(aligned);
    }, []);

    // Close/cancel handler
    const handleClose = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    }, [router]);

    // Permission handling
    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionText}>
                        We need camera access to capture your body scan photos.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backLink} onPress={handleClose}>
                        <Text style={styles.backLinkText}>Go Back</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    const currentConfig = STEP_CONFIG[currentStep];
    const stepIndex = STEP_ORDER.indexOf(currentStep);
    const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Camera View */}
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
            />

            {/* Ghost Overlay */}
            <ScanGhostOverlay step={currentStep} isAligned={isAligned} />

            {/* Flash Effect */}
            <Animated.View
                style={[styles.flashOverlay, flashStyle]}
                pointerEvents="none"
            />

            {/* Top UI */}
            <SafeAreaView style={styles.topUI} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.stepIndicator}>
                        <Text style={styles.stepLabel}>
                            Step {stepIndex + 1} of {STEP_ORDER.length}
                        </Text>
                        <Text style={styles.stepName}>{currentStep} POSE</Text>
                    </View>

                    <View style={styles.closeButton} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                </View>
            </SafeAreaView>

            {/* Bottom UI */}
            <View style={[styles.bottomUI, { paddingBottom: insets.bottom + 20 }]}>
                {/* Gyro Leveler */}
                <GyroLeveler onAligned={handleAlignmentChange} threshold={8} />

                {/* Instructions */}
                <Animated.View
                    key={currentStep}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                    style={styles.instructionContainer}
                >
                    <Text style={styles.instructionText}>{currentConfig.instruction}</Text>
                </Animated.View>

                {/* Capture Button / Countdown */}
                <View style={styles.captureContainer}>
                    {countdown !== null ? (
                        <View style={styles.countdownContainer}>
                            <Animated.Text
                                key={countdown}
                                entering={FadeIn.duration(100)}
                                style={styles.countdownText}
                            >
                                {countdown}
                            </Animated.Text>
                            <Text style={styles.countdownLabel}>GET IN POSITION</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={startCountdown}
                            activeOpacity={0.8}
                        >
                            <View style={styles.captureOuter}>
                                <View style={[
                                    styles.captureInner,
                                    isAligned && styles.captureInnerAligned
                                ]} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Photo Thumbnails */}
                <View style={styles.thumbnailRow}>
                    {STEP_ORDER.map((step) => {
                        const photo = photos.find(p => p.step === step);
                        const isActive = step === currentStep;
                        return (
                            <TouchableOpacity
                                key={step}
                                style={[
                                    styles.thumbnail,
                                    isActive && styles.thumbnailActive,
                                    photo && styles.thumbnailComplete,
                                ]}
                                onPress={() => photo && setCurrentStep(step)}
                            >
                                {photo ? (
                                    <Ionicons name="checkmark" size={16} color="#10B981" />
                                ) : (
                                    <Text style={styles.thumbnailLabel}>
                                        {step.charAt(0)}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Review Modal */}
            <ScanReviewModal
                visible={showReview}
                photos={photos}
                onRetake={handleRetake}
                onProcess={handleProcess}
                onClose={() => setShowReview(false)}
                processing={processing}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    flashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFF',
    },
    topUI: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    closeButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIndicator: {
        alignItems: 'center',
    },
    stepLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 0.5,
    },
    stepName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 1,
    },
    progressContainer: {
        paddingHorizontal: 24,
        marginTop: 4,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF4500',
        borderRadius: 1.5,
    },
    bottomUI: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    instructionContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginBottom: 24,
        maxWidth: width - 48,
    },
    instructionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#FFF',
        textAlign: 'center',
        lineHeight: 22,
    },
    captureContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    captureInnerAligned: {
        backgroundColor: '#FF4500',
    },
    countdownContainer: {
        alignItems: 'center',
    },
    countdownText: {
        fontSize: 72,
        fontWeight: '800',
        color: '#FF4500',
    },
    countdownLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 1,
        marginTop: -4,
    },
    thumbnailRow: {
        flexDirection: 'row',
        gap: 12,
    },
    thumbnail: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailActive: {
        borderColor: '#FF4500',
    },
    thumbnailComplete: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
    },
    thumbnailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.4)',
    },
    // Permission states
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 20,
        marginBottom: 12,
    },
    permissionText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#FF4500',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    backLink: {
        marginTop: 16,
        padding: 12,
    },
    backLinkText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});
