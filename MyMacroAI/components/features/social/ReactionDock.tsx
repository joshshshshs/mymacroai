import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, { 
  FadeInUp,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '../../../hooks/useHaptics';
import { SquadMember } from '../../../types/user';

interface ReactionDockProps {
  selectedMember: SquadMember | null;
  onReactionSent: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Reaction dock component with animated emoji buttons
 */
export default function ReactionDock({ selectedMember, onReactionSent }: ReactionDockProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const { addReaction } = useUserStore(state => state);
  const { triggerReaction } = useHaptics();

  const reactions = [
    { id: 'fire', emoji: '🔥', label: 'Streak', color: '#F59E0B' },
    { id: 'muscle', emoji: '💪', label: 'Gains', color: '#10B981' },
    { id: 'nudge', emoji: '👉', label: 'Nudge', color: '#3B82F6' }
  ];

  const handleReactionPress = async (reactionId: string) => {
    if (!selectedMember || selectedMember.id === 'current') return;

    setSelectedReaction(reactionId);
    
    // Trigger haptic feedback
    await triggerReaction();
    
    // Add reaction to store
    addReaction({
      type: reactionId as 'fire' | 'muscle' | 'nudge',
      senderId: 'current',
      receiverId: selectedMember.id,
      message: `${reactionId} reaction sent to ${selectedMember.name}`,
      timestamp: new Date().toISOString()
    });

    // Reset after animation
    setTimeout(() => {
      setSelectedReaction(null);
      onReactionSent();
    }, 1500);
  };

  const getAnimatedStyle = (reactionId: string) => {
    return useAnimatedStyle(() => {
      const isSelected = selectedReaction === reactionId;
      return {
        transform: [
          { 
            scale: withSpring(isSelected ? 1.2 : 1, {
              damping: 10,
              stiffness: 100
            })
          }
        ],
        opacity: withSpring(isSelected ? 0.8 : 1)
      };
    });
  };

  const getPulseAnimation = (reactionId: string) => {
    return useAnimatedStyle(() => {
      const isSelected = selectedReaction === reactionId;
      return {
        transform: [
          { 
            scale: withSequence(
              withTiming(isSelected ? 1.5 : 0, { duration: 0 }),
              withTiming(isSelected ? 0 : 0, { duration: 1500 })
            )
          }
        ],
        opacity: withSequence(
          withTiming(isSelected ? 0.6 : 0, { duration: 0 }),
          withTiming(isSelected ? 0 : 0, { duration: 1500 })
        )
      };
    });
  };

  if (!selectedMember || selectedMember.id === 'current') {
    return null;
  }

  return (
    <Animated.View 
      entering={FadeInUp.duration(600).springify()}
      style={{
        position: 'absolute',
        bottom: 100,
        left: (screenWidth - 280) / 2,
        width: 280,
        zIndex: 1000,
      }}
    >
      {/* Selected Member Info */}
      <BlurView
        intensity={40}
        tint="dark"
        style={{
          padding: 16,
          borderRadius: 20,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
        }}
      >
        <Text style={{ 
          color: '#fff', 
          fontSize: 14, 
          fontWeight: '600',
          marginBottom: 4
        }}>
          Send reaction to
        </Text>
        <Text style={{ 
          color: '#3B82F6', 
          fontSize: 16, 
          fontWeight: 'bold'
        }}>
          {selectedMember.name}
        </Text>
      </BlurView>

      {/* Reaction Buttons */}
      <BlurView
        intensity={50}
        tint="dark"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 16,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        {reactions.map((reaction) => (
          <View key={reaction.id} style={{ alignItems: 'center' }}>
            {/* Pulse Effect */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: reaction.color,
                },
                getPulseAnimation(reaction.id)
              ]}
            />
            
            <Pressable
              onPress={() => handleReactionPress(reaction.id)}
              disabled={!!selectedReaction}
            >
              <Animated.View 
                style={[
                  {
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: reaction.color,
                    marginBottom: 8,
                  },
                  getAnimatedStyle(reaction.id)
                ]}
              >
                <Text style={{ fontSize: 24 }}>
                  {reaction.emoji}
                </Text>
                
                {/* Success Animation */}
                {selectedReaction === reaction.id && (
                  <Animated.Text
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(300)}
                    style={{
                      position: 'absolute',
                      fontSize: 12,
                      color: reaction.color,
                      fontWeight: 'bold',
                    }}
                  >
                    Sent!
                  </Animated.Text>
                )}
              </Animated.View>
            </Pressable>
            
            <Text style={{ 
              fontSize: 12, 
              color: '#9CA3AF',
              fontWeight: '500'
            }}>
              {reaction.label}
            </Text>
          </View>
        ))}
      </BlurView>

      {/* Instruction Text */}
      <Animated.Text
        entering={FadeInUp.duration(600).delay(200)}
        style={{
          textAlign: 'center',
          color: '#6B7280',
          fontSize: 11,
          marginTop: 8,
          fontStyle: 'italic',
        }}
      >
        Tap an emoji to send encouragement
      </Animated.Text>
    </Animated.View>
  );
}
