import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useUserStore, useHealthMetrics, usePreferences } from '../../store/userStore';
import BentoCard from '../../components/ui/BentoCard';
import LiquidGauge from '../../components/ui/LiquidGauge';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const CARD_SPACING = 16;
const CARD_WIDTH = (width - CARD_SPACING * 3) / 2;

interface HealthSummary {
  calories: {
    consumed: number;
    remaining: number;
    target: number;
  };
  sleep: {
    score: number;
    duration: number;
    quality: string;
  };
  activity: {
    steps: number;
    activeMinutes: number;
    caloriesBurned: number;
  };
  hydration: {
    current: number;
    target: number;
    progress: number;
  };
}

export default function DashboardScreen() {
  const healthMetrics = useHealthMetrics();
  const preferences = usePreferences();
  const [isLoading, setIsLoading] = useState(true);
  const [healthSummary, setHealthSummary] = useState<HealthSummary>({
    calories: { consumed: 0, remaining: 2000, target: 2500 },
    sleep: { score: 85, duration: 7.5, quality: '良好' },
    activity: { steps: 8542, activeMinutes: 45, caloriesBurned: 420 },
    hydration: { current: 1800, target: 2500, progress: 72 },
  });

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setAiSuggestions([
        '建议增加15分钟步行活动以完成日目标',
        '水分摄入已达到目标的72%，继续保持',
        '今日睡眠质量良好，建议保持规律作息'
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCalorieProgress = () => {
    const progress = (healthSummary.calories.consumed / healthSummary.calories.target) * 100;
    return Math.min(progress, 100);
  };

  const getSleepColor = (score: number) => {
    if (score >= 80) return ['#34C759', '#30D158'];
    if (score >= 60) return ['#FFD60A', '#FFCC00'];
    return ['#FF3B30', '#FF453A'];
  };

  const getActivityColor = (steps: number) => {
    const target = 10000;
    const progress = (steps / target) * 100;
    if (progress >= 100) return ['#5856D6', '#5E5CE6'];
    if (progress >= 70) return ['#007AFF', '#5AC8FA'];
    return ['#AF52DE', '#BF5AF2'];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载健康数据中...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* AI建议横幅 */}
      {aiSuggestions.length > 0 && preferences.aiRecommendations && (
        <BentoCard
          style={styles.bannerCard}
          intensity={60}
          tint="dark"
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>AI健康建议</Text>
            <Text style={styles.bannerText}>
              {aiSuggestions[0]}
            </Text>
          </View>
        </BentoCard>
      )}

      {/* Hero Section - 热量管理 */}
      <BentoCard style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>热量管理</Text>
            <Text style={styles.heroSubtitle}>今日目标: {healthSummary.calories.target} kcal</Text>
          </View>
          
          <View style={styles.heroGauge}>
            <LiquidGauge
              value={getCalorieProgress()}
              size={140}
              strokeWidth={16}
              gradientColors={['#FF2D55', '#FF375F']}
              label="已摄入"
              unit="%"
            />
            
            <View style={styles.calorieStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{healthSummary.calories.consumed}</Text>
                <Text style={styles.statLabel}>已摄入</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.remainingValue]}>
                  {healthSummary.calories.remaining}
                </Text>
                <Text style={styles.statLabel}>剩余</Text>
              </View>
            </View>
          </View>
        </View>
      </BentoCard>

      {/* Context Section - 两列小卡片 */}
      <View style={styles.contextSection}>
        {/* 睡眠质量卡片 */}
        <BentoCard style={{ ...styles.contextCard, width: CARD_WIDTH }}>
          <View style={styles.contextContent}>
            <LiquidGauge
              value={healthSummary.sleep.score}
              size={80}
              strokeWidth={8}
              gradientColors={getSleepColor(healthSummary.sleep.score)}
              showValue={true}
              unit=""
            />
            <View style={styles.contextText}>
              <Text style={styles.contextTitle}>睡眠质量</Text>
              <Text style={styles.contextValue}>{healthSummary.sleep.duration}h</Text>
              <Text style={styles.contextSubtitle}>{healthSummary.sleep.quality}</Text>
            </View>
          </View>
        </BentoCard>

        {/* 活动步数卡片 */}
        <BentoCard style={{ ...styles.contextCard, width: CARD_WIDTH }}>
          <View style={styles.contextContent}>
            <LiquidGauge
              value={(healthSummary.activity.steps / 10000) * 100}
              size={80}
              strokeWidth={8}
              gradientColors={getActivityColor(healthSummary.activity.steps)}
              showValue={false}
            />
            <View style={styles.contextText}>
              <Text style={styles.contextTitle}>今日步数</Text>
              <Text style={styles.contextValue}>
                {healthSummary.activity.steps.toLocaleString()}
              </Text>
              <Text style={styles.contextSubtitle}>
                {healthSummary.activity.activeMinutes}分钟活动
              </Text>
            </View>
          </View>
        </BentoCard>
      </View>

      {/* 水分补充卡片 */}
      <BentoCard style={styles.hydrationCard}>
        <View style={styles.hydrationContent}>
          <View style={styles.hydrationHeader}>
            <Text style={styles.hydrationTitle}>水分补充</Text>
            <Text style={styles.hydrationSubtitle}>
              {healthSummary.hydration.current}ml / {healthSummary.hydration.target}ml
            </Text>
          </View>
          
          <View style={styles.hydrationProgress}>
            <LiquidGauge
              value={healthSummary.hydration.progress}
              size={100}
              strokeWidth={10}
              gradientColors={['#32D74B', '#30D158']}
              label="水分"
              unit="%"
            />
            
            <View style={styles.hydrationStats}>
              <Text style={styles.hydrationValue}>
                还需 {healthSummary.hydration.target - healthSummary.hydration.current}ml
              </Text>
              <Text style={styles.hydrationTip}>建议每小时补充200ml水分</Text>
            </View>
          </View>
        </View>
      </BentoCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: CARD_SPACING,
    gap: CARD_SPACING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  bannerCard: {
    marginBottom: CARD_SPACING,
  },
  bannerContent: {
    padding: 8,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    minHeight: 200,
  },
  heroContent: {
    flex: 1,
  },
  heroHeader: {
    marginBottom: 20,
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  heroGauge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calorieStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
  remainingValue: {
    color: '#34C759',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  contextSection: {
    flexDirection: 'row',
    gap: CARD_SPACING,
  },
  contextCard: {
    minHeight: 120,
  },
  contextContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contextText: {
    flex: 1,
  },
  contextTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contextValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  contextSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  hydrationCard: {
    minHeight: 140,
  },
  hydrationContent: {
    flex: 1,
  },
  hydrationHeader: {
    marginBottom: 16,
  },
  hydrationTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  hydrationSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  hydrationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  hydrationStats: {
    flex: 1,
  },
  hydrationValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  hydrationTip: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    lineHeight: 16,
  },
});