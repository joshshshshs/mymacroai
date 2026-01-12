import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../store/userStore';
import { useHaptics } from '../../hooks/useHaptics';
import { StoreItem } from '../../types/user';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock store items
const STORE_ITEMS: StoreItem[] = [
  // Liquid Skins
  {
    id: 'skin_gold',
    name: 'Golden Liquid',
    description: 'Premium gold theme with animated particles',
    price: 5000,
    category: 'liquid_skins',
    rarity: 'legendary',
    isPurchased: false,
    effect: 'Unlocks golden theme',
    icon: '🏆'
  },
  {
    id: 'skin_silver',
    name: 'Silver Stream',
    description: 'Elegant silver theme with flowing animations',
    price: 2500,
    category: 'liquid_skins',
    rarity: 'epic',
    isPurchased: false,
    effect: 'Unlocks silver theme',
    icon: '💎'
  },
  {
    id: 'skin_blue',
    name: 'Azure Current',
    description: 'Calm blue theme with water effects',
    price: 1000,
    category: 'liquid_skins',
    rarity: 'rare',
    isPurchased: false,
    effect: 'Unlocks blue theme',
    icon: '🌊'
  },

  // Deep Dives
  {
    id: 'dive_analysis',
    name: 'AI Health Analysis',
    description: 'Comprehensive AI-powered health report',
    price: 1500,
    category: 'deep_dives',
    rarity: 'epic',
    isPurchased: false,
    effect: 'Generates detailed health insights',
    icon: '🧠'
  },
  {
    id: 'dive_trends',
    name: 'Trend Analysis',
    description: 'Identify patterns in your health data',
    price: 800,
    category: 'deep_dives',
    rarity: 'rare',
    isPurchased: false,
    effect: 'Reveals health trends',
    icon: '📊'
  },

  // Streak Freeze
  {
    id: 'freeze_7',
    name: '7-Day Streak Shield',
    description: 'Protect your streak for 7 days',
    price: 2000,
    category: 'streak_freeze',
    rarity: 'epic',
    isPurchased: false,
    effect: 'Streak protection for 7 days',
    icon: '🛡️'
  },
  {
    id: 'freeze_3',
    name: '3-Day Safety Net',
    description: 'Basic streak protection for 3 days',
    price: 800,
    category: 'streak_freeze',
    rarity: 'rare',
    isPurchased: false,
    effect: 'Streak protection for 3 days',
    icon: '🔒'
  }
];

/**
 * Store modal with premium items and purchase functionality
 */
export default function StoreModal() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedItem, setPurchasedItem] = useState<string | null>(null);
  const macroCoins = useUserStore(state => state.economy.macroCoins);
  const purchaseHistory = useUserStore(state => state.economy.purchaseHistory);
  const { purchaseItem } = useUserStore(state => state);
  const { triggerPurchaseSuccess, triggerPurchaseFail, light } = useHaptics();

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'liquid_skins', name: 'Liquid Skins', icon: '??' },
    { id: 'deep_dives', name: 'Deep Dives', icon: '🔍' },
    { id: 'streak_freeze', name: 'Streak Freeze', icon: '🛡️' }
  ];

  const filteredItems = STORE_ITEMS.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#C77CFF';
      case 'rare': return '#4FC3F7';
      default: return '#78909C';
    }
  };

  const getRarityGradient = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case 'legendary':
        return ['#FFD700', '#FFA000'];
      case 'epic':
        return ['#C77CFF', '#8E24AA'];
      case 'rare':
        return ['#4FC3F7', '#0288D1'];
      default:
        return ['#78909C', '#546E7A'];
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    await light();
    
    if (macroCoins < item.price) {
      await triggerPurchaseFail();
      return;
    }

    const success = purchaseItem(item);
    if (success) {
      setPurchasedItem(item.id);
      await triggerPurchaseSuccess();
      
      setTimeout(() => {
        setPurchasedItem(null);
      }, 2000);
    } else {
      await triggerPurchaseFail();
    }
  };

  const canAfford = (price: number) => macroCoins >= price;
  const isPurchased = (itemId: string) => 
    purchaseHistory.some(item => item.id === itemId);

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={{ 
          paddingTop: 60, 
          paddingHorizontal: 20, 
          paddingBottom: 20 
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: '#6B7280', fontSize: 16 }}>✕</Text>
          </Pressable>
          
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            Hidden Store
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#FFD700', fontSize: 18, marginRight: 4 }}>⚡</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {macroCoins.toLocaleString()}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Category Filter */}
      <Animated.ScrollView 
        horizontal
        entering={FadeInUp.duration(600).delay(200)}
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 20, marginBottom: 20 }}
      >
        {categories.map((category, index) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Animated.View
              entering={SlideInRight.duration(400).delay(index * 100)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.id 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: selectedCategory === category.id 
                  ? '#3B82F6' 
                  : 'rgba(255, 255, 255, 0.2)',
                marginRight: 8,
              }}
            >
              <Text style={{ 
                color: selectedCategory === category.id ? '#3B82F6' : '#fff',
                fontSize: 14,
                fontWeight: '600'
              }}>
                {category.icon} {category.name}
              </Text>
            </Animated.View>
          </Pressable>
        ))}
      </Animated.ScrollView>

      {/* Items Grid */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {filteredItems.map((item, index) => {
            const purchased = isPurchased(item.id);
            const affordable = canAfford(item.price);
            
            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.duration(600).delay(index * 100)}
                style={{ width: (screenWidth - 60) / 2, marginBottom: 20 }}
              >
                <Pressable
                  onPress={() => !purchased && handlePurchase(item)}
                  disabled={purchased || !affordable}
                >
                  <LinearGradient
                    colors={getRarityGradient(item.rarity)}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={{
                      borderRadius: 16,
                      padding: 2,
                    }}
                  >
                    <BlurView
                      intensity={40}
                      tint="dark"
                      style={{
                        borderRadius: 14,
                        padding: 16,
                        height: 200,
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Item Header */}
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>
                          {item.icon}
                        </Text>
                        <Text style={{ 
                          color: '#fff', 
                          fontSize: 16, 
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {item.name}
                        </Text>
                      </View>

                      {/* Description */}
                      <Text style={{ 
                        color: '#9CA3AF', 
                        fontSize: 12,
                        textAlign: 'center',
                        lineHeight: 16
                      }}>
                        {item.description}
                      </Text>

                      {/* Price and Purchase */}
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          marginBottom: 8
                        }}>
                          <Text style={{ color: '#FFD700', fontSize: 14, marginRight: 4 }}>⚡</Text>
                          <Text style={{ 
                            color: affordable ? '#FFD700' : '#EF4444',
                            fontSize: 16,
                            fontWeight: 'bold'
                          }}>
                            {item.price.toLocaleString()}
                          </Text>
                        </View>

                        {purchased ? (
                          <View style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            borderWidth: 1,
                            borderColor: '#10B981',
                          }}>
                            <Text style={{ 
                              color: '#10B981', 
                              fontSize: 12,
                              fontWeight: '600'
                            }}>
                              Purchased
                            </Text>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() => handlePurchase(item)}
                            disabled={!affordable}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                              borderRadius: 12,
                              backgroundColor: affordable 
                                ? 'rgba(59, 130, 246, 0.3)' 
                                : 'rgba(239, 68, 68, 0.3)',
                              borderWidth: 1,
                              borderColor: affordable ? '#3B82F6' : '#EF4444',
                            }}
                          >
                            <Text style={{ 
                              color: affordable ? '#3B82F6' : '#EF4444',
                              fontSize: 12,
                              fontWeight: '600'
                            }}>
                              {affordable ? 'Purchase' : 'Need Coins'}
                            </Text>
                          </Pressable>
                        )}
                      </View>

                      {/* Purchase Success Animation */}
                      {purchasedItem === item.id && (
                        <Animated.View
                          entering={ZoomIn.duration(300)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: '#10B981',
                          }}
                        >
                          <Text style={{ 
                            color: '#10B981', 
                            fontSize: 18,
                            fontWeight: 'bold'
                          }}>
                            ✅ Purchased!
                          </Text>
                        </Animated.View>
                      )}
                    </BlurView>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
