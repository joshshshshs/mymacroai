import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore, useFreeAdjustmentsUsed, useIsProMember } from '@/src/store/UserStore';
import AutoAdjuster, { type AdjustmentResult } from '../../../services/nutrition/AutoAdjuster';

interface MagicAdjustmentCardProps {
  adjustment: AdjustmentResult;
  onAdjust?: (addedCalories: number) => void;
  onUpgrade?: () => void;
}

/**
 * 魔法调整卡片组件
 * 仅在非Pro会员且AutoAdjuster建议调整时显示
 */
export const MagicAdjustmentCard: React.FC<MagicAdjustmentCardProps> = ({
  adjustment,
  onAdjust,
  onUpgrade
}: MagicAdjustmentCardProps) => {
  const freeAdjustmentsUsed = useFreeAdjustmentsUsed();
  const isProMember = useIsProMember();
  const { incrementFreeAdjustments } = useUserStore();

  // 条件渲染：仅对非Pro会员且需要调整时显示
  if (isProMember || !adjustment.shouldAdjust) {
    return null;
  }

  const remainingAdjustments = 2 - freeAdjustmentsUsed;
  const canUseFreeAdjustment = remainingAdjustments > 0;

  const handleAdjust = () => {
    if (canUseFreeAdjustment) {
      incrementFreeAdjustments();
      onAdjust?.(adjustment.addedCalories);
    } else {
      onUpgrade?.();
    }
  };

  const getButtonText = () => {
    if (canUseFreeAdjustment) {
      return `应用调整 (${remainingAdjustments}/2 本周免费)`;
    } else {
      return '升级到Pro享受无限调整';
    }
  };

  const getCardStyle = () => {
    if (canUseFreeAdjustment) {
      return styles.availableCard;
    } else {
      return styles.limitedCard;
    }
  };

  return (
    <View style={[styles.container, getCardStyle()]}>
      <BlurView intensity={20} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={canUseFreeAdjustment ? ['#A3E635', '#65A30D'] : ['#94A3B8', '#64748B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >
          <Text style={styles.headerText}>
            {canUseFreeAdjustment ? '✨ 智能调整建议' : '⚡ 调整次数已用尽'}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.title}>
            {AutoAdjuster.getAdjustmentDescription(adjustment) ||
              `检测到活动，建议增加${adjustment.addedCalories}千卡`}
          </Text>
          
          <Text style={styles.description}>
            {adjustment.reason}
          </Text>

          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              本周已使用: {freeAdjustmentsUsed}/2 次免费调整
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              canUseFreeAdjustment ? styles.availableButton : styles.limitedButton
            ]}
            onPress={handleAdjust}
          >
            <Text style={styles.buttonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>

          {!canUseFreeAdjustment && (
            <Text style={styles.upgradeHint}>
              升级到Pro会员享受无限智能调整
            </Text>
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  availableCard: {
    borderColor: '#A3E635',
    borderWidth: 1,
  },
  limitedCard: {
    borderColor: '#94A3B8',
    borderWidth: 1,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  usageInfo: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  usageText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  availableButton: {
    backgroundColor: '#A3E635',
  },
  limitedButton: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default MagicAdjustmentCard;
