/**
 * AI Coach Tab - The Heart of MyMacro
 * 
 * Full-featured AI coaching interface with:
 * - Real-time chat with context awareness
 * - Rich content rendering (tables, charts, plans)
 * - Day-based conversation history
 * - Macro adjustment alerts
 * - Voice input support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useAICoachStore } from '@/src/store/AICoachStore';
import { RichContentRenderer } from '@/src/components/ai-coach/RichContentRenderer';
import { useUserStore } from '@/src/store/UserStore';
import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { Message } from '@/src/types/ai-coach';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  primary: '#FF5C00',
  primaryLight: '#FF8C40',
  aiPurple: '#8B5CF6',
  success: '#22C55E',
  
  lightBg: '#F5F5F7',
  darkBg: '#0A0A0C',
  
  lightSurface: '#FFFFFF',
  darkSurface: 'rgba(255,255,255,0.06)',
  
  lightText: '#1A1A1A',
  darkText: '#FFFFFF',
  
  lightSubtext: '#8E8E93',
  darkSubtext: 'rgba(255,255,255,0.5)',
};

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================

interface MessageBubbleProps {
  message: Message;
  isDark: boolean;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isDark, isLast }) => {
  const isUser = message.role === 'user';
  
  return (
    <Animated.View
      entering={isLast ? FadeInUp.springify() : undefined}
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        {
          backgroundColor: isUser
            ? COLORS.primary
            : (isDark ? COLORS.darkSurface : COLORS.lightSurface),
        },
      ]}
    >
      {!isUser && (
        <View style={styles.assistantHeader}>
          <View style={[styles.assistantAvatar, { backgroundColor: `${COLORS.aiPurple}20` }]}>
            <Ionicons name="sparkles" size={14} color={COLORS.aiPurple} />
          </View>
          <Text style={[styles.assistantName, { color: isDark ? COLORS.darkSubtext : COLORS.lightSubtext }]}>
            MyMacro Coach
          </Text>
        </View>
      )}
      
      <Text
        style={[
          styles.messageText,
          {
            color: isUser
              ? '#FFFFFF'
              : (isDark ? COLORS.darkText : COLORS.lightText),
          },
        ]}
      >
        {message.content}
      </Text>
      
      {/* Rich Content */}
      {message.richContent && message.richContent.length > 0 && (
        <RichContentRenderer content={message.richContent} />
      )}
      
      {/* Timestamp */}
      <Text
        style={[
          styles.messageTime,
          {
            color: isUser
              ? 'rgba(255,255,255,0.7)'
              : (isDark ? COLORS.darkSubtext : COLORS.lightSubtext),
          },
        ]}
      >
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
};

// ============================================================================
// SUGGESTION CHIP
// ============================================================================

interface SuggestionChipProps {
  text: string;
  onPress: () => void;
  isDark: boolean;
  index: number;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onPress, isDark, index }) => {
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={[
          styles.suggestionChip,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.suggestionText,
            { color: isDark ? COLORS.darkText : COLORS.lightText },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// MACRO ADJUSTMENT BANNER
// ============================================================================

interface MacroAdjustmentBannerProps {
  adjustment: {
    reason: string;
    originalCalories: number;
    adjustedCalories: number;
    adjustedProtein: number;
  };
  onApply: () => void;
  onDismiss: () => void;
  isDark: boolean;
}

const MacroAdjustmentBanner: React.FC<MacroAdjustmentBannerProps> = ({
  adjustment,
  onApply,
  onDismiss,
  isDark,
}) => {
  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.adjustmentBanner}>
      <LinearGradient
        colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#FFF', '#F5F5F7']}
        style={styles.adjustmentContent}
      >
        <View style={styles.adjustmentHeader}>
          <View style={[styles.adjustmentIcon, { backgroundColor: `${COLORS.success}20` }]}>
            <Ionicons name="trending-up" size={18} color={COLORS.success} />
          </View>
          <View style={styles.adjustmentText}>
            <Text style={[styles.adjustmentTitle, { color: isDark ? COLORS.darkText : COLORS.lightText }]}>
              Macro Adjustment Recommended
            </Text>
            <Text style={[styles.adjustmentReason, { color: isDark ? COLORS.darkSubtext : COLORS.lightSubtext }]}>
              {adjustment.reason}
            </Text>
          </View>
        </View>
        
        <View style={styles.adjustmentStats}>
          <View style={styles.adjustmentStat}>
            <Text style={[styles.statLabel, { color: isDark ? COLORS.darkSubtext : COLORS.lightSubtext }]}>
              Calories
            </Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {adjustment.originalCalories} → {adjustment.adjustedCalories}
            </Text>
          </View>
          <View style={styles.adjustmentStat}>
            <Text style={[styles.statLabel, { color: isDark ? COLORS.darkSubtext : COLORS.lightSubtext }]}>
              Protein
            </Text>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              {adjustment.adjustedProtein}g
            </Text>
          </View>
        </View>
        
        <View style={styles.adjustmentActions}>
          <TouchableOpacity
            style={[styles.adjustmentButton, styles.dismissButton]}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adjustmentButton, styles.applyButton]}
            onPress={onApply}
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function AICoachScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Store
  const {
    messages,
    isLoading,
    suggestions,
    macroAdjustment,
    inputText,
    sendMessage,
    setInputText,
    applyMacroAdjustment,
    dismissMacroAdjustment,
  } = useAICoachStore();
  
  // User store for greeting
  const userName = useUserStore(state => state.user?.name?.split(' ')[0] || 'there');
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Handlers
  const handleSend = useCallback(() => {
    if (!inputText.trim() || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendMessage(inputText);
  }, [inputText, isLoading, sendMessage]);
  
  const handleSuggestion = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);
  
  // Colors
  const colors = {
    bg: isDark ? COLORS.darkBg : COLORS.lightBg,
    surface: isDark ? COLORS.darkSurface : COLORS.lightSurface,
    text: isDark ? COLORS.darkText : COLORS.lightText,
    subtext: isDark ? COLORS.darkSubtext : COLORS.lightSubtext,
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  };
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark
          ? ['#0A0A0C', '#12121A', '#0A0A0C']
          : ['#F5F5F7', '#FFFFFF', '#F5F5F7']
        }
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoContainer, { backgroundColor: `${COLORS.aiPurple}15` }]}>
              <LinearGradient
                colors={[COLORS.aiPurple, COLORS.primary]}
                style={styles.logoGradient}
              >
                <Ionicons name="sparkles" size={20} color="#FFF" />
              </LinearGradient>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AI Coach</Text>
              <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
                Always learning, always helping
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: colors.surface }]}
            onPress={() => {/* TODO: Open history modal */}}
          >
            <Ionicons name="time-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Macro Adjustment Banner */}
        {macroAdjustment && (
          <MacroAdjustmentBanner
            adjustment={macroAdjustment}
            onApply={applyMacroAdjustment}
            onDismiss={dismissMacroAdjustment}
            isDark={isDark}
          />
        )}
        
        {/* Chat Area */}
        <KeyboardAvoidingView
          style={styles.chatArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome State */}
            {messages.length === 0 && (
              <Animated.View entering={FadeIn.delay(200)} style={styles.welcomeContainer}>
                <View style={styles.welcomeIconContainer}>
                  <LinearGradient
                    colors={[COLORS.aiPurple, COLORS.primary]}
                    style={styles.welcomeIcon}
                  >
                    <Ionicons name="sparkles" size={32} color="#FFF" />
                  </LinearGradient>
                </View>
                
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                  {getGreeting()}, {userName}! 👋
                </Text>
                <Text style={[styles.welcomeSubtitle, { color: colors.subtext }]}>
                  I'm your personal AI coach with full access to your health data. Ask me anything about nutrition, workouts, recovery, or let me help you reach your goals.
                </Text>
                
                <View style={styles.featuresGrid}>
                  {[
                    { icon: 'nutrition-outline', label: 'Nutrition' },
                    { icon: 'barbell-outline', label: 'Workouts' },
                    { icon: 'bed-outline', label: 'Recovery' },
                    { icon: 'analytics-outline', label: 'Progress' },
                  ].map((feature, index) => (
                    <View
                      key={feature.label}
                      style={[styles.featureItem, { backgroundColor: colors.surface }]}
                    >
                      <Ionicons
                        name={feature.icon as any}
                        size={20}
                        color={COLORS.primary}
                      />
                      <Text style={[styles.featureLabel, { color: colors.text }]}>
                        {feature.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
            
            {/* Messages */}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isDark={isDark}
                isLast={index === messages.length - 1}
              />
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <Animated.View
                entering={FadeIn}
                style={[styles.loadingBubble, { backgroundColor: colors.surface }]}
              >
                <View style={styles.loadingDots}>
                  <ActivityIndicator size="small" color={COLORS.aiPurple} />
                  <Text style={[styles.loadingText, { color: colors.subtext }]}>
                    Thinking...
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
          
          {/* Suggestions */}
          {messages.length === 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsLabel, { color: colors.subtext }]}>
                TRY ASKING
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsScroll}
              >
                {suggestions.map((suggestion, index) => (
                  <SuggestionChip
                    key={index}
                    text={suggestion}
                    onPress={() => handleSuggestion(suggestion)}
                    isDark={isDark}
                    index={index}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Input Bar */}
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
            <BlurView
              intensity={isDark ? 40 : 80}
              tint={isDark ? 'dark' : 'light'}
              style={[styles.inputBar, { borderColor: colors.border }]}
            >
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="Ask me anything..."
                placeholderTextColor={colors.subtext}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: inputText.trim()
                      ? COLORS.primary
                      : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                  },
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={inputText.trim() ? '#FFF' : colors.subtext}
                  />
                )}
              </TouchableOpacity>
            </BlurView>
          </View>
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
  safeArea: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoContainer: {
    borderRadius: 16,
    padding: 2,
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Chat Area
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  
  // Welcome State
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  welcomeIconContainer: {
    marginBottom: SPACING.xl,
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Message Bubble
  messageBubble: {
    maxWidth: '85%',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantName: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  
  // Loading
  loadingBubble: {
    alignSelf: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderBottomLeftRadius: 6,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Suggestions
  suggestionsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  suggestionsScroll: {
    gap: SPACING.sm,
  },
  suggestionChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Input
  inputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  
  // Macro Adjustment Banner
  adjustmentBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  adjustmentContent: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  adjustmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustmentText: {
    flex: 1,
  },
  adjustmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  adjustmentReason: {
    fontSize: 13,
    fontWeight: '500',
  },
  adjustmentStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  adjustmentStat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  adjustmentActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  adjustmentButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  applyButton: {
    backgroundColor: COLORS.success,
  },
  applyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
