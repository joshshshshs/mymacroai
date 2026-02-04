import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IntroStepProps {
  onNext: () => void;
  onSkip?: () => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MyMacro AI</Text>
      <Text style={styles.subtitle}>Your personal nutrition companion</Text>
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
  },
});

export default IntroStep;
