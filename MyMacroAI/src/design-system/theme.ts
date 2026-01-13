import { useColorScheme } from 'react-native';

/**
 * Semantic Theme Engine
 * Defines the contract for Light/Dark mode colors.
 */

// Base Palettes
const PALETTE = {
    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',
    slate950: '#020617',

    // Brand (Blue)
    blue50: '#EFF6FF',
    blue100: '#DBEAFE',
    blue200: '#BFDBFE',
    blue300: '#93C5FD',
    blue400: '#60A5FA',
    blue500: '#3B82F6', // Primary Brand
    blue600: '#2563EB',
    blue700: '#1D4ED8',
    blue900: '#1E3A8A',

    // Functional
    emerald500: '#10B981', // Success
    amber500: '#F59E0B',   // Warning
    rose500: '#F43F5E',    // Error
    gold500: '#EAB308',    // Coins
};

export const LightTheme = {
    dark: false,
    colors: {
        // Backgrounds
        background: PALETTE.slate50,      // Main screen bg
        surface: PALETTE.white,           // Card bg
        surfaceHighlight: PALETTE.slate100, // Hover/Press state

        // Text
        textPrimary: PALETTE.slate900,    // Main headings
        textSecondary: PALETTE.slate500,  // Subtitles
        textMuted: PALETTE.slate400,      // Placeholder/Disabled
        textInverse: PALETTE.white,       // Text on dark backgrounds

        // Borders
        border: PALETTE.slate200,
        borderSubtle: PALETTE.slate100,

        // Brand
        primary: PALETTE.blue500,
        primaryForeground: PALETTE.white,
        secondary: PALETTE.blue100,

        // Status
        success: PALETTE.emerald500,
        warning: PALETTE.amber500,
        error: PALETTE.rose500,
        gold: PALETTE.gold500,

        // Glass
        glassTint: 'light',
        glassBorder: 'rgba(255,255,255,0.5)',
    }
};

export const DarkTheme = {
    dark: true,
    colors: {
        // Backgrounds
        background: PALETTE.slate950,
        surface: PALETTE.slate900,
        surfaceHighlight: PALETTE.slate800,

        // Text
        textPrimary: PALETTE.slate50,
        textSecondary: PALETTE.slate400,
        textMuted: PALETTE.slate600,
        textInverse: PALETTE.slate900,

        // Borders
        border: PALETTE.slate800,
        borderSubtle: PALETTE.slate900,

        // Brand
        primary: PALETTE.blue500,
        primaryForeground: PALETTE.white,
        secondary: PALETTE.slate800,

        // Status
        success: PALETTE.emerald500,
        warning: PALETTE.amber500,
        error: PALETTE.rose500,
        gold: PALETTE.gold500,

        // Glass
        glassTint: 'dark',
        glassBorder: 'rgba(255,255,255,0.1)',
    }
};

export type Theme = typeof LightTheme;

export function useAppTheme() {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark' ? DarkTheme : LightTheme;
}
