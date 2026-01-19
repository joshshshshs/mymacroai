/**
 * useTheme - Theme Management Hook
 *
 * Provides themed colors and theme toggling functionality.
 * Respects user preference from UserStore (system, light, dark).
 * Uses Appearance.setColorScheme() to force the theme app-wide.
 */

import { useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { useUserStore } from '@/src/store/UserStore';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  bg: string;
  surface: string;
  surfaceElevated: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Borders
  border: string;
  borderLight: string;

  // Semantic
  accent: string;
  accentSecondary: string;
  success: string;
  warning: string;
  error: string;

  // Glass effects
  glassBg: string;
  glassBlur: number;
}

const LIGHT_COLORS: ThemeColors = {
  // Backgrounds
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  textTertiary: 'rgba(0,0,0,0.4)',

  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.04)',

  // Semantic
  accent: '#FF5C00',
  accentSecondary: '#FF9E00',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Glass effects
  glassBg: 'rgba(255,255,255,0.7)',
  glassBlur: 60,
};

const DARK_COLORS: ThemeColors = {
  // Backgrounds
  bg: '#0A0A0C',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.5)',
  textTertiary: 'rgba(255,255,255,0.3)',

  // Borders
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',

  // Semantic
  accent: '#FF5C00',
  accentSecondary: '#FF9E00',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Glass effects
  glassBg: 'rgba(28,28,30,0.7)',
  glassBlur: 40,
};

/**
 * Hook that provides the current theme and colors
 */
export function useTheme() {
  const systemColorScheme = useColorScheme();
  const themePreference = useUserStore((s) => s.preferences?.theme || 'system');
  const updatePreferences = useUserStore((s) => s.actions.updatePreferences);

  // Apply theme preference to Appearance API when it changes
  useEffect(() => {
    if (themePreference === 'system') {
      // Reset to system default
      Appearance.setColorScheme(null);
    } else {
      // Force light or dark
      Appearance.setColorScheme(themePreference);
    }
  }, [themePreference]);

  // Determine actual theme based on preference
  const resolvedTheme = themePreference === 'system'
    ? (systemColorScheme || 'light')
    : themePreference;

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Theme setter function
  const setTheme = (mode: ThemeMode) => {
    updatePreferences({ theme: mode });
  };

  // Toggle between light and dark (ignores system)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updatePreferences({ theme: newTheme });
  };

  return {
    theme: resolvedTheme as 'light' | 'dark',
    themePreference,
    isDark,
    colors,
    setTheme,
    toggleTheme,
  };
}

/**
 * Get theme label for display
 */
export function getThemeLabel(mode: ThemeMode): string {
  switch (mode) {
    case 'system':
      return 'System';
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
  }
}

export default useTheme;