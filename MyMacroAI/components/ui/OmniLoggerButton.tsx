import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOmniLogger } from '../../hooks/useOmniLogger';
import { useHaptics } from '../../hooks/useHaptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WaveAnimationProps {
  isActive: boolean;
  color: string;
}

/**
 * 液态波形动画组件
 */
const WaveAnimation: React.FC<WaveAnimationProps> = ({ isActive, color }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // 启动波纹动画
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 2,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 750,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 750,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      // 停止动画
      scale.setValue(1);
      opacity.setValue(0);
    }
  }, [isActive, scale, opacity]);

  if (!isActive) return null;

  return (
    <View style={styles.waveContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.wave,
            {
              backgroundColor: color,
              transform: [{ scale: Animated.add(scale, index * 0.3) }],
              opacity: Animated.add(opacity, -index * 0.2),
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * 语音输入状态指示器
 */
const VoiceIndicator: React.FC<{ isRecording: boolean; volume: number }> = ({
  isRecording,
  volume,
}) => {
  const bars = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bars, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bars, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bars.setValue(0);
    }
  }, [isRecording, bars]);

  if (!isRecording) return null;

  return (
    <View style={styles.voiceIndicator}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.voiceBar,
            {
              transform: [
                {
                  scaleY: bars.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3 + index * 0.1, 0.8 + index * 0.2],
                  }),
                },
              ],
              opacity: 0.7 + index * 0.1,
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Omni-Logger浮动按钮主组件
 */
const OmniLoggerButton: React.FC = () => {
  const {
    state,
    isActive,
    isListening,
    isProcessing,
    isExecuting,
    isSuccess,
    isError,
    startListening,
    stopListening,
    recordingText,
  } = useOmniLogger();

  const { triggerHaptic } = useHaptics();
  
  const [buttonScale] = useState(new Animated.Value(1));
  const [buttonRotation] = useState(new Animated.Value(0));
  const [showText, setShowText] = useState(false);

  // 根据状态决定颜色和图标
  const getButtonConfig = () => {
    switch (state) {
      case 'listening':
        return {
          color: '#10B981', // 绿色
          icon: 'mic' as const,
          gradient: ['#10B981', '#34D399'],
        };
      case 'processing':
        return {
          color: '#F59E0B', // 橙色
          icon: 'ellipsis-horizontal' as const,
          gradient: ['#F59E0B', '#FBBF24'],
        };
      case 'executing':
        return {
          color: '#8B5CF6', // 紫色
          icon: 'flash' as const,
          gradient: ['#8B5CF6', '#A78BFA'],
        };
      case 'success':
        return {
          color: '#10B981', // 绿色
          icon: 'checkmark' as const,
          gradient: ['#10B981', '#34D399'],
        };
      case 'error':
        return {
          color: '#EF4444', // 红色
          icon: 'close' as const,
          gradient: ['#EF4444', '#F87171'],
        };
      default:
        return {
          color: '#3B82F6', // 蓝色
          icon: 'mic-outline' as const,
          gradient: ['#3B82F6', '#60A5FA'],
        };
    }
  };

  const { color, icon, gradient } = getButtonConfig();

  // 按钮动画效果
  useEffect(() => {
    if (isActive) {
      // 激活状态动画
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1.1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 恢复默认状态
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRotation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, buttonScale, buttonRotation]);

  // 处理按钮点击
  const handlePress = async () => {
    await triggerHaptic('light');
    
    if (isActive) {
      // 如果在激活状态，停止监听
      await stopListening();
      setShowText(false);
    } else {
      // 如果在空闲状态，开始监听
      await startListening();
      setShowText(true);
    }
  };

  // 处理长按
  const handleLongPress = async () => {
    await triggerHaptic('heavy');
    // 长按可以触发其他功能，如手动输入模式
  };

  const rotation = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* 波形动画 */}
      <WaveAnimation isActive={isActive} color={color} />
      
      {/* 语音输入指示器 */}
      <VoiceIndicator isRecording={isListening} volume={0.5} />
      
      {/* 浮动按钮 */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: buttonScale },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
        >
          <Ionicons name={icon} size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* 状态文本显示 */}
      {showText && recordingText && (
        <Animated.View style={styles.textContainer}>
          <Text style={styles.recordingText} numberOfLines={2}>
            {recordingText}
          </Text>
        </Animated.View>
      )}

      {/* 状态指示器 */}
      <View style={styles.statusIndicator}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: color,
              opacity: isActive ? 1 : 0.3,
            },
          ]}
        />
        <Text style={styles.statusText}>
          {getStatusText(state)}
        </Text>
      </View>
    </View>
  );
};

// 获取状态文本
const getStatusText = (state: string) => {
  switch (state) {
    case 'listening':
      return '聆听中...';
    case 'processing':
      return '分析中...';
    case 'executing':
      return '执行中...';
    case 'success':
      return '完成';
    case 'error':
      return '错误';
    default:
      return '点击说话';
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  buttonWrapper: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  waveContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  voiceIndicator: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  voiceBar: {
    width: 3,
    height: 8,
    backgroundColor: '#10B981',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: -30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default OmniLoggerButton;