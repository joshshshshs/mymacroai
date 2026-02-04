/**
 * Progress Photos - View and compare past photo sets
 * Time-lapse comparison with slider
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 80;

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

// Placeholder photo sets - in production, these come from secure storage
const PHOTO_SETS: PhotoSet[] = [
  {
    id: '1',
    date: '2024-01-14',
    frontUri: 'https://via.placeholder.com/300x400/1a1a1a/666?text=Front+1',
    sideUri: 'https://via.placeholder.com/300x400/1a1a1a/666?text=Side+1',
    backUri: 'https://via.placeholder.com/300x400/1a1a1a/666?text=Back+1',
    stats: { weight: 175, bodyFat: 18 },
  },
  {
    id: '2',
    date: '2024-01-07',
    frontUri: 'https://via.placeholder.com/300x400/1a1a1a/666?text=Front+2',
    sideUri: 'https://via.placeholder.com/300x400/1a1a1a/666?text=Side+2',
    backUri: 'https://via.placeholder.com/300x400/1a1a1a/666?text=Back+2',
    stats: { weight: 177, bodyFat: 19 },
  },
];

export default function ProgressPhotosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'side' | 'back'>('front');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);

  const sliderPosition = useSharedValue(0.5);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newPos = Math.max(0, Math.min(1, (e.x / PHOTO_WIDTH)));
      sliderPosition.value = newPos;
    });

  const leftImageStyle = useAnimatedStyle(() => ({
    width: `${sliderPosition.value * 100}%`,
  }));

  const handleSetSelect = (setId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (compareMode) {
      if (selectedSets.includes(setId)) {
        setSelectedSets(prev => prev.filter(id => id !== setId));
      } else if (selectedSets.length < 2) {
        setSelectedSets(prev => [...prev, setId]);
      }
    }
  };

  const toggleCompareMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompareMode(!compareMode);
    if (!compareMode) {
      setSelectedSets([]);
    }
  };

  const getPhotoUri = (set: PhotoSet) => {
    switch (selectedAngle) {
      case 'front': return set.frontUri;
      case 'side': return set.sideUri;
      case 'back': return set.backUri;
    }
  };

  const compareSets = selectedSets.length === 2
    ? PHOTO_SETS.filter(s => selectedSets.includes(s.id))
    : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Progress Photos</Text>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/three-photo' as any)}
            style={styles.backButton}
          >
            <Ionicons name="camera" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.angleSelector}>
            {(['front', 'side', 'back'] as const).map((angle) => (
              <TouchableOpacity
                key={angle}
                style={[
                  styles.angleButton,
                  selectedAngle === angle && styles.angleButtonActive,
                ]}
                onPress={() => setSelectedAngle(angle)}
              >
                <Text style={[
                  styles.angleButtonText,
                  selectedAngle === angle && styles.angleButtonTextActive,
                ]}>
                  {angle.charAt(0).toUpperCase() + angle.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.compareToggle, compareMode && styles.compareToggleActive]}
            onPress={toggleCompareMode}
          >
            <Ionicons
              name="git-compare"
              size={18}
              color={compareMode ? '#FFF' : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[
              styles.compareToggleText,
              compareMode && styles.compareToggleTextActive,
            ]}>
              {compareMode ? 'Exit Compare' : 'Compare Photos'}
            </Text>
          </TouchableOpacity>

          {compareMode && compareSets ? (
            <View style={styles.comparisonContainer}>
              <GestureDetector gesture={panGesture}>
                <View style={styles.comparisonView}>
                  <Image
                    source={{ uri: getPhotoUri(compareSets[1]) }}
                    style={styles.comparisonImageBack}
                  />
                  <Animated.View style={[styles.comparisonImageFront, leftImageStyle]}>
                    <Image
                      source={{ uri: getPhotoUri(compareSets[0]) }}
                      style={styles.comparisonImageInner}
                    />
                  </Animated.View>
                  <View style={styles.sliderLine} />
                  <View style={styles.sliderHandle}>
                    <Ionicons name="swap-horizontal" size={20} color="#FFF" />
                  </View>
                </View>
              </GestureDetector>
              <View style={styles.comparisonLabels}>
                <Text style={styles.comparisonDate}>{compareSets[0].date}</Text>
                <Text style={styles.comparisonDate}>{compareSets[1].date}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoList}>
              {PHOTO_SETS.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="images-outline" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyTitle}>No Photos Yet</Text>
                  <Text style={styles.emptyText}>
                    Start tracking your progress with the 3-Photo Protocol
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/(modals)/three-photo' as any)}
                  >
                    <Ionicons name="camera" size={18} color="#FFF" />
                    <Text style={styles.emptyButtonText}>Take First Photos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                PHOTO_SETS.map((set) => (
                  <TouchableOpacity
                    key={set.id}
                    style={[
                      styles.photoSetCard,
                      compareMode && selectedSets.includes(set.id) && styles.photoSetCardSelected,
                    ]}
                    onPress={() => handleSetSelect(set.id)}
                    activeOpacity={compareMode ? 0.7 : 1}
                  >
                    <Image
                      source={{ uri: getPhotoUri(set) }}
                      style={styles.photoSetImage}
                    />
                    <View style={styles.photoSetInfo}>
                      <Text style={styles.photoSetDate}>
                        {new Date(set.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                      {set.stats && (
                        <View style={styles.photoSetStats}>
                          {set.stats.weight && (
                            <Text style={styles.photoSetStat}>
                              {set.stats.weight} lbs
                            </Text>
                          )}
                          {set.stats.bodyFat && (
                            <Text style={styles.photoSetStat}>
                              {set.stats.bodyFat}% BF
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                    {compareMode && (
                      <View style={[
                        styles.selectCircle,
                        selectedSets.includes(set.id) && styles.selectCircleActive,
                      ]}>
                        {selectedSets.includes(set.id) && (
                          <Text style={styles.selectNumber}>
                            {selectedSets.indexOf(set.id) + 1}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {compareMode && selectedSets.length < 2 && (
            <Text style={styles.selectHint}>
              Select {2 - selectedSets.length} more photo{selectedSets.length === 1 ? '' : 's'} to compare
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  angleSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  angleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  angleButtonActive: {
    backgroundColor: '#FF4500',
  },
  angleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  angleButtonTextActive: {
    color: '#FFF',
  },
  compareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 20,
  },
  compareToggleActive: {
    backgroundColor: '#3B82F6',
  },
  compareToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  compareToggleTextActive: {
    color: '#FFF',
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  comparisonView: {
    width: PHOTO_WIDTH,
    aspectRatio: 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  comparisonImageBack: {
    ...StyleSheet.absoluteFillObject,
  },
  comparisonImageFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  comparisonImageInner: {
    width: PHOTO_WIDTH,
    height: '100%',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: '#FFF',
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  comparisonLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  comparisonDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  photoList: {
    gap: 16,
  },
  photoSetCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoSetCardSelected: {
    borderColor: '#3B82F6',
  },
  photoSetImage: {
    width: 100,
    height: 133,
  },
  photoSetInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  photoSetDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  photoSetStats: {
    flexDirection: 'row',
    gap: 16,
  },
  photoSetStat: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  selectCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    alignSelf: 'center',
  },
  selectCircleActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  selectNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  selectHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
