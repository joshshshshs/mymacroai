import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { geminiService, type Intent, type IntentType, type OmniLoggerContext } from '../services/ai/GeminiService';
import { useHaptics } from './useHaptics';
import { useAuth } from './useAuth';
import { useHealth } from './useHealth';
import { usePreferences } from '@/src/store/UserStore';

// Omni-Logger状态类型
export type OmniLoggerState = 'idle' | 'listening' | 'processing' | 'executing' | 'success' | 'error';

export interface OmniLoggerResult {
  intents: Intent[];
  executionResults: Array<{
    intent: Intent;
    success: boolean;
    message: string;
  }>;
  timestamp: string;
}

/**
 * Omni-Logger Hook - 管理自然语言输入、意图识别和执行
 */
export function useOmniLogger() {
  const [state, setState] = useState<OmniLoggerState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [lastResult, setLastResult] = useState<OmniLoggerResult | null>(null);

  // Refs for audio recording
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  // Hooks
  const { triggerHaptic, success, error: hapticError } = useHaptics();
  const { user } = useAuth();
  const { logNutrition, logWorkout, logWeight } = useHealth();
  const preferences = usePreferences();

  /**
   * 启动语音监听
   */
  const startListening = useCallback(async () => {
    try {
      setState('listening');
      setIsActive(true);
      setRecordingText('');
      await triggerHaptic('light');

      // 启动语音识别（模拟实现）
      await startSpeechRecognition();

    } catch (err) {
      console.error('Failed to start listening:', err);
      setState('error');
      await hapticError();
    }
  }, [triggerHaptic, hapticError]);

  /**
   * 停止语音监听并处理输入
   */
  const stopListening = useCallback(async (text?: string) => {
    try {
      setState('processing');
      await triggerHaptic('medium');

      // 停止语音识别
      await stopSpeechRecognition();

      // 如果有传入文本，使用它；否则使用录音转文本
      const finalText = text || await transcribeAudio();

      if (!finalText.trim()) {
        throw new Error('No speech detected');
      }

      setRecordingText(finalText);
      await processNaturalLanguage(finalText);

    } catch (err) {
      console.error('Failed to process input:', err);
      setState('error');
      await hapticError();
      Alert.alert('处理失败', '无法识别您的语音输入，请重试');
    }
  }, [triggerHaptic, hapticError]);

  /**
   * 处理自然语言输入
   */
  const processNaturalLanguage = useCallback(async (input: string) => {
    try {
      setState('processing');

      // 构建上下文
      const context: OmniLoggerContext = {
        userText: input,
        timestamp: new Date().toISOString(),
        // userContext omitted - AIContext interface requires full data not yet available
        userContext: undefined
      };

      // 调用Gemini服务进行意图识别
      const intents = await geminiService.processNaturalLanguage(input, context);

      if (intents.length === 0) {
        throw new Error('No intents detected');
      }

      // 执行识别的意图
      await executeIntents(intents);

    } catch (err) {
      console.error('Natural language processing failed:', err);
      setState('error');
      await hapticError();
      Alert.alert('分析失败', '无法理解您的输入，请尝试更清晰的表达');
    }
  }, [user, hapticError]);

  /**
   * 执行所有识别的意图
   */
  const executeIntents = useCallback(async (intents: Intent[]) => {
    try {
      setState('executing');

      const executionResults = [];

      for (const intent of intents) {
        try {
          const result = await executeSingleIntent(intent);
          executionResults.push(result);
        } catch (err) {
          executionResults.push({
            intent,
            success: false,
            message: `执行失败: ${err}`
          });
        }
      }

      // 保存结果
      const finalResult: OmniLoggerResult = {
        intents,
        executionResults,
        timestamp: new Date().toISOString()
      };

      setLastResult(finalResult);
      setState('success');
      await success();

      // 显示成功消息
      const successfulIntents = executionResults.filter(r => r.success);
      if (successfulIntents.length > 0) {
        Alert.alert(
          '操作完成',
          `成功执行了 ${successfulIntents.length} 个操作`
        );
      }

    } catch (err) {
      console.error('Intent execution failed:', err);
      setState('error');
      await hapticError();
    } finally {
      setIsActive(false);
    }
  }, [success, hapticError]);

  /**
   * 执行单个意图
   */
  const executeSingleIntent = useCallback(async (intent: Intent) => {
    switch (intent.type) {
      case 'LOG_FOOD':
        return await executeLogFoodIntent(intent);

      case 'LOG_WORKOUT':
        return await executeLogWorkoutIntent(intent);

      case 'LOG_WEIGHT':
        return await executeLogWeightIntent(intent);

      case 'LOG_CYCLE':
        return await executeLogCycleIntent(intent);

      case 'ADD_PANTRY':
        return await executeAddPantryIntent(intent);

      default:
        throw new Error(`未知的意图类型: ${intent.type}`);
    }
  }, [logNutrition, logWorkout, logWeight]);

  /**
   * 执行记录食物意图
   */
  const executeLogFoodIntent = useCallback(async (intent: Intent) => {
    const { parameters } = intent;
    const foodItems = parameters.foodItems || parameters.detectedFoods || ['未知食物'];

    await logNutrition({
      foodItems,
      mealType: parameters.mealType || 'unknown',
      calories: parameters.calories || 0,
      timestamp: new Date().toISOString()
    });

    return {
      intent,
      success: true,
      message: `记录了食物: ${foodItems.join(', ')}`
    };
  }, [logNutrition]);

  /**
   * 执行记录运动意图
   */
  const executeLogWorkoutIntent = useCallback(async (intent: Intent) => {
    const { parameters } = intent;

    await logWorkout({
      activityType: parameters.activityType || '其他运动',
      duration: parameters.duration || 30, // 默认30分钟
      caloriesBurned: parameters.calories || 0,
      timestamp: new Date().toISOString()
    });

    return {
      intent,
      success: true,
      message: `记录了运动: ${parameters.activityType}`
    };
  }, [logWorkout]);

  /**
   * 执行记录体重意图
   */
  const executeLogWeightIntent = useCallback(async (intent: Intent) => {
    const { parameters } = intent;
    const weight = parameters.weightValue;

    if (!weight) {
      throw new Error('未检测到体重数值');
    }

    await logWeight({
      value: weight,
      unit: 'kg',
      timestamp: new Date().toISOString()
    });

    return {
      intent,
      success: true,
      message: `记录了体重: ${weight}kg`
    };
  }, [logWeight]);

  /**
   * 执行记录生理周期意图
   */
  const executeLogCycleIntent = useCallback(async (intent: Intent) => {
    // 这里需要实现周期记录逻辑
    // 暂时返回成功
    return {
      intent,
      success: true,
      message: '生理周期记录功能开发中'
    };
  }, []);

  /**
   * 执行添加食材意图
   */
  const executeAddPantryIntent = useCallback(async (intent: Intent) => {
    // 这里需要实现食材库存管理
    // 暂时返回成功
    return {
      intent,
      success: true,
      message: '食材库存功能开发中'
    };
  }, []);

  /**
   * 重置Omni-Logger状态
   */
  const reset = useCallback(() => {
    setState('idle');
    setIsActive(false);
    setRecordingText('');
    setLastResult(null);
  }, []);

  /**
   * 手动输入文本
   */
  const processTextInput = useCallback(async (text: string) => {
    await processNaturalLanguage(text);
  }, [processNaturalLanguage]);

  // 语音识别模拟函数
  const startSpeechRecognition = async () => {
    // 模拟语音识别启动
    console.log('Speech recognition started');
  };

  const stopSpeechRecognition = async () => {
    // 模拟语音识别停止
    console.log('Speech recognition stopped');
  };

  const transcribeAudio = async (): Promise<string> => {
    // 模拟语音转文本
    return '这是一段模拟的语音转文本结果';
  };

  return {
    // 状态
    state,
    isActive,
    recordingText,
    lastResult,

    // 操作方法
    startListening,
    stopListening,
    processTextInput,
    reset,

    // 状态检查
    isIdle: state === 'idle',
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    isExecuting: state === 'executing',
    isSuccess: state === 'success',
    isError: state === 'error',
  };
}

export default useOmniLogger;
