import { Recipe, HERO_RECIPES, filterRecipesByHealth, scoreRecipeByPantry } from '../../data/recipes';
import { usePantryStore } from '../../store/pantryStore';

export interface RecipeHealthData {
  fatigueLevel?: number;
  sleepQuality?: number;
  recoveryPriority?: 'low' | 'medium' | 'high';
}

export interface MealSuggestionContext {
  healthData: RecipeHealthData;
  remainingMacros: {
    protein: number;
    carbs: number; 
    fat: number;
    kcal: number;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  isPreWorkout?: boolean;
  isPostWorkout?: boolean;
  maxCookingTime?: number; // 最大烹饪时间（分钟）
  onlyUseInventory?: boolean; // 仅使用库存食材
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  scoreBreakdown: {
    base: number;
    nutritionMatch: number;
    recoveryBoost: number;
    pantryBonus: number;
  };
}

/**
 * MyMacro AI智能推荐引擎
 * 基于健康指标、剩余营养素和储藏室食材提供个性化食谱建议
 */
export class RecipeEngine {
  private recipes: Recipe[];
  private pantryStore: typeof usePantryStore;

  constructor(recipes: Recipe[] = HERO_RECIPES) {
    this.recipes = recipes;
    this.pantryStore = usePantryStore;
  }

  /**
   * 计算食谱综合评分
   * 评分逻辑：基础(50) + 营养匹配(+20) + 恢复增强(+20) + 储藏室加成(+30)
   */
  private scoreRecipe(
    recipe: Recipe, 
    context: MealSuggestionContext
  ): ScoredRecipe {
    const pantryItems = this.pantryStore.getState().items;
    
    // 基础分数 - 所有食谱都有基础分
    const baseScore = 50;

    // 营养匹配分数 - 基于剩余营养素需求
    const nutritionMatchScore = this.calculateNutritionMatch(recipe, context.remainingMacros);

    // 恢复增强分数 - 基于健康数据优化
    const recoveryBoostScore = this.calculateRecoveryBoost(recipe, context.healthData);

    // 储藏室加成 - 基于可用食材匹配度
    const pantryBonusScore = this.calculatePantryBonus(recipe, pantryItems);

    const totalScore = baseScore + nutritionMatchScore + recoveryBoostScore + pantryBonusScore;

    return {
      recipe,
      score: Math.min(totalScore, 100), // 上限100分
      scoreBreakdown: {
        base: baseScore,
        nutritionMatch: nutritionMatchScore,
        recoveryBoost: recoveryBoostScore,
        pantryBonus: pantryBonusScore
      }
    };
  }

  /**
   * 计算营养匹配度分数 (0-20分)
   */
  private calculateNutritionMatch(
    recipe: Recipe, 
    remainingMacros: MealSuggestionContext['remainingMacros']
  ): number {
    if (remainingMacros.kcal <= 0) return 0;

    const macroRatio = {
      protein: recipe.macros.protein / remainingMacros.protein,
      carbs: recipe.macros.carbs / remainingMacros.carbs,
      fat: recipe.macros.fat / remainingMacros.fat,
      kcal: recipe.macros.kcal / remainingMacros.kcal
    };

    // 计算平均匹配度，避免超出剩余量
    const avgMatch = (macroRatio.protein + macroRatio.carbs + macroRatio.fat) / 3;
    const normalizedMatch = Math.min(avgMatch, 1); // 不超出剩余量

    return Math.round(normalizedMatch * 20);
  }

  /**
   * 计算恢复增强分数 (0-20分)
   */
  private calculateRecoveryBoost(
    recipe: Recipe, 
    healthData: RecipeHealthData
  ): number {
    let boostScore = 0;

    // 疲劳度优化
    if (healthData.fatigueLevel && recipe.optimalConditions.fatigueLevel) {
      if (healthData.fatigueLevel >= recipe.optimalConditions.fatigueLevel) {
        boostScore += 10;
      }
    }

    // 睡眠优化
    if (healthData.sleepQuality && recipe.optimalConditions.sleepQuality) {
      if (healthData.sleepQuality <= recipe.optimalConditions.sleepQuality) {
        boostScore += 10;
      }
    }

    return boostScore;
  }

  /**
   * 计算储藏室加成分数 (0-30分)
   */
  private calculatePantryBonus(recipe: Recipe, pantryItems: string[]): number {
    const matchPercentage = scoreRecipeByPantry(recipe, pantryItems);
    return Math.round((matchPercentage / 100) * 30);
  }

  /**
   * 主推荐方法 - 基于上下文提供个性化食谱建议
   */
  suggestMeal(context: MealSuggestionContext): ScoredRecipe[] {
    // 第一步：根据健康指标筛选候选食谱
    const filteredRecipes = filterRecipesByHealth(this.recipes, {
      fatigueLevel: context.healthData.fatigueLevel,
      sleepQuality: context.healthData.sleepQuality,
      isPreWorkout: context.isPreWorkout,
      isPostWorkout: context.isPostWorkout,
      timeOfDay: context.timeOfDay
    });

    // 第二步：应用高级筛选条件
    const timeFilteredRecipes = this.filterByTime(filteredRecipes, context.maxCookingTime);
    const inventoryFilteredRecipes = this.filterByInventory(timeFilteredRecipes, context.onlyUseInventory);

    // 第三步：对候选食谱进行评分（考虑筛选条件）
    const scoredRecipes = inventoryFilteredRecipes.map(recipe => 
      this.scoreRecipe(recipe, context)
    );

    // 第四步：按分数排序并返回前3名
    const topRecipes = scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return topRecipes;
  }

  /**
   * 快速建议方法 - 简化版推荐，适合实时场景
   */
  quickSuggest(context: MealSuggestionContext): Recipe | null {
    const suggestions = this.suggestMeal(context);
    return suggestions.length > 0 ? suggestions[0].recipe : null;
  }

  /**
   * 根据时间筛选食谱
   */
  filterByTime(recipes: Recipe[], maxMinutes?: number): Recipe[] {
    if (!maxMinutes) return recipes;
    
    return recipes.filter(recipe => 
      recipe.preparationTime && recipe.preparationTime <= maxMinutes
    );
  }

  /**
   * 根据库存筛选食谱
   */
  filterByInventory(recipes: Recipe[], onlyUseInventory?: boolean): Recipe[] {
    if (!onlyUseInventory) return recipes;
    
    const pantryItems = this.pantryStore.getState().items;
    
    return recipes.filter(recipe => {
      // 计算缺失食材数量
      const missingIngredients = this.getMissingIngredients(recipe, pantryItems);
      
      // 如果onlyUseInventory为true，严重惩罚缺失食材超过3个的食谱
      if (onlyUseInventory && missingIngredients > 3) {
        return false; // 直接排除
      }
      
      return true;
    });
  }

  /**
   * 获取食谱缺失的食材数量
   */
  private getMissingIngredients(recipe: Recipe, pantryItems: string[]): number {
    const essentialIngredients = recipe.ingredients
      .filter(ingredient => ingredient.isEssential)
      .map(ingredient => ingredient.name.toLowerCase());
    
    const missingCount = essentialIngredients.filter(ingredient => {
      return !pantryItems.some(pantryItem => 
        pantryItem.toLowerCase().includes(ingredient) || 
        ingredient.includes(pantryItem.toLowerCase())
      );
    }).length;
    
    return missingCount;
  }

  /**
   * 智能推荐 - 结合所有筛选条件的最优解
   */
  smartSuggest(context: MealSuggestionContext): {
    quickPrep: ScoredRecipe[];      // 快速准备（<20分钟）
    pantryFriendly: ScoredRecipe[];  // 库存友好（缺失食材≤2）
    highRecovery: ScoredRecipe[];    // 高恢复效果
    allOptions: ScoredRecipe[];     // 所有选项
  } {
    const baseRecipes = this.recipes;
    
    // 生成不同场景的推荐
    const quickPrepContext = { ...context, maxCookingTime: 20 };
    const pantryContext = { ...context, onlyUseInventory: true };
    const recoveryContext: MealSuggestionContext = { 
      ...context, 
      healthData: { ...context.healthData, recoveryPriority: 'high' as const }
    };
    
    return {
      quickPrep: this.suggestMeal(quickPrepContext),
      pantryFriendly: this.suggestMeal(pantryContext),
      highRecovery: this.suggestMeal(recoveryContext),
      allOptions: this.suggestMeal(context)
    };
  }

  /**
   * 获取食谱难度分布统计
   */
  getDifficultyStats(): { easy: number; medium: number; hard: number } {
    const stats = { easy: 0, medium: 0, hard: 0 };
    
    this.recipes.forEach(recipe => {
      switch (recipe.difficulty) {
        case 'easy': stats.easy++; break;
        case 'medium': stats.medium++; break;
        case 'hard': stats.hard++; break;
        default: stats.medium++; // 默认中等难度
      }
    });
    
    return stats;
  }

  /**
   * 获取时区推荐 - 基于当前时间智能推荐
   */
  getTimeBasedRecommendations(): {
    breakfast: Recipe[];
    lunch: Recipe[];
    dinner: Recipe[];
    snack: Recipe[];
  } {
    return {
      breakfast: this.recipes.filter(recipe =>
        recipe.optimalConditions.timeOfDay?.includes('morning')
      ),
      lunch: this.recipes.filter(recipe =>
        recipe.optimalConditions.timeOfDay?.includes('afternoon')
      ),
      dinner: this.recipes.filter(recipe =>
        recipe.optimalConditions.timeOfDay?.includes('evening')
      ),
      snack: this.recipes.filter(recipe => recipe.tags.includes('Quick'))
    };
  }

  /**
   * 获取推荐详情 - 包含评分解释
   */
  getSuggestionDetails(suggestion: ScoredRecipe): {
    score: number;
    breakdown: string[];
    recommendation: string;
  } {
    const breakdown: string[] = [];

    if (suggestion.scoreBreakdown.nutritionMatch > 0) {
      breakdown.push(`营养匹配 ${suggestion.scoreBreakdown.nutritionMatch}/20分`);
    }

    if (suggestion.scoreBreakdown.recoveryBoost > 0) {
      breakdown.push(`恢复增强 ${suggestion.scoreBreakdown.recoveryBoost}/20分`);
    }

    if (suggestion.scoreBreakdown.pantryBonus > 0) {
      breakdown.push(`食材加成 ${suggestion.scoreBreakdown.pantryBonus}/30分`);
    }

    let recommendation = '';
    if (suggestion.score >= 90) {
      recommendation = '强烈推荐 - 完美匹配您的需求';
    } else if (suggestion.score >= 70) {
      recommendation = '推荐 - 符合当前条件';
    } else {
      recommendation = '可选 - 基本满足要求';
    }

    return {
      score: suggestion.score,
      breakdown,
      recommendation
    };
  }
}

// 默认实例导出
export const recipeEngine = new RecipeEngine();

// Hook版本方便React组件使用
export const useRecipeEngine = () => {
  return recipeEngine;
};

// 工具函数：创建默认推荐上下文
export const createDefaultContext = (
  healthData: RecipeHealthData,
  remainingMacros: MealSuggestionContext['remainingMacros'],
  timeOfDay: 'morning' | 'afternoon' | 'evening' = 'evening'
): MealSuggestionContext => ({
  healthData,
  remainingMacros,
  timeOfDay,
  isPreWorkout: false,
  isPostWorkout: false
});
