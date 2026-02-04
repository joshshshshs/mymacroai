/**
 * ThemeProvider - Global Theme Management
 * 
 * Provides:
 * - Light/Dark mode that works consistently across all screens
 * - Custom purchasable color themes
 * - Each theme has both light and dark variants
 * - Persists theme choices
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme, Appearance, StatusBar, Platform } from 'react-native';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// TYPES
// ============================================================================

export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentThemeId = 'default' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'midnight' | 'rose' | 'mint' | 'gold';

export interface AccentTheme {
  id: AccentThemeId;
  name: string;
  description: string;
  price: number; // MacroCoins, 0 = free
  isPremium: boolean;
  preview: {
    light: string;
    dark: string;
  };
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    gradient: [string, string];
  };
}

export interface ThemeColors {
  // Mode
  isDark: boolean;
  
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  cardBackground: string;
  inputBackground: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  headerText: string;
  buttonText: string;
  
  // Accent (from selected theme)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBackground: string;
  primaryText: string;
  secondary: string;
  
  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Borders
  border: string;
  borderLight: string;
  divider: string;
  
  // Overlays
  overlay: string;
  glassBg: string;
  
  // Specific UI
  tabBar: string;
  tabBarBorder: string;
  skeleton: string;
  
  // Accent
  accent: string;
  tertiary: string;
}

interface ThemeContextValue {
  // Current state
  mode: 'light' | 'dark';
  themePreference: ThemeMode;
  accentTheme: AccentThemeId;
  colors: ThemeColors;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setAccentTheme: (themeId: AccentThemeId) => void;
  toggleMode: () => void;
}

// ============================================================================
// ACCENT THEMES
// ============================================================================

export const ACCENT_THEMES: Record<AccentThemeId, AccentTheme> = {
  default: {
    id: 'default',
    name: 'Vitamin Orange',
    description: 'The classic MyMacro energy',
    price: 0,
    isPremium: false,
    preview: { light: '#FF5C00', dark: '#FF6B00' },
    colors: {
      primary: '#FF5C00',
      primaryLight: '#FF8C40',
      primaryDark: '#E54D00',
      secondary: '#FF9E00',
      gradient: ['#FF5C00', '#FF9E00'],
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calm and focused energy',
    price: 500,
    isPremium: false,
    preview: { light: '#0EA5E9', dark: '#38BDF8' },
    colors: {
      primary: '#0EA5E9',
      primaryLight: '#38BDF8',
      primaryDark: '#0284C7',
      secondary: '#06B6D4',
      gradient: ['#0EA5E9', '#06B6D4'],
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural and grounded',
    price: 500,
    isPremium: false,
    preview: { light: '#10B981', dark: '#34D399' },
    colors: {
      primary: '#10B981',
      primaryLight: '#34D399',
      primaryDark: '#059669',
      secondary: '#14B8A6',
      gradient: ['#10B981', '#14B8A6'],
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Pink',
    description: 'Warm and inviting',
    price: 750,
    isPremium: false,
    preview: { light: '#EC4899', dark: '#F472B6' },
    colors: {
      primary: '#EC4899',
      primaryLight: '#F472B6',
      primaryDark: '#DB2777',
      secondary: '#F97316',
      gradient: ['#EC4899', '#F97316'],
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Dream',
    description: 'Peaceful and creative',
    price: 750,
    isPremium: false,
    preview: { light: '#8B5CF6', dark: '#A78BFA' },
    colors: {
      primary: '#8B5CF6',
      primaryLight: '#A78BFA',
      primaryDark: '#7C3AED',
      secondary: '#C084FC',
      gradient: ['#8B5CF6', '#C084FC'],
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Purple',
    description: 'Deep and mysterious',
    price: 1000,
    isPremium: true,
    preview: { light: '#6366F1', dark: '#818CF8' },
    colors: {
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      secondary: '#8B5CF6',
      gradient: ['#6366F1', '#8B5CF6'],
    },
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold',
    description: 'Elegant and sophisticated',
    price: 1000,
    isPremium: true,
    preview: { light: '#F43F5E', dark: '#FB7185' },
    colors: {
      primary: '#F43F5E',
      primaryLight: '#FB7185',
      primaryDark: '#E11D48',
      secondary: '#FDA4AF',
      gradient: ['#F43F5E', '#FDA4AF'],
    },
  },
  mint: {
    id: 'mint',
    name: 'Fresh Mint',
    description: 'Clean and refreshing',
    price: 500,
    isPremium: false,
    preview: { light: '#14B8A6', dark: '#2DD4BF' },
    colors: {
      primary: '#14B8A6',
      primaryLight: '#2DD4BF',
      primaryDark: '#0D9488',
      secondary: '#06B6D4',
      gradient: ['#14B8A6', '#06B6D4'],
    },
  },
  gold: {
    id: 'gold',
    name: 'Royal Gold',
    description: 'Premium and luxurious',
    price: 1500,
    isPremium: true,
    preview: { light: '#F59E0B', dark: '#FBBF24' },
    colors: {
      primary: '#F59E0B',
      primaryLight: '#FBBF24',
      primaryDark: '#D97706',
      secondary: '#FCD34D',
      gradient: ['#F59E0B', '#FCD34D'],
    },
  },
};

// ============================================================================
// BASE COLOR PALETTES
// ============================================================================

const LIGHT_BASE = {
  isDark: false,
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F0F0F5',
  text: '#1A1A1A',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',
  headerText: '#1A1A1A',
  buttonText: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  border: 'rgba(0,0,0,0.08)',
  borderLight: 'rgba(0,0,0,0.04)',
  divider: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.4)',
  glassBg: 'rgba(255,255,255,0.8)',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  skeleton: '#E5E5EA',
  accent: '#FF5C00',
  tertiary: '#8E8E93',
};

const DARK_BASE = {
  isDark: true,
  background: '#0A0A0C',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  cardBackground: '#1C1C1E',
  inputBackground: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  textInverse: '#1A1A1A',
  headerText: '#FFFFFF',
  buttonText: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
  divider: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.6)',
  glassBg: 'rgba(28,28,30,0.8)',
  tabBar: '#1C1C1E',
  tabBarBorder: 'rgba(255,255,255,0.1)',
  skeleton: '#2C2C2E',
  accent: '#FF6B00',
  tertiary: 'rgba(255,255,255,0.5)',
};

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  // Get preferences from store
  const themePreference = useUserStore((s) => s.preferences?.theme || 'system') as ThemeMode;
  const accentTheme = useUserStore((s) => s.preferences?.accentTheme || 'default') as AccentThemeId;
  const updatePreferences = useUserStore((s) => s.actions.updatePreferences);

  // Apply theme to system
  useEffect(() => {
    if (themePreference === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themePreference);
    }
  }, [themePreference]);

  // Resolve actual mode
  const resolvedMode = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme || 'light';
    }
    return themePreference;
  }, [themePreference, systemColorScheme]);

  const isDark = resolvedMode === 'dark';

  // Build colors with accent theme
  const colors = useMemo((): ThemeColors => {
    const base = isDark ? DARK_BASE : LIGHT_BASE;
    const accent = ACCENT_THEMES[accentTheme] || ACCENT_THEMES.default;
    
    return {
      ...base,
      primary: accent.colors.primary,
      primaryLight: accent.colors.primaryLight,
      primaryDark: accent.colors.primaryDark,
      primaryBackground: isDark 
        ? `${accent.colors.primary}20` 
        : `${accent.colors.primary}15`,
      primaryText: accent.colors.primary,
      secondary: accent.colors.secondary,
      accent: accent.colors.primary,
    };
  }, [isDark, accentTheme]);

  // Update status bar
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.background);
    }
  }, [isDark, colors.background]);

  // Actions
  const setMode = (mode: ThemeMode) => {
    updatePreferences({ theme: mode });
  };

  const setAccentTheme = (themeId: AccentThemeId) => {
    updatePreferences({ accentTheme: themeId });
  };

  const toggleMode = () => {
    const newMode = isDark ? 'light' : 'dark';
    updatePreferences({ theme: newMode });
  };

  const value: ThemeContextValue = {
    mode: resolvedMode,
    themePreference,
    accentTheme,
    colors,
    setMode,
    setAccentTheme,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // Fallback for when used outside provider
    const systemColorScheme = useColorScheme();
    const isDark = systemColorScheme === 'dark';
    const base = isDark ? DARK_BASE : LIGHT_BASE;
    const accent = ACCENT_THEMES.default;
    
    return {
      mode: systemColorScheme || 'light',
      themePreference: 'system',
      accentTheme: 'default',
      colors: {
        ...base,
        primary: accent.colors.primary,
        primaryLight: accent.colors.primaryLight,
        primaryDark: accent.colors.primaryDark,
        primaryBackground: isDark 
          ? `${accent.colors.primary}20` 
          : `${accent.colors.primary}15`,
        primaryText: accent.colors.primary,
        secondary: accent.colors.secondary,
        accent: accent.colors.primary,
      },
      setMode: () => {},
      setAccentTheme: () => {},
      toggleMode: () => {},
    };
  }
  
  return context;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getAccentTheme(id: AccentThemeId): AccentTheme {
  return ACCENT_THEMES[id] || ACCENT_THEMES.default;
}

export function getAllAccentThemes(): AccentTheme[] {
  return Object.values(ACCENT_THEMES);
}

export function getFreeAccentThemes(): AccentTheme[] {
  return Object.values(ACCENT_THEMES).filter(t => t.price === 0);
}

export function getPaidAccentThemes(): AccentTheme[] {
  return Object.values(ACCENT_THEMES).filter(t => t.price > 0);
}

export default ThemeProvider;
