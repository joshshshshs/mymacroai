/**
 * Voice Log Modal - Voice recognition interface
 * Listening UI with waveform animation and entity recognition
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    TextInput,
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
import { LivingVoiceOrb } from '@/src/components/animations';

export default function VoiceLogModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light, medium } = useHaptics();

    const [isListening, setIsListening] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');

    const colors = {
        bg: isDark ? '#1c1f22' : '#fcf8f4',
        surface: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#F5F5F5' : '#0f161a',
        textSecondary: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(25,87,118,0.6)',
        primary: '#195776',
        accent: '#FF6F61',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
        glassBg: isDark ? 'rgba(28,31,34,0.6)' : 'rgba(255,255,255,0.4)',
    };

    // Simulate voice recognition
    useEffect(() => {
        if (isListening) {
            const timer = setTimeout(() => {
                setIsProcessing(true);
                setTimeout(() => {
                    setRecognizedText('Log a double espresso and a protein bar.');
                    setIsProcessing(false);
                }, 1000);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isListening]);

    // Get orb state
    const getOrbState = (): 'idle' | 'listening' | 'processing' | 'speaking' => {
        if (isProcessing) return 'processing';
        if (isListening) return 'listening';
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
        }
    }, [isListening]);

    const pingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pingScale.value }],
        opacity: pingOpacity.value,
    }));

    const handleMicPress = () => {
        medium();
        setIsListening(!isListening);
        if (!isListening) {
            setRecognizedText('');
        }
    };

    const handleChatPress = () => {
        light();
        router.push('/(modals)/ai-chat' as any);
    };

    // Render entity-highlighted text
    const renderHighlightedText = () => {
        if (!recognizedText) {
            return (
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                    Listening for your input...
                </Text>
            );
        }

        // Simple entity detection (in production, this would come from AI)
        const entities = ['double espresso', 'protein bar'];
        let result = recognizedText;

        return (
            <Text style={[styles.recognizedText, { color: colors.text }]}>
                Log a{' '}
                <Text style={[styles.entityText, { color: colors.accent }]}>
                    double espresso
                </Text>
                {' '}and a{' '}
                <Text style={[styles.entityText, { color: colors.accent }]}>
                    protein bar
                </Text>
                .
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
                        onPress={() => { light(); router.back(); }}
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="close" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>STATUS</Text>
                        <Text style={[styles.statusText, { color: colors.primary }]}>
                            {isListening ? 'MYMACRO AI LISTENING' : 'TAP MIC TO START'}
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
                            {isListening ? 'Recognizing entities...' : 'Ready to listen'}
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
                        >
                            <LivingVoiceOrb state={getOrbState()} size={140} />
                        </TouchableOpacity>
                    </View>
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
                                style={[styles.micButton, { backgroundColor: colors.accent }]}
                                onPress={handleMicPress}
                                activeOpacity={0.9}
                            >
                                <Ionicons
                                    name={isListening ? 'mic' : 'mic-outline'}
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
        // Simulated dot pattern via background
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
    },
    placeholderText: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 36,
    },
    recognizedText: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 42,
        letterSpacing: -0.5,
    },
    entityText: {
        textDecorationLine: 'underline',
        textDecorationColor: 'rgba(255,111,97,0.3)',
    },
    // Waveform
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 48,
        height: 40,
    },
    wavebar: {
        width: 4,
        borderRadius: 2,
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
