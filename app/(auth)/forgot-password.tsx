/**
 * Forgot Password - Password reset flow
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { authService } from '@/services/auth/AuthService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    const result = await authService.resetPassword(email.trim());

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', result.error || 'Could not send reset email. Please try again.');
    }

    setLoading(false);
  }, [email]);

  if (sent) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#0F0F0F', '#1A1A1A']}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="mail" size={48} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.successHint}>
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </Text>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#0F0F0F', '#1A1A1A']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-open" size={32} color="#FF4500" />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.back()}
              >
                <Text style={styles.loginLinkText}>
                  Remember your password? <Text style={styles.loginLinkBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 69, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#FF4500',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  loginLinkBold: {
    color: '#FF4500',
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 16,
  },
  successHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
