/**
 * AI Chat Modal - Chat interface with MyMacro AI Coach
 * Uses AsyncStorage for persistent storage
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SectionList,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { ChatService, ChatContextBuilder, ChatMessage } from '@/src/services/chat';
import { geminiService } from '@/src/services/ai/GeminiService';
import { parseWidgetFromMessage, WidgetRenderer } from '@/src/components/chat/WidgetParser';

// ============================================================================
// Types
// ============================================================================

interface MessageSection {
    title: string;
    data: ChatMessage[];
}

// ============================================================================
// Helpers
// ============================================================================

function formatDateHeader(sessionId: string): string {
    const date = new Date(sessionId);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (sessionId === today.toISOString().split('T')[0]) {
        return 'Today';
    }
    if (sessionId === yesterday.toISOString().split('T')[0]) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupMessagesBySession(messages: ChatMessage[]): MessageSection[] {
    const groups: Map<string, ChatMessage[]> = new Map();

    messages.forEach(msg => {
        const existing = groups.get(msg.session_id) || [];
        existing.push(msg);
        groups.set(msg.session_id, existing);
    });

    return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // Most recent first
        .map(([sessionId, data]) => ({
            title: formatDateHeader(sessionId),
            data: data.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        }));
}

// ============================================================================
// Component
// ============================================================================

export default function AIChatModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light, medium } = useHaptics();
    const listRef = useRef<SectionList>(null);

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const colors = {
        bg: isDark ? '#121214' : '#FAF9F6',
        surface: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        primary: '#FF4500',
        userBubble: '#FF4500',
        aiBubble: isDark ? '#2C2C2E' : '#F0F0F0',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        inputBg: isDark ? '#2C2C2E' : '#FFFFFF',
        sectionHeader: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
        pinned: '#FFD700',
    };

    // Load initial messages
    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const msgs = await ChatService.getMessagesPage(undefined, 50);
            setMessages(msgs);
            setHasMore(msgs.length >= 50);

            // If no messages, add welcome message
            if (msgs.length === 0) {
                const welcomeMsg = await ChatService.addMessage({
                    content: `System Online. 🟢 Let's calibrate. What's the first meal of the day?`,
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

        if (moreMsgs.length < 50) {
            setHasMore(false);
        }

        setMessages(prev => [...moreMsgs, ...prev]);
    };

    const handleSend = async () => {
        if (!inputText.trim() || isTyping) return;

        const userText = inputText.trim();
        setInputText('');
        medium();

        // Add user message to DB and state
        const userMessage = await ChatService.addMessage({
            content: userText,
            role: 'user',
        });
        setMessages(prev => [...prev, userMessage]);

        // Build context with RAG
        setIsTyping(true);
        try {
            const payload = await ChatContextBuilder.buildPromptPayload(userText);

            // Call Gemini API
            const aiResponse = await geminiService.chat(
                payload.messages.map(m => ({ role: m.role, content: m.content })),
                payload.systemPrompt
            );

            // Save AI response to DB
            const assistantMessage = await ChatService.addMessage({
                content: aiResponse,
                role: 'assistant',
            });
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI response failed:', error);
            const errorMessage = await ChatService.addMessage({
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                role: 'assistant',
            });
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handlePinMessage = async (message: ChatMessage) => {
        light();
        const newPinnedState = !message.is_pinned;
        await ChatService.pinMessage(message.id, newPinnedState);

        setMessages(prev =>
            prev.map(m =>
                m.id === message.id ? { ...m, is_pinned: newPinnedState } : m
            )
        );
    };

    const handleVoiceLog = () => {
        light();
        router.push('/(modals)/voice-log' as any);
    };

    const sections = groupMessagesBySession(messages);

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        // Parse widget from AI messages
        const isAI = item.role === 'assistant';
        let displayText = item.content;
        let widgetData = null;

        if (isAI) {
            const parsed = parseWidgetFromMessage(item.content);
            displayText = parsed.text || item.content;
            widgetData = parsed.widgetData;
        }

        return (
            <View style={styles.messageWrapper}>
                <View
                    style={[
                        styles.messageRow,
                        item.role === 'user' ? styles.userRow : styles.aiRow,
                    ]}
                >
                    <View
                        style={[
                            styles.messageBubble,
                            item.role === 'user'
                                ? [styles.userBubble, { backgroundColor: colors.userBubble }]
                                : [styles.aiBubble, { backgroundColor: colors.aiBubble }],
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                { color: item.role === 'user' ? '#FFFFFF' : colors.text },
                            ]}
                        >
                            {displayText}
                        </Text>
                    </View>

                    {/* Pin button for AI messages */}
                    {isAI && (
                        <TouchableOpacity
                            style={styles.pinButton}
                            onPress={() => handlePinMessage(item)}
                        >
                            <Ionicons
                                name={item.is_pinned ? 'bookmark' : 'bookmark-outline'}
                                size={16}
                                color={item.is_pinned ? colors.pinned : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Render widget if present */}
                {widgetData && <WidgetRenderer widgetData={widgetData} />}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => { light(); router.back(); }}
                        style={[styles.backButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
                            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Coach</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                {isTyping ? 'Typing...' : 'Online'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={handleVoiceLog}
                        style={[styles.voiceButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="mic" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.messagesContainer}
                    keyboardVerticalOffset={100}
                >
                    <SectionList<ChatMessage, MessageSection>
                        ref={listRef as any}
                        sections={sections}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        renderSectionHeader={({ section }) => (
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionHeaderText, { color: colors.sectionHeader }]}>
                                    {section.title}
                                </Text>
                            </View>
                        )}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                        inverted={false}
                        onEndReached={loadMoreMessages}
                        onEndReachedThreshold={0.3}
                        stickySectionHeadersEnabled={false}
                        ListFooterComponent={
                            isTyping ? (
                                <View style={[styles.messageRow, styles.aiRow]}>
                                    <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.aiBubble }]}>
                                        <View style={styles.typingIndicator}>
                                            <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                                            <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                                            <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                                        </View>
                                    </View>
                                </View>
                            ) : null
                        }
                    />

                    {/* Input Area */}
                    <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Message Coach..."
                                placeholderTextColor={colors.textSecondary}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                editable={!isTyping}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: colors.primary, opacity: inputText.trim() && !isTyping ? 1 : 0.5 },
                                ]}
                                onPress={handleSend}
                                disabled={!inputText.trim() || isTyping}
                            >
                                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
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
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    voiceButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Messages
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: SPACING.lg,
        paddingBottom: 20,
    },
    sectionHeader: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    sectionHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageRow: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 20,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    pinButton: {
        padding: 4,
    },
    typingIndicator: {
        flexDirection: 'row',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    messageWrapper: {
        marginBottom: 4,
    },
    // Input
    inputContainer: {
        padding: SPACING.md,
        paddingBottom: SPACING.lg,
        borderTopWidth: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        borderWidth: 1,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
    },
    input: {
        flex: 1,
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
