import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HealthStepProps {
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export const HealthStep: React.FC<HealthStepProps> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Health Data</Text>
      <Text style={styles.subtitle}>Allow access to Apple Health or Google Fit for personalized insights</Text>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Connect Health</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip || onNext}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default HealthStep;
