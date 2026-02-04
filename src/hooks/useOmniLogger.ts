import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { geminiService, type Intent, type IntentType, type OmniLoggerContext, getStringParam, getNumberParam, getArrayParam } from '@/src/services/ai/GeminiService';
import { useHaptics } from './useHaptics';
import { useAuth } from './useAuth';
import { useHealth } from './useHealth';
import { usePreferences } from '@/src/store/UserStore';
import { soundEffects } from '@/src/services/audio/SoundEffectsService';
import { cyclePhaseAdapter, type CyclePhase } from '@/src/services/nutrition/CyclePhaseAdapter';
import { usePantryStore } from '@/src/store/pantryStore';

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
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs for audio recording
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Hooks
  const { triggerHaptic, success, error: hapticError } = useHaptics();
  const { user } = useAuth();
  const { logNutrition, logWorkout, logWeight } = useHealth();
  const preferences = usePreferences();

  const getAudioMimeType = (uri: string) => {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'm4a':
        return 'audio/m4a';
      case 'mp4':
        return 'audio/mp4';
      case '3gp':
        return 'audio/3gpp';
      case 'caf':
        return 'audio/x-caf';
      case 'wav':
        return 'audio/wav';
      case 'mp3':
        return 'audio/mpeg';
      default:
        return 'audio/m4a';
    }
  };

  const startSpeechRecognition = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Microphone permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: 2, // DoNotMix
      interruptionModeAndroid: 2, // DoNotMix
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    const recording = new Audio.Recording();

    // Enable metering
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });

    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.metering) {
        // Normalize metering (-160db to 0db) to 0-1 range
        // Typical speech is around -40db to -10db
        const db = status.metering;
        const normalized = Math.max(0, (db + 60) / 60); // Clamp signals below -60db to 0
        setAudioLevel(normalized);
      }
    });

    await recording.startAsync();
    recordingRef.current = recording;
  };

  const stopSpeechRecognition = async (): Promise<string | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.warn('Error unloading recording:', error);
    }
    recordingRef.current = null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: 2, // DoNotMix
      interruptionModeAndroid: 2, // DoNotMix
    });

    return recording.getURI();
  };

  const transcribeAudio = async (audioUri?: string | null): Promise<string> => {
    if (!audioUri) {
      return '';
    }

    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mimeType = getAudioMimeType(audioUri);
    return await geminiService.transcribeAudio(base64Audio, mimeType);
  };

  /**
   * 执行记录食物意图
   */
  const executeLogFoodIntent = useCallback(async (intent: Intent) => {
    const { parameters } = intent;
    const foodItemsParam = getArrayParam(parameters, 'foodItems');
    const detectedFoodsParam = getArrayParam(parameters, 'detectedFoods');
    const foodItems = foodItemsParam.length > 0 ? foodItemsParam : detectedFoodsParam.length > 0 ? detectedFoodsParam : ['未知食物'];

    await logNutrition({
      foodItems,
      mealType: getStringParam(parameters, 'mealType', 'unknown'),
      calories: getNumberParam(parameters, 'calories', 0),
      timestamp: new Date().toISOString()
    });

    await soundEffects.playLogSound(); // Thock sound on log

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
      activityType: getStringParam(parameters, 'activityType', '其他运动'),
      duration: getNumberParam(parameters, 'duration', 30), // 默认30分钟
      caloriesBurned: getNumberParam(parameters, 'calories', 0),
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
    const weight = parameters.weightValue as number;

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
    const { parameters } = intent;

    // Map common cycle phase names to CyclePhase type
    const phaseMap: Record<string, CyclePhase> = {
      'menstrual': 'menstrual',
      'period': 'menstrual',
      'period_start': 'menstrual',
      'follicular': 'follicular',
      'ovulatory': 'ovulatory',
      'ovulation': 'ovulatory',
      'luteal': 'luteal',
    };

    const phaseInput = (parameters.cyclePhase || parameters.phase || 'menstrual') as string;
    const phase: CyclePhase = phaseMap[phaseInput.toLowerCase()] || 'menstrual';
    const symptoms = Array.isArray(parameters.symptoms) ? parameters.symptoms as string[] : [];

    const userId = user?.id || 'current-user';
    const success = await cyclePhaseAdapter.logCyclePhase(userId, phase, undefined, symptoms);

    if (success) {
      await soundEffects.playLogSound();
    }

    return {
      intent,
      success,
      message: success ? `记录了周期阶段: ${phase}` : '周期记录失败'
    };
  }, [user]);

  /**
   * 执行添加食材意图
   */
  const executeAddPantryIntent = useCallback(async (intent: Intent) => {
    const { parameters } = intent;

    // Get items from various possible parameter names
    let items: string[] = [];
    if (Array.isArray(parameters.items)) {
      items = parameters.items as string[];
    } else if (Array.isArray(parameters.foodItems)) {
      items = parameters.foodItems as string[];
    } else if (Array.isArray(parameters.ingredients)) {
      items = parameters.ingredients as string[];
    } else if (typeof parameters.item === 'string') {
      items = [parameters.item];
    }

    if (items.length === 0) {
      return {
        intent,
        success: false,
        message: '未检测到食材名称'
      };
    }

    const { addItem } = usePantryStore.getState();

    // Add each item to pantry
    for (const item of items) {
      addItem(item);
    }

    await soundEffects.playLogSound();

    return {
      intent,
      success: true,
      message: `添加了食材: ${items.join(', ')}`
    };
  }, []);

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
  }, [logNutrition, logWorkout, logWeight, executeLogFoodIntent, executeLogWorkoutIntent, executeLogWeightIntent, executeLogCycleIntent, executeAddPantryIntent]);

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
      await soundEffects.playSuccessSound(); // Success sound

      // 显示成功消息
      const successfulIntents = executionResults.filter(r => r.success);
      if (successfulIntents.length > 0) {
        Alert.alert(
          '操作完成',
          `成功执行了 ${successfulIntents.length} 个操作`
        );
      }

    } catch (err) {
      if (__DEV__) console.error('[OmniLogger] Intent execution failed:', err);
      setState('error');
      await hapticError();
    } finally {
      setIsActive(false);
    }
  }, [success, hapticError, executeSingleIntent]);

  /**
   * 处理自然语言输入
   */
  const processNaturalLanguage = useCallback(async (input: string) => {
    try {
      setState('processing');

      // 调用Gemini服务进行意图识别
      const result = await geminiService.processNaturalLanguage(input);

      // Convert NLUResult to Intent format
      const intent: Intent = {
        type: result.intent === 'log_food' ? 'LOG_FOOD' :
          result.intent === 'log_workout' ? 'LOG_WORKOUT' :
            result.intent === 'query' ? 'QUERY' : 'CHAT',
        confidence: 0.9,
        parameters: result.entities || {}
      };

      // 执行识别的意图
      await executeIntents([intent]);

    } catch (err) {
      if (__DEV__) console.error('[OmniLogger] NLP failed:', err);
      setState('error');
      await hapticError();
      Alert.alert('分析失败', '无法理解您的输入，请尝试更清晰的表达');
    }
  }, [user, hapticError, executeIntents]);

  /**
   * 启动语音监听
   */
  const startListening = useCallback(async () => {
    try {
      // Robust cleanup
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          // ignore
        }
        recordingRef.current = null;
      }

      setState('listening');
      setIsActive(true);
      setRecordingText('');
      setAudioLevel(0);
      await triggerHaptic('light');
      await soundEffects.playPopupSound();

      await startSpeechRecognition();

    } catch (err) {
      if (__DEV__) console.error('[OmniLogger] Failed to start listening:', err);
      setState('error');
      await hapticError();
      await soundEffects.playErrorSound();
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
      const audioUri = await stopSpeechRecognition();

      setAudioLevel(0);

      // 如果有传入文本，使用它；否则使用录音转文本
      const finalText = text || await transcribeAudio(audioUri);

      if (!finalText.trim()) {
        throw new Error('No speech detected');
      }

      setRecordingText(finalText);
      await processNaturalLanguage(finalText);

    } catch (err) {
      if (__DEV__) console.error('[OmniLogger] Failed to process input:', err);
      setState('error');
      await hapticError();
      Alert.alert('处理失败', '无法识别您的语音输入，请重试');
    }
  }, [triggerHaptic, hapticError, processNaturalLanguage]);

  /**
   * 重置Omni-Logger状态
   */
  const reset = useCallback(() => {
    setState('idle');
    setIsActive(false);
    setRecordingText('');
    setLastResult(null);
    setAudioLevel(0);
    // Ensure recording is stopped
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => { });
      recordingRef.current = null;
    }
  }, []);

  /**
   * 手动输入文本
   */
  const processTextInput = useCallback(async (text: string) => {
    await processNaturalLanguage(text);
  }, [processNaturalLanguage]);

  return {
    // 状态
    state,
    isActive,
    recordingText,
    lastResult,
    audioLevel,

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
