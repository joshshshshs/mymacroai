/**
 * Three Photo Protocol - Comprehensive physique analysis
 * Captures front, side, and back photos for AI analysis
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { threePhotoProtocol, PhotoAngle, PhotoCapture } from '@/src/services/camera/ThreePhotoProtocol';

interface AngleInfo {
  angle: PhotoAngle;
  label: string;
  icon: string;
  instructions: string;
}

const ANGLES: AngleInfo[] = [
  {
    angle: 'front',
    label: 'Front View',
    icon: '👤',
    instructions: 'Stand facing the camera with arms relaxed at your sides',
  },
  {
    angle: 'side',
    label: 'Side View',
    icon: '👥',
    instructions: 'Turn 90° to show your profile, arms relaxed',
  },
  {
    angle: 'back',
    label: 'Back View',
    icon: '🔙',
    instructions: 'Turn around with your back to the camera',
  },
];

export default function ThreePhotoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [photos, setPhotos] = useState<Record<PhotoAngle, PhotoCapture | null>>({
    front: null,
    side: null,
    back: null,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<PhotoAngle>('front');

  const handleCapture = useCallback(async (angle: PhotoAngle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await threePhotoProtocol.capturePhoto(angle);
      if (photo) {
        setPhotos(prev => ({ ...prev, [angle]: photo }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-advance to next angle
        const nextIndex = ANGLES.findIndex(a => a.angle === angle) + 1;
        if (nextIndex < ANGLES.length) {
          setCurrentAngle(ANGLES[nextIndex].angle);
        }
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Could not capture photo. Please try again.');
    }
  }, []);

  const handleRetake = useCallback((angle: PhotoAngle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos(prev => ({ ...prev, [angle]: null }));
    setCurrentAngle(angle);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!photos.front || !photos.side || !photos.back) {
      Alert.alert('Incomplete Set', 'Please capture all three angles before analyzing.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAnalyzing(true);

    try {
      const analysis = await threePhotoProtocol.analyzePhotoSet('body_recomp');

      if (analysis) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigate to results - using vault which has the time-lapse comparison
        router.push('/(modals)/vault' as any);
      }
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze photos. Please try again.');
    }

    setAnalyzing(false);
  }, [photos, router]);

  const completedCount = Object.values(photos).filter(Boolean).length;
  const isComplete = completedCount === 3;

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
          <Text style={styles.title}>3-Photo Protocol</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/3 photos captured
          </Text>

          <View style={styles.photoGrid}>
            {ANGLES.map((angleInfo) => {
              const photo = photos[angleInfo.angle];
              const isActive = currentAngle === angleInfo.angle && !photo;

              return (
                <View key={angleInfo.angle} style={styles.photoSlot}>
                  <View style={[
                    styles.photoCard,
                    isActive && styles.photoCardActive,
                    photo && styles.photoCardComplete,
                  ]}>
                    {photo ? (
                      <>
                        <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                        <TouchableOpacity
                          style={styles.retakeButton}
                          onPress={() => handleRetake(angleInfo.angle)}
                        >
                          <Ionicons name="refresh" size={16} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                        </View>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.captureArea}
                        onPress={() => handleCapture(angleInfo.angle)}
                      >
                        <View style={[styles.angleIcon, isActive && styles.angleIconActive]}>
                          <Text style={styles.angleEmoji}>{angleInfo.icon}</Text>
                        </View>
                        <Text style={styles.angleLabel}>{angleInfo.label}</Text>
                        {isActive && (
                          <View style={styles.captureHint}>
                            <Ionicons name="camera" size={14} color="#FF4500" />
                            <Text style={styles.captureHintText}>Tap to capture</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.instructionText} numberOfLines={2}>
                    {angleInfo.instructions}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Photo Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="sunny" size={16} color="#F59E0B" />
                <Text style={styles.tipText}>Use good, even lighting</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="body" size={16} color="#3B82F6" />
                <Text style={styles.tipText}>Wear fitted clothing or workout gear</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="phone-portrait" size={16} color="#10B981" />
                <Text style={styles.tipText}>Keep phone at chest height</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, !isComplete && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={!isComplete || analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFF" />
                <Text style={styles.analyzeButtonText}>Analyze Photos</Text>
              </>
            )}
          </TouchableOpacity>
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
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  photoSlot: {
    flex: 1,
  },
  photoCard: {
    aspectRatio: 0.75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginBottom: 8,
  },
  photoCardActive: {
    borderColor: '#FF4500',
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
  },
  photoCardComplete: {
    borderColor: '#10B981',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  angleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  angleIconActive: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
  },
  angleEmoji: {
    fontSize: 24,
  },
  angleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  captureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  captureHintText: {
    fontSize: 10,
    color: '#FF4500',
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 14,
  },
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4500',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
