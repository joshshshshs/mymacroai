import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../store/userStore';
import { useHaptics } from '../../hooks/useHaptics';
import { logger } from '../../utils/logger';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 付费墙组件 - Complete Monetization系统核心
 */
export default function Paywall() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { triggerSuccess, triggerImpact } = useHaptics();

  const subscriptionPlans = {
    monthly: {
      price: '$9.99',
      period: 'month',
      savings: '',
      popular: false,
    },
    yearly: {
      price: '$79.99',
      period: 'year',
      savings: '33% off',
      popular: true,
    },
  };

  const features = [
    {
      icon: '🔮',
      title: 'AI Deep Dives',
      description: 'Advanced analytics and insights powered by AI',
      premium: true,
    },
    {
      icon: '💎',
      title: 'Liquid Skins',
      description: 'Exclusive animated themes and visual effects',
      premium: true,
    },
    {
      icon: '🛡️',
      title: 'Streak Protection',
      description: 'Never lose your progress with streak shields',
      premium: true,
    },
    {
      icon: '👥',
      title: 'Premium Squads',
      description: 'Join exclusive communities and challenges',
      premium: true,
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Detailed progress tracking and trend analysis',
      premium: true,
    },
    {
      icon: '⚡',
      title: 'Priority Support',
      description: 'Fast-track assistance and feature requests',
      premium: true,
    },
  ];

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    await triggerImpact('heavy');
    // 这里集成实际的支付逻辑
    logger.log(`Subscribing to ${plan} plan`);
    
    // 模拟支付成功
    setTimeout(() => {
      triggerSuccess();
      // 这里应该更新用户订阅状态
    }, 1500);
  };

  const handleRestorePurchase = async () => {
    await triggerImpact('medium');
    // 恢复购买逻辑
    logger.log('Restoring purchase...');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
      {/* Header */}
      <Animated.View 
        entering={SlideInDown.springify()}
        style={{ 
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 20,
          alignItems: 'center',
        }}
      >
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: '#fff',
          marginBottom: 8,
        }}>
          MyMacro AI Pro
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: '#9CA3AF',
          textAlign: 'center',
          lineHeight: 22,
        }}>
          Unlock the full potential of your health journey
        </Text>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Pricing Cards */}
        <Animated.View 
          entering={FadeIn.delay(200)}
          style={{ paddingHorizontal: 24, marginBottom: 32 }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {Object.entries(subscriptionPlans).map(([key, plan]) => (
              <Pressable
                key={key}
                onPress={() => setSelectedPlan(key as 'monthly' | 'yearly')}
                style={{ flex: 1 }}
              >
                <Animated.View
                  style={[
                    {
                      borderRadius: 20,
                      padding: 20,
                      borderWidth: 3,
                      borderColor: selectedPlan === key ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: selectedPlan === key ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    },
                  ]}
                >
                  {plan.popular && (
                    <View style={{
                      position: 'absolute',
                      top: -10,
                      alignSelf: 'center',
                      backgroundColor: '#8B5CF6',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ 
                        fontSize: 12, 
                        fontWeight: 'bold', 
                        color: '#fff' 
                      }}>
                        MOST POPULAR
                      </Text>
                    </View>
                  )}

                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: '#fff',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}>
                    {plan.price}
                  </Text>
                  
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#9CA3AF',
                    textAlign: 'center',
                    marginBottom: 8,
                  }}>
                    per {plan.period}
                  </Text>

                  {plan.savings && (
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#10B981',
                      textAlign: 'center',
                      fontWeight: '600',
                    }}>
                      {plan.savings}
                    </Text>
                  )}
                </Animated.View>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View 
          entering={FadeIn.delay(400)}
          style={{ paddingHorizontal: 24, marginBottom: 32 }}
        >
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#fff',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Everything Included
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(600 + index * 100)}
                style={{ width: (screenWidth - 72) / 2 }}
              >
                <BlurView
                  intensity={30}
                  tint="dark"
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    height: 120,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>
                    {feature.icon}
                  </Text>
                  
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: '#fff',
                    marginBottom: 4,
                  }}>
                    {feature.title}
                  </Text>
                  
                  <Text style={{ 
                    fontSize: 11, 
                    color: '#9CA3AF',
                    lineHeight: 14,
                  }}>
                    {feature.description}
                  </Text>
                </BlurView>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Free Trial Notice */}
        <Animated.View 
          entering={FadeIn.delay(1200)}
          style={{ paddingHorizontal: 24, marginBottom: 24 }}
        >
          <BlurView
            intensity={20}
            tint="dark"
            style={{
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: '#10B981',
              textAlign: 'center',
            }}>
              🎉 7-day free trial included • Cancel anytime
            </Text>
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeIn.delay(1400)}
          style={{ paddingHorizontal: 24, gap: 12 }}
        >
          {/* Subscribe Button */}
          <Pressable
            onPress={() => handleSubscribe(selectedPlan)}
            style={({ pressed }) => ({
              borderRadius: 16,
              padding: 20,
              backgroundColor: pressed ? 'rgba(139, 92, 246, 0.8)' : '#8B5CF6',
            })}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={[0, 0]}
              end={[1, 1]}
              style={{
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: '#fff' 
              }}>
                Start Free Trial
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: 4,
              }}>
                {subscriptionPlans[selectedPlan].price} per {subscriptionPlans[selectedPlan].period}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Restore Purchase */}
          <Pressable
            onPress={handleRestorePurchase}
            style={({ pressed }) => ({
              borderRadius: 12,
              padding: 16,
              backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            })}
          >
            <Text style={{ 
              fontSize: 16, 
              color: '#9CA3AF',
              textAlign: 'center',
              fontWeight: '600',
            }}>
              Restore Purchase
            </Text>
          </Pressable>

          {/* Terms */}
          <Text style={{ 
            fontSize: 11, 
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: 16,
            marginTop: 8,
          }}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            Subscription automatically renews unless canceled 24 hours before the end of the current period.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}