/**
 * ThemeContext - App-wide theme provider
 *
 * Forces the color scheme across the entire app based on user preference.
 * This ensures that useColorScheme() returns the correct theme everywhere.
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useUserStore } from '@/src/store/UserStore';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
    theme: 'light' | 'dark';
    themePreference: ThemeMode;
    isDark: boolean;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const themePreference = useUserStore((s) => s.preferences?.theme || 'system') as ThemeMode;
    const updatePreferences = useUserStore((s) => s.actions.updatePreferences);

    // Apply the theme preference to the Appearance API
    useEffect(() => {
        if (themePreference === 'system') {
            // Reset to system default
            Appearance.setColorScheme(null);
        } else {
            // Force light or dark
            Appearance.setColorScheme(themePreference);
        }
    }, [themePreference]);

    // Determine the resolved theme
    const resolvedTheme = themePreference === 'system'
        ? (systemColorScheme || 'light')
        : themePreference;

    const isDark = resolvedTheme === 'dark';

    const setTheme = (mode: ThemeMode) => {
        updatePreferences({ theme: mode });
    };

    return (
        <ThemeContext.Provider value={{
            theme: resolvedTheme as 'light' | 'dark',
            themePreference,
            isDark,
            setTheme,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}
