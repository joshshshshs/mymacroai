/**
 * Health & Recovery Dashboard - Dynamic Widget Grid
 * Hardware-aware widgets with locked states and customization
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GradientMeshBackground } from '@/src/components/ui/GradientMeshBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useHealthData } from '@/hooks/useHealthData';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';
import { useConnectedDevices } from '@/hooks/useConnectedDevices';
import { useHaptics } from '@/hooks/useHaptics';
import { WIDGET_REGISTRY, isWidgetUnlocked, getRequirementText } from '@/src/config/widgetRegistry';
import {
  RecoveryBattery,
  CycleStatusCard,
  StrainGauge,
  AIInsightCard,
  LockedWidgetOverlay,
  ManageWidgetsSheet,
  SleepCard,
  RespirationCard,
  StressCard,
  OxygenCard,
  HRVCard,
} from '@/src/components/health';

export default function HealthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { data, isLoading, refresh } = useHealthData();
  const { preferences, getOrderedVisibleWidgets, isWidgetVisible } = useWidgetPreferences();
  const { connectedDevices } = useConnectedDevices();
  const { light } = useHaptics();

  const [refreshing, setRefreshing] = useState(false);
  const [showManageSheet, setShowManageSheet] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const colors = {
    bg: isDark ? '#121214' : '#F0F0F5', // Matches Dashboard contrast fix
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
    surface: isDark ? '#2C2C2E' : '#FFFFFF',
  };

  // Navigation handlers for each widget
  const navigateToDetail = (route: string) => {
    light();
    router.push(route as any);
  };

  // Render a widget based on its ID
  const renderWidget = (widgetId: string) => {
    const widget = WIDGET_REGISTRY.find(w => w.id === widgetId);
    if (!widget || !data) return null;

    const unlocked = isWidgetUnlocked(widget, connectedDevices);

    // Widget content with navigation handlers
    let content: React.ReactNode = null;
    switch (widgetId) {
      case 'SLEEP':
        content = <SleepCard data={data.sleep} />;
        break;
      case 'RESPIRATION':
        content = (
          <RespirationCard
            data={data.respiration}
            onPress={() => navigateToDetail('/(modals)/respiration-detail')}
          />
        );
        break;
      case 'STRESS':
        content = (
          <StressCard
            level={data.stress}
            history={data.stressHistory}
            onPress={() => navigateToDetail('/(modals)/stress-detail')}
          />
        );
        break;
      case 'SPO2':
        content = (
          <OxygenCard
            spo2={data.spo2}
            onPress={() => navigateToDetail('/(modals)/spo2-detail')}
          />
        );
        break;
      case 'HRV':
        content = (
          <HRVCard
            hrv={data.hrv}
            trend={data.hrvTrend}
            onPress={() => navigateToDetail('/(modals)/heart-detail')}
          />
        );
        break;
      case 'CYCLE':
        if (data.cycle) {
          content = (
            <CycleStatusCard
              data={data.cycle}
              onPress={() => navigateToDetail('/(modals)/cycle-detail')}
            />
          );
        }
        break;
      default:
        return null;
    }

    if (!content) return null;

    // Wrap in locked overlay if needed
    if (!unlocked) {
      return (
        <LockedWidgetOverlay key={widgetId} requirementText={getRequirementText(widget)}>
          {content}
        </LockedWidgetOverlay>
      );
    }

    return <View key={widgetId}>{content}</View>;
  };

  // Get the ordered visible widgets, split into pairs for grid
  const visibleWidgets = getOrderedVisibleWidgets();
  const gridWidgets = visibleWidgets.filter(id => ['SLEEP', 'RESPIRATION', 'STRESS', 'SPO2', 'HRV'].includes(id));
  const fullWidgets = visibleWidgets.filter(id => ['CYCLE'].includes(id));

  if (isLoading || !data) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#FF5C00" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientMeshBackground variant="health" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Recovery</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.surface }]}
            onPress={() => { light(); setShowManageSheet(true); }}
          >
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5C00" />
          }
        >
          {/* 1. AI Coach Insight (Top Priority) */}
          <AIInsightCard data={data} />

          {/* 2. Hero: Recovery Battery */}
          <TouchableOpacity onPress={() => navigateToDetail('/(modals)/recovery')} activeOpacity={0.8}>
            <RecoveryBattery
              score={data.recoveryScore}
              hrv={data.hrv}
              hrvTrend={data.hrvTrend}
              rhr={data.rhr}
              rhrTrend={data.rhrTrend}
            />
          </TouchableOpacity>

          {/* Section Label */}
          {gridWidgets.length > 0 && (
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>VITALS</Text>
          )}

          {/* 3. Bio-Grid: 2x2 Vital Cards */}
          {gridWidgets.length > 0 && (
            <View style={styles.grid}>
              <View style={styles.gridRow}>
                {gridWidgets.slice(0, 2).map(id => (
                  <View key={id} style={styles.gridCell}>
                    {renderWidget(id)}
                  </View>
                ))}
              </View>
              {gridWidgets.length > 2 && (
                <View style={styles.gridRow}>
                  {gridWidgets.slice(2, 4).map(id => (
                    <View key={id} style={styles.gridCell}>
                      {renderWidget(id)}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 4. Full-width widgets (Cycle, etc.) */}
          {fullWidgets.map(id => renderWidget(id))}

          {/* Section Label */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LOAD</Text>

          {/* 5. Strain vs Capacity */}
          <StrainGauge strain={data.strain} capacity={data.capacity} />

          {/* Bottom Padding */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Manage Widgets Sheet */}
      <ManageWidgetsSheet
        visible={showManageSheet}
        onClose={() => setShowManageSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCell: {
    flex: 1,
  },
});
