/**
 * Progress Photos - Premium Redesign
 * Glass cards, photo thumbnails with date overlays, before/after comparison
 * Full light/dark mode support
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 48;

interface PhotoSet {
  id: string;
  date: string;
  frontUri: string;
  sideUri: string;
  backUri: string;
  stats?: {
    weight?: number;
    bodyFat?: number;
  };
}

// In production, photo sets are loaded from secure storage
// Dev mock data is only used for testing
const PHOTO_SETS: PhotoSet[] = [];

export default function ProgressPhotosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'side' | 'back'>('front');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);

  const colors = {
    bg: isDark ? '#0A0A0A' : '#F5F5F7',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
    cardBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    accent: '#FF4500',
    compare: '#3B82F6',
  };

  const sliderPosition = useSharedValue(0.5);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newPos = Math.max(0.05, Math.min(0.95, e.x / PHOTO_WIDTH));
      sliderPosition.value = newPos;
    })
    .onEnd(() => {
      Haptics.selectionAsync();
    });

  const leftImageStyle = useAnimatedStyle(() => ({
    width: `${sliderPosition.value * 100}%`,
  }));

  const sliderLineStyle = useAnimatedStyle(() => ({
    left: `${sliderPosition.value * 100}%`,
  }));

  const handleSetSelect = useCallback((setId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (compareMode) {
      if (selectedSets.includes(setId)) {
        setSelectedSets((prev) => prev.filter((id) => id !== setId));
      } else if (selectedSets.length < 2) {
        setSelectedSets((prev) => [...prev, setId]);
      }
    }
  }, [compareMode, selectedSets]);

  const toggleCompareMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompareMode(!compareMode);
    if (!compareMode) {
      setSelectedSets([]);
    }
  }, [compareMode]);

  const getPhotoUri = (set: PhotoSet) => {
    switch (selectedAngle) {
      case 'front': return set.frontUri;
      case 'side': return set.sideUri;
      case 'back': return set.backUri;
    }
  };

  const compareSets = selectedSets.length === 2
    ? PHOTO_SETS.filter((s) => selectedSets.includes(s.id))
    : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background Gradient */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={isDark
            ? ['rgba(255,69,0,0.12)', 'transparent']
            : ['rgba(255,182,150,0.3)', 'transparent']
          }
          style={[styles.bgBlob, styles.bgBlobTop]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <LinearGradient
          colors={isDark
            ? ['rgba(59,130,246,0.08)', 'transparent']
            : ['rgba(147,197,253,0.25)', 'transparent']
          }
          style={[styles.bgBlob, styles.bgBlobBottom]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerButton, { backgroundColor: colors.cardBg }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Progress</Text>

          <TouchableOpacity
            onPress={() => router.push('/(modals)/three-photo' as any)}
            style={[styles.headerButton, { backgroundColor: colors.cardBg }]}
          >
            <Ionicons name="camera" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Angle Selector */}
          <View style={[styles.angleSelectorContainer, { backgroundColor: colors.cardBg }]}>
            {(['front', 'side', 'back'] as const).map((angle) => (
              <TouchableOpacity
                key={angle}
                style={[
                  styles.angleButton,
                  selectedAngle === angle && { backgroundColor: colors.accent },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedAngle(angle);
                }}
              >
                <Text
                  style={[
                    styles.angleButtonText,
                    { color: selectedAngle === angle ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {angle.charAt(0).toUpperCase() + angle.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Compare Toggle */}
          <TouchableOpacity
            style={[
              styles.compareToggle,
              {
                backgroundColor: compareMode ? colors.compare : colors.cardBg,
                borderColor: compareMode ? colors.compare : colors.cardBorder,
              },
            ]}
            onPress={toggleCompareMode}
          >
            <Ionicons
              name="git-compare"
              size={18}
              color={compareMode ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.compareToggleText,
                { color: compareMode ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {compareMode ? 'Exit Compare' : 'Compare Photos'}
            </Text>
          </TouchableOpacity>

          {/* Comparison View or Photo Grid */}
          {compareMode && compareSets ? (
            <View style={styles.comparisonContainer}>
              {/* Main Comparison View */}
              <GestureDetector gesture={panGesture}>
                <View style={styles.comparisonImageContainer}>
                  {/* Right/After Image (Full) */}
                  <Image
                    source={{ uri: getPhotoUri(compareSets[1]) }}
                    style={styles.comparisonImageFull}
                  />

                  {/* Left/Before Image (Clipped) */}
                  <Animated.View style={[styles.comparisonImageLeft, leftImageStyle]}>
                    <Image
                      source={{ uri: getPhotoUri(compareSets[0]) }}
                      style={[styles.comparisonImageInner, { width: PHOTO_WIDTH }]}
                    />
                  </Animated.View>

                  {/* Slider Line */}
                  <Animated.View style={[styles.sliderLine, sliderLineStyle]}>
                    <View style={styles.sliderHandle}>
                      <BlurView intensity={80} tint="light" style={styles.sliderHandleBlur}>
                        <Ionicons name="swap-horizontal" size={18} color="#333" />
                      </BlurView>
                    </View>
                  </Animated.View>

                  {/* Date Labels */}
                  <View style={styles.comparisonDateLabels}>
                    <View style={[styles.dateLabelBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                      <Text style={styles.dateLabelText}>Before</Text>
                      <Text style={styles.dateLabelDate}>{formatDate(compareSets[0].date)}</Text>
                    </View>
                    <View style={[styles.dateLabelBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.dateLabelText}>After</Text>
                      <Text style={styles.dateLabelDate}>{formatDate(compareSets[1].date)}</Text>
                    </View>
                  </View>
                </View>
              </GestureDetector>

              {/* Stats Comparison */}
              {compareSets[0].stats && compareSets[1].stats && (
                <View style={[styles.statsComparison, { backgroundColor: colors.cardBg }]}>
                  <View style={styles.statsComparisonRow}>
                    <View style={styles.statsComparisonItem}>
                      <Text style={[styles.statsComparisonLabel, { color: colors.textSecondary }]}>
                        Weight
                      </Text>
                      <View style={styles.statsComparisonValues}>
                        <Text style={[styles.statsComparisonValue, { color: colors.textSecondary }]}>
                          {compareSets[0].stats.weight}
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                        <Text style={[styles.statsComparisonValue, { color: colors.text }]}>
                          {compareSets[1].stats.weight}
                        </Text>
                        <Text
                          style={[
                            styles.statsComparisonDiff,
                            {
                              color: (compareSets[1].stats.weight || 0) < (compareSets[0].stats.weight || 0)
                                ? '#10B981'
                                : '#EF4444',
                            },
                          ]}
                        >
                          {(compareSets[1].stats.weight || 0) - (compareSets[0].stats.weight || 0) > 0 ? '+' : ''}
                          {(compareSets[1].stats.weight || 0) - (compareSets[0].stats.weight || 0)} lbs
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statsDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.statsComparisonItem}>
                      <Text style={[styles.statsComparisonLabel, { color: colors.textSecondary }]}>
                        Body Fat
                      </Text>
                      <View style={styles.statsComparisonValues}>
                        <Text style={[styles.statsComparisonValue, { color: colors.textSecondary }]}>
                          {compareSets[0].stats.bodyFat}%
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                        <Text style={[styles.statsComparisonValue, { color: colors.text }]}>
                          {compareSets[1].stats.bodyFat}%
                        </Text>
                        <Text
                          style={[
                            styles.statsComparisonDiff,
                            {
                              color: (compareSets[1].stats.bodyFat || 0) < (compareSets[0].stats.bodyFat || 0)
                                ? '#10B981'
                                : '#EF4444',
                            },
                          ]}
                        >
                          {(compareSets[1].stats.bodyFat || 0) - (compareSets[0].stats.bodyFat || 0) > 0 ? '+' : ''}
                          {(compareSets[1].stats.bodyFat || 0) - (compareSets[0].stats.bodyFat || 0)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {PHOTO_SETS.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconContainer, { backgroundColor: colors.cardBg }]}>
                    <Ionicons name="images-outline" size={48} color={colors.textTertiary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    No Photos Yet
                  </Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Start tracking your progress with the 3-Photo Protocol
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/(modals)/three-photo' as any)}
                  >
                    <Ionicons name="camera" size={18} color="#FFFFFF" />
                    <Text style={styles.emptyButtonText}>Take First Photos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                PHOTO_SETS.map((set) => (
                  <TouchableOpacity
                    key={set.id}
                    style={[
                      styles.photoCard,
                      selectedSets.includes(set.id) && { borderColor: colors.compare, borderWidth: 2 },
                    ]}
                    onPress={() => handleSetSelect(set.id)}
                    activeOpacity={compareMode ? 0.8 : 1}
                  >
                    <BlurView
                      intensity={isDark ? 40 : 60}
                      tint={isDark ? 'dark' : 'light'}
                      style={styles.photoCardBlur}
                    >
                      {/* Thumbnail */}
                      <View style={styles.thumbnailContainer}>
                        <Image source={{ uri: getPhotoUri(set) }} style={styles.thumbnail} />
                        {/* Date Overlay */}
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.7)']}
                          style={styles.dateOverlay}
                        >
                          <Text style={styles.dateText}>
                            {new Date(set.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                          <Text style={styles.yearText}>{new Date(set.date).getFullYear()}</Text>
                        </LinearGradient>
                      </View>

                      {/* Info Section */}
                      <View style={styles.photoCardInfo}>
                        <View style={styles.statsRow}>
                          {set.stats?.weight && (
                            <View style={styles.statBadge}>
                              <Ionicons name="scale-outline" size={14} color={colors.textSecondary} />
                              <Text style={[styles.statText, { color: colors.text }]}>
                                {set.stats.weight} lbs
                              </Text>
                            </View>
                          )}
                          {set.stats?.bodyFat && (
                            <View style={styles.statBadge}>
                              <Ionicons name="body-outline" size={14} color={colors.textSecondary} />
                              <Text style={[styles.statText, { color: colors.text }]}>
                                {set.stats.bodyFat}%
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Selection Indicator */}
                      {compareMode && (
                        <View
                          style={[
                            styles.selectionCircle,
                            {
                              borderColor: selectedSets.includes(set.id) ? colors.compare : colors.textTertiary,
                              backgroundColor: selectedSets.includes(set.id) ? colors.compare : 'transparent',
                            },
                          ]}
                        >
                          {selectedSets.includes(set.id) && (
                            <Text style={styles.selectionNumber}>
                              {selectedSets.indexOf(set.id) + 1}
                            </Text>
                          )}
                        </View>
                      )}
                    </BlurView>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Selection Hint */}
          {compareMode && selectedSets.length < 2 && (
            <View style={[styles.hintCard, { backgroundColor: colors.cardBg }]}>
              <Ionicons name="information-circle" size={20} color={colors.compare} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Select {2 - selectedSets.length} more photo
                {selectedSets.length === 1 ? '' : 's'} to compare
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  bgBlobTop: {
    top: -100,
    right: -80,
    width: 350,
    height: 350,
  },
  bgBlobBottom: {
    bottom: -50,
    left: -80,
    width: 300,
    height: 300,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
  },
  angleSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  angleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  angleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
  },
  compareToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  comparisonContainer: {
    gap: 16,
  },
  comparisonImageContainer: {
    width: PHOTO_WIDTH,
    aspectRatio: 0.75,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  comparisonImageFull: {
    ...StyleSheet.absoluteFillObject,
  },
  comparisonImageLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  comparisonImageInner: {
    height: '100%',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    marginLeft: -1.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sliderHandle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sliderHandleBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonDateLabels: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateLabelDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statsComparison: {
    borderRadius: 16,
    padding: 16,
  },
  statsComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsComparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsComparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsComparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsComparisonValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsComparisonDiff: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  statsDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  photoGrid: {
    gap: 16,
  },
  photoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  photoCardBlur: {
    flexDirection: 'row',
    padding: 12,
    gap: 14,
  },
  thumbnailContainer: {
    width: 100,
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  yearText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  photoCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
