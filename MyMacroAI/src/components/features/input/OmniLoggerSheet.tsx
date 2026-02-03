import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// UI
import { GlassSheet } from '../../ui/GlassSheet';

// Utils
import { haptics } from '@/src/utils/haptics';
import { geminiService } from '@/src/services/ai/GeminiService';
import { useUserStore } from '@/src/store/UserStore';
import { useTabBarStore } from '@/src/store/tabBarStore';
import { useCombinedTheme } from '@/src/design-system/theme';

// Updated to 4 Core Actions
const QUICK_ACTIONS = [
    { id: 'scan', label: 'Scan Food', icon: 'barcode-outline' },
    { id: 'log', label: 'Text Log', icon: 'create-outline' },
    { id: 'weight', label: 'Weight', icon: 'scale-outline' },
    { id: 'water', label: 'Water', icon: 'water-outline' },
];

interface OmniLoggerSheetProps {
    visible: boolean;
    onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const OmniLoggerSheet: React.FC<OmniLoggerSheetProps> = ({ visible, onClose }) => {
    const [intent, setIntent] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const translateY = useSharedValue(0);
    const { hideTabBar, showTabBar } = useTabBarStore();
    const { colors, isDark } = useCombinedTheme();

    // Hide tab bar when sheet opens, show when it closes
    useEffect(() => {
        if (visible) {
            hideTabBar();
        } else {
            showTabBar();
        }
    }, [visible, hideTabBar, showTabBar]);

    const handleActionPress = (id: string) => {
        haptics.selection();
        setIntent(id);
    };

    const triggerCameraMode = () => {
        haptics.success();
        onClose(); // Close sheet to open camera
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow swiping up (negative Y)
            if (event.translationY < 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY < -100) {
                // Swipe threshold met
                runOnJS(triggerCameraMode)();
            } else {
                translateY.value = withSpring(0);
            }
        });

    const { logFood } = useUserStore(); // Hook for state logic

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        haptics.heavy();

        try {
            // Real Gemini NLU Processing
            const result = await geminiService.processNaturalLanguage(inputValue);

            if (result.intent === 'log_food' && result.entities) {
                const { calories = 0, protein = 0, carbs = 0, fats = 0, food = 'Food' } = result.entities;

                // Commit to Store
                logFood(calories, protein, carbs, fats, food);
                haptics.success();
            } else {
                // Handle Query or other intents
                haptics.selection();
            }

            setInputValue(''); // Clear input
            onClose();

        } catch (error) {
            console.error("Gemini Error:", error);
            haptics.error();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const getHeaderText = () => {
        if (intent) return `Logging ${intent}...`;
        return "What did you eat?";
    };

    return (
        <GlassSheet visible={visible} onClose={onClose} height={SCREEN_HEIGHT * 0.5} triggerHaptics={haptics.medium}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.container, animatedStyle]}>

                    {/* Header */}
                    <View style={styles.header}>
                        {/* Swipe Hint */}
                        <View style={styles.dragHandle} />

                        <View style={styles.headerContent}>
                            <Ionicons name="mic" size={24} color={colors.primary} />
                            <Text style={[styles.headerText, { color: colors.textPrimary }]}>{getHeaderText()}</Text>
                        </View>
                        <Text style={[styles.swipeHint, { color: colors.textMuted }]}>Swipe up for Camera</Text>
                    </View>

                    {/* Waveform Area (Visual Only) */}
                    <View style={[styles.waveformContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        {/* Mock Waveform Lines */}
                        {[...Array(20)].map((_, i) => (
                            <View key={i} style={[styles.waveLine, { height: 10 + Math.random() * 20, backgroundColor: colors.primary }]} />
                        ))}
                    </View>

                    {/* Quick Actions Grid */}
                    <View style={styles.grid}>
                        {QUICK_ACTIONS.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.actionPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                                onPress={() => handleActionPress(action.id)}
                            >
                                <Ionicons name={action.icon as any} size={20} color={colors.textPrimary} />
                                <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={onClose}>
                        <Text style={[styles.sendButtonText, { color: colors.textContrast }]}>Send</Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.textContrast} />
                    </TouchableOpacity>

                </Animated.View>
            </GestureDetector>
        </GlassSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        gap: 20,
        height: '100%',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginBottom: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
    },
    swipeHint: {
        fontSize: 10,
        marginTop: 4,
    },
    waveformContainer: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    waveLine: {
        width: 3,
        borderRadius: 2,
        opacity: 0.7,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    actionPill: {
        width: '45%', // 2 per row
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 'auto',
        marginBottom: 20,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
