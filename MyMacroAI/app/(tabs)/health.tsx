import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Components
import { DreamyBackground } from '@/src/components/ui/DreamyBackground';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { GlassDockNav, TabItem } from '@/src/components/ui/GlassDockNav';
import { RingProgress } from '@/src/components/ui/RingProgress';
import { JarvisMicButton } from '@/src/components/ui/JarvisMicButton';
import { OmniLoggerSheet } from '@/src/components/features/input/OmniLoggerSheet';

// Utils
import { haptics } from '@/src/utils/haptics';

export default function HealthScreen() {
  const [activeTab, setActiveTab] = useState(1); // Health tab index
  const [isOmniLoggerOpen, setIsOmniLoggerOpen] = useState(false);

  // Navigation Tabs (Shared)
  const navTabs: TabItem[] = [
    { icon: 'home', label: 'Dashboard' },
    { icon: 'heart', label: 'Health' }, // Active
    { icon: 'nutrition', label: 'Nutrition' },
    { icon: 'people', label: 'Squads' },
  ];

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    haptics.selection();
    // In a real app, we would navigate here
  };
  // const [activeTab, setActiveTab] = useState(1); // Health tab index
  // const [isOmniLoggerOpen, setIsOmniLoggerOpen] = useState(false);

  // // Navigation Tabs (Shared)
  // const navTabs: TabItem[] = [
  //   { icon: 'home', label: 'Dashboard' },
  //   { icon: 'heart', label: 'Health' }, // Active
  //   { icon: 'nutrition', label: 'Nutrition' },
  //   { icon: 'people', label: 'Squads' },
  // ];

  // const handleTabPress = (index: number) => {
  //   setActiveTab(index);
  //   haptics.selection();
  //   // In a real app, we would navigate here
  // };

  // const handleMicPress = () => {
  //   haptics.medium();
  //   setIsOmniLoggerOpen(true);
  // };

  return (
    <View style={styles.container}>
      <DreamyBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Spacer */}
          <View style={{ height: 60 }} />

          {/* 1. Recovery Gauge Hero */}
          <View style={styles.gaugeContainer}>
            <RingProgress
              value={78}
              size={200}
              strokeWidth={16}
              gradientColors={['#EF4444', '#A3E635']} // Red to Green
              showValue={false}
            />
            <View style={styles.gaugeOverlay}>
              <Text style={styles.gaugeValue}>78</Text>
              <Text style={styles.gaugeLabel}>RECOVERY</Text>
            </View>
          </View>

          {/* 2. Metrics Grid */}
          <View style={styles.metricsRow}>
            <GlassCard style={styles.metricCard}>
              <Ionicons name="moon-outline" size={24} color="#A3E635" />
              <Text style={styles.metricValue}>7h 20m</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <Ionicons name="pulse-outline" size={24} color="#3B82F6" />
              <Text style={styles.metricValue}>52ms</Text>
              <Text style={styles.metricLabel}>HRV</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <Ionicons name="flame-outline" size={24} color="#F59E0B" />
              <Text style={styles.metricValue}>2,100</Text>
              <Text style={styles.metricLabel}>Burn</Text>
            </GlassCard>
          </View>

          {/* 3. Mirror Gallery (Body Scans) */}
          <Text style={styles.sectionTitle}>Mirror Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} style={styles.galleryCard} intensity={20}>
                {/* Placeholder for Body Scan Image */}
                <View style={styles.scanPlaceholder}>
                  <Ionicons name="body-outline" size={48} color="rgba(255,255,255,0.2)" />
                </View>
                <Text style={styles.galleryDate}>Jan {10 + i}</Text>
              </GlassCard>
            ))}
          </ScrollView>

          {/* Spacer for Dock Nav */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  alignItems: 'center',
  marginBottom: 16,
},
  cardLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#94A3B8',
  textTransform: 'uppercase',
  marginBottom: 20,
  alignSelf: 'flex-start',
},
  gaugeContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
},
  gaugeValueContainer: {
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
},
  heroValue: {
  fontSize: 48, // heroXL
  fontWeight: '800',
  color: '#F1F5F9',
  lineHeight: 56,
  letterSpacing: -1,
},
  gaugeLabels: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  paddingHorizontal: 20,
  gap: 8,
},
  gaugeLabelText: {
  fontSize: 12,
  color: '#94A3B8',
  fontWeight: '600',
},
  gaugeLine: {
  flex: 1,
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
  gaugeDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#A3E635',
  borderWidth: 2,
  borderColor: '#0B1410',
},
  metricsRow: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 16,
},
  metricCard: {
  flex: 1,
  padding: 16,
  height: 110,
  justifyContent: 'space-between',
},
  metricTitle: {
  fontSize: 14,
  color: '#94A3B8',
},
  metricValue: {
  fontSize: 20,
  fontWeight: '700',
  marginTop: 4,
},
  metricSub: {
  fontSize: 12,
  color: '#64748B',
},
  insightCard: {
  padding: 20,
  marginBottom: 16,
  gap: 12,
  backgroundColor: 'rgba(245, 158, 11, 0.05)', // Subtle amber tint
},
  insightHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
  insightTitle: {
  fontSize: 12,
  fontWeight: '700',
  color: '#F59E0B',
  letterSpacing: 0.5,
},
  insightBody: {
  fontSize: 16,
  color: '#F1F5F9',
  lineHeight: 24,
},
  toggleCard: {
  padding: 16,
  marginBottom: 16,
  alignItems: 'center',
},
  toggleText: {
  fontSize: 14,
  color: '#94A3B8',
  marginBottom: 8,
},
  dots: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
  dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.2)',
},
  dotActive: {
  backgroundColor: '#A3E635',
},
  dotText: {
  fontSize: 12,
  color: '#F1F5F9',
},
  fab: {
  position: 'absolute',
  bottom: 100,
  right: 20,
  zIndex: 20,
},
});