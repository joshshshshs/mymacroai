/**
 * GhostCamera - Camera component with ghost overlay alignment
 * Features:
 * - Ghost overlay from previous progress photo
 * - Gyro-lock alignment indicator
 * - Hands-free countdown timer
 * - Capture with haptic feedback
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { useGyroLock } from '../../../../hooks/useGyroLock';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GhostCameraProps {
    ghostImageUri?: string;
    onCapture: (photoUri: string) => void;
    onCancel: () => void;
}

export const GhostCamera: React.FC<GhostCameraProps> = ({
    ghostImageUri,
    onCapture,
    onCancel,
}) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    const { isAligned, deviation, startListening, stopListening } = useGyroLock({
        tolerance: 5,
        hapticFeedback: true,
    });

    // Animation values
    const countdownScale = useSharedValue(1);
    const alignmentGlow = useSharedValue(0);

    useEffect(() => {
        startListening();
        return () => stopListening();
    }, [startListening, stopListening]);

    useEffect(() => {
        alignmentGlow.value = withTiming(isAligned ? 1 : 0, { duration: 200 });
    }, [isAligned, alignmentGlow]);

    const countdownStyle = useAnimatedStyle(() => ({
        transform: [{ scale: countdownScale.value }],
        opacity: countdown !== null ? 1 : 0,
    }));

    const alignmentIndicatorStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(16, 185, 129, ${alignmentGlow.value})`,
        shadowOpacity: alignmentGlow.value * 0.5,
    }));

    const startCountdown = useCallback(() => {
        if (isCapturing) return;

        setIsCapturing(true);
        setCountdown(3);

        const tick = (count: number) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            countdownScale.value = withSequence(
                withSpring(1.3, { damping: 8, stiffness: 200 }),
                withSpring(1, { damping: 10, stiffness: 180 })
            );

            if (count > 1) {
                setTimeout(() => {
                    setCountdown(count - 1);
                    tick(count - 1);
                }, 1000);
            } else {
                setTimeout(async () => {
                    setCountdown(null);
                    await capturePhoto();
                }, 1000);
            }
        };

        tick(3);
    }, [isCapturing, countdownScale]);

    const capturePhoto = async () => {
        if (!cameraRef.current) return;

        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.9,
            });

            if (photo?.uri) {
                onCapture(photo.uri);
            }
        } catch (error) {
            console.error('Camera capture failed:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsCapturing(false);
        }
    };

    if (!permission?.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.5)" />
                <Text style={styles.permissionText}>Camera access required</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera Preview */}
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="front"
                />

                {/* Ghost Overlay */}
                {ghostImageUri && (
                    <Image
                        source={{ uri: ghostImageUri }}
                        style={styles.ghostOverlay}
                        resizeMode="cover"
                    />
                )}

                {/* Alignment Frame */}
                <Animated.View style={[styles.alignmentFrame, alignmentIndicatorStyle]}>
                    {/* Body outline guides */}
                    <View style={styles.bodyGuide}>
                        <Ionicons
                            name="body-outline"
                            size={280}
                            color={isAligned ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 69, 0, 0.3)'}
                        />
                    </View>
                </Animated.View>

                {/* Level Indicator */}
                <View style={styles.levelContainer}>
                    <View style={styles.levelTrack}>
                        <View
                            style={[
                                styles.levelBubble,
                                {
                                    left: `${50 + Math.max(-40, Math.min(40, deviation.roll * 2))}%`,
                                    backgroundColor: isAligned ? '#10B981' : '#FF4500',
                                }
                            ]}
                        />
                        <View style={styles.levelCenter} />
                    </View>
                    <Text style={[styles.levelText, isAligned && styles.levelTextAligned]}>
                        {isAligned ? 'ALIGNED' : 'TILT TO ALIGN'}
                    </Text>
                </View>

                {/* Countdown Overlay */}
                {countdown !== null && (
                    <View style={styles.countdownOverlay}>
                        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                        <Animated.Text style={[styles.countdownText, countdownStyle]}>
                            {countdown}
                        </Animated.Text>
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.captureButton, !isAligned && styles.captureButtonDisabled]}
                    onPress={startCountdown}
                    disabled={isCapturing || !isAligned}
                >
                    <LinearGradient
                        colors={isAligned ? ['#FF4500', '#FF6A00'] : ['#666', '#444']}
                        style={styles.captureButtonInner}
                    >
                        <View style={styles.captureButtonRing} />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.timerButton}>
                    <Ionicons name="timer-outline" size={24} color="#FFF" />
                    <Text style={styles.timerText}>3s</Text>
                </TouchableOpacity>
            </View>

            {/* Helper Text */}
            <Text style={styles.helperText}>
                {isAligned
                    ? 'Perfect! Tap capture when ready'
                    : 'Hold phone steady and align with ghost'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    ghostOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    alignmentFrame: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 3,
        borderRadius: 24,
        borderColor: 'rgba(255, 69, 0, 0.5)',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
    },
    bodyGuide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelContainer: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    levelTrack: {
        width: '80%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        position: 'relative',
    },
    levelBubble: {
        position: 'absolute',
        top: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: -8,
    },
    levelCenter: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 2,
        marginLeft: -1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    levelText: {
        marginTop: 12,
        fontSize: 12,
        fontWeight: '700',
        color: '#FF4500',
        letterSpacing: 2,
    },
    levelTextAligned: {
        color: '#10B981',
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countdownText: {
        fontSize: 120,
        fontWeight: '900',
        color: '#FFF',
        textShadowColor: 'rgba(255, 69, 0, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 24,
        paddingHorizontal: 40,
    },
    cancelButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    captureButtonDisabled: {
        opacity: 0.5,
    },
    captureButtonInner: {
        flex: 1,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonRing: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    timerButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFF',
        marginTop: 2,
    },
    helperText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        paddingBottom: 16,
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: '#000',
    },
    permissionText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    permissionButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#FF4500',
        borderRadius: 12,
    },
    permissionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
});
