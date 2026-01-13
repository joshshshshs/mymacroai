/**
 * AI Hub Modal - Redesign V2
 * Matches "Middle Screen" reference:
 * - Large "Voice" card with 3D Robot
 * - Right column for new chat/scan
 * - Recent search pills at bottom
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS, MOTION, TYPOGRAPHY } from '../../../design-system/tokens';
import { SoftGlassCard } from '../../ui/SoftGlassCard';

// Asset (in a real app, import from assets/images)
// For now assuming it's available at the path we copied to
const ROBOT_IMAGE = require('../../../../assets/ai-robot.png');

interface AiHubModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const AiHubModalRedesign: React.FC<AiHubModalProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

  // Robot Float Animation
  const robotTranslateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      robotTranslateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const robotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: robotTranslateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(MOTION.duration.medium)}
        exiting={FadeOut.duration(MOTION.duration.short)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView
            intensity={90}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </Pressable>
      </Animated.View>

      {/* Content Container */}
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(100)}
          exiting={SlideOutDown.duration(MOTION.duration.short)}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerGreeting, { color: textColor }]}>Hey Joshua,</Text>
              <Text style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
                How can I assist you today
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <SoftGlassCard
                variant="soft"
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, padding: 0 }}
              >
                <Ionicons name="close" size={20} color={textColor} />
              </SoftGlassCard>
            </TouchableOpacity>
          </View>

          {/* Main Action Grid */}
          <View style={styles.gridContainer}>
            {/* Left Col: Large Voice Card */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.leftColumn}
            >
              <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }}>
                <SoftGlassCard variant="prominent" style={styles.voiceCard}>
                  {/* Floating Robot */}
                  <Animated.View style={[styles.robotContainer, robotAnimatedStyle]}>
                    <Image
                      source={ROBOT_IMAGE}
                      style={styles.robotImage}
                      resizeMode="contain"
                    />
                  </Animated.View>

                  <View style={styles.voiceCardContent}>
                    <View style={styles.micIconContainer}>
                      <SoftGlassCard variant="soft" style={styles.micGlass}>
                        <Ionicons name="mic" size={24} color="#FFF" />
                      </SoftGlassCard>
                    </View>
                    <Text style={styles.cardTitle}>Uncover new things via Voice Recordings</Text>

                    <View style={styles.pillButton}>
                      <Text style={styles.pillButtonText}>Let's talk</Text>
                    </View>
                  </View>
                </SoftGlassCard>
              </TouchableOpacity>
            </Animated.View>

            {/* Right Col: Stacked Actions */}
            <View style={styles.rightColumn}>
              {/* Chat Action */}
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={styles.rightCardWrapper}
              >
                <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
                  <SoftGlassCard variant="medium" style={styles.smallCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={22} color={textColor} />
                    </View>
                    <Text style={[styles.smallCardTitle, { color: textColor }]}>Start new chat</Text>
                    <Ionicons name="arrow-forward" size={16} color={secondaryTextColor} style={styles.arrowIcon} />
                  </SoftGlassCard>
                </TouchableOpacity>
              </Animated.View>

              {/* Image Search Action */}
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                style={styles.rightCardWrapper}
              >
                <TouchableOpacity activeOpacity={0.8} style={{ flex: 1 }}>
                  <SoftGlassCard variant="medium" style={styles.smallCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                      <Ionicons name="image-outline" size={22} color={textColor} />
                    </View>
                    <Text style={[styles.smallCardTitle, { color: textColor }]}>Search by Image</Text>
                    <Ionicons name="arrow-forward" size={16} color={secondaryTextColor} style={styles.arrowIcon} />
                  </SoftGlassCard>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Recent Search Section */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={styles.recentSection}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Search</Text>

            <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 12 }}>
              <SoftGlassCard variant="soft" style={styles.recentRow}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color={secondaryTextColor} style={{ marginRight: 12 }} />
                <Text style={[styles.recentText, { color: textColor }]}>Fix spelling and grammar</Text>
                <Ionicons name="arrow-forward" size={16} color={secondaryTextColor} style={{ marginLeft: 'auto' }} />
              </SoftGlassCard>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 12 }}>
              <SoftGlassCard variant="soft" style={styles.recentRow}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color={secondaryTextColor} style={{ marginRight: 12 }} />
                <Text style={[styles.recentText, { color: textColor }]}>Explain quantum physics</Text>
                <Ionicons name="arrow-forward" size={16} color={secondaryTextColor} style={{ marginLeft: 'auto' }} />
              </SoftGlassCard>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <SoftGlassCard variant="soft" style={styles.recentRow}>
                <Ionicons name="image-outline" size={20} color={secondaryTextColor} style={{ marginRight: 12 }} />
                <Text style={[styles.recentText, { color: textColor }]}>Projects ideas for UX/UI case</Text>
                <Ionicons name="arrow-forward" size={16} color={secondaryTextColor} style={{ marginLeft: 'auto' }} />
              </SoftGlassCard>
            </TouchableOpacity>
          </Animated.View>

        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
    flex: 1, // Take up avail space
    justifyContent: 'center', // Center vertically roughly like the design
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING['2xl'],
    marginTop: SPACING.xl,
  },
  headerGreeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  closeButton: {
    marginLeft: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    height: 320, // Check aspect ratio
    marginBottom: SPACING['2xl'],
    gap: SPACING.md,
  },
  leftColumn: {
    flex: 5,
  },
  rightColumn: {
    flex: 4,
    gap: SPACING.md,
  },
  voiceCard: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    backgroundColor: '#7F56D9', // Fallback/Tint base
    overflow: 'hidden',
  },
  robotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    marginTop: -10,
  },
  robotImage: {
    width: 140,
    height: 140,
  },
  voiceCardContent: {
    gap: SPACING.sm,
  },
  micIconContainer: {
    marginBottom: SPACING.xs,
  },
  micGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  pillButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  pillButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  rightCardWrapper: {
    flex: 1,
  },
  smallCard: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'auto', // Pushes it to top
  },
  smallCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10,
  },
  arrowIcon: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
  },
  recentSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    height: 60, // Consistent height
    borderRadius: RADIUS.xl,
  },
  recentText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
