/**
 * AICoachStore - State Management for AI Coach
 * 
 * Manages:
 * - Current conversation messages
 * - Loading/sending states
 * - Selected date for history
 * - Macro adjustments
 */

import { create } from 'zustand';
import { Message, AICoachResponse, MacroAdjustment } from '@/src/types/ai-coach';
import { AICoachService } from '@/src/services/ai/AICoachService';

// ============================================================================
// STORE TYPES
// ============================================================================

interface AICoachState {
  // Current conversation
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Suggestions
  suggestions: string[];
  
  // Active macro adjustment
  macroAdjustment: MacroAdjustment | null;
  
  // History navigation
  selectedDate: string | null;
  availableDates: string[];
  
  // Input state
  inputText: string;
  
  // Actions
  sendMessage: (text: string) => Promise<void>;
  loadConversation: (date: string) => Promise<void>;
  loadAvailableDates: () => Promise<void>;
  setInputText: (text: string) => void;
  clearError: () => void;
  reset: () => void;
  
  // Quick actions
  applyMacroAdjustment: () => void;
  dismissMacroAdjustment: () => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useAICoachStore = create<AICoachState>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  error: null,
  suggestions: [
    "How am I doing today?",
    "What should I eat for dinner?",
    "Create a workout plan for me",
  ],
  macroAdjustment: null,
  selectedDate: null,
  availableDates: [],
  inputText: '',

  // ============================================================================
  // MAIN ACTIONS
  // ============================================================================

  sendMessage: async (text: string) => {
    if (!text.trim() || get().isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
      inputText: '',
    }));

    try {
      const response: AICoachResponse = await AICoachService.chat(text);

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        richContent: response.richContent,
        metadata: {
          intent: undefined,
          contextUsed: response.metadata.contextAreasUsed,
          webSearchUsed: !!response.sources?.length,
          tokensUsed: response.metadata.tokensUsed,
        },
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        suggestions: response.suggestions || state.suggestions,
        macroAdjustment: response.macroAdjustments || state.macroAdjustment,
        isLoading: false,
      }));
    } catch (error) {
      console.error('[AICoachStore] Error sending message:', error);
      set({
        error: 'Failed to get response. Please try again.',
        isLoading: false,
      });
    }
  },

  loadConversation: async (date: string) => {
    set({ isLoading: true, error: null });

    try {
      const messages = await AICoachService.getConversationForDate(date);
      set({
        messages,
        selectedDate: date,
        isLoading: false,
      });
    } catch (error) {
      console.error('[AICoachStore] Error loading conversation:', error);
      set({
        error: 'Failed to load conversation history.',
        isLoading: false,
      });
    }
  },

  loadAvailableDates: async () => {
    try {
      const dates = await AICoachService.getConversationDates();
      set({ availableDates: dates });
    } catch (error) {
      console.error('[AICoachStore] Error loading dates:', error);
    }
  },

  setInputText: (text: string) => {
    set({ inputText: text });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      messages: [],
      isLoading: false,
      error: null,
      suggestions: [
        "How am I doing today?",
        "What should I eat for dinner?",
        "Create a workout plan for me",
      ],
      selectedDate: null,
      inputText: '',
    });
  },

  // ============================================================================
  // MACRO ADJUSTMENT ACTIONS
  // ============================================================================

  applyMacroAdjustment: () => {
    const { macroAdjustment } = get();
    if (!macroAdjustment) return;

    // In a real implementation, this would update the user's daily goals
    // For now, we just acknowledge it
    console.log('[AICoachStore] Applying macro adjustment:', macroAdjustment);

    // Add a system message
    const systemMessage: Message = {
      id: `system_${Date.now()}`,
      role: 'assistant',
      content: `✅ Macro targets adjusted for today:\n• Calories: ${macroAdjustment.adjustedCalories} kcal\n• Protein: ${macroAdjustment.adjustedProtein}g\n• Carbs: ${macroAdjustment.adjustedCarbs}g\n• Fat: ${macroAdjustment.adjustedFat}g`,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, systemMessage],
      macroAdjustment: null,
    }));
  },

  dismissMacroAdjustment: () => {
    set({ macroAdjustment: null });
  },
}));

// ============================================================================
// SELECTORS
// ============================================================================

export const selectMessages = (state: AICoachState) => state.messages;
export const selectIsLoading = (state: AICoachState) => state.isLoading;
export const selectSuggestions = (state: AICoachState) => state.suggestions;
export const selectMacroAdjustment = (state: AICoachState) => state.macroAdjustment;
export const selectHasConversation = (state: AICoachState) => state.messages.length > 0;

export default useAICoachStore;
