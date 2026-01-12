import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useUserStore } from '../../../store/userStore';
import { useHaptics } from '../../../hooks/useHaptics';
import { SquadMember } from '../../../types/user';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 物理碰撞排名系统 - Social Physics核心组件
 */
export default function Leaderboard() {
  const { squad, streak } = useUserStore(state => state.social);
  const { triggerImpact, triggerCollision } = useHaptics();
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [collisionActive, setCollisionActive] = useState(false);

  // 动画值用于物理效果
  const positions = useRef(
    squad?.members?.map(() => ({
      x: useSharedValue(0),
      y: useSharedValue(0),
      rotation: useSharedValue(0),
      scale: useSharedValue(1),
    })) || []
  ).current;

  // 如果没有小队数据，显示空状态
  if (!squad || !squad.members || squad.members.length === 0) {
    return (
      <Animated.View 
        entering={FadeIn.duration(600)}
        style={{
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <BlurView
          intensity={30}
          tint="dark"
          style={{
            padding: 32,
            borderRadius: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🏆</Text>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#fff',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            排行榜
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: '#9CA3AF',
            textAlign: 'center',
            lineHeight: 20 
          }}>
            加入小队后，在这里查看成员排名和互动
          </Text>
        </BlurView>
      </Animated.View>
    );
  }

  // 计算成员排名（基于streak和一致性分数）
  const rankedMembers = [...squad.members].sort((a, b) => {
    const aScore = (a.streak || 0) * 10 + (a.consistencyScore || 0);
    const bScore = (b.streak || 0) * 10 + (b.consistencyScore || 0);
    return bScore - aScore;
  });

  // 处理排名项点击（物理碰撞效果）
  const handleRankPress = async (rank: number, member: SquadMember) => {
    if (collisionActive) return;
    
    setCollisionActive(true);
    setSelectedRank(rank);
    
    // 触发触觉反馈
    await triggerCollision();
    
    // 物理碰撞动画
    const item = positions[rank];
    if (item) {
      item.x.value = withSequence(
        withSpring(-10, { damping: 3, stiffness: 200 }),
        withSpring(0, { damping: 10, stiffness: 100 })
      );
      item.y.value = withSequence(
        withSpring(-10, { damping: 3, stiffness: 200 }),
        withSpring(0, { damping: 10, stiffness: 100 })
      );
      item.rotation.value = withSequence(
        withSpring(-5, { damping: 3, stiffness: 200 }),
        withSpring(0, { damping: 10, stiffness: 100 })
      );
      item.scale.value = withSequence(
        withSpring(1.05, { damping: 3, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
    }

    // 重置状态
    setTimeout(() => {
      setCollisionActive(false);
      setSelectedRank(null);
    }, 800);
  };

  // 获取排名颜色
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 0: return '#FFD700'; // 金牌
      case 1: return '#C0C0C0'; // 银牌
      case 2: return '#CD7F32'; // 铜牌
      default: return '#3B82F6'; // 蓝色
    }
  };

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${rank + 1}️⃣`;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 标题区域 */}
      <Animated.View 
        entering={SlideInDown.springify()}
        style={{ padding: 24, paddingBottom: 16 }}
      >
        <Text style={{ 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: '#fff',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Physics Race Track
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#9CA3AF',
          textAlign: 'center'
        }}>
          点击成员查看详细信息，体验物理碰撞效果
        </Text>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {rankedMembers.map((member, index) => {
          const isCurrentUser = member.id === 'current';
          const rankColor = getRankColor(index);
          const rankIcon = getRankIcon(index);
          const item = positions[index] || {
            x: useSharedValue(0),
            y: useSharedValue(0),
            rotation: useSharedValue(0),
            scale: useSharedValue(1),
          };

          // 动画样式
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [
              { translateX: item.x.value },
              { translateY: item.y.value },
              { rotate: `${item.rotation.value}deg` },
              { scale: item.scale.value },
            ],
          }));

          return (
            <Animated.View
              key={member.id}
              entering={FadeIn.delay(index * 100)}
              style={[
                {
                  marginBottom: 12,
                },
                animatedStyle
              ]}
            >
              <Pressable
                onPress={() => handleRankPress(index, member)}
                disabled={collisionActive}
              >
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: isCurrentUser ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: isCurrentUser ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* 排名图标 */}
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20,
                    backgroundColor: rankColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                      {rankIcon}
                    </Text>
                  </View>

                  {/* 成员信息 */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        color: '#fff',
                        marginRight: 8 
                      }}>
                        {member.name}
                      </Text>
                      {isCurrentUser && (
                        <Text style={{ 
                          fontSize: 12, 
                          color: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 8 
                        }}>
                          你
                        </Text>
                      )}
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* 连续打卡天数 */}
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        marginRight: 12 
                      }}>
                        <Text style={{ fontSize: 12, color: '#F59E0B', marginRight: 4 }}>🔥</Text>
                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                          {member.streak || 0}天
                        </Text>
                      </View>
                      
                      {/* 一致性分数 */}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#3B82F6', marginRight: 4 }}>📊</Text>
                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                          {Math.round(member.consistencyScore || 0)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 综合分数 */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: 'bold', 
                      color: rankColor 
                    }}>
                      {Math.round((member.streak || 0) * 10 + (member.consistencyScore || 0))}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>综合分</Text>
                  </View>
                </BlurView>
              </Pressable>

              {/* 选中状态指示器 */}
              {selectedRank === index && (
                <Animated.View
                  entering={ZoomIn.duration(300)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: rankColor,
                    backgroundColor: `${rankColor}20`,
                  }}
                />
              )}
            </Animated.View>
          );
        })}

        {/* 物理效果说明 */}
        <Animated.View 
          entering={FadeIn.delay(rankedMembers.length * 100 + 200)}
          style={{ 
            backgroundColor: 'rgba(107, 114, 128, 0.2)', 
            borderRadius: 12, 
            padding: 16,
            marginTop: 8 
          }}
        >
          <Text style={{ 
            fontSize: 12, 
            color: '#9CA3AF',
            fontStyle: 'italic',
            textAlign: 'center' 
          }}>
            💡 点击排名卡片体验物理碰撞效果和触觉反馈
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
