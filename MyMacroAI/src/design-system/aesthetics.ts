/**
 * Aesthetic Design System
 * Translucent glassmorphism with grey background
 */

import { COLORS } from './tokens';

/**
 * Color Palette
 * Translucent panels on grey background
 */
export const PASTEL_COLORS = {
  // Background colors
  backgrounds: {
    light: '#F5F5F7', // Light grey background
    dark: '#1C1C1E', // Dark grey background
  },

  // Soft gradients for special cards (more visible)
  gradients: {
    purpleDream: ['rgba(224, 195, 252, 0.5)', 'rgba(142, 197, 252, 0.5)'],
    pinkSunset: ['rgba(255, 182, 217, 0.5)', 'rgba(210, 153, 194, 0.5)'],
    blueMist: ['rgba(168, 237, 234, 0.5)', 'rgba(135, 206, 235, 0.5)'],
    lavenderFog: ['rgba(232, 213, 242, 0.5)', 'rgba(201, 182, 228, 0.5)'],
    peachGlow: ['rgba(255, 216, 190, 0.5)', 'rgba(255, 182, 217, 0.5)'],
    mintyFresh: ['rgba(194, 233, 251, 0.5)', 'rgba(161, 196, 253, 0.5)'],
    ice: ['rgba(224, 231, 255, 0.6)', 'rgba(240, 249, 255, 0.6)'],
  },

  // Accent colors - Primary is popping blue
  accents: {
    primary: '#007AFF', // Popping blue - main accent
    primaryGlow: 'rgba(0, 122, 255, 0.4)', // Blue glow
    softPink: '#FFB6D9',
    softPurple: '#C9B6E4',
    softBlue: '#87CEEB',
    softGreen: '#B4E7CE',
    softOrange: '#FFD8BE',
    softYellow: '#FFF4A3',
  },

  // Glass tints (more translucent)
  glass: {
    light: 'rgba(255, 255, 255, 0.15)',
    medium: 'rgba(255, 255, 255, 0.10)',
    heavy: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },
};

/**
 * Soft Shadow System
 * Gentle, dreamlike shadows
 * All shadows include backgroundColor: 'transparent' to prevent warnings
 */
export const SOFT_SHADOWS = {
  // Outer shadows (elevation)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: 'transparent',
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    backgroundColor: 'transparent',
  },

  // Inner shadows (depth)
  inner: {
    // Simulated with border/overlay
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },

  // Glow shadows (soft accents)
  glow: {
    pink: {
      shadowColor: PASTEL_COLORS.accents.softPink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      backgroundColor: 'transparent',
    },
    purple: {
      shadowColor: PASTEL_COLORS.accents.softPurple,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      backgroundColor: 'transparent',
    },
    blue: {
      shadowColor: PASTEL_COLORS.accents.softBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      backgroundColor: 'transparent',
    },
  },
};

/**
 * Soft Border Radius
 * Very rounded, organic shapes
 */
export const SOFT_RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  pill: 9999,
};

/**
 * Blur Intensity (Lower = Softer)
 */
export const SOFT_BLUR = {
  subtle: 10,    // Very light frosting
  light: 20,     // Light frosting
  medium: 30,    // Medium frosting
  heavy: 40,     // Heavy frosting
  ultra: 50,     // Ultra frosting
};

/**
 * Gradient Presets
 */
export const GRADIENT_PRESETS = {
  purpleDream: {
    colors: PASTEL_COLORS.gradients.purpleDream,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  pinkSunset: {
    colors: PASTEL_COLORS.gradients.pinkSunset,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  blueMist: {
    colors: PASTEL_COLORS.gradients.blueMist,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  lavenderFog: {
    colors: PASTEL_COLORS.gradients.lavenderFog,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

/**
 * Typography for Soft Aesthetic
 * Lighter weights, more delicate
 */
export const SOFT_TYPOGRAPHY = {
  display: {
    fontSize: 48,
    fontWeight: '300' as const, // Lighter
    letterSpacing: -1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '400' as const, // Lighter
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    fontWeight: '300' as const, // Lighter
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '400' as const, // Lighter
    letterSpacing: 0.2,
  },
};
