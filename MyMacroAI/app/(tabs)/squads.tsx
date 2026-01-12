import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { 
  Layout,
  FadeInDown,
  ZoomIn,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useUserStore } from '../../store/userStore';
import { useHaptics } from '../../hooks/useHaptics';
import Header from '../../components/layout/Header';
import ReactionDock from '../../components/features/social/ReactionDock';
import { SquadMember } from '../../types/user';

// Mock squad data for demonstration
const MOCK_SQUAD_MEMBERS: SquadMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    consistencyScore: 92,
    streak: 7,
    lastActive: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    name: 'Sarah Chen',
    consistencyScore: 88,
    streak: 14,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    consistencyScore: 76,
    streak: 3,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false
  },
  {
    id: '4',
    name: 'Emma Wilson',
    consistencyScore: 95,
    streak: 21,
    lastActive: new Date().toISOString(),
    isActive: true
  },
  {
    id: '5',
    name: 'David Kim',
    consistencyScore: 81,
    streak: 5,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];

/**
 * Squads tab screen with ranked member list based on consistency scores
 */
export default function SquadsScreen() {
  const [selectedMember, setSelectedMember] = useState<SquadMember | null>(null);
  const [pressedMember, setPressedMember] = useState<string | null>(null);
  const userStreak = useUserStore(state => state.social.streak);
  const userConsistencyScore = useUserStore(state => state.consistencyMetrics.consistencyScore);
  const { light, medium } = useHaptics();
  
  // Add current user to the squad list
  const squadMembers = useMemo(() => {
    const userMember: SquadMember = {
      id: 'current',
      name: 'You',
      consistencyScore: userConsistencyScore,
      streak: userStreak,
      lastActive: new Date().toISOString(),
      isActive: true
    };
    
    return [userMember, ...MOCK_SQUAD_MEMBERS];
  }, [userStreak, userConsistencyScore]);

  // Sort by consistency score (descending)
  const sortedMembers = useMemo(() => {
    return [...squadMembers].sort((a, b) => b.consistencyScore - a.consistencyScore);
  }, [squadMembers]);

  const getRankColor = (rank: number) => {
    if (rank === 0) return '#FFD700'; // Gold
    if (rank === 1) return '#C0C0C0'; // Silver
    if (rank === 2) return '#CD7F32'; // Bronze
    return '#6B7280'; // Default
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#10B981' : '#EF4444';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `${rank + 1}️⃣`;
  };

  const getMemberAnimation = (memberId: string) => {
    return useAnimatedStyle(() => {
      const isSelected = pressedMember === memberId;
      return {
        transform: [
          { 
            scale: withSpring(isSelected ? 0.95 : 1, {
              damping: 15,
              stiffness: 120
            })
          }
        ],
        borderColor: withSpring(
          isSelected ? 'rgba(59, 130, 246, 0.6)' : 
          memberId === 'current' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          { duration: 200 }
        )
      };
    });
  };

  const handleMemberPress = async (member: SquadMember) => {
    setPressedMember(member.id);
    await medium();
    setSelectedMember(member);
    setTimeout(() => setPressedMember(null), 200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Header title="Private Squad" showLogo={false} />
      
      {/* Squad Stats Overview */}
      <Animated.View 
        entering={FadeInDown.duration(600).delay(200)}
        style={{ padding: 20 }}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                {squadMembers.length}
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Members</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#10B981', fontSize: 24, fontWeight: 'bold' }}>
                {Math.max(...squadMembers.map(m => m.consistencyScore))}
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Top Score</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#F59E0B', fontSize: 24, fontWeight: 'bold' }}>
                {Math.max(...squadMembers.map(m => m.streak))}
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Longest Streak</Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Member List */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {sortedMembers.map((member, index) => (
          <Animated.View
            key={member.id}
            entering={SlideInRight.duration(400).delay(index * 100)}
            layout={Layout.springify()}
          >
            <Pressable
              onPress={() => handleMemberPress(member)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                marginBottom: 12,
              })}
            >
              <Animated.View style={getMemberAnimation(member.id)}>
                <BlurView
                intensity={25}
                tint="dark"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: member.id === 'current' 
                    ? 'rgba(59, 130, 246, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: member.id === 'current' 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Rank Badge with Physics Animation */}
                <Animated.View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getRankColor(index),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: 'bold',
                    color: '#000'
                  }}>
                    {getRankEmoji(index)}
                  </Text>
                </Animated.View>

                {/* Member Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600',
                      color: '#fff',
                      marginRight: 8
                    }}>
                      {member.name}
                    </Text>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: getStatusColor(member.isActive),
                    }} />
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#9CA3AF',
                      marginRight: 12
                    }}>
                      ⚡ {member.consistencyScore} pts
                    </Text>
                    <Text style={{ 
                      fontSize: 12, 
                      color: '#F59E0B'
                    }}>
                      🔥 {member.streak} days
                    </Text>
                  </View>
                </View>

                {/* Consistency Score Bar with Physics */}
                <Animated.View style={{ alignItems: 'flex-end' }}>
                  <View style={{
                    width: 60,
                    height: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    marginBottom: 4,
                    overflow: 'hidden',
                  }}>
                    <Animated.View
                      style={{
                        width: `${member.consistencyScore}%`,
                        height: '100%',
                        backgroundColor: member.consistencyScore >= 80 
                          ? '#10B981' 
                          : member.consistencyScore >= 60 
                          ? '#F59E0B' 
                          : '#EF4444',
                        borderRadius: 2,
                      }}
                      entering={FadeInDown.duration(800).delay(index * 200)}
                    />
                  </View>
                  <Text style={{ 
                    fontSize: 10, 
                    color: '#9CA3AF'
                  }}>
                    {member.consistencyScore}%
                  </Text>
                </Animated.View>
              </BlurView>
              </Animated.View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Reaction Dock */}
      <ReactionDock 
        selectedMember={selectedMember}
        onReactionSent={() => setSelectedMember(null)}
      />
    </View>
  );
}