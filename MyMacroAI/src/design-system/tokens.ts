/**
 * MyMacro AI Design System v3.0
 * Apple-Grade Glassmorphism with Semantic Glow System
 *
 * This file contains all design tokens for:
 * - Glass materials (blur intensities, tints)
 * - Semantic glow system (health category colors)
 * - Motion timings and easing curves
 * - Typography scale
 * - Spacing system
 */

export const COLORS = {
  // Base Forest Theme (Dark Mode Primary)
  forest: {
    bg: '#0B1410',
    card: '#13201C',
    elevated: '#1A2B25',
    border: 'rgba(255, 255, 255, 0.10)',
  },

  // Morning Mist Theme (Light Mode)
  mist: {
    bg: '#F2F5F3',
    card: '#FFFFFF',
    elevated: '#FAFAFA',
    border: 'rgba(0, 0, 0, 0.06)',
  },

  // Semantic Category Colors (Health Data)
  semantic: {
    // Heart / HRV - Pink-Red
    heart: {
      light: '#FF6B8E',
      dark: '#FF3B6E',
      glow: '#FF6B8E',
    },
    // Hydration / Water - Blue
    hydration: {
      light: '#4DADF7',
      dark: '#4DCFFF',
      glow: '#4DCFFF',
    },
    // Sleep - Purple/Indigo
    sleep: {
      light: '#9B7EDE',
      dark: '#B4A0E5',
      glow: '#9B7EDE',
    },
    // Recovery - Green
    recovery: {
      light: '#6EE7B7',
      dark: '#5EEAD4',
      glow: '#6EE7B7',
    },
    // Nutrition / Protein - Orange
    nutrition: {
      light: '#FB923C',
      dark: '#FDBA74',
      glow: '#FB923C',
    },
    // Training Load - Red/Orange-Red
    training: {
      light: '#EF4444',
      dark: '#F87171',
      glow: '#EF4444',
    },
    // Stress - Red/Magenta
    stress: {
      light: '#EC4899',
      dark: '#F472B6',
      glow: '#EC4899',
    },
    // Social/Squad - Purple/Gold accent
    social: {
      light: '#A78BFA',
      dark: '#C4B5FD',
      glow: '#A78BFA',
    },
    // MacroCoins - Gold/Yellow
    coins: {
      light: '#FBBF24',
      dark: '#FCD34D',
      glow: '#FBBF24',
    },
  },

  // Accent Colors (Lime)
  accent: {
    lime400: '#A3E635',
    lime500: '#84CC16',
    lime600: '#65A30D',
  },

  // Glass overlays
  glass: {
    dark: 'rgba(255, 255, 255, 0.05)',
    light: 'rgba(255, 255, 255, 0.70)',
    border: 'rgba(255, 255, 255, 0.10)',
  },
};

/**
 * Glass Material System
 * Four tiers: thin, frosted, thick, solid
 * Each has light/dark variants and fallback colors
 */
export const MATERIALS = {
  // Thin Glass - Very translucent, preserves background
  thin: {
    intensity: 15,
    tint: 'default' as const,
    fallbackLight: 'rgba(255, 255, 255, 0.40)',
    fallbackDark: 'rgba(26, 26, 26, 0.60)',
    androidIntensity: 10, // Cap for performance
  },

  // Frosted Glass - Medium blur, standard for cards
  frosted: {
    intensity: 40,
    tint: 'default' as const,
    fallbackLight: 'rgba(255, 255, 255, 0.80)',
    fallbackDark: 'rgba(26, 26, 26, 0.85)',
    androidIntensity: 30,
  },

  // Thick Glass - Heavy blur, hero elements
  thick: {
    intensity: 70,
    tint: 'default' as const,
    fallbackLight: 'rgba(255, 255, 255, 0.90)',
    fallbackDark: 'rgba(26, 26, 26, 0.95)',
    androidIntensity: 50,
  },

  // Hero Glass - Ultra-thick, maximum emphasis
  hero: {
    intensity: 80,
    tint: 'default' as const,
    fallbackLight: 'rgba(255, 255, 255, 0.95)',
    fallbackDark: 'rgba(26, 26, 26, 0.98)',
    androidIntensity: 50,
  },

  // Solid Tile - No blur fallback
  solid: {
    intensity: 0,
    tint: 'default' as const,
    fallbackLight: 'rgba(255, 255, 255, 0.95)',
    fallbackDark: 'rgba(19, 32, 28, 0.98)',
    androidIntensity: 0,
  },
};

/**
 * Semantic Glow System
 * Each health category has defined glow properties
 * Radius = blur spread, Opacity = max opacity
 */
export const GLOWS = {
  heart: {
    color: COLORS.semantic.heart.glow,
    radius: 15,
    opacityLight: 0.2,
    opacityDark: 0.3,
    spread: 0, // iOS shadow offset
  },
  hydration: {
    color: COLORS.semantic.hydration.glow,
    radius: 20,
    opacityLight: 0.15,
    opacityDark: 0.25,
    spread: 0,
  },
  sleep: {
    color: COLORS.semantic.sleep.glow,
    radius: 15,
    opacityLight: 0.15,
    opacityDark: 0.2,
    spread: 0,
  },
  recovery: {
    color: COLORS.semantic.recovery.glow,
    radius: 15,
    opacityLight: 0.2,
    opacityDark: 0.25,
    spread: 0,
  },
  nutrition: {
    color: COLORS.semantic.nutrition.glow,
    radius: 12,
    opacityLight: 0.2,
    opacityDark: 0.3,
    spread: 0,
  },
  training: {
    color: COLORS.semantic.training.glow,
    radius: 10,
    opacityLight: 0.25,
    opacityDark: 0.35,
    spread: 0,
  },
  stress: {
    color: COLORS.semantic.stress.glow,
    radius: 15,
    opacityLight: 0.2,
    opacityDark: 0.3,
    spread: 0,
  },
  social: {
    color: COLORS.semantic.social.glow,
    radius: 12,
    opacityLight: 0.15,
    opacityDark: 0.2,
    spread: 0,
  },
  coins: {
    color: COLORS.semantic.coins.glow,
    radius: 10,
    opacityLight: 0.3,
    opacityDark: 0.4,
    spread: 0,
  },
};

/**
 * Motion System
 * Timing tiers and easing curves for consistent animation feel
 */
export const MOTION = {
  // Duration tiers (milliseconds)
  duration: {
    micro: 120,      // Button taps, toggles
    short: 300,      // Screen transitions, card expansions
    medium: 400,     // Modal presentations
    long: 600,       // Ambient/background effects
    breathing: 2000, // Slow breathing animations
  },

  // Easing curves (cubic bezier)
  easing: {
    // Standard ease-out for quick interactions
    easeOut: [0.0, 0.0, 0.2, 1.0] as const,
    // Smooth ease-in-out for transitions
    easeInOut: [0.4, 0.0, 0.2, 1.0] as const,
    // Apple-like curve
    apple: [0.25, 0.8, 0.5, 1.0] as const,
  },

  // Spring physics (for react-native-reanimated)
  spring: {
    // Bouncy spring for playful interactions
    bouncy: {
      damping: 12,
      stiffness: 150,
      mass: 0.8,
    },
    // Snappy spring for button presses
    snappy: {
      damping: 15,
      stiffness: 200,
      mass: 0.6,
    },
    // Smooth spring for large transitions
    smooth: {
      damping: 20,
      stiffness: 120,
      mass: 1.0,
    },
    // Viscous spring for drag interactions
    viscous: {
      damping: 25,
      stiffness: 100,
      mass: 1.2,
    },
  },
};

/**
 * Typography System
 * Semantic text styles for consistent typography
 */
export const TYPOGRAPHY = {
  // Display styles (large hero text)
  display: {
    large: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '700' as const,
      letterSpacing: -1,
    },
    medium: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    small: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600' as const,
      letterSpacing: -0.5,
    },
  },

  // Heading styles
  heading: {
    h1: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.1,
    },
  },

  // Body text
  body: {
    large: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    small: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },

  // Labels and captions
  label: {
    large: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0.1,
    },
    medium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500' as const,
      letterSpacing: 0.1,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.2,
    },
  },
};

/**
 * Spacing System
 * Consistent spacing scale based on 4px grid
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

/**
 * Border Radius System
 */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  glass: 32,  // Standard for glass cards
  pill: 9999, // Full rounded
};

/**
 * Shadow System (beyond glow effects)
 * Standard elevations for depth
 */
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

/**
 * Z-Index Scale
 * Layering system for proper stacking
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
};

/**
 * Animation Presets
 * Common animation configurations
 */
export const ANIMATION_PRESETS = {
  // Fade in with slight upward movement
  fadeInUp: {
    from: {
      opacity: 0,
      transform: [{ translateY: 10 }],
    },
    to: {
      opacity: 1,
      transform: [{ translateY: 0 }],
    },
  },

  // Scale bounce (button press)
  scaleBounce: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 0.95 }] },
    back: { transform: [{ scale: 1 }] },
  },

  // Pulse (breathing effect)
  pulse: {
    from: { opacity: 1, transform: [{ scale: 1 }] },
    to: { opacity: 0.7, transform: [{ scale: 1.03 }] },
  },
};

/**
 * Accessibility Settings
 * Default states for reduce motion/transparency
 */
export const A11Y = {
  reduceMotion: false, // Will be overridden by device settings
  reduceTransparency: false,
  // When reduce motion is on, all durations become instant
  motionDisabledDuration: 1,
  // When reduce transparency is on, use solid fallbacks
  transparencyDisabledOpacity: 0.95,
};

/**
 * Helper function to get themed color
 */
export const getThemedColor = (isDark: boolean, lightColor: string, darkColor: string) => {
  return isDark ? darkColor : lightColor;
};

/**
 * Helper function to get semantic color by category
 */
export const getSemanticColor = (
  category: keyof typeof COLORS.semantic,
  variant: 'light' | 'dark' | 'glow',
  isDark: boolean = false
) => {
  if (variant === 'glow') return COLORS.semantic[category].glow;
  return isDark ? COLORS.semantic[category].dark : COLORS.semantic[category].light;
};

/**
 * Helper function to get glow config
 */
export const getGlowConfig = (category: keyof typeof GLOWS, isDark: boolean = false) => {
  const glow = GLOWS[category];
  return {
    shadowColor: glow.color,
    shadowRadius: glow.radius,
    shadowOpacity: isDark ? glow.opacityDark : glow.opacityLight,
    shadowOffset: { width: 0, height: 0 },
  };
};
