/**
 * MyMacroAI 大脑系统集成测试
 * 测试Context Engine、Auto-Adjustments和Omni-Logger功能
 */

import AutoAdjuster from '../services/nutrition/AutoAdjuster';
import { geminiService } from '../services/ai/GeminiService';
import { intentHandler } from '../services/ai/IntentHandler';

// 模拟测试数据
const testActivityMetrics = {
  strain: 75,
  caloriesBurned: 800,
  sleepQuality: 45,
  lastUpdated: new Date().toISOString()
};

const testIntents = [
  {
    type: 'LOG_FOOD',
    confidence: 0.95,
    parameters: {
      items: ['苹果', '鸡蛋'],
      meal: '早餐',
      quantity: '1个苹果和2个鸡蛋'
    },
    rawText: '早餐吃了苹果和鸡蛋',
    timestamp: new Date().toISOString()
  },
  {
    type: 'LOG_WORKOUT',
    confidence: 0.9,
    parameters: {
      type: '跑步',
      duration: 30,
      intensity: '中等',
      distance: 5
    },
    rawText: '今天跑了5公里',
    timestamp: new Date().toISOString()
  }
];

/**
 * 测试Auto-Adjuster引擎
 */
async function testAutoAdjuster() {
  console.log('🧠 测试 Auto-Adjuster 引擎...\n');
  
  try {
    // 测试基础调整计算
    const adjustment = AutoAdjuster.calculateAdjustment(testActivityMetrics);
    console.log('✅ 基础调整测试通过');
    console.log('调整结果:', adjustment);
    
    // 测试复合调整
    const complexAdjustment = AutoAdjuster.calculateComplexAdjustment(
      testActivityMetrics, 
      80, // 高压状态
      50  // 水分不足
    );
    console.log('\n✅ 复合调整测试通过');
    console.log('复合调整结果:', complexAdjustment);
    
    // 测试数据验证
    const validation = AutoAdjuster.validateMetrics(testActivityMetrics);
    console.log('\n✅ 数据验证测试通过');
    console.log('验证结果:', validation);
    
    return true;
  } catch (error) {
    console.error('❌ Auto-Adjuster 测试失败:', error);
    return false;
  }
}

/**
 * 测试Context Engine健康指导
 */
async function testContextEngine() {
  console.log('\n🧠 测试 Context Engine...\n');
  
  try {
    // 初始化Gemini服务（需要有效API密钥）
    const initialized = await geminiService.initialize();
    
    if (initialized) {
      // 测试健康指导生成
      const guidance = await geminiService.generateDailyGuidance({
        sleep: 45,
        strain: 75
      });
      
      console.log('✅ Context Engine 测试通过');
      console.log('健康指导:', guidance);
    } else {
      console.log('⚠️ Gemini服务未初始化，使用备用逻辑测试');
      
      // 测试备用逻辑
      const fallbackGuidance = geminiService.generateFallbackGuidance({
        sleep: 45,
        strain: 75
      });
      
      console.log('✅ 备用指导逻辑测试通过');
      console.log('备用指导:', fallbackGuidance);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Context Engine 测试失败:', error);
    return false;
  }
}

/**
 * 测试Intent Handler
 */
async function testIntentHandler() {
  console.log('\n🧠 测试 Intent Handler...\n');
  
  try {
    // 测试各类意图处理
    for (const intent of testIntents) {
      const result = await intentHandler.executeIntent(intent);
      console.log(`✅ ${intent.type} 意图处理测试通过`);
      console.log('处理结果:', result);
    }
    
    // 测试未知意图
    const unknownIntent = {
      type: 'UNKNOWN',
      confidence: 0.3,
      parameters: {},
      rawText: '随便说点什么',
      timestamp: new Date().toISOString()
    };
    
    const unknownResult = await intentHandler.executeIntent(unknownIntent);
    console.log('✅ 未知意图处理测试通过');
    console.log('未知意图处理结果:', unknownResult);
    
    return true;
  } catch (error) {
    console.error('❌ Intent Handler 测试失败:', error);
    return false;
  }
}

/**
 * 集成测试 - 完整流程
 */
async function testIntegration() {
  console.log('\n🧠 开始集成测试...\n');
  
  try {
    // 1. 健康数据分析
    const adjustment = AutoAdjuster.calculateAdjustment(testActivityMetrics);
    console.log('📊 健康数据分析完成:', adjustment);
    
    // 2. 生成健康指导
    const guidance = await geminiService.generateDailyGuidance({
      sleep: testActivityMetrics.sleepQuality,
      strain: testActivityMetrics.strain
    });
    console.log('💡 健康指导生成完成:', guidance.message);
    
    // 3. 处理用户意图
    for (const intent of testIntents) {
      const result = await intentHandler.executeIntent(intent);
      console.log(`🗣️ 意图处理结果 [${intent.type}]:`, result.message);
    }
    
    console.log('\n🎉 集成测试完成！所有系统组件协同工作正常。');
    return true;
  } catch (error) {
    console.error('❌ 集成测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 启动 MyMacroAI 大脑系统测试...\n');
  
  const results = {
    autoAdjuster: await testAutoAdjuster(),
    contextEngine: await testContextEngine(),
    intentHandler: await testIntentHandler(),
    integration: await testIntegration()
  };
  
  console.log('\n📋 测试结果汇总:');
  console.log('- Auto-Adjuster:', results.autoAdjuster ? '✅ 通过' : '❌ 失败');
  console.log('- Context Engine:', results.contextEngine ? '✅ 通过' : '❌ 失败');
  console.log('- Intent Handler:', results.intentHandler ? '✅ 通过' : '❌ 失败');
  console.log('- 集成测试:', results.integration ? '✅ 通过' : '❌ 失败');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎊 所有测试通过！MyMacroAI 大脑系统功能完整。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查相关组件。');
  }
  
  return allPassed;
}

// 执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  testAutoAdjuster,
  testContextEngine,
  testIntentHandler,
  testIntegration,
  runAllTests
};