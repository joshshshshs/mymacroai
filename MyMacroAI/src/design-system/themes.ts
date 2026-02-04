/**
 * Dynamic Theme Engine - "The Chromatosphere"
 *
 * A full semantic palette system for premium theme skins.
 * Each theme defines not just a primary color, but an entire
 * harmonious palette including gradients, charts, glows, and surfaces.
 */

// ============================================================================
// THEME PALETTE INTERFACE
// ============================================================================

export interface ThemePalette {
    id: string;
    name: string;
    description: string;
    price: number;         // MacroCoins (0 = free default)
    isPro: boolean;        // Free for Pro users?
    isDefault?: boolean;   // Is this the default theme?

    colors: {
        // Core Brand Colors
        primary: string;           // Main button / active state
        primaryLight: string;      // Lighter variant for backgrounds
        secondary: string;         // Gradient end / accents
        accent: string;            // High contrast pop (usually matches primary)

        // Surface & Glass
        surfaceTint: string;       // Very low opacity bg for glass cards (e.g., rgba)
        surfaceTintSolid: string;  // Solid version for non-glass contexts

        // Text
        textContrast: string;      // Text on top of primary (#FFF or #000)

        // Effects
        shadow: string;            // Color for glow/shadow effects
        shadowRgb: string;         // RGB values for rgba() usage (e.g., "255, 92, 0")

        // Gradient Definitions
        gradient: {
            start: string;
            end: string;
        };

        // Chart Colors (4 harmonious colors for pie charts, rings, etc.)
        charts: [string, string, string, string];

        // Macro-specific colors (protein, carbs, fats)
        macros: {
            protein: string;
            carbs: string;
            fats: string;
        };

        // Status overrides (optional - falls back to semantic if not defined)
        success?: string;
        warning?: string;
        error?: string;
    };
}

// ============================================================================
// THEME DEFINITIONS - "THE CHROMATOSPHERE"
// ============================================================================

export const THEME_PALETTES: ThemePalette[] = [
    // -------------------------------------------------------------------------
    // VITAMIN ORANGE (Default)
    // The original MyMacro look - warm, energetic, motivational
    // -------------------------------------------------------------------------
    {
        id: 'vitamin-orange',
        name: 'Vitamin Orange',
        description: 'The classic MyMacro look',
        price: 0,
        isPro: false,
        isDefault: true,
        colors: {
            primary: '#FF5C00',
            primaryLight: '#FFF0E6',
            secondary: '#FF9E00',
            accent: '#FF5C00',
            surfaceTint: 'rgba(255, 92, 0, 0.05)',
            surfaceTintSolid: '#FFF8F3',
            textContrast: '#FFFFFF',
            shadow: '#FF5C00',
            shadowRgb: '255, 92, 0',
            gradient: {
                start: '#FF5C00',
                end: '#FF9E00',
            },
            charts: ['#FF5C00', '#FF9E00', '#FFD166', '#FFF7ED'],
            macros: {
                protein: '#FF5C00',
                carbs: '#FF9E00',
                fats: '#FFD166',
            },
        },
    },

    // -------------------------------------------------------------------------
    // CYBER LIME (Bio-Hacker)
    // Matrix vibes - for the data-driven, supplement-optimizing user
    // -------------------------------------------------------------------------
    {
        id: 'cyber-lime',
        name: 'Cyber Lime',
        description: 'Bio-hacker aesthetic',
        price: 1500,
        isPro: true, // Free for Pro users
        colors: {
            primary: '#84CC16',        // Lime 600 - readable
            primaryLight: '#ECFCCB',   // Lime 100
            secondary: '#BEF264',      // Lime 300 - neon
            accent: '#65A30D',         // Lime 700 for contrast
            surfaceTint: 'rgba(132, 204, 22, 0.05)',
            surfaceTintSolid: '#F7FEE7',
            textContrast: '#FFFFFF',
            shadow: '#84CC16',
            shadowRgb: '132, 204, 22',
            gradient: {
                start: '#84CC16',
                end: '#BEF264',
            },
            charts: ['#84CC16', '#BEF264', '#10B981', '#ECFCCB'],
            macros: {
                protein: '#84CC16',
                carbs: '#10B981',
                fats: '#BEF264',
            },
        },
    },

    // -------------------------------------------------------------------------
    // ELECTRIC BLUE (Science)
    // Clinical precision - for the analytical, science-first user
    // -------------------------------------------------------------------------
    {
        id: 'electric-blue',
        name: 'Electric Blue',
        description: 'Clinical precision',
        price: 1500,
        isPro: true,
        colors: {
            primary: '#2563EB',        // Blue 600
            primaryLight: '#DBEAFE',   // Blue 100
            secondary: '#06B6D4',      // Cyan 500
            accent: '#1D4ED8',         // Blue 700
            surfaceTint: 'rgba(37, 99, 235, 0.05)',
            surfaceTintSolid: '#EFF6FF',
            textContrast: '#FFFFFF',
            shadow: '#2563EB',
            shadowRgb: '37, 99, 235',
            gradient: {
                start: '#2563EB',
                end: '#06B6D4',
            },
            charts: ['#2563EB', '#06B6D4', '#60A5FA', '#DBEAFE'],
            macros: {
                protein: '#2563EB',
                carbs: '#06B6D4',
                fats: '#60A5FA',
            },
        },
    },

    // -------------------------------------------------------------------------
    // HOT PLASMA (High Burn)
    // Intense energy - for the high-intensity, competitive user
    // -------------------------------------------------------------------------
    {
        id: 'hot-plasma',
        name: 'Hot Plasma',
        description: 'High-intensity energy',
        price: 2000,
        isPro: true,
        colors: {
            primary: '#DB2777',        // Pink 600
            primaryLight: '#FCE7F3',   // Pink 100
            secondary: '#9333EA',      // Purple 600
            accent: '#BE185D',         // Pink 700
            surfaceTint: 'rgba(219, 39, 119, 0.05)',
            surfaceTintSolid: '#FDF2F8',
            textContrast: '#FFFFFF',
            shadow: '#DB2777',
            shadowRgb: '219, 39, 119',
            gradient: {
                start: '#DB2777',
                end: '#9333EA',
            },
            charts: ['#DB2777', '#9333EA', '#F472B6', '#FCE7F3'],
            macros: {
                protein: '#DB2777',
                carbs: '#9333EA',
                fats: '#F472B6',
            },
        },
    },

    // -------------------------------------------------------------------------
    // MIDAS TOUCH (Gold - The Flex)
    // Premium gold - the ultimate flex for dedicated users
    // -------------------------------------------------------------------------
    {
        id: 'midas-touch',
        name: 'Midas Touch',
        description: 'The ultimate flex',
        price: 3000,
        isPro: false, // Must be purchased even by Pro users
        colors: {
            primary: '#D97706',        // Amber 600
            primaryLight: '#FFFBEB',   // Amber 50
            secondary: '#FCD34D',      // Amber 300
            accent: '#B45309',         // Amber 700
            surfaceTint: 'rgba(217, 119, 6, 0.05)',
            surfaceTintSolid: '#FFFBEB',
            textContrast: '#FFFFFF',
            shadow: '#D97706',
            shadowRgb: '217, 119, 6',
            gradient: {
                start: '#D97706',
                end: '#FCD34D',
            },
            charts: ['#D97706', '#FCD34D', '#FFFBEB', '#78350F'],
            macros: {
                protein: '#D97706',
                carbs: '#FCD34D',
                fats: '#F59E0B',
            },
        },
    },

    // -------------------------------------------------------------------------
    // ARCTIC FROST (Ice Blue)
    // Cool, calm, collected - for the zen-focused user
    // -------------------------------------------------------------------------
    {
        id: 'arctic-frost',
        name: 'Arctic Frost',
        description: 'Cool and collected',
        price: 1500,
        isPro: true,
        colors: {
            primary: '#0EA5E9',        // Sky 500
            primaryLight: '#E0F2FE',   // Sky 100
            secondary: '#38BDF8',      // Sky 400
            accent: '#0284C7',         // Sky 600
            surfaceTint: 'rgba(14, 165, 233, 0.05)',
            surfaceTintSolid: '#F0F9FF',
            textContrast: '#FFFFFF',
            shadow: '#0EA5E9',
            shadowRgb: '14, 165, 233',
            gradient: {
                start: '#0EA5E9',
                end: '#38BDF8',
            },
            charts: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#E0F2FE'],
            macros: {
                protein: '#0EA5E9',
                carbs: '#38BDF8',
                fats: '#7DD3FC',
            },
        },
    },

    // -------------------------------------------------------------------------
    // MIDNIGHT PURPLE (Royalty)
    // Deep, mysterious - for the night owl user
    // -------------------------------------------------------------------------
    {
        id: 'midnight-purple',
        name: 'Midnight Purple',
        description: 'Mysterious royalty',
        price: 2000,
        isPro: true,
        colors: {
            primary: '#7C3AED',        // Violet 600
            primaryLight: '#EDE9FE',   // Violet 100
            secondary: '#A78BFA',      // Violet 400
            accent: '#6D28D9',         // Violet 700
            surfaceTint: 'rgba(124, 58, 237, 0.05)',
            surfaceTintSolid: '#F5F3FF',
            textContrast: '#FFFFFF',
            shadow: '#7C3AED',
            shadowRgb: '124, 58, 237',
            gradient: {
                start: '#7C3AED',
                end: '#A78BFA',
            },
            charts: ['#7C3AED', '#A78BFA', '#C4B5FD', '#EDE9FE'],
            macros: {
                protein: '#7C3AED',
                carbs: '#A78BFA',
                fats: '#C4B5FD',
            },
        },
    },

    // -------------------------------------------------------------------------
    // FOREST MOSS (Nature)
    // Earthy, grounded - for the outdoor/natural user
    // -------------------------------------------------------------------------
    {
        id: 'forest-moss',
        name: 'Forest Moss',
        description: 'Earthy and grounded',
        price: 1500,
        isPro: true,
        colors: {
            primary: '#059669',        // Emerald 600
            primaryLight: '#D1FAE5',   // Emerald 100
            secondary: '#34D399',      // Emerald 400
            accent: '#047857',         // Emerald 700
            surfaceTint: 'rgba(5, 150, 105, 0.05)',
            surfaceTintSolid: '#ECFDF5',
            textContrast: '#FFFFFF',
            shadow: '#059669',
            shadowRgb: '5, 150, 105',
            gradient: {
                start: '#059669',
                end: '#34D399',
            },
            charts: ['#059669', '#34D399', '#6EE7B7', '#D1FAE5'],
            macros: {
                protein: '#059669',
                carbs: '#34D399',
                fats: '#6EE7B7',
            },
        },
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get theme palette by ID
 */
export const getThemePalette = (themeId: string): ThemePalette => {
    const theme = THEME_PALETTES.find(t => t.id === themeId);
    return theme || THEME_PALETTES.find(t => t.isDefault) || THEME_PALETTES[0];
};

/**
 * Get the default theme
 */
export const getDefaultTheme = (): ThemePalette => {
    return THEME_PALETTES.find(t => t.isDefault) || THEME_PALETTES[0];
};

/**
 * Get all purchasable themes (excluding default)
 */
export const getPurchasableThemes = (): ThemePalette[] => {
    return THEME_PALETTES.filter(t => !t.isDefault);
};

/**
 * Check if a theme is available to a user
 */
export const isThemeAvailable = (
    themeId: string,
    ownedThemes: string[],
    isPro: boolean
): boolean => {
    const theme = getThemePalette(themeId);
    if (!theme) return false;
    if (theme.isDefault) return true;
    if (theme.isPro && isPro) return true;
    return ownedThemes.includes(themeId);
};

/**
 * Get the effective price for a theme based on Pro status
 */
export const getEffectivePrice = (theme: ThemePalette, isPro: boolean): number => {
    if (theme.isDefault) return 0;
    if (theme.isPro && isPro) return 0;
    return theme.price;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ThemeId = typeof THEME_PALETTES[number]['id'];
