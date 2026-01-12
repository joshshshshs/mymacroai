import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface IntroStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({ onNext, onSkip }) => {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <Animated.View 
        entering={FadeInUp.duration(800)}
        style={styles.content}
      >
        <View style={styles.illustration}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>⚡</Text>
          </View>
        </View>

        <Animated.View 
          entering={SlideInRight.delay(300).duration(600)}
          style={styles.textContainer}
        >
          <Typography variant="h1" style={styles.title}>
            Welcome to MyMacro AI
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Your AI-powered health companion that learns your patterns, 
            optimizes your nutrition, and helps you build sustainable habits.
          </Typography>
          
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Typography variant="body" style={styles.featureText}>
                AI-Powered Insights
              </Typography>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Typography variant="body" style={styles.featureText}>
                Real-time Analytics
              </Typography>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <Typography variant="body" style={styles.featureText}>
                Social Motivation
              </Typography>
            </View>
          </View>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            variant="primary"
            onPress={onNext}
            style={styles.primaryButton}
          />
          <Button
            title="Skip for Now"
            variant="transparent"
            onPress={onSkip}
            style={styles.secondaryButton}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  illustration: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logo: {
    fontSize: 48,
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  features: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 0.2,
    width: '100%',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 0,
  },
});
