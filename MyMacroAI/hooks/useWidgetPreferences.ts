/**
 * useWidgetPreferences - Persist widget visibility and order preferences
 * 
 * Uses Zustand for shared state across all components.
 * This ensures that when widgets are toggled in ManageWidgetsSheet,
 * the health screen immediately reflects the changes.
 */

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WIDGET_REGISTRY } from '@/src/config/widgetRegistry';

const STORAGE_KEY = '@mymacro/widget_preferences';

export interface WidgetPreferences {
    visibleWidgets: string[];
    widgetOrder: string[];
    quickActions: string[];
}

const DEFAULT_QUICK_ACTIONS = ['workout', 'meal', 'water', 'voice'];

const DEFAULT_PREFERENCES: WidgetPreferences = {
    visibleWidgets: WIDGET_REGISTRY.filter(w => w.defaultVisible).map(w => w.id),
    widgetOrder: WIDGET_REGISTRY.map(w => w.id),
    quickActions: DEFAULT_QUICK_ACTIONS,
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

interface WidgetPreferencesState {
    preferences: WidgetPreferences;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    loadPreferences: () => Promise<void>;
    savePreferences: (newPrefs: WidgetPreferences) => Promise<void>;
    toggleWidget: (widgetId: string) => void;
    reorderWidgets: (newOrder: string[]) => void;
    setQuickActions: (actions: string[]) => void;
    resetToDefaults: () => void;
}

const useWidgetPreferencesStore = create<WidgetPreferencesState>((set, get) => ({
    preferences: DEFAULT_PREFERENCES,
    isLoading: true,
    isInitialized: false,

    loadPreferences: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as WidgetPreferences;
                // Ensure any new default-visible widgets are added to existing prefs
                const defaultVisibleIds = WIDGET_REGISTRY.filter(w => w.defaultVisible).map(w => w.id);
                const mergedVisible = [...new Set([...parsed.visibleWidgets, ...defaultVisibleIds])];
                const mergedOrder = [...new Set([...parsed.widgetOrder, ...WIDGET_REGISTRY.map(w => w.id)])];
                set({
                    preferences: {
                        ...parsed,
                        visibleWidgets: mergedVisible,
                        widgetOrder: mergedOrder,
                    },
                    isLoading: false,
                    isInitialized: true
                });
            } else {
                set({ isLoading: false, isInitialized: true });
            }
        } catch (error) {
            console.warn('Failed to load widget preferences:', error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    savePreferences: async (newPrefs: WidgetPreferences) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
            set({ preferences: newPrefs });
        } catch (error) {
            console.error('Failed to save widget preferences:', error);
        }
    },

    toggleWidget: (widgetId: string) => {
        const { preferences, savePreferences } = get();
        const newVisible = preferences.visibleWidgets.includes(widgetId)
            ? preferences.visibleWidgets.filter(id => id !== widgetId)
            : [...preferences.visibleWidgets, widgetId];

        savePreferences({ ...preferences, visibleWidgets: newVisible });
    },

    reorderWidgets: (newOrder: string[]) => {
        const { preferences, savePreferences } = get();
        savePreferences({ ...preferences, widgetOrder: newOrder });
    },

    setQuickActions: (actions: string[]) => {
        const { preferences, savePreferences } = get();
        savePreferences({ ...preferences, quickActions: actions });
    },

    resetToDefaults: () => {
        const { savePreferences } = get();
        savePreferences(DEFAULT_PREFERENCES);
    },
}));

// ============================================================================
// HOOK
// ============================================================================

export function useWidgetPreferences() {
    const {
        preferences,
        isLoading,
        isInitialized,
        loadPreferences,
        toggleWidget,
        reorderWidgets,
        setQuickActions,
        resetToDefaults,
    } = useWidgetPreferencesStore();

    // Load preferences on first mount
    useEffect(() => {
        if (!isInitialized) {
            loadPreferences();
        }
    }, [isInitialized, loadPreferences]);

    // Check if a widget is visible
    const isWidgetVisible = useCallback((widgetId: string) => {
        return preferences.visibleWidgets.includes(widgetId);
    }, [preferences.visibleWidgets]);

    // Get ordered visible widgets
    const getOrderedVisibleWidgets = useCallback(() => {
        return preferences.widgetOrder.filter(id =>
            preferences.visibleWidgets.includes(id)
        );
    }, [preferences.widgetOrder, preferences.visibleWidgets]);

    return {
        preferences,
        isLoading,
        toggleWidget,
        reorderWidgets,
        setQuickActions,
        isWidgetVisible,
        getOrderedVisibleWidgets,
        resetToDefaults,
    };
}
