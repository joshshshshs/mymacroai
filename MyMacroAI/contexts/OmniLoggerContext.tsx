import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Intent, IntentType } from '@/src/services/ai/GeminiService';
import { useHaptics } from '../hooks/useHaptics';
import { logger } from '../utils/logger';

// Omni-Logger状态类型
export type OmniLoggerState = 'idle' | 'listening' | 'processing' | 'executing' | 'success' | 'error';

// 上下文状态
interface OmniLoggerContextState {
  state: OmniLoggerState;
  isActive: boolean;
  recordingText: string;
  recognizedIntents: Intent[];
  executionHistory: Array<{
    intents: Intent[];
    timestamp: string;
    successCount: number;
    totalCount: number;
  }>;
  lastExecutionTime?: string;
}

// 上下文操作
interface OmniLoggerContextActions {
  startListening: () => void;
  stopListening: (text?: string) => void;
  processTextInput: (text: string) => void;
  reset: () => void;
  clearHistory: () => void;
}

// 组合上下文类型
type OmniLoggerContextType = OmniLoggerContextState & OmniLoggerContextActions;

// 初始状态
const initialState: OmniLoggerContextState = {
  state: 'idle',
  isActive: false,
  recordingText: '',
  recognizedIntents: [],
  executionHistory: [],
};

// Action类型
type OmniLoggerAction =
  | { type: 'SET_STATE'; payload: OmniLoggerState }
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'SET_RECORDING_TEXT'; payload: string }
  | { type: 'SET_INTENTS'; payload: Intent[] }
  | { type: 'ADD_EXECUTION_HISTORY'; payload: {
      intents: Intent[];
      successCount: number;
      totalCount: number;
    }}
  | { type: 'CLEAR_HISTORY' }
  | { type: 'RESET' };

// Reducer函数
function omniLoggerReducer(state: OmniLoggerContextState, action: OmniLoggerAction): OmniLoggerContextState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, state: action.payload };
    
    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };
    
    case 'SET_RECORDING_TEXT':
      return { ...state, recordingText: action.payload };
    
    case 'SET_INTENTS':
      return { ...state, recognizedIntents: action.payload };
    
    case 'ADD_EXECUTION_HISTORY':
      const newHistoryItem = {
        intents: action.payload.intents,
        timestamp: new Date().toISOString(),
        successCount: action.payload.successCount,
        totalCount: action.payload.totalCount,
      };
      return {
        ...state,
        executionHistory: [newHistoryItem, ...state.executionHistory.slice(0, 49)], // 保留最近50条记录
        lastExecutionTime: newHistoryItem.timestamp,
      };
    
    case 'CLEAR_HISTORY':
      return { ...state, executionHistory: [] };
    
    case 'RESET':
      return {
        ...initialState,
        executionHistory: state.executionHistory, // 保留历史记录
      };
    
    default:
      return state;
  }
}

// 创建上下文
const OmniLoggerContext = createContext<OmniLoggerContextType | undefined>(undefined);

// Provider组件
interface OmniLoggerProviderProps {
  children: ReactNode;
}

export function OmniLoggerProvider({ children }: OmniLoggerProviderProps) {
  const [state, dispatch] = useReducer(omniLoggerReducer, initialState);
  const { triggerHaptic, success, error: hapticError } = useHaptics();

  // 开始监听
  const startListening = async () => {
    try {
      dispatch({ type: 'SET_STATE', payload: 'listening' });
      dispatch({ type: 'SET_ACTIVE', payload: true });
      dispatch({ type: 'SET_RECORDING_TEXT', payload: '' });
      await triggerHaptic('light');

      // 这里可以添加实际的语音识别启动逻辑
      logger.log('Omni-Logger: Started listening');
      
    } catch (err) {
      logger.error('Failed to start listening:', err);
      dispatch({ type: 'SET_STATE', payload: 'error' });
      await hapticError();
    }
  };

  // 停止监听并处理输入
  const stopListening = async (text?: string) => {
    try {
      dispatch({ type: 'SET_STATE', payload: 'processing' });
      await triggerHaptic('medium');
      
      // 模拟语音识别结果
      const finalText = text || '这是一段模拟的语音输入文本';
      dispatch({ type: 'SET_RECORDING_TEXT', payload: finalText });

      // 模拟意图识别
      await simulateIntentRecognition(finalText);
      
    } catch (err) {
      logger.error('Failed to process input:', err);
      dispatch({ type: 'SET_STATE', payload: 'error' });
      await hapticError();
    }
  };

  // 处理文本输入
  const processTextInput = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      dispatch({ type: 'SET_STATE', payload: 'processing' });
      dispatch({ type: 'SET_RECORDING_TEXT', payload: text });
      dispatch({ type: 'SET_ACTIVE', payload: true });

      await simulateIntentRecognition(text);
      
    } catch (err) {
      logger.error('Text processing failed:', err);
      dispatch({ type: 'SET_STATE', payload: 'error' });
      await hapticError();
    }
  };

  // 模拟意图识别和执行
  const simulateIntentRecognition = async (text: string) => {
    try {
      // 模拟识别延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟识别的意图
      const simulatedIntents: Intent[] = simulateIntentsFromText(text);
      dispatch({ type: 'SET_INTENTS', payload: simulatedIntents });
      dispatch({ type: 'SET_STATE', payload: 'executing' });

      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟执行结果
      const successCount = Math.floor(simulatedIntents.length * 0.8); // 80%成功率
      dispatch({
        type: 'ADD_EXECUTION_HISTORY',
        payload: {
          intents: simulatedIntents,
          successCount,
          totalCount: simulatedIntents.length,
        }
      });

      dispatch({ type: 'SET_STATE', payload: 'success' });
      await success();

      // 显示成功消息
      if (successCount > 0) {
        Alert.alert('操作完成', `成功执行了 ${successCount} 个操作`);
      }
      
    } catch (err) {
      logger.error('Intent recognition simulation failed:', err);
      dispatch({ type: 'SET_STATE', payload: 'error' });
      await hapticError();
    } finally {
      dispatch({ type: 'SET_ACTIVE', payload: false });
    }
  };

  // 基于文本模拟意图识别
  const simulateIntentsFromText = (text: string): Intent[] => {
    const lowerText = text.toLowerCase();
    const intents: Intent[] = [];

    // 简单的规则匹配
    if (lowerText.includes('吃') || lowerText.includes('早餐') || lowerText.includes('午餐') || lowerText.includes('晚餐')) {
      intents.push({
        type: 'LOG_FOOD',
        confidence: 0.85,
        parameters: { foodItems: ['模拟食物'], mealType: 'unknown' },
        rawText: text,
        timestamp: new Date().toISOString(),
      });
    }

    if (lowerText.includes('跑') || lowerText.includes('运动') || lowerText.includes('锻炼')) {
      intents.push({
        type: 'LOG_WORKOUT',
        confidence: 0.78,
        parameters: { activityType: '跑步', duration: 30 },
        rawText: text,
        timestamp: new Date().toISOString(),
      });
    }

    if (lowerText.includes('体重') || lowerText.includes('公斤')) {
      intents.push({
        type: 'LOG_WEIGHT',
        confidence: 0.92,
        parameters: { weightValue: 70 },
        rawText: text,
        timestamp: new Date().toISOString(),
      });
    }

    // 如果没有匹配到任何意图，返回一个通用意图
    if (intents.length === 0) {
      intents.push({
        type: 'UNKNOWN',
        confidence: 0.3,
        parameters: {},
        rawText: text,
        timestamp: new Date().toISOString(),
      });
    }

    return intents;
  };

  // 重置状态
  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  // 清空历史记录
  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  // 上下文值
  const contextValue: OmniLoggerContextType = {
    ...state,
    startListening,
    stopListening,
    processTextInput,
    reset,
    clearHistory,
  };

  return (
    <OmniLoggerContext.Provider value={contextValue}>
      {children}
    </OmniLoggerContext.Provider>
  );
}

// Hook用于在组件中使用上下文
export function useOmniLoggerContext() {
  const context = useContext(OmniLoggerContext);
  if (context === undefined) {
    throw new Error('useOmniLoggerContext must be used within an OmniLoggerProvider');
  }
  return context;
}

export default OmniLoggerContext;