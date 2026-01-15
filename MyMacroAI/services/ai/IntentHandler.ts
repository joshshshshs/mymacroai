import { useUserStore } from '@/src/store/UserStore';
import type { Intent, IntentExecutionResult } from './GeminiService';

/**
 * 意图处理器服务
 * 将AI识别的意图映射到具体的store操作
 */
export class IntentHandler {
  private userStore: ReturnType<typeof useUserStore.getState>;

  constructor() {
    // 获取store的当前状态
    this.userStore = useUserStore.getState();
  }

  /**
   * 执行意图处理
   * @param intent 要处理的意图
   * @returns 执行结果
   */
  async executeIntent(intent: Intent): Promise<IntentExecutionResult> {
    try {
      switch (intent.type) {
        case 'LOG_FOOD':
          return await this.handleLogFood(intent);

        case 'LOG_WORKOUT':
          return await this.handleLogWorkout(intent);

        case 'LOG_WEIGHT':
          return await this.handleLogWeight(intent);

        case 'LOG_CYCLE':
          return await this.handleLogCycle(intent);

        case 'ADD_PANTRY':
          return await this.handleAddPantry(intent);

        case 'GENERAL_HELP':
          return await this.handleGeneralHelp(intent);

        case 'UNKNOWN':
          return await this.handleUnknown(intent);

        default:
          return {
            intent,
            success: false,
            message: `未知的意图类型: ${intent.type}`,
            error: 'UNKNOWN_INTENT_TYPE'
          };
      }
    } catch (error) {
      return {
        intent,
        success: false,
        message: `意图执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: 'EXECUTION_FAILED'
      };
    }
  }

  /**
   * 处理食物记录意图
   */
  private async handleLogFood(intent: Intent): Promise<IntentExecutionResult> {
    const { parameters } = intent;
    const items = parameters.items || [];
    const meal = parameters.meal || 'unknown';
    const quantity = parameters.quantity || '';

    if (items.length === 0) {
      return {
        intent,
        success: false,
        message: '未识别到具体的食物项目',
        error: 'NO_FOOD_ITEMS'
      };
    }

    try {
      // 创建食物记录
      const foodLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timestamp: Date.now(),
        type: 'food' as const,
        mood: 3,
        energyLevel: 5,
        notes: `记录食物: ${items.join('、')}到${this.getMealDisplayName(meal)}`,
        achievements: [`完成了${this.getMealDisplayName(meal)}记录`],
        challenges: [],
        createdAt: new Date().toISOString()
      };

      // 调用store添加记录
      this.userStore.addDailyLog(foodLog);

      // 创建一个临时的nutrition日志对象用于返回数据
      const nutritionLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'food' as const,
        mealType: this.normalizeMealType(meal),
        items: items,
        totalCalories: this.calculateTotalCalories(items, quantity)
      };

      return {
        intent,
        success: true,
        message: `已记录${items.join('、')}到${this.getMealDisplayName(meal)}`,
        data: nutritionLog
      };
    } catch (error) {
      return {
        intent,
        success: false,
        message: `食物记录失败: ${error}`,
        error: 'FOOD_LOG_FAILED'
      };
    }
  }

  /**
   * 处理运动记录意图
   */
  private async handleLogWorkout(intent: Intent): Promise<IntentExecutionResult> {
    const { parameters } = intent;
    const type = parameters.type || '其他运动';
    const duration = parameters.duration || 0;
    const intensity = parameters.intensity || '中等';
    const distance = parameters.distance || 0;

    if (duration <= 0) {
      return {
        intent,
        success: false,
        message: '运动时长需大于0',
        error: 'INVALID_DURATION'
      };
    }

    try {
      // 创建运动记录
      const workoutLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timestamp: Date.now(),
        type: 'workout' as const,
        mood: 4,
        energyLevel: 6,
        notes: `记录运动: ${type} ${duration}分钟`,
        achievements: [`完成了${type}运动`],
        challenges: [],
        createdAt: new Date().toISOString()
      };

      // 调用store添加记录
      this.userStore.addDailyLog(workoutLog);

      return {
        intent,
        success: true,
        message: `已记录${type} ${duration}分钟`,
        data: workoutLog
      };
    } catch (error) {
      return {
        intent,
        success: false,
        message: `运动记录失败: ${error}`,
        error: 'WORKOUT_LOG_FAILED'
      };
    }
  }

  /**
   * 处理体重记录意图
   */
  private async handleLogWeight(intent: Intent): Promise<IntentExecutionResult> {
    const { parameters } = intent;
    const amount = parameters.amount;
    const unit = parameters.unit || 'kg';

    if (!amount || amount <= 0) {
      return {
        intent,
        success: false,
        message: '体重数值无效',
        error: 'INVALID_WEIGHT'
      };
    }

    try {
      // 转换为公斤
      let weightInKg = amount;
      if (unit === '斤') {
        weightInKg = amount / 2;
      }

      // 更新健康指标
      this.userStore.updateHealthMetrics({
        weight: weightInKg,
        lastUpdated: new Date().toISOString()
      });

      // 创建体重记录
      const weightLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timestamp: Date.now(),
        type: 'weight' as const,
        mood: 3,
        energyLevel: 5,
        notes: `记录体重: ${weightInKg}kg`,
        achievements: ['完成体重记录'],
        challenges: [],
        createdAt: new Date().toISOString()
      };

      this.userStore.addDailyLog(weightLog);

      return {
        intent,
        success: true,
        message: `已记录体重: ${amount}${unit}`,
        data: weightLog
      };
    } catch (error) {
      return {
        intent,
        success: false,
        message: `体重记录失败: ${error}`,
        error: 'WEIGHT_LOG_FAILED'
      };
    }
  }

  /**
   * 处理生理周期记录意图
   */
  private async handleLogCycle(intent: Intent): Promise<IntentExecutionResult> {
    const { parameters } = intent;
    const phase = parameters.phase || '未知';
    const day = parameters.day || 1;
    const symptoms = parameters.symptoms || [];

    try {
      // 创建周期记录
      const cycleLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timestamp: Date.now(),
        type: 'cycle' as const,
        mood: 3,
        energyLevel: 5,
        notes: `记录生理周期: ${phase}第${day}天`,
        symptoms: symptoms,
        achievements: ['完成生理周期记录'],
        challenges: [],
        createdAt: new Date().toISOString()
      };

      // 调用store添加记录
      this.userStore.addDailyLog(cycleLog);

      return {
        intent,
        success: true,
        message: `已记录${phase}第${day}天`,
        data: cycleLog
      };
    } catch (error) {
      return {
        intent,
        success: false,
        message: `周期记录失败: ${error}`,
        error: 'CYCLE_LOG_FAILED'
      };
    }
  }

  /**
   * 处理添加食材到库存意图
   */
  private async handleAddPantry(intent: Intent): Promise<IntentExecutionResult> {
    const { parameters } = intent;
    const item = parameters.item || '';
    const quantity = parameters.quantity || '';
    const category = parameters.category || '其他';

    if (!item) {
      return {
        intent,
        success: false,
        message: '未识别到具体的食材项目',
        error: 'NO_PANTRY_ITEM'
      };
    }

    try {
      // 这里需要集成实际的库存管理系统
      // 暂时返回成功响应
      const pantryItem = {
        id: Date.now().toString(),
        name: item,
        quantity: quantity,
        category: category,
        addedAt: new Date().toISOString()
      };

      return {
        intent,
        success: true,
        message: `已将${item}${quantity ? `(${quantity})` : ''}添加到库存`,
        data: pantryItem
      };
    } catch (error) {
      return {
        intent,
        success: false,
        message: `库存添加失败: ${error}`,
        error: 'PANTRY_ADD_FAILED'
      };
    }
  }

  /**
   * 处理一般帮助请求
   */
  private async handleGeneralHelp(intent: Intent): Promise<IntentExecutionResult> {
    return {
      intent,
      success: true,
      message: '我可以帮您记录食物、运动、体重等信息。请告诉我您想记录什么？',
      data: {
        supportedActions: [
          '记录食物摄入 (如: "我吃了苹果")',
          '记录运动 (如: "跑了5公里")',
          '记录体重 (如: "体重75公斤")',
          '添加食材到库存 (如: "买了牛奶")'
        ]
      }
    };
  }

  /**
   * 处理未知意图
   */
  private async handleUnknown(intent: Intent): Promise<IntentExecutionResult> {
    return {
      intent,
      success: false,
      message: '抱歉，我没有理解您的意思。您可以尝试说："记录食物"、"记录运动"等。',
      error: 'UNRECOGNIZED_INTENT'
    };
  }

  /**
   * 标准化餐次类型
   */
  private normalizeMealType(meal: string): string {
    const mealMap: Record<string, string> = {
      'breakfast': 'breakfast',
      '早餐': 'breakfast',
      'lunch': 'lunch',
      '午餐': 'lunch',
      'dinner': 'dinner',
      '晚餐': 'dinner',
      'snack': 'snack',
      '零食': 'snack',
      '加餐': 'snack'
    };

    return mealMap[meal.toLowerCase()] || 'other';
  }

  /**
   * 获取餐次显示名称
   */
  private getMealDisplayName(meal: string): string {
    const displayMap: Record<string, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '零食',
      'other': '其他餐次'
    };

    return displayMap[this.normalizeMealType(meal)] || '其他餐次';
  }

  /**
   * 估算食物热量
   */
  private estimateCalories(food: string, quantity: string): number {
    // 简单的食物热量估算表
    const calorieMap: Record<string, number> = {
      '苹果': 52,
      '鸡蛋': 155,
      '面包': 265,
      '牛奶': 42,
      '米饭': 130,
      '鸡肉': 165,
      '牛肉': 250,
      '鱼': 206,
      '蔬菜': 25,
      '水果': 60
    };

    const baseCalories = calorieMap[food] || 100;

    // 简单的数量估算
    let multiplier = 1;
    if (quantity.includes('2')) multiplier = 2;
    if (quantity.includes('3')) multiplier = 3;
    if (quantity.includes('半')) multiplier = 0.5;

    return Math.round(baseCalories * multiplier);
  }

  /**
   * 计算总热量
   */
  private calculateTotalCalories(items: string[], quantity: string): number {
    return items.reduce((total, item) => {
      return total + this.estimateCalories(item, quantity);
    }, 0);
  }

  /**
   * 估算运动消耗热量
   */
  private estimateWorkoutCalories(type: string, duration: number, intensity: string): number {
    // 基础代谢率估算 (基于70kg体重)
    const baseCaloriesPerMinute: Record<string, number> = {
      '跑步': 10,
      '走路': 4,
      '游泳': 8,
      '瑜伽': 3,
      '力量训练': 6,
      '健身': 7,
      '其他运动': 5
    };

    const baseRate = baseCaloriesPerMinute[type] || 5;
    let intensityMultiplier = 1;

    if (intensity === '高') intensityMultiplier = 1.3;
    if (intensity === '低') intensityMultiplier = 0.7;

    return Math.round(baseRate * duration * intensityMultiplier);
  }
}

// 单例模式导出
export const intentHandler = new IntentHandler();
export default intentHandler;