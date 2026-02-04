import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BentoCard from '../../../../components/ui/BentoCard';
import LiquidGauge from '../../../../components/ui/LiquidGauge';
import { useHaptics } from '../../../../hooks/useHaptics';
import { Recipe } from '../../../data/recipes';
import { useRecipeEngine, ScoredRecipe } from '../../../services/nutrition/RecipeEngine';

interface SuggestionCardProps {
  suggestion: ScoredRecipe;
  onViewRecipe: (recipe: Recipe) => void;
  isVisible: boolean;
}

/**
 * 智能建议卡片组件
 * 仅在晚上6点后显示，基于健康数据提供个性化建议
 */
export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onViewRecipe,
  isVisible
}) => {
  const { triggerHaptic } = useHaptics();
  const { getSuggestionDetails } = useRecipeEngine();

  if (!isVisible) {
    return null;
  }

  const details = getSuggestionDetails(suggestion);

  const handleViewRecipe = () => {
    triggerHaptic('light');
    onViewRecipe(suggestion.recipe);
  };

  // 根据分数生成动态文案
  const getDynamicMessage = (score: number, recipe: Recipe) => {
    if (score >= 90) {
      return `完美匹配！${recipe.title} 非常适合您当前的状态`;
    } else if (score >= 70) {
      return `推荐！${recipe.title} 符合您的营养需求`;
    } else {
      return `可选：${recipe.title} 基本满足要求`;
    }
  };

  return (
    <BentoCard style={styles.card} tint="light" intensity={80}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💡</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>智能建议</Text>
          <Text style={styles.headerSubtitle}>
            {getDynamicMessage(suggestion.score, suggestion.recipe)}
          </Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* 评分显示 */}
        <View style={styles.scoreSection}>
          <LiquidGauge
            value={suggestion.score}
            maxValue={100}
            size={60}
            color={suggestion.score >= 70 ? '#10B981' : '#F59E0B'}
            label="匹配度"
          />
          
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreText}>{suggestion.score}分</Text>
            <Text style={styles.recommendationText}>{details.recommendation}</Text>
          </View>
        </View>

        {/* 评分详情 */}
        <View style={styles.breakdownSection}>
          {details.breakdown.map((item: string, index: number) => (
            <View key={index} style={styles.breakdownItem}>
              <Text style={styles.breakdownText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* 食谱预览 */}
        <View style={styles.recipePreview}>
          <Text style={styles.recipeTitle}>{suggestion.recipe.title}</Text>
          <Text style={styles.recipeDescription}>{suggestion.recipe.description}</Text>
          
          <View style={styles.macroInfo}>
            <Text style={styles.macroText}>
              {suggestion.recipe.macros.kcal}卡路里 • {suggestion.recipe.preparationTime}分钟
            </Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <TouchableOpacity 
          style={[
            styles.viewButton,
            suggestion.score >= 70 ? styles.highScoreButton : styles.lowScoreButton
          ]}
          onPress={handleViewRecipe}
        >
          <Text style={styles.buttonText}>查看食谱详情</Text>
        </TouchableOpacity>
      </View>
    </BentoCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  container: {
    paddingTop: 8,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreDetails: {
    marginLeft: 16,
    flex: 1,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recommendationText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownItem: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  recipePreview: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  macroInfo: {
    marginTop: 8,
  },
  macroText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  viewButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  highScoreButton: {
    backgroundColor: '#10B981',
  },
  lowScoreButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// 智能显示逻辑Hook
export const useSuggestionVisibility = () => {
  const isEvening = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 18; // 晚上6点后
  };

  const hasDinnerRecorded = () => {
    // 这里应该检查用户是否已经记录了晚餐
    // 暂时返回false，假设用户未记录晚餐
    return false;
  };

  return {
    shouldShowSuggestion: isEvening() && !hasDinnerRecorded(),
    isEvening: isEvening()
  };
};

export default SuggestionCard;
