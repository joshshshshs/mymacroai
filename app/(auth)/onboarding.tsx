import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useUserActions, useUserStore } from '@/src/store/UserStore';
import { IntroStep } from '../../components/features/onboarding/IntroStep';
import { ImportStep } from '../../components/features/onboarding/ImportStep';
import { HealthStep } from '../../components/features/onboarding/HealthStep';
import { CameraStep } from '../../components/features/onboarding/CameraStep';

const { width } = Dimensions.get('window');

type OnboardingStep = 'intro' | 'import' | 'health' | 'camera' | 'complete';

/**
 * Onboarding协调器 - 管理4步引导流程
 * 实现"First 60 Seconds"引导体验
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('intro');
  const [progress, setProgress] = useState(0);
  const { completeOnboarding } = useUserActions();
  const isOnboardingCompleted = useUserStore(state => state.isOnboardingCompleted);
  const rootNavigationState = useRootNavigationState();

  // 如果已经完成引导，重定向到主界面
  useEffect(() => {
    if (isOnboardingCompleted && rootNavigationState?.key) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isOnboardingCompleted, router, rootNavigationState]);

  // 更新进度条
  useEffect(() => {
    const stepProgress = {
      intro: 0,
      import: 25,
      health: 50,
      camera: 75,
      complete: 100
    };
    setProgress(stepProgress[currentStep]);
  }, [currentStep]);

  const handleNext = () => {
    const steps: OnboardingStep[] = ['intro', 'import', 'health', 'camera', 'complete'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: OnboardingStep[] = ['intro', 'import', 'health', 'camera', 'complete'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    // 跳过引导，直接完成
    completeOnboarding();
    router.replace('/(tabs)/dashboard');
  };

  const handleComplete = () => {
    // 完成所有步骤，标记引导完成
    completeOnboarding();
    router.replace('/(tabs)/dashboard');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <IntroStep
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 'import':
        return (
          <ImportStep
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'health':
        return (
          <HealthStep
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'camera':
        return (
          <CameraStep
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 进度指示器 */}
      {currentStep !== 'intro' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.progressContainer}
        >
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]}
            />
          </View>
          <View style={styles.stepIndicator}>
            <View style={[styles.step, currentStep === 'import' && styles.activeStep]} />
            <View style={[styles.step, currentStep === 'health' && styles.activeStep]} />
            <View style={[styles.step, currentStep === 'camera' && styles.activeStep]} />
          </View>
        </Animated.View>
      )}

      {/* 当前步骤内容 */}
      <Animated.View
        entering={SlideInRight.duration(500)}
        style={styles.content}
      >
        {renderCurrentStep()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  step: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: '#667eea',
    transform: [{ scale: 1.2 }],
  },
  content: {
    flex: 1,
  },
});