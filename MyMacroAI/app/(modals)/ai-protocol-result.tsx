/**
 * AI Protocol Result Modal
 * Displays generated protocol from AI analysis
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Share, Alert, Clipboard } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { AIProtocolService, ProtocolData } from '@/src/services/shop/AIProtocolService';
import { useUserStore } from '@/src/store/UserStore';

export default function AIProtocolResultModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ protocolData?: string }>();

  const user = useUserStore(state => state.user);
  const dailyLogs = useUserStore(state => state.dailyLog.history);

  // Parse protocol data or generate new one
  const [protocolData] = useState<ProtocolData>(() => {
    if (params.protocolData) {
      return JSON.parse(params.protocolData);
    }
    return AIProtocolService.analyzeLast30Days(dailyLogs);
  });

  const protocolText = AIProtocolService.generateProtocol(protocolData, user?.name || 'User');

  // Colors
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryColor = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#2C2C2E' : '#FFFFFF';
  const surfaceBg = isDark ? '#1E1E20' : '#F2F2F4';
  const primaryColor = '#FF4500';
  const successColor = '#10B981';

  const handleShare = async () => {
    try {
      await Share.share({
        message: protocolText,
        title: 'My MacroAI Protocol',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share protocol');
    }
  };

  const handleCopy = async () => {
    Clipboard.setString(protocolText);
    Alert.alert('Copied!', 'Protocol copied to clipboard');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return successColor;
    if (score >= 6) return primaryColor;
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <SoftDreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: cardBg }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={textColor} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: textColor }]}>Your Protocol</Text>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: cardBg }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Banner */}
          <View style={[styles.successBanner, { backgroundColor: surfaceBg }]}>
            <View style={[styles.successIcon, { backgroundColor: successColor }]}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.successText}>
              <Text style={[styles.successTitle, { color: textColor }]}>
                Protocol Generated!
              </Text>
              <Text style={[styles.successSubtitle, { color: secondaryColor }]}>
                Based on your last 30 days of data
              </Text>
            </View>
          </View>

          {/* Metrics Overview */}
          <View style={[styles.metricsCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>📊 Your Metrics</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: getScoreColor(protocolData.sleepAverage / 0.9) }]}>
                  {protocolData.sleepAverage.toFixed(1)}h
                </Text>
                <Text style={[styles.metricLabel, { color: secondaryColor }]}>Sleep</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: getScoreColor(protocolData.sleepQuality) }]}>
                  {protocolData.sleepQuality.toFixed(1)}
                </Text>
                <Text style={[styles.metricLabel, { color: secondaryColor }]}>Quality</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: getScoreColor(protocolData.nutritionScore) }]}>
                  {protocolData.nutritionScore.toFixed(0)}%
                </Text>
                <Text style={[styles.metricLabel, { color: secondaryColor }]}>Nutrition</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: getScoreColor(protocolData.consistency) }]}>
                  {protocolData.consistency.toFixed(0)}%
                </Text>
                <Text style={[styles.metricLabel, { color: secondaryColor }]}>Consistency</Text>
              </View>
            </View>
          </View>

          {/* Strengths */}
          {protocolData.strengths.length > 0 && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>💪 Your Strengths</Text>
              {protocolData.strengths.map((strength, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={20} color={successColor} />
                  <Text style={[styles.listItemText, { color: textColor }]}>{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Improvements */}
          {protocolData.improvements.length > 0 && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>📈 Areas to Improve</Text>
              {protocolData.improvements.map((improvement, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="trending-up" size={20} color={primaryColor} />
                  <Text style={[styles.listItemText, { color: textColor }]}>{improvement}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {protocolData.recommendations.length > 0 && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>🎯 Action Plan</Text>
              {protocolData.recommendations.map((rec, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.numberBadge, { backgroundColor: primaryColor }]}>
                    <Text style={styles.numberBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.listItemText, { color: textColor }]}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Copy Protocol</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: cardBg }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color={textColor} />
              <Text style={[styles.actionButtonText, { color: textColor }]}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    gap: 16,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
  },
  metricsCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
