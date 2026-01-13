import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { logger } from '../../../utils/logger';

const { width } = Dimensions.get('window');

interface CameraStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export const CameraStep: React.FC<CameraStepProps> = ({ onComplete, onBack }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const calibrateCamera = async () => {
    try {
      setIsCalibrating(true);

      // Simulate camera calibration process
      for (let i = 0; i <= 100; i += 10) {
        setCalibrationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCalibrationProgress(100);

      Alert.alert(
        'Camera Ready!',
        'Camera calibration simulated successfully. In a full build, this would use the device camera.',
        [{ text: 'Continue', onPress: onComplete }]
      );

    } catch (error) {
      logger.error('Camera calibration error:', error);
      Alert.alert(
        'Calibration Failed',
        'Please try again or skip for now.',
        [
          { text: 'Try Again', onPress: calibrateCamera },
          { text: 'Skip', onPress: onComplete }
        ]
      );
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Camera Setup?',
      'You can calibrate your camera later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: onComplete }
      ]
    );
  };

  return (
    <LinearGradient colors={['#fa709a', '#fee240']} style={styles.container}>
      <Animated.View entering={SlideInLeft.duration(600)} style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Camera Calibration
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Calibrate your camera for accurate food recognition and portion estimation.
          </Typography>
        </View>

        <View style={styles.cameraSection}>
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Typography variant="body" style={styles.placeholderText}>
                Camera preview (currently disabled)
              </Typography>
            </View>

            <View style={styles.calibrationInfo}>
              <Typography variant="h3" style={styles.calibrationTitle}>
                Camera Setup
              </Typography>

              {isCalibrating && (
                <Animated.View entering={FadeIn.duration(400)} style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${calibrationProgress}%` }]} />
                  </View>
                  <Typography variant="caption" style={styles.progressText}>
                    Calibrating... {calibrationProgress}%
                  </Typography>
                </Animated.View>
              )}

              <View style={styles.features}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🍎</Text>
                  <Typography variant="body" style={styles.featureText}>
                    Automatic food recognition
                  </Typography>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>⚖️</Text>
                  <Typography variant="body" style={styles.featureText}>
                    Accurate portion estimation
                  </Typography>
                </View>
              </View>
            </View>

            <Button
              title={isCalibrating ? 'Calibrating...' : 'Simulate Calibration'}
              variant="secondary"
              onPress={calibrateCamera}
              disabled={isCalibrating}
              style={styles.calibrateButton}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Back" variant="transparent" onPress={onBack} style={styles.backButton} />
          <Button
            title={calibrationProgress === 100 ? "Finish Setup" : isCalibrating ? "Calibrating..." : "Skip Calibration"}
            variant="primary"
            onPress={calibrationProgress === 100 ? onComplete : handleSkip}
            disabled={isCalibrating}
            style={styles.continueButton}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { color: '#FFFFFF', textAlign: 'center', marginBottom: 16, fontWeight: '700' },
  subtitle: { color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 22 },
  cameraSection: { flex: 1, width: '100%', justifyContent: 'center' },
  cameraContainer: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 24, marginBottom: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  cameraPlaceholder: { width: '100%', height: 200, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  cameraIcon: { fontSize: 48, marginBottom: 12 },
  placeholderText: { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' },
  calibrationInfo: { width: '100%', alignItems: 'center', marginBottom: 20 },
  calibrationTitle: { color: '#FFFFFF', marginBottom: 16, fontWeight: '600' },
  progressContainer: { width: '100%', marginBottom: 16 },
  progressBar: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  progressText: { color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center' },
  features: { width: '100%' },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: { fontSize: 16, marginRight: 12 },
  featureText: { color: 'rgba(255, 255, 255, 0.8)', flex: 1 },
  calibrateButton: { minWidth: 200 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: 20 },
  backButton: { flex: 1, marginRight: 8, borderWidth: 0 },
  continueButton: { flex: 2, marginLeft: 8 },
});
