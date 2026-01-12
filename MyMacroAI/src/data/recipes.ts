import { FoodCategory } from '../../types/nutrition';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  preparationTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  
  // 营养信息
  macros: {
    protein: number; // grams
    carbs: number; // grams;
    fat: number; // grams;
    kcal: number; // calories
  };
  
  // 标签和分类
  tags: RecipeTag[];
  category: FoodCategory;
  dietaryTags: DietaryTag[];
  
  // 食材和步骤
  ingredients: Ingredient[];
  instructions: string[];
  
  // 推荐逻辑参数
  optimalConditions: {
    fatigueLevel?: number; // 疲劳度阈值
    sleepQuality?: number; // 睡眠质量阈值
    timeOfDay?: ('morning' | 'afternoon' | 'evening')[];
    preWorkout?: boolean;
    postWorkout?: boolean;
  };
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: FoodCategory;
  isEssential: boolean; // 是否为核心食材
}

export type RecipeTag = 
  | 'HighProtein' 
  | 'Recovery' 
  | 'Quick' 
  | 'Budget' 
  | 'Vegetarian' 
  | 'HighCarb' 
  | 'LowFat' 
  | 'MealPrep' 
  | 'ComfortFood';

export type DietaryTag = 
  | 'glutenFree' 
  | 'dairyFree' 
  | 'nutFree' 
  | 'vegan' 
  | 'keto';

// 英雄食谱数据库 - 包含5个原型的智能食谱
export const HERO_RECIPES: Recipe[] = [
  {
    id: 'recovery-bowl',
    title: '恢复碗',
    description: '高蛋白餐后恢复配方，疲劳度较高时的理想选择',
    image: '🥗',
    preparationTime: 15,
    difficulty: 'easy',
    servings: 1,
    macros: {
      protein: 35,
      carbs: 45,
      fat: 12,
      kcal: 420
    },
    tags: ['HighProtein', 'Recovery', 'Quick'],
    category: 'protein',
    dietaryTags: ['glutenFree'],
    ingredients: [
      { name: '鸡胸肉', amount: 150, unit: 'g', category: 'protein', isEssential: true },
      { name: '糙米', amount: 100, unit: 'g', category: 'grain', isEssential: true },
      { name: '牛油果', amount: 0.5, unit: '个', category: 'fat', isEssential: false },
      { name: '菠菜', amount: 50, unit: 'g', category: 'vegetable', isEssential: false },
      { name: '橄榄油', amount: 1, unit: '汤匙', category: 'fat', isEssential: false }
    ],
    instructions: [
      '鸡胸肉切块，用盐和胡椒腌制5分钟',
      '平底锅加热，煎熟鸡胸肉至金黄色',
      '同时煮熟糙米',
      '将糙米铺底，放上鸡胸肉和蔬菜',
      '淋上橄榄油即可享用'
    ],
    optimalConditions: {
      fatigueLevel: 80, // 疲劳度>80时推荐
      postWorkout: true
    }
  },
  {
    id: 'deep-sleep-salmon',
    title: '深度睡眠三文鱼',
    description: '富含omega-3和镁的晚餐，有助于改善睡眠质量',
    image: '🐟',
    preparationTime: 25,
    difficulty: 'medium',
    servings: 2,
    macros: {
      protein: 30,
      carbs: 20,
      fat: 25,
      kcal: 380
    },
    tags: ['HighProtein', 'Recovery'],
    category: 'protein',
    dietaryTags: ['glutenFree', 'dairyFree'],
    ingredients: [
      { name: '三文鱼排', amount: 200, unit: 'g', category: 'protein', isEssential: true },
      { name: '芦笋', amount: 150, unit: 'g', category: 'vegetable', isEssential: true },
      { name: '杏仁', amount: 30, unit: 'g', category: 'fat', isEssential: false },
      { name: '柠檬', amount: 0.5, unit: '个', category: 'fruit', isEssential: false },
      { name: '大蒜', amount: 2, unit: '瓣', category: 'vegetable', isEssential: false }
    ],
    instructions: [
      '三文鱼用盐、胡椒和柠檬汁腌制10分钟',
      '烤箱预热至200°C，烤三文鱼15分钟',
      '同时蒸煮芦笋',
      '杏仁切碎，撒在三文鱼上',
      '搭配芦笋和柠檬角食用'
    ],
    optimalConditions: {
      sleepQuality: 50, // 睡眠质量<50时推荐
      timeOfDay: ['evening']
    }
  },
  {
    id: 'pre-workout-carbs',
    title: '训练前碳负载',
    description: '训练前2小时的理想碳水化合物补充',
    image: '🍚',
    preparationTime: 20,
    difficulty: 'easy',
    servings: 1,
    macros: {
      protein: 15,
      carbs: 75,
      fat: 5,
      kcal: 400
    },
    tags: ['HighCarb', 'Quick'],
    category: 'grain',
    dietaryTags: ['glutenFree', 'vegan'],
    ingredients: [
      { name: '燕麦', amount: 80, unit: 'g', category: 'grain', isEssential: true },
      { name: '香蕉', amount: 1, unit: '根', category: 'fruit', isEssential: true },
      { name: '蜂蜜', amount: 1, unit: '汤匙', category: 'other', isEssential: false },
      { name: '肉桂粉', amount: 0.5, unit: '茶匙', category: 'other', isEssential: false }
    ],
    instructions: [
      '燕麦加水煮10分钟至软糯',
      '香蕉切片，加入燕麦中',
      '调入蜂蜜和肉桂粉',
      '搅拌均匀即可食用'
    ],
    optimalConditions: {
      preWorkout: true,
      timeOfDay: ['morning', 'afternoon']
    }
  },
  {
    id: 'budget-chicken-rice',
    title: '经济鸡肉饭',
    description: '使用储藏室常见食材的经济实惠选择',
    image: '🍗',
    preparationTime: 30,
    difficulty: 'easy',
    servings: 4,
    macros: {
      protein: 25,
      carbs: 50,
      fat: 8,
      kcal: 370
    },
    tags: ['Budget', 'MealPrep'],
    category: 'protein',
    dietaryTags: ['glutenFree'],
    ingredients: [
      { name: '鸡腿肉', amount: 400, unit: 'g', category: 'protein', isEssential: true },
      { name: '白米', amount: 300, unit: 'g', category: 'grain', isEssential: true },
      { name: '胡萝卜', amount: 2, unit: '根', category: 'vegetable', isEssential: false },
      { name: '洋葱', amount: 1, unit: '个', category: 'vegetable', isEssential: false },
      { name: '酱油', amount: 2, unit: '汤匙', category: 'other', isEssential: false }
    ],
    instructions: [
      '鸡腿肉切块，胡萝卜和洋葱切丁',
      '米饭洗净，与所有食材一起放入电饭煲',
      '加入适量水和酱油',
      '按下煮饭键，等待完成',
      '可一次性制作多份，冷藏保存'
    ],
    optimalConditions: {
      // 经济型食谱，无特定条件限制
    }
  },
  {
    id: 'quick-veggie-plate',
    title: '快速素食盘',
    description: '15分钟内完成的简单素食选择',
    image: '🥦',
    preparationTime: 15,
    difficulty: 'easy',
    servings: 2,
    macros: {
      protein: 18,
      carbs: 35,
      fat: 10,
      kcal: 290
    },
    tags: ['Quick', 'Vegetarian', 'MealPrep'],
    category: 'vegetable',
    dietaryTags: ['vegan', 'glutenFree'],
    ingredients: [
      { name: '花椰菜', amount: 1, unit: '个', category: 'vegetable', isEssential: true },
      { name: '鹰嘴豆', amount: 200, unit: 'g', category: 'protein', isEssential: true },
      { name: '彩椒', amount: 2, unit: '个', category: 'vegetable', isEssential: false },
      { name: '橄榄油', amount: 1, unit: '汤匙', category: 'fat', isEssential: false },
      { name: '香料混合', amount: 1, unit: '茶匙', category: 'other', isEssential: false }
    ],
    instructions: [
      '花椰菜和彩椒切小块',
      '与鹰嘴豆一起放入烤盘',
      '淋上橄榄油和香料',
      '200°C烤12分钟',
      '取出即可食用'
    ],
    optimalConditions: {
      timeOfDay: ['afternoon', 'evening']
    }
  }
];

// 工具函数：根据健康指标筛选食谱
export function filterRecipesByHealth(
  recipes: Recipe[],
  healthData: {
    fatigueLevel?: number;
    sleepQuality?: number;
    isPreWorkout?: boolean;
    isPostWorkout?: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
  }
): Recipe[] {
  return recipes.filter(recipe => {
    const conditions = recipe.optimalConditions;
    
    // 检查疲劳度条件
    if (conditions.fatigueLevel && healthData.fatigueLevel) {
      if (healthData.fatigueLevel < conditions.fatigueLevel) {
        return false;
      }
    }
    
    // 检查睡眠质量条件
    if (conditions.sleepQuality && healthData.sleepQuality) {
      if (healthData.sleepQuality > conditions.sleepQuality) {
        return false;
      }
    }
    
    // 检查训练状态
    if (conditions.preWorkout && !healthData.isPreWorkout) {
      return false;
    }
    if (conditions.postWorkout && !healthData.isPostWorkout) {
      return false;
    }
    
    // 检查时间段
    if (conditions.timeOfDay && healthData.timeOfDay) {
      if (!conditions.timeOfDay.includes(healthData.timeOfDay)) {
        return false;
      }
    }
    
    return true;
  });
}

// 工具函数：根据储藏室食材匹配食谱
export function scoreRecipeByPantry(
  recipe: Recipe,
  pantryItems: string[]
): number {
  const essentialIngredients = recipe.ingredients
    .filter(ingredient => ingredient.isEssential)
    .map(ingredient => ingredient.name.toLowerCase());
  
  const ownedIngredients = essentialIngredients.filter(ingredient =>
    pantryItems.some(pantryItem => 
      pantryItem.toLowerCase().includes(ingredient) || 
      ingredient.includes(pantryItem.toLowerCase())
    )
  );
  
  return (ownedIngredients.length / essentialIngredients.length) * 100;
}

export default HERO_RECIPES;
