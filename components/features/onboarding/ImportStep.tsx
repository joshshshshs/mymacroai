import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ImportStepProps {
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export const ImportStep: React.FC<ImportStepProps> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Your Data</Text>
      <Text style={styles.subtitle}>Connect your existing health apps or skip for now</Text>
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
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default ImportStep;
