/**
 * useWidgetPreferences - Persist widget visibility and order preferences
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WIDGET_REGISTRY } from '@/src/config/widgetRegistry';

const STORAGE_KEY = '@mymacro/widget_preferences';

export interface WidgetPreferences {
    visibleWidgets: string[];
    widgetOrder: string[];
}

const DEFAULT_PREFERENCES: WidgetPreferences = {
    visibleWidgets: WIDGET_REGISTRY.filter(w => w.defaultVisible).map(w => w.id),
    widgetOrder: WIDGET_REGISTRY.map(w => w.id),
};

export function useWidgetPreferences() {
    const [preferences, setPreferences] = useState<WidgetPreferences>(DEFAULT_PREFERENCES);
    const [isLoading, setIsLoading] = useState(true);

    // Load preferences from storage
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as WidgetPreferences;
                setPreferences(parsed);
            }
        } catch (error) {
            console.warn('Failed to load widget preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const savePreferences = async (newPrefs: WidgetPreferences) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
            setPreferences(newPrefs);
        } catch (error) {
            console.error('Failed to save widget preferences:', error);
        }
    };

    // Toggle widget visibility
    const toggleWidget = useCallback((widgetId: string) => {
        const newVisible = preferences.visibleWidgets.includes(widgetId)
            ? preferences.visibleWidgets.filter(id => id !== widgetId)
            : [...preferences.visibleWidgets, widgetId];

        savePreferences({ ...preferences, visibleWidgets: newVisible });
    }, [preferences]);

    // Reorder widgets
    const reorderWidgets = useCallback((newOrder: string[]) => {
        savePreferences({ ...preferences, widgetOrder: newOrder });
    }, [preferences]);

    // Check if a widget is visible
    const isWidgetVisible = useCallback((widgetId: string) => {
        return preferences.visibleWidgets.includes(widgetId);
    }, [preferences]);

    // Get ordered visible widgets
    const getOrderedVisibleWidgets = useCallback(() => {
        return preferences.widgetOrder.filter(id =>
            preferences.visibleWidgets.includes(id)
        );
    }, [preferences]);

    // Reset to defaults
    const resetToDefaults = useCallback(() => {
        savePreferences(DEFAULT_PREFERENCES);
    }, []);

    return {
        preferences,
        isLoading,
        toggleWidget,
        reorderWidgets,
        isWidgetVisible,
        getOrderedVisibleWidgets,
        resetToDefaults,
    };
}
