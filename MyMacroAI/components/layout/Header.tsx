import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { useHaptics } from '../../hooks/useHaptics';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showCoins?: boolean;
}

/**
 * Global header component with user avatar, logo, and currency badge
 */
export default function Header({ 
  title, 
  showLogo = true, 
  showCoins = true 
}: HeaderProps) {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const macroCoins = useUserStore(state => state.economy.macroCoins);
  const { notification } = useHaptics();

  const handleCoinPress = async () => {
    await notification();
    router.push('/store');
  };

  const getUserInitial = () => {
    return user?.name?.[0]?.toUpperCase() || 'U';
  };

  const getCoinColor = () => {
    if (macroCoins > 5000) return '#FFD700'; // Gold
    if (macroCoins > 2000) return '#C0C0C0'; // Silver
    return '#B8B8B8'; // Bronze
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()}
      style={{ 
        width: '100%', 
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
      }}
    >
      {/* Left: User Avatar or Initial */}
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: 'bold',
          color: '#fff'
        }}>
          {getUserInitial()}
        </Text>
      </View>

      {/* Center: Logo or Title */}
      {showLogo ? (
        <View style={{ alignItems: 'center' }}>
          <Animated.Image
            entering={FadeInUp.duration(800).springify()}
            source={require('../../assets/icon.png')}
            style={{ 
              width: 32, 
              height: 32,
              tintColor: '#fff'
            }}
            resizeMode="contain"
          />
          {title && (
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600',
              color: '#fff',
              marginTop: 2
            }}>
              {title}
            </Text>
          )}
        </View>
      ) : title ? (
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600',
          color: '#fff'
        }}>
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {/* Right: Currency Badge */}
      {showCoins && (
        <Pressable onPress={handleCoinPress}>
          <Animated.View
            entering={FadeInDown.duration(600).delay(200).springify()}
          >
            <BlurView
              intensity={30}
              tint="dark"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                minWidth: 80,
              }}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: 'bold',
                color: getCoinColor(),
                marginRight: 4
              }}>
                ⚡
              </Text>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600',
                color: '#fff'
              }}>
                {macroCoins.toLocaleString()}
              </Text>
            </BlurView>
          </Animated.View>
        </Pressable>
      )}
      
      {!showCoins && <View style={{ width: 40 }} />}
    </Animated.View>
  );
}