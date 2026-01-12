/**
 * 自动调整引擎服务
 * 根据用户的活动强度和热量消耗自动调整营养目标
 */

export interface AdjustmentResult {
  addedCalories: number;
  reason: string;
  shouldAdjust: boolean;
}

export interface ActivityMetrics {
  strain: number; // 活动强度指标，范围0-100
  caloriesBurned: number; // 活动消耗的热量（千卡）
  sleepQuality: number; // 睡眠质量，范围0-100
  lastUpdated: string; // 数据更新时间
}

/**
 * 自动调整引擎类
 * 实现基于健康数据的智能营养目标调整
 */
export class AutoAdjuster {
  /**
   * 计算营养目标调整
   * @param metrics 健康指标数据
   * @returns 调整结果
   */
  static calculateAdjustment(metrics: ActivityMetrics): AdjustmentResult {
    const { strain, caloriesBurned, sleepQuality } = metrics;
    
    // 基础检查
    if (strain <= 0 || caloriesBurned <= 0) {
      return {
        addedCalories: 0,
        reason: "活动数据不足，无需调整",
        shouldAdjust: false
      };
    }

    // 检查是否满足调整条件
    if (strain > 50) {
      // 中等以上活动强度，触发调整
      const addedCalories = Math.round(caloriesBurned * 0.5);
      
      // 根据睡眠质量调整理由
      let reason: string;
      if (sleepQuality < 50) {
        reason = `高强度活动检测到(+${caloriesBurned}活动千卡)，但睡眠质量较低(${sleepQuality}/100)。已添加${addedCalories}千卡支持恢复，建议优先改善睡眠。`;
      } else {
        reason = `高强度活动检测到(+${caloriesBurned}活动千卡)。已添加${addedCalories}千卡补充能量，支持肌肉恢复。`;
      }
      
      return {
        addedCalories,
        reason,
        shouldAdjust: true
      };
    }

    // 不满足调整条件
    return {
      addedCalories: 0,
      reason: `活动强度(${strain}/100)未达到调整阈值，保持当前目标`,
      shouldAdjust: false
    };
  }

  /**
   * 计算复合调整（考虑多个因素）
   * @param metrics 健康指标数据
   * @param stressLevel 压力水平，范围0-100（可选）
   * @param hydration 水分摄入状态，范围0-100（可选）
   * @returns 调整结果
   */
  static calculateComplexAdjustment(
    metrics: ActivityMetrics,
    stressLevel?: number,
    hydration?: number
  ): AdjustmentResult {
    const baseAdjustment = this.calculateAdjustment(metrics);
    
    if (!baseAdjustment.shouldAdjust) {
      return baseAdjustment;
    }

    // 考虑额外因素
    let finalCalories = baseAdjustment.addedCalories;
    let additionalFactors: string[] = [];

    // 压力因素调整
    if (stressLevel && stressLevel > 70) {
      finalCalories = Math.round(finalCalories * 0.8); // 高压状态下减少调整量
      additionalFactors.push("高压状态");
    }

    // 水分因素调整
    if (hydration && hydration < 60) {
      finalCalories = Math.round(finalCalories * 0.9); // 缺水状态下轻微减少调整量
      additionalFactors.push("水分不足");
    }

    // 更新理由
    let reason = baseAdjustment.reason;
    if (additionalFactors.length > 0) {
      reason = reason.replace('。', `。考虑到${additionalFactors.join('和')}，最终调整为${finalCalories}千卡。`);
    }

    return {
      addedCalories: finalCalories,
      reason,
      shouldAdjust: true
    };
  }

  /**
   * 验证健康数据有效性
   * @param metrics 健康指标数据
   * @returns 验证结果
   */
  static validateMetrics(metrics: ActivityMetrics): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (metrics.strain < 0 || metrics.strain > 100) {
      errors.push(`活动强度值${metrics.strain}超出有效范围(0-100)`);
    }

    if (metrics.caloriesBurned < 0) {
      errors.push(`热量消耗值${metrics.caloriesBurned}不能为负数`);
    }

    if (metrics.sleepQuality < 0 || metrics.sleepQuality > 100) {
      errors.push(`睡眠质量值${metrics.sleepQuality}超出有效范围(0-100)`);
    }

    if (!metrics.lastUpdated || isNaN(Date.parse(metrics.lastUpdated))) {
      errors.push("数据更新时间格式无效");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取调整建议描述
   * @param adjustment 调整结果
   * @returns 用户友好的描述
   */
  static getAdjustmentDescription(adjustment: AdjustmentResult): string {
    if (!adjustment.shouldAdjust) {
      return "今日无需调整营养目标";
    }

    const calories = adjustment.addedCalories;
    
    if (calories < 100) {
      return `轻微调整：增加${calories}千卡（小幅补充）`;
    } else if (calories < 300) {
      return `适度调整：增加${calories}千卡（支持恢复）`;
    } else {
      return `显著调整：增加${calories}千卡（高强度活动补偿）`;
    }
  }
}

// 导出默认实例
export default AutoAdjuster;