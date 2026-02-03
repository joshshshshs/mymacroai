/**
 * MyMacro AI Modal - Intelligent Health OS Interface
 * Welcome screen with auto-scrolling smart suggestions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ReAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 200;
const CARD_GAP = 16;

type SuggestionCard = {
  icon: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  iconBg: string;
  borderColor: string;
  route?: string;
};

type QuickAction = {
  label: string;
  route?: string;
};

export default function CoachModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { light } = useHaptics();
  const { user } = useUserStore();
  const userName = user?.name?.split(' ')[0] || 'there';

  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const colors = {
    bg: isDark ? '#1C1C1E' : '#F2F2F4',
    surface: isDark ? '#2C2C2E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#98989D' : '#8E8E93',
    primary: '#E05D3D',
    secondary: '#4A90E2',
    accent: '#47B881',
    border: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  };

  // Pulsing animation for AI button
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Auto-scroll suggestions
  useEffect(() => {
    let scrollPosition = 0;
    const totalWidth = (CARD_WIDTH + CARD_GAP) * 3;

    const interval = setInterval(() => {
      scrollPosition += 1;
      if (scrollPosition > totalWidth - SCREEN_WIDTH + 40) {
        scrollPosition = 0;
      }
      scrollRef.current?.scrollTo({ x: scrollPosition, animated: false });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const suggestions: SuggestionCard[] = [
    {
      icon: 'flag',
      title: 'Set Daily Goal',
      description: 'Establish your calorie and activity targets.',
      tag: 'SETUP',
      tagColor: colors.secondary,
      iconBg: isDark ? 'rgba(74,144,226,0.2)' : 'rgba(74,144,226,0.1)',
      borderColor: 'rgba(74,144,226,0.1)',
      route: '/(modals)/settings',
    },
    {
      icon: 'pulse',
      title: 'Track Sleep',
      description: 'Sync your wearable to analyze recovery.',
      tag: 'ACTION',
      tagColor: colors.accent,
      iconBg: isDark ? 'rgba(71,184,129,0.2)' : 'rgba(71,184,129,0.1)',
      borderColor: 'rgba(71,184,129,0.1)',
      route: '/(modals)/hardware',
    },
    {
      icon: 'restaurant',
      title: 'Meal Planning',
      description: 'Generate a high-protein plan for today.',
      tag: 'QUICK',
      tagColor: colors.primary,
      iconBg: isDark ? 'rgba(224,93,61,0.2)' : 'rgba(224,93,61,0.1)',
      borderColor: 'rgba(224,93,61,0.1)',
      route: '/(tabs)/nutrition',
    },
  ];

  const quickActions: QuickAction[] = [
    { label: 'Start workout', route: '/(modals)/import' },
    { label: 'Log hydration', route: '/(tabs)/health' },
    { label: 'Last activity?' },
  ];

  const handleSuggestionPress = (card: SuggestionCard) => {
    light();
    if (card.route) {
      router.push(card.route as any);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    light();
    if (action.route) {
      router.push(action.route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header with Close Button */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>MyMacro AI</Text>
          <TouchableOpacity
            onPress={() => { light(); router.back(); }}
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Welcome Section */}
          <ReAnimated.View entering={FadeInDown.duration(400)} style={styles.welcomeSection}>
            <View style={[styles.iconBubble, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="flash" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hello, {userName}.
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              System Online. 🟢 Your health OS is ready.{'\n'}How should we optimize today?
            </Text>
          </ReAnimated.View>

          {/* Smart Suggestions */}
          <ReAnimated.View entering={FadeInDown.delay(100).duration(400)} style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SMART SUGGESTIONS
              </Text>
              <Ionicons name="sparkles" size={16} color={colors.textSecondary} />
            </View>

            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScroll}
              scrollEventThrottle={16}
            >
              {suggestions.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionCard,
                    { backgroundColor: colors.surface, borderColor: card.borderColor },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSuggestionPress(card)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconBg, { backgroundColor: card.iconBg }]}>
                      <Ionicons name={card.icon as any} size={20} color={card.tagColor} />
                    </View>
                    <Text style={[styles.cardTag, { color: card.tagColor }]}>
                      {card.tag}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {card.title}
                    </Text>
                    <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                      {card.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ReAnimated.View>
        </View>

        {/* Bottom CTA Area */}
        <LinearGradient
          colors={[
            'transparent',
            isDark ? 'rgba(28,28,30,0.9)' : 'rgba(242,242,244,0.9)',
            colors.bg,
          ]}
          style={styles.bottomGradient}
        >
          {/* Pulsing AI Button */}
          <ReAnimated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity
              style={styles.aiButtonContainer}
              onPress={() => light()}
              activeOpacity={0.9}
            >
              <ReAnimated.View style={[styles.pulseOuter, pulseStyle, { backgroundColor: colors.primary }]} />
              <View style={[styles.pulseMiddle, { backgroundColor: `${colors.primary}30` }]} />
              <View style={[styles.aiButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="flash" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </ReAnimated.View>

          {/* Quick Actions */}
          <ReAnimated.View entering={FadeInDown.delay(250).duration(400)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickActionText, { color: colors.text }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ReAnimated.View>

          {/* Input Field */}
          <ReAnimated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Message Coach..."
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.micButton} onPress={() => light()}>
                <Ionicons name="mic" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </ReAnimated.View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  // Welcome
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  // Suggestions
  suggestionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  suggestionsScroll: {
    paddingRight: 16,
    gap: CARD_GAP,
  },
  suggestionCard: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardIconBg: {
    padding: 8,
    borderRadius: 12,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Bottom
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  aiButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: 96,
    height: 96,
  },
  pulseOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  pulseMiddle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  aiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E05D3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  quickActionsScroll: {
    paddingHorizontal: 8,
    gap: 8,
    marginBottom: 16,
  },
  quickAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  micButton: {
    padding: 4,
  },
});