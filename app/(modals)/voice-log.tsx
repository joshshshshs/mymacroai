/**
 * Voice Log Modal - Real Voice Recognition Interface
 * Uses useOmniLogger hook for actual microphone input and AI transcription
 */

import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeIn,
    FadeInUp,
} from 'react-native-reanimated';

import { SPACING } from '@/src/design-system/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useOmniLogger } from '@/hooks/useOmniLogger';
import { VoiceWaveform } from '@/src/components/animations/VoiceWaveform';

export default function VoiceLogModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light, medium } = useHaptics();

    // Use the real OmniLogger hook for voice recognition
    const {
        state,
        isActive,
        recordingText,
        lastResult,
        startListening,
        stopListening,
        reset,
        isListening,
        isProcessing,
        audioLevel,
    } = useOmniLogger();

    const colors = {
        bg: isDark ? '#1c1f22' : '#fcf8f4',
        surface: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#F5F5F5' : '#0f161a',
        textSecondary: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(25,87,118,0.6)',
        primary: '#195776',
        accent: '#FF6F61',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
        glassBg: isDark ? 'rgba(28,31,34,0.6)' : 'rgba(255,255,255,0.4)',
        success: '#10B981',
        error: '#EF4444',
    };

    // Auto-start listening when modal opens
    useEffect(() => {
        const timer = setTimeout(() => {
            startListening();
        }, 500);
        return () => {
            clearTimeout(timer);
            reset();
        };
    }, []);

    // Handle successful result
    useEffect(() => {
        if (state === 'success' && lastResult) {
            const successCount = lastResult.executionResults.filter(r => r.success).length;
            if (successCount > 0) {
                setTimeout(() => {
                    router.back();
                }, 1500);
            }
        }
    }, [state, lastResult]);

    // Get orb state
    const getOrbState = (): 'idle' | 'listening' | 'processing' | 'speaking' => {
        if (state === 'processing' || state === 'executing') return 'processing';
        if (state === 'listening') return 'listening';
        if (state === 'success') return 'speaking';
        return 'idle';
    };

    // Waveform animations
    const waveHeights = [
        useSharedValue(16),
        useSharedValue(24),
        useSharedValue(32),
        useSharedValue(20),
        useSharedValue(28),
        useSharedValue(16),
    ];

    useEffect(() => {
        waveHeights.forEach((height, index) => {
            const baseHeight = [16, 24, 32, 20, 28, 16][index];
            const maxHeight = baseHeight + 12;
            height.value = withRepeat(
                withSequence(
                    withTiming(maxHeight, { duration: 300 + index * 50, easing: Easing.inOut(Easing.ease) }),
                    withTiming(baseHeight, { duration: 300 + index * 50, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        });
    }, []);

    // Ping animation for mic button
    const pingScale = useSharedValue(1);
    const pingOpacity = useSharedValue(0.2);

    useEffect(() => {
        if (isListening) {
            pingScale.value = withRepeat(
                withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
            pingOpacity.value = withRepeat(
                withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
        } else {
            pingScale.value = 1;
            pingOpacity.value = 0.2;
        }
    }, [isListening]);

    const pingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pingScale.value }],
        opacity: pingOpacity.value,
    }));

    const handleMicPress = useCallback(async () => {
        medium();
        if (isListening) {
            // Stop listening and process
            await stopListening();
        } else if (state === 'idle' || state === 'error') {
            // Start listening
            await startListening();
        }
    }, [isListening, state, medium, startListening, stopListening]);

    const handleChatPress = () => {
        light();
        router.push('/(modals)/ai-chat' as any);
    };

    // Get status text
    const getStatusText = () => {
        switch (state) {
            case 'listening':
                return 'LISTENING...';
            case 'processing':
                return 'PROCESSING...';
            case 'executing':
                return 'LOGGING...';
            case 'success':
                return 'DONE!';
            case 'error':
                return 'TAP TO RETRY';
            default:
                return 'TAP MIC TO START';
        }
    };

    // Render recognized text with entity highlighting
    const renderHighlightedText = () => {
        if (state === 'success' && lastResult) {
            const successResults = lastResult.executionResults.filter(r => r.success);
            if (successResults.length > 0) {
                return (
                    <Text style={[styles.recognizedText, { color: colors.success }]}>
                        {successResults.map(r => r.message).join('\n')}
                    </Text>
                );
            }
        }

        if (state === 'error') {
            return (
                <Text style={[styles.placeholderText, { color: colors.error }]}>
                    Could not understand. Please try again.
                </Text>
            );
        }

        if (!recordingText) {
            if (isListening) {
                return (
                    <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                        Listening for your input...
                    </Text>
                );
            }
            if (isProcessing) {
                return (
                    <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                        Processing your voice...
                    </Text>
                );
            }
            return (
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                    Tap the mic to start speaking
                </Text>
            );
        }

        // Display the transcribed text
        return (
            <Text style={[styles.recognizedText, { color: colors.text }]}>
                "{recordingText}"
            </Text>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Dot pattern background */}
            <View style={styles.dotPattern} />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => { light(); reset(); router.back(); }}
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="close" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>STATUS</Text>
                        <Text style={[styles.statusText, { color: state === 'success' ? colors.success : state === 'error' ? colors.error : colors.primary }]}>
                            {getStatusText()}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={22} color={`${colors.primary}60`} />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Recognition status */}
                    <Animated.View entering={FadeIn.duration(300)}>
                        <Text style={[styles.recognizingLabel, { color: colors.textSecondary }]}>
                            {isListening ? 'Speak naturally...' : isProcessing ? 'Analyzing speech...' : state === 'success' ? 'Successfully logged!' : 'Voice Assistant'}
                        </Text>
                    </Animated.View>

                    {/* Recognized Text */}
                    <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.textContainer}>
                        {renderHighlightedText()}
                    </Animated.View>

                    {/* Living Voice Orb */}
                    <View style={styles.orbContainer}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handleMicPress}
                            disabled={state === 'processing' || state === 'executing'}
                        >
                            <VoiceWaveform
                                state={getOrbState() as any}
                                size={140}
                                audioLevel={audioLevel}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Hint Text */}
                    <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                        {isListening ? 'Tap to stop' : 'Try: "Log 2 eggs and toast for breakfast"'}
                    </Text>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <BlurView
                        intensity={isDark ? 40 : 60}
                        tint={isDark ? 'dark' : 'light'}
                        style={[styles.controlsGlass, { borderColor: colors.border }]}
                    >
                        {/* Chat Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.surface }]}
                            onPress={handleChatPress}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chatbubbles" size={28} color={colors.primary} />
                        </TouchableOpacity>

                        {/* Mic Button */}
                        <View style={styles.micButtonContainer}>
                            {isListening && (
                                <Animated.View
                                    style={[
                                        styles.micPing,
                                        { backgroundColor: colors.accent },
                                        pingStyle,
                                    ]}
                                />
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.micButton,
                                    { backgroundColor: state === 'success' ? colors.success : state === 'error' ? colors.error : colors.accent }
                                ]}
                                onPress={handleMicPress}
                                activeOpacity={0.9}
                                disabled={state === 'processing' || state === 'executing'}
                            >
                                <Ionicons
                                    name={isListening ? 'stop' : state === 'success' ? 'checkmark' : 'mic'}
                                    size={32}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dotPattern: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.03,
    },
    safeArea: {
        flex: 1,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#195776',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 2,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    settingsButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Content
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    recognizingLabel: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    textContainer: {
        paddingHorizontal: 8,
        minHeight: 80,
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 32,
    },
    recognizedText: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 38,
        letterSpacing: -0.5,
    },
    entityText: {
        textDecorationLine: 'underline',
        textDecorationColor: 'rgba(255,111,97,0.3)',
    },
    hintText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 24,
        fontStyle: 'italic',
    },
    // Living Voice Orb
    orbContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    // Bottom Controls
    bottomControls: {
        paddingHorizontal: 40,
        paddingBottom: 24,
    },
    controlsGlass: {
        borderRadius: 40,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        borderWidth: 1,
        overflow: 'hidden',
    },
    actionButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    micButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    micPing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF6F61',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
});
