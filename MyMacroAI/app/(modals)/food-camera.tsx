/**
 * FoodCameraScreen - AI-Powered Food Photo Estimation
 *
 * Take a photo of your food and get instant calorie/macro estimates.
 * Uses Gemini Vision API for accurate food recognition.
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';

import { useUserStore } from '@/src/store/UserStore';
import { geminiService } from '@/src/services/ai/GeminiService';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width, height } = Dimensions.get('window');

const COLORS = {
    vitaminOrange: '#FF5C00',
    neonOrange: '#FF9E00',
    success: '#22C55E',
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
};

type AnalysisState = 'camera' | 'analyzing' | 'result';

interface FoodAnalysis {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export default function FoodCameraScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ mealType?: string }>();
    const mealType = params.mealType || 'snacks';

    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [state, setState] = useState<AnalysisState>('camera');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Pulsing animation for capture button
    const pulseScale = useSharedValue(1);

    React.useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: true,
            });

            if (photo?.uri) {
                setCapturedImage(photo.uri);
                setState('analyzing');

                // Analyze with AI
                if (photo.base64) {
                    await analyzeFood(photo.base64);
                } else {
                    // Read base64 from file
                    const base64 = await FileSystem.readAsStringAsync(photo.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    await analyzeFood(base64);
                }
            }
        } catch (err) {
            if (__DEV__) console.error('[FoodCamera] Capture error:', err);
            setError('Failed to capture photo. Please try again.');
            setState('camera');
        }
    };

    const analyzeFood = async (base64: string) => {
        try {
            const result = await geminiService.analyzeVision(base64);

            if (result && result.name) {
                setAnalysis({
                    name: result.name || 'Unknown Food',
                    calories: result.calories || 0,
                    protein: result.protein || 0,
                    carbs: result.carbs || 0,
                    fats: result.fats || 0,
                });
                setState('result');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                throw new Error('Could not identify food');
            }
        } catch (err) {
            if (__DEV__) console.error('[FoodCamera] Analysis error:', err);
            setError('Could not identify this food. Try a clearer photo.');
            setState('camera');
            setCapturedImage(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleLogFood = () => {
        if (!analysis) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        const { logFood } = useUserStore.getState();
        const normalizedMealType = (['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)
            ? mealType
            : 'snacks') as 'breakfast' | 'lunch' | 'dinner' | 'snacks';

        logFood(
            analysis.calories,
            analysis.protein,
            analysis.carbs,
            analysis.fats,
            analysis.name,
            normalizedMealType
        );

        router.back();
    };

    const handleRetake = () => {
        Haptics.selectionAsync();
        setCapturedImage(null);
        setAnalysis(null);
        setError(null);
        setState('camera');
    };

    const handleClose = () => {
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
                    We need camera access to analyze your food photos
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

            {/* Camera / Captured Image */}
            {state === 'camera' && (
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                />
            )}

            {(state === 'analyzing' || state === 'result') && capturedImage && (
                <Image
                    source={{ uri: capturedImage }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            )}

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Header */}
                <SafeAreaView style={styles.header} edges={['top']}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Photo Estimate</Text>
                    <View style={{ width: 44 }} />
                </SafeAreaView>

                {/* Center Guide (Camera mode only) */}
                {state === 'camera' && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        style={styles.guideContainer}
                    >
                        <View style={styles.guideFrame}>
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                        <Text style={styles.guideText}>Center your food in the frame</Text>
                    </Animated.View>
                )}

                {/* Analyzing State */}
                {state === 'analyzing' && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        style={styles.analyzingContainer}
                    >
                        <View style={styles.analyzingCard}>
                            <ActivityIndicator size="large" color={COLORS.vitaminOrange} />
                            <Text style={styles.analyzingTitle}>Analyzing Food...</Text>
                            <Text style={styles.analyzingSubtitle}>AI is estimating calories and macros</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Result State */}
                {state === 'result' && analysis && (
                    <Animated.View
                        entering={FadeInDown.springify()}
                        style={[styles.resultContainer, { paddingBottom: insets.bottom + SPACING.md }]}
                    >
                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <View style={styles.resultIconBg}>
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                                </View>
                                <View style={styles.resultHeaderText}>
                                    <Text style={styles.resultFoodName}>{analysis.name}</Text>
                                    <Text style={styles.resultSubtitle}>AI Estimated</Text>
                                </View>
                            </View>

                            {/* Macro Grid */}
                            <View style={styles.macroGrid}>
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroValue, { color: COLORS.vitaminOrange }]}>
                                        {analysis.calories}
                                    </Text>
                                    <Text style={styles.macroLabel}>kcal</Text>
                                </View>
                                <View style={styles.macroDivider} />
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroValue, { color: COLORS.protein }]}>
                                        {analysis.protein}g
                                    </Text>
                                    <Text style={styles.macroLabel}>Protein</Text>
                                </View>
                                <View style={styles.macroDivider} />
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroValue, { color: COLORS.carbs }]}>
                                        {analysis.carbs}g
                                    </Text>
                                    <Text style={styles.macroLabel}>Carbs</Text>
                                </View>
                                <View style={styles.macroDivider} />
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroValue, { color: COLORS.fats }]}>
                                        {analysis.fats}g
                                    </Text>
                                    <Text style={styles.macroLabel}>Fat</Text>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.resultActions}>
                                <TouchableOpacity
                                    style={styles.retakeButton}
                                    onPress={handleRetake}
                                >
                                    <Ionicons name="camera-reverse-outline" size={20} color="#FFF" />
                                    <Text style={styles.retakeButtonText}>Retake</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.logButton}
                                    onPress={handleLogFood}
                                >
                                    <LinearGradient
                                        colors={[COLORS.vitaminOrange, COLORS.neonOrange]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.logButtonGradient}
                                    >
                                        <Ionicons name="add-circle" size={20} color="#FFF" />
                                        <Text style={styles.logButtonText}>Log Food</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Footer - Capture Button (Camera mode only) */}
                {state === 'camera' && (
                    <SafeAreaView style={styles.footer} edges={['bottom']}>
                        {error && (
                            <Animated.Text
                                entering={FadeIn}
                                exiting={FadeOut}
                                style={styles.errorText}
                            >
                                {error}
                            </Animated.Text>
                        )}

                        <TouchableOpacity
                            style={styles.captureButtonOuter}
                            onPress={handleCapture}
                            activeOpacity={0.8}
                        >
                            <Animated.View style={[styles.captureButtonPulse, pulseStyle]} />
                            <View style={styles.captureButtonInner}>
                                <Ionicons name="camera" size={32} color="#FFF" />
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.captureHint}>Tap to capture</Text>
                    </SafeAreaView>
                )}
            </View>
        </View>
    );
}

const GUIDE_SIZE = width * 0.75;

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
        backgroundColor: COLORS.vitaminOrange,
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
        justifyContent: 'space-between',
    },

    // Header
    header: {
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

    // Guide
    guideContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guideFrame: {
        width: GUIDE_SIZE,
        height: GUIDE_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.vitaminOrange,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 12,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 12,
    },
    guideText: {
        marginTop: SPACING.lg,
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },

    // Analyzing
    analyzingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    analyzingCard: {
        backgroundColor: 'rgba(30,30,30,0.95)',
        padding: SPACING.xl,
        borderRadius: RADIUS['2xl'],
        alignItems: 'center',
        minWidth: 200,
    },
    analyzingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginTop: SPACING.md,
    },
    analyzingSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: SPACING.xs,
    },

    // Result
    resultContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
    },
    resultCard: {
        backgroundColor: 'rgba(30,30,30,0.95)',
        borderRadius: RADIUS['2xl'],
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    resultIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(34,197,94,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    resultHeaderText: {
        flex: 1,
    },
    resultFoodName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    resultSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },

    // Macro Grid
    macroGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADIUS.xl,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.lg,
    },
    macroItem: {
        alignItems: 'center',
        flex: 1,
    },
    macroValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    macroLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    macroDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    // Result Actions
    resultActions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    retakeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        gap: SPACING.xs,
    },
    retakeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    logButton: {
        flex: 2,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    logButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.xs,
    },
    logButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingBottom: SPACING.xl,
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        marginBottom: SPACING.md,
        textAlign: 'center',
        paddingHorizontal: SPACING.xl,
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonPulse: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.vitaminOrange,
        opacity: 0.3,
    },
    captureButtonInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.vitaminOrange,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    captureHint: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: SPACING.md,
    },
});
