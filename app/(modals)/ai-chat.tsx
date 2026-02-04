/**
 * AI Coach Chat - Premium Design with Light/Dark Mode
 * 
 * Features:
 * - Light and Dark mode support
 * - Gradient mesh background
 * - Glassmorphism chat bubbles
 * - Clean circular avatar (no pulsing glow)
 * - Premium typography
 * - Smooth micro-interactions
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SectionList,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ChatService, ChatContextBuilder, ChatMessage } from '@/src/services/chat';
import { geminiService } from '@/src/services/ai/GeminiService';
import { parseWidgetFromMessage, WidgetRenderer } from '@/src/components/chat/WidgetParser';
import { SPACING } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CoachLogo = require('@/assets/white bkg.png');

// ============================================================================
// THEME COLORS
// ============================================================================

const getColors = (isDark: boolean) => ({
    // Backgrounds
    bg: isDark ? '#0A0A0C' : '#F8F9FA',
    bgSecondary: isDark ? '#141418' : '#FFFFFF',
    bgGradient: isDark
        ? ['#0A0A0C', '#141418', '#0A0A0C'] as [string, string, string]
        : ['#F8F9FA', '#FFFFFF', '#F8F9FA'] as [string, string, string],

    // Surfaces
    surface: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    surfaceHover: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',

    // Accent
    accent: '#FF5C00',
    accentLight: '#FF8A50',
    accentGlow: isDark ? 'rgba(255, 92, 0, 0.3)' : 'rgba(255, 92, 0, 0.15)',

    // Text
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',

    // Borders
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',

    // Status
    success: '#34C759',

    // Bubbles
    userBubble: '#FF5C00',
    aiBubble: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',

    // Orbs
    orbColor1: isDark ? 'rgba(255, 92, 0, 0.3)' : 'rgba(255, 92, 0, 0.12)',
    orbColor2: isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.08)',

    // Blur intensity
    blurIntensity: isDark ? 20 : 60,
});

const QUICK_ACTIONS = [
    { id: '1', emoji: '🔥', text: 'Log my meal', gradient: ['#FF5C00', '#FF8A50'] as [string, string] },
    { id: '2', emoji: '📊', text: 'Check macros', gradient: ['#7C3AED', '#A78BFA'] as [string, string] },
    { id: '3', emoji: '🎯', text: 'Am I on track?', gradient: ['#10B981', '#34D399'] as [string, string] },
    { id: '4', emoji: '💡', text: 'Meal ideas', gradient: ['#F59E0B', '#FBBF24'] as [string, string] },
    { id: '5', emoji: '💪', text: 'Workout fuel', gradient: ['#EF4444', '#F87171'] as [string, string] },
];

interface MessageSection {
    title: string;
    data: ChatMessage[];
}

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

const AnimatedBackground: React.FC<{ colors: ReturnType<typeof getColors> }> = ({ colors }) => {
    const orb1Y = useSharedValue(0);
    const orb2X = useSharedValue(0);

    useEffect(() => {
        orb1Y.value = withRepeat(
            withSequence(
                withTiming(-50, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
                withTiming(50, { duration: 8000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        orb2X.value = withRepeat(
            withSequence(
                withTiming(30, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-30, { duration: 10000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const orb1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: orb1Y.value }],
    }));

    const orb2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: orb2X.value }],
    }));

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View style={[styles.gradientOrb, styles.orb1, { backgroundColor: colors.orbColor1 }, orb1Style]} />
            <Animated.View style={[styles.gradientOrb, styles.orb2, { backgroundColor: colors.orbColor2 }, orb2Style]} />
        </View>
    );
};

// ============================================================================
// SIMPLE AVATAR (No pulsing, circular)
// ============================================================================

const CoachAvatar: React.FC<{ size?: number }> = ({ size = 48 }) => {
    return (
        <View style={[styles.coachAvatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
            <Image
                source={CoachLogo}
                style={{ width: size, height: size, borderRadius: size / 2 }}
                resizeMode="cover"
            />
        </View>
    );
};

// ============================================================================
// TYPING INDICATOR
// ============================================================================

const TypingIndicator: React.FC<{ color: string }> = ({ color }) => {
    const dots = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

    useEffect(() => {
        dots.forEach((dot, i) => {
            dot.value = withDelay(
                i * 150,
                withRepeat(
                    withSequence(
                        withTiming(-6, { duration: 300, easing: Easing.out(Easing.ease) }),
                        withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) })
                    ),
                    -1,
                    true
                )
            );
        });
    }, []);

    return (
        <View style={styles.typingContainer}>
            {dots.map((dot, i) => {
                const style = useAnimatedStyle(() => ({
                    transform: [{ translateY: dot.value }],
                }));
                return (
                    <Animated.View
                        key={i}
                        style={[styles.typingDot, { backgroundColor: color }, style]}
                    />
                );
            })}
        </View>
    );
};

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

const QuickActionCard: React.FC<{
    action: typeof QUICK_ACTIONS[0];
    colors: ReturnType<typeof getColors>;
    onPress: () => void;
    delay: number;
}> = ({ action, colors, onPress, delay }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value) }],
    }));

    return (
        <Animated.View entering={FadeInUp.duration(400).delay(delay)}>
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                onPressIn={() => { scale.value = 0.95; }}
                onPressOut={() => { scale.value = 1; }}
                activeOpacity={1}
            >
                <Animated.View style={animatedStyle}>
                    <BlurView intensity={colors.blurIntensity} tint="default" style={[styles.quickActionCard, { borderColor: colors.border }]}>
                        <View style={styles.quickActionInner}>
                            <LinearGradient
                                colors={action.gradient}
                                style={styles.quickActionIcon}
                            >
                                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                            </LinearGradient>
                            <Text style={[styles.quickActionText, { color: colors.text }]}>{action.text}</Text>
                        </View>
                    </BlurView>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================

const MessageBubble: React.FC<{
    message: ChatMessage;
    colors: ReturnType<typeof getColors>;
    onPin: (msg: ChatMessage) => void;
}> = ({ message, colors, onPin }) => {
    const isAI = message.role === 'assistant';
    const isUser = message.role === 'user';

    let displayText = message.content;
    let widgetData = null;

    if (isAI) {
        const parsed = parseWidgetFromMessage(message.content);
        displayText = parsed.text || message.content;
        widgetData = parsed.widgetData;
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (isUser) {
        return (
            <Animated.View
                entering={FadeInUp.duration(300)}
                style={styles.userMessageWrapper}
            >
                <LinearGradient
                    colors={[colors.accent, colors.accentLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.userBubble}
                >
                    <Text style={styles.userBubbleText}>{displayText}</Text>
                </LinearGradient>
                <Text style={[styles.userTime, { color: colors.textMuted }]}>{formatTime(message.timestamp)}</Text>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            entering={FadeInUp.duration(300)}
            style={styles.aiMessageWrapper}
        >
            <View style={styles.aiMessageRow}>
                <CoachAvatar size={32} />
                <View style={styles.aiMessageContent}>
                    <View style={styles.aiMessageHeader}>
                        <Text style={[styles.aiSenderName, { color: colors.accent }]}>Coach</Text>
                        <Text style={[styles.aiTime, { color: colors.textMuted }]}>{formatTime(message.timestamp)}</Text>
                    </View>
                    <BlurView intensity={colors.blurIntensity} tint="default" style={[styles.aiBubble, { borderColor: colors.border }]}>
                        <Text style={[styles.aiBubbleText, { color: colors.text }]}>{displayText}</Text>
                    </BlurView>
                    <View style={styles.aiActions}>
                        <TouchableOpacity
                            onPress={() => onPin(message)}
                            style={styles.actionBtn}
                        >
                            <Ionicons
                                name={message.is_pinned ? 'bookmark' : 'bookmark-outline'}
                                size={14}
                                color={message.is_pinned ? colors.accent : colors.textMuted}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="copy-outline" size={14} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {widgetData && <WidgetRenderer widgetData={widgetData} />}
        </Animated.View>
    );
};

// ============================================================================
// HELPERS
// ============================================================================

function formatDateHeader(sessionId: string): string {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (sessionId === today) return 'Today';
    if (sessionId === yesterday) return 'Yesterday';
    return new Date(sessionId).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
}

function groupMessagesBySession(messages: ChatMessage[]): MessageSection[] {
    const groups = new Map<string, ChatMessage[]>();
    messages.forEach(msg => {
        const existing = groups.get(msg.session_id) || [];
        existing.push(msg);
        groups.set(msg.session_id, existing);
    });
    return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([sessionId, data]) => ({
            title: formatDateHeader(sessionId),
            data: data.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        }));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIChatModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getColors(isDark);

    const router = useRouter();
    const listRef = useRef<SectionList>(null);

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const sendButtonScale = useSharedValue(1);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const msgs = await ChatService.getMessagesPage(undefined, 50);
            setMessages(msgs);
            setHasMore(msgs.length >= 50);

            if (msgs.length === 0) {
                const welcomeMsg = await ChatService.addMessage({
                    content: `Hey! I'm your AI nutrition coach. Ready to crush your goals today? 💪\n\nTap a quick action below or just tell me what's on your mind.`,
                    role: 'assistant',
                });
                setMessages([welcomeMsg]);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreMessages = async () => {
        if (!hasMore || messages.length === 0) return;
        const oldestTimestamp = messages[0]?.timestamp;
        const moreMsgs = await ChatService.getMessagesPage(oldestTimestamp, 50);
        if (moreMsgs.length < 50) setHasMore(false);
        setMessages(prev => [...moreMsgs, ...prev]);
    };

    const handleSend = async (text?: string) => {
        const userText = (text || inputText).trim();
        if (!userText || isTyping) return;

        setInputText('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const userMessage = await ChatService.addMessage({ content: userText, role: 'user' });
        setMessages(prev => [...prev, userMessage]);

        setIsTyping(true);
        try {
            const payload = await ChatContextBuilder.buildPromptPayload(userText);
            const aiResponse = await geminiService.chat(
                payload.messages.map(m => ({ role: m.role, content: m.content })),
                payload.systemPrompt
            );
            const assistantMessage = await ChatService.addMessage({
                content: aiResponse,
                role: 'assistant'
            });
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = await ChatService.addMessage({
                content: "I'm here to help with nutrition and health questions! What would you like to know? (Currently in offline mode)",
                role: 'assistant',
            });
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handlePinMessage = async (message: ChatMessage) => {
        Haptics.selectionAsync();
        const newPinnedState = !message.is_pinned;
        await ChatService.pinMessage(message.id, newPinnedState);
        setMessages(prev =>
            prev.map(m => m.id === message.id ? { ...m, is_pinned: newPinnedState } : m)
        );
    };

    const handleVoiceLog = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(modals)/voice-log' as any);
    };

    const sections = groupMessagesBySession(messages);
    const showQuickActions = messages.length <= 2 && !isTyping;

    const sendAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(sendButtonScale.value) }],
    }));

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <LinearGradient
                    colors={colors.bgGradient}
                    style={StyleSheet.absoluteFillObject}
                />
                <AnimatedBackground colors={colors} />
                <View style={styles.loadingContainer}>
                    <CoachAvatar size={80} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading conversation...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background */}
            <LinearGradient
                colors={colors.bgGradient}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />
            <AnimatedBackground colors={colors} />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Premium Header - LOWERED with extra padding */}
                <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={[styles.header, { borderBottomColor: colors.border }]}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.back();
                        }}
                        style={[styles.backButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <CoachAvatar size={44} />
                        <View style={styles.headerInfo}>
                            <View style={styles.headerTitleRow}>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>AI Coach</Text>
                                <View style={[styles.aiBadge, { backgroundColor: colors.accent }]}>
                                    <Text style={styles.aiBadgeText}>PRO</Text>
                                </View>
                            </View>
                            <View style={styles.statusRow}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: isTyping ? colors.accent : colors.success }
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: isTyping ? colors.accent : colors.success }
                                ]}>
                                    {isTyping ? 'Thinking...' : 'Online'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleVoiceLog}
                        style={styles.voiceButton}
                    >
                        <LinearGradient
                            colors={[colors.accent, colors.accentLight]}
                            style={styles.voiceButtonGradient}
                        >
                            <Ionicons name="mic" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Chat Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.flex}
                    keyboardVerticalOffset={0}
                >
                    <SectionList<ChatMessage, MessageSection>
                        ref={listRef as any}
                        sections={sections}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <MessageBubble
                                message={item}
                                colors={colors}
                                onPin={handlePinMessage}
                            />
                        )}
                        renderSectionHeader={({ section }) => (
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
                                <Text style={[styles.sectionText, { color: colors.textMuted }]}>{section.title}</Text>
                                <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onEndReached={loadMoreMessages}
                        onEndReachedThreshold={0.3}
                        stickySectionHeadersEnabled={false}
                        ListFooterComponent={isTyping ? (
                            <View style={styles.aiMessageWrapper}>
                                <View style={styles.aiMessageRow}>
                                    <CoachAvatar size={32} />
                                    <BlurView intensity={colors.blurIntensity} tint="default" style={[styles.aiBubble, { borderColor: colors.border }]}>
                                        <TypingIndicator color={colors.textSecondary} />
                                    </BlurView>
                                </View>
                            </View>
                        ) : null}
                    />

                    {/* Quick Actions */}
                    {showQuickActions && (
                        <View style={styles.quickActionsContainer}>
                            <Text style={[styles.quickActionsLabel, { color: colors.textMuted }]}>Quick Actions</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.quickActionsScroll}
                            >
                                {QUICK_ACTIONS.map((action, idx) => (
                                    <QuickActionCard
                                        key={action.id}
                                        action={action}
                                        colors={colors}
                                        onPress={() => handleSend(action.text)}
                                        delay={idx * 80}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Input Area */}
                    <Animated.View
                        entering={FadeInUp.duration(400).delay(200)}
                        style={[styles.inputContainer, { borderTopColor: colors.border }]}
                    >
                        <BlurView intensity={colors.blurIntensity} tint="default" style={[styles.inputWrapper, { borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Ask anything..."
                                placeholderTextColor={colors.textMuted}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                editable={!isTyping}
                            />
                            <TouchableOpacity
                                onPress={() => handleSend()}
                                onPressIn={() => { sendButtonScale.value = 0.9; }}
                                onPressOut={() => { sendButtonScale.value = 1; }}
                                disabled={!inputText.trim() || isTyping}
                                style={{ opacity: inputText.trim() && !isTyping ? 1 : 0.4 }}
                            >
                                <Animated.View style={sendAnimatedStyle}>
                                    <LinearGradient
                                        colors={[colors.accent, colors.accentLight]}
                                        style={styles.sendButton}
                                    >
                                        <Ionicons name="arrow-up" size={20} color="#FFF" />
                                    </LinearGradient>
                                </Animated.View>
                            </TouchableOpacity>
                        </BlurView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },

    // Background
    gradientOrb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orb1: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.8,
        top: -SCREEN_WIDTH * 0.3,
        left: -SCREEN_WIDTH * 0.2,
        opacity: 0.4,
    },
    orb2: {
        width: SCREEN_WIDTH * 0.6,
        height: SCREEN_WIDTH * 0.6,
        bottom: SCREEN_HEIGHT * 0.2,
        right: -SCREEN_WIDTH * 0.2,
        opacity: 0.3,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
    },

    // Coach Avatar (simple, circular)
    coachAvatarContainer: {
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 92, 0, 0.1)',
    },

    // Header - LOWERED
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg, // Extra top padding to lower the header
        paddingBottom: SPACING.md,
        gap: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    aiBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    aiBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    voiceButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    voiceButtonGradient: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Messages
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    sectionLine: {
        flex: 1,
        height: 1,
    },
    sectionText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // User Message
    userMessageWrapper: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    userBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomRightRadius: 6,
    },
    userBubbleText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#FFF',
    },
    userTime: {
        fontSize: 11,
        marginTop: 6,
    },

    // AI Message
    aiMessageWrapper: {
        marginBottom: 16,
    },
    aiMessageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    aiMessageContent: {
        flex: 1,
        maxWidth: '80%',
    },
    aiMessageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    aiSenderName: {
        fontSize: 13,
        fontWeight: '600',
    },
    aiTime: {
        fontSize: 11,
    },
    aiBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        overflow: 'hidden',
    },
    aiBubbleText: {
        fontSize: 15,
        lineHeight: 22,
    },
    aiActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
        marginLeft: 4,
    },
    actionBtn: {
        padding: 4,
    },

    // Typing
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    // Quick Actions
    quickActionsContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 12,
    },
    quickActionsLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    quickActionsScroll: {
        gap: 10,
    },
    quickActionCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    quickActionInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        gap: 10,
    },
    quickActionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionEmoji: {
        fontSize: 16,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Input
    inputContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        borderWidth: 1,
        paddingLeft: 18,
        paddingRight: 6,
        paddingVertical: 6,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 10,
    },
    sendButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
