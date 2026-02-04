# MyMacro AI Design System v2.1
## "The Final Merge" - Soft-Spartan Visual Language

---

# A) VISUAL SYSTEM SUMMARY

The MyMacro AI design system embodies a **"Soft-Spartan"** philosophy: terminal-level speed and precision wrapped in a biological, liquid-feeling aesthetic. The visual language draws from dreamy pastel gradients, layered frosted-glass panels, and soft depth through subtle neumorphism.

### Core Visual Principles (15 bullets)

1. **Dreamy Gradient Backdrops**: Soft pastel gradients (purple/pink/blue/teal) create atmospheric depth behind all UI elements. Dark mode uses "bioluminescent blooms" - cool violets and teals that glow subtly.

2. **Layered Glass Architecture**: Maximum 2-3 glass layers visible at once. Each layer uses real iOS `BlurView` (expo-blur) with `UIBlurEffect` - never fake transparency with opacity.

3. **High Corner Radius Language**: All glass surfaces use 28-36px radius for that premium, rounded "liquid bubble" feel.

4. **Border Highlight System**: 1px borders at very low opacity (8-15% white) define glass edges. Creates separation without harsh lines.

5. **Inner Sheen Effect**: Top-left specular highlight on glass cards (linear gradient from white 6% to transparent) simulates light catching curved glass.

6. **Soft Shadow + Glow**: Shadows are diffused and warm. Cards have subtle outer glow in theme accent colors. Never harsh drop shadows.

7. **Hero Numbers Typography**: Large, bold statistics (28-48px, weight 700+) command attention. Secondary text stays calm (14-16px, weight 400-500).

8. **Floating Card Hierarchy**: Cards appear to float above the gradient backdrop with layered shadows and blur intensities.

9. **Glass Dock Navigation**: Bottom tab bar is a translucent glass surface with blur, not a solid opaque bar.

10. **Lime Accent Restraint**: The primary accent (#A3E635 dark / #65A30D light) is used purposefully for CTAs, progress rings, and streaks - never everywhere.

11. **Pill Chip Language**: Status indicators, quick actions, and tags use rounded pill shapes (full border-radius) with glass fill.

12. **Minimal Chart Styling**: Charts use soft gradient fills, thin stroke lines (1-2px), and high contrast for legibility. No grid lines or heavy axes.

13. **Spring Motion System**: All animations use Reanimated springs with `damping: 30, stiffness: 300` for viscous, satisfying feel.

14. **Press Interaction Depth**: Pressable elements scale to 0.96-0.98 with spring animation, simulating physical depth.

15. **Legibility Priority**: When glass reduces readability, cards auto-switch to higher opacity fills. Contrast ratios must meet WCAG AA.

---

# B) DESIGN TOKENS

## Color System

### Dark Theme: "Deep Forest"
```typescript
const darkTheme = {
  // Base layers
  background: '#0B1410',        // Deep forest floor
  cardBase: '#13201C',          // Base card surface
  cardElevated: '#1A2B25',      // Elevated card surface

  // Text hierarchy
  textPrimary: '#F1F5F9',       // Primary text (slate-100)
  textSecondary: '#94A3B8',     // Secondary text (slate-400)
  textMuted: '#64748B',         // Muted/disabled (slate-500)

  // Accent system
  accent: '#A3E635',            // Lime primary (lime-400)
  accentMuted: '#65A30D',       // Lime muted (lime-600)
  accentGlow: 'rgba(163, 230, 53, 0.25)', // Glow effect

  // Bioluminescent blooms (background gradients)
  bloomViolet: 'rgba(139, 92, 246, 0.15)',   // violet-500 @ 15%
  bloomTeal: 'rgba(20, 184, 166, 0.12)',     // teal-500 @ 12%
  bloomPurple: 'rgba(168, 85, 247, 0.10)',   // purple-500 @ 10%

  // Status colors
  success: '#10B981',           // emerald-500
  warning: '#F59E0B',           // amber-500
  error: '#EF4444',             // red-500
  info: '#3B82F6',              // blue-500

  // Glass effects
  glassFill: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassHighlight: 'rgba(255, 255, 255, 0.06)',
};
```

### Light Theme: "Morning Mist"
```typescript
const lightTheme = {
  // Base layers
  background: '#F2F5F3',        // Soft morning mist
  cardBase: '#FFFFFF',          // Pure white cards
  cardElevated: '#FAFAFA',      // Slightly elevated

  // Text hierarchy
  textPrimary: '#111827',       // Primary text (gray-900)
  textSecondary: '#6B7280',     // Secondary text (gray-500)
  textMuted: '#9CA3AF',         // Muted/disabled (gray-400)

  // Accent system
  accent: '#65A30D',            // Lime primary (lime-600)
  accentMuted: '#84CC16',       // Lime muted (lime-500)
  accentGlow: 'rgba(101, 163, 13, 0.20)', // Glow effect

  // Soft tints (background gradients)
  tintLavender: 'rgba(167, 139, 250, 0.08)',  // violet-400 @ 8%
  tintSky: 'rgba(56, 189, 248, 0.06)',         // sky-400 @ 6%
  tintRose: 'rgba(251, 113, 133, 0.05)',       // rose-400 @ 5%

  // Status colors
  success: '#059669',           // emerald-600
  warning: '#D97706',           // amber-600
  error: '#DC2626',             // red-600
  info: '#2563EB',              // blue-600

  // Glass effects
  glassFill: 'rgba(255, 255, 255, 0.70)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassHighlight: 'rgba(255, 255, 255, 0.80)',
};
```

## Blur Intensities (iOS)

```typescript
const blurIntensity = {
  low: 20,      // Subtle hint, background elements
  medium: 40,   // Standard glass cards
  high: 60,     // Prominent surfaces, modals
  ultra: 80,    // Hero cards, dock nav
};
```

## Glass Fill Opacity Ranges

```typescript
// Dark theme
const darkGlassOpacity = {
  subtle: 0.03,     // Barely visible
  light: 0.05,      // Standard card
  medium: 0.08,     // Elevated card
  solid: 0.12,      // When legibility matters
};

// Light theme
const lightGlassOpacity = {
  subtle: 0.50,     // Minimal frosting
  light: 0.65,      // Standard card
  medium: 0.80,     // Elevated card
  solid: 0.92,      // When legibility matters
};
```

## Border & Highlight Alpha

```typescript
const borderAlpha = {
  subtle: 0.06,     // Barely visible edge
  light: 0.10,      // Standard border
  medium: 0.15,     // Emphasized border
  strong: 0.20,     // Active/focused state
};

const sheenAlpha = {
  dark: 0.06,       // Dark mode inner sheen
  light: 0.40,      // Light mode inner sheen
};
```

## Shadow Recipe

```typescript
// iOS shadow values
const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardElevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
  }),
};

// Android elevation mapping
const elevation = {
  card: 4,
  cardElevated: 8,
  modal: 16,
  dock: 12,
};
```

## Radius Scale

```typescript
const radius = {
  xs: 8,        // Small chips, badges
  sm: 12,       // Buttons, inputs
  md: 16,       // Small cards
  lg: 20,       // Medium cards
  xl: 24,       // Standard cards
  '2xl': 28,    // Large cards
  '3xl': 32,    // Hero cards
  '4xl': 36,    // Modal sheets
  full: 9999,   // Pills, circular
};
```

## Spacing Scale

```typescript
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// Layout-specific
const layout = {
  screenPadding: 16,
  cardGap: 16,
  sectionGap: 24,
  modalTopRadius: 36,
  dockHeight: 84,
  dockPadding: 20,
};
```

## Typography Scale

```typescript
const typography = {
  // Hero numbers
  heroXL: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
    letterSpacing: -1,
  },
  heroLG: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  heroMD: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },

  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },

  // Body text
  bodyLG: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMD: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySM: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },

  // Labels
  labelLG: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  labelMD: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelSM: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
};
```

## Animation Tokens

```typescript
const animation = {
  // Spring configs (Reanimated)
  springDefault: {
    damping: 30,
    stiffness: 300,
  },
  springSnappy: {
    damping: 20,
    stiffness: 400,
  },
  springBouncy: {
    damping: 12,
    stiffness: 200,
  },
  springViscous: {
    damping: 40,
    stiffness: 250,
  },

  // Timing
  durationFast: 150,
  durationNormal: 250,
  durationSlow: 400,

  // Scale for press
  pressScale: 0.96,
  pressScaleSubtle: 0.98,
};
```

---

# C) COMPONENT SPECS

## 1. GlassCard

The foundational glass surface component.

```typescript
interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'hero';
  intensity?: number;        // Blur intensity (20-80)
  onPress?: () => void;
  style?: ViewStyle;
  showSheen?: boolean;       // Top-left highlight
  glowColor?: string;        // Optional outer glow
}

// Implementation notes:
// - Uses BlurView from expo-blur
// - Wraps in Animated.View for press scaling
// - Border: 1px rgba(255,255,255,0.10)
// - Sheen: LinearGradient top-left to center

const GlassCard = styled({
  borderRadius: radius['2xl'],      // 28px
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.10)',
  overflow: 'hidden',

  // Variants
  default: { blurIntensity: 40 },
  elevated: { blurIntensity: 60, shadowElevation: 8 },
  hero: { blurIntensity: 80, borderRadius: radius['3xl'] },
});
```

## 2. GlassPill

Status chips and quick action buttons.

```typescript
interface GlassPillProps {
  label: string;
  icon?: ReactNode;          // Custom icon or emoji replacement
  variant?: 'default' | 'active' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

const GlassPill = styled({
  borderRadius: radius.full,
  paddingVertical: spacing[2],    // 8px
  paddingHorizontal: spacing[4],  // 16px
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing[2],

  // Size variants
  sm: { paddingVertical: 4, paddingHorizontal: 10, fontSize: 12 },
  md: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
  lg: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 16 },
});
```

## 3. GlassDockNav

The bottom navigation bar with glass effect.

```typescript
interface GlassDockNavProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

interface TabItem {
  icon: string;              // Icon name or custom icon
  label: string;
  badge?: number;            // Notification count
}

// Implementation:
// - Fixed bottom position
// - BlurView with intensity 80
// - Safe area padding at bottom
// - Active tab has lime accent indicator

const GlassDockNav = styled({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: layout.dockHeight,         // 84px
  paddingBottom: safeAreaBottom,
  borderTopLeftRadius: radius.xl,    // 24px
  borderTopRightRadius: radius.xl,
  borderTopWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
});
```

## 4. GlassButton

Primary and secondary action buttons.

```typescript
interface GlassButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

// Primary: Lime accent fill with glow
// Secondary: Glass fill with border
// Ghost: Transparent with text color only

const GlassButton = styled({
  borderRadius: radius.sm,           // 12px
  paddingVertical: spacing[3],       // 12px
  paddingHorizontal: spacing[5],     // 20px

  primary: {
    backgroundColor: theme.accent,
    ...shadows.glow(theme.accent),
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});
```

## 5. StatChip

Compact stat display with icon.

```typescript
interface StatChipProps {
  icon: ReactNode;           // Custom icon component
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

// Layout: Icon left, value + label stacked right
// Trend indicator as small arrow

const StatChip = styled({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing[2],
  padding: spacing[3],
  borderRadius: radius.lg,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
});
```

## 6. RingProgress

Circular progress indicator with gradient.

```typescript
interface RingProgressProps {
  value: number;             // 0-100
  size: number;              // Diameter in px
  strokeWidth: number;       // Ring thickness
  gradientColors: [string, string];
  showValue?: boolean;
  label?: string;
  unit?: string;
}

// Implementation:
// - SVG Circle with strokeDasharray
// - LinearGradient fill
// - Animated value transition
// - Center text for value/label

const RingProgress = {
  track: {
    stroke: 'rgba(255, 255, 255, 0.1)',
  },
  progress: {
    strokeLinecap: 'round',
  },
};
```

## 7. MiniChartCard

Small chart within a glass card.

```typescript
interface MiniChartCardProps {
  title: string;
  value: string | number;
  unit: string;
  data: number[];            // Array of values for sparkline
  trend: 'up' | 'down' | 'neutral';
  color: string;
  onPress?: () => void;
}

// Layout:
// - Top: Title + trend indicator
// - Middle: Hero value + unit
// - Bottom: Sparkline chart

const MiniChartCard = styled({
  minHeight: 140,
  padding: spacing[4],
  gap: spacing[2],
});
```

## 8. JarvisMicButton

The primary floating action button for voice input.

```typescript
interface JarvisMicButtonProps {
  state: 'idle' | 'listening' | 'processing' | 'executing' | 'success' | 'error';
  onPress: () => void;
  onLongPress?: () => void;
}

// Implementation:
// - Circular button 64px diameter
// - Glass fill with blur
// - Animated pulse rings when active
// - Color changes by state:
//   - idle: blue (#3B82F6)
//   - listening: green (#10B981)
//   - processing: orange (#F59E0B)
//   - executing: purple (#8B5CF6)
//   - success: green (#10B981)
//   - error: red (#EF4444)
// - Glow effect matching state color

const JarvisMicButton = styled({
  width: 64,
  height: 64,
  borderRadius: 32,
  position: 'absolute',
  bottom: 100,              // Above dock nav
  right: spacing[5],
  ...shadows.glow(stateColor),
});
```

## 9. GlassSheet

Modal bottom sheet with glass effect.

```typescript
interface GlassSheetProps {
  visible: boolean;
  onClose: () => void;
  height?: number | 'auto';  // Percentage or auto-height
  children: ReactNode;
  showHandle?: boolean;      // Drag handle indicator
}

// Implementation:
// - Animated slide up with spring
// - BlurView intensity 60
// - Top corners rounded 36px
// - Backdrop dim with tap to close
// - Swipe down to dismiss

const GlassSheet = styled({
  borderTopLeftRadius: layout.modalTopRadius,   // 36px
  borderTopRightRadius: layout.modalTopRadius,
  overflow: 'hidden',

  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginTop: spacing[2],
  },
});
```

---

# D) ICON PACK SPEC

## Design Guidelines

All icons follow a unified **"premium emoji sticker"** aesthetic:
- **Style**: Soft 3D with glossy gradients, rounded forms
- **Light Source**: Top-left (10 o'clock direction)
- **Specular Highlight**: Subtle white reflection at top-left
- **Shadow**: Soft bottom-right internal shadow
- **Forms**: Rounded, never sharp angles
- **Outlines**: None - shapes defined by gradient fills
- **Consistency**: Same visual weight, same shadow softness

## Icon Set Specification

| Icon Name | Meaning | Gradient Colors | Sizes | Usage |
|-----------|---------|-----------------|-------|-------|
| **StreakFire** | Streak/consistency | `#F59E0B → #EF4444` (amber to red) | 24, 28, 32 | Streak counters, motivation |
| **Gains** | Strength/muscle | `#8B5CF6 → #EC4899` (violet to pink) | 24, 28, 32 | Workout achievements |
| **Nudge** | Encouragement | `#3B82F6 → #06B6D4` (blue to cyan) | 24, 28, 32 | Social reactions |
| **Meal** | Food/eating | `#10B981 → #84CC16` (emerald to lime) | 24, 28, 32 | Meal logging, nutrition |
| **CameraMeal** | Photo food log | `#6366F1 → #EC4899` (indigo to pink) | 24, 28, 32 | Camera meal capture |
| **BarcodeScan** | Scan reticle | `#14B8A6 → #22D3EE` (teal to cyan) | 24, 28, 32 | Barcode scanning |
| **Mic** | Voice input | `#3B82F6 → #8B5CF6` (blue to violet) | 24, 28, 32 | Jarvis/voice features |
| **Sleep** | Moon/rest | `#6366F1 → #312E81` (indigo to dark) | 24, 28, 32 | Sleep tracking |
| **Heart** | Heart rate/health | `#EF4444 → #F87171` (red gradient) | 24, 28, 32 | Health metrics |
| **Lightning** | Intensity/energy | `#F59E0B → #FCD34D` (amber to yellow) | 24, 28, 32 | Workout intensity |
| **MacroCoin** | Currency | `#FCD34D → #F59E0B` (gold gradient) | 24, 28, 32 | Economy system |
| **Freeze** | Streak freeze | `#06B6D4 → #67E8F9` (cyan gradient) | 24, 28, 32 | Streak protection |
| **LeafAccent** | Organic/natural | `#A3E635 → #65A30D` (lime gradient) | 24, 28, 32 | Brand accent elements |

## Size Specifications

```typescript
const iconSizes = {
  sm: 24,    // Inline with text, lists
  md: 28,    // Card icons, nav items
  lg: 32,    // Hero elements, buttons
};

const iconViewBox = '0 0 32 32';  // Standard viewBox
```

## Monochrome Fallbacks

Each icon has a monochrome variant for accessibility:
- Fill: `currentColor` (inherits text color)
- Stroke: None
- Same silhouette as gradient version

## Usage Rules

1. **Always use the correct size variant** - don't scale SVGs arbitrarily
2. **Maintain consistent spacing** - 8px gap minimum from text
3. **Use gradient version by default** - monochrome only for high-contrast mode
4. **Don't mix with system emojis** - replace all emojis with custom icons
5. **Respect the light source** - if rotating, maintain top-left highlight

---

# E) TRANSLATION MAP

## High Priority: User-Facing UI

### app/(tabs)/_layout.tsx
| Line | Chinese | English |
|------|---------|---------|
| 18 | 仪表板 | Dashboard |
| 27 | 健康 | Health |
| 36 | 营养 | Nutrition |
| 45 | 战队 | Squads |

### app/(tabs)/dashboard.tsx
| Line | Chinese | English |
|------|---------|---------|
| 48 | 良好 | Good |
| 56 | 模拟数据加载 | Simulating data load |
| 59 | 建议增加15分钟步行活动以完成日目标 | Add 15 min walking to reach daily goal |
| 60 | 水分摄入已达到目标的72%，继续保持 | Water intake at 72% of goal - keep going |
| 61 | 今日睡眠质量良好，建议保持规律作息 | Sleep quality good today - maintain routine |
| 92 | 加载健康数据中... | Loading health data... |
| 103 | AI建议横幅 (comment) | AI Suggestion Banner |
| 111 | AI健康建议 | AI Health Tips |
| 119 | Hero Section - 热量管理 (comment) | Hero Section - Calorie Management |
| 123 | 热量管理 | Calorie Management |
| 124 | 今日目标 | Daily Goal |
| 133 | 已摄入 | Consumed |
| 140 | 已摄入 | Consumed |
| 149 | 剩余 | Remaining |
| 156 | Context Section - 两列小卡片 (comment) | Context Section - Two Column Cards |
| 158 | 睡眠质量卡片 (comment) | Sleep Quality Card |
| 170 | 睡眠质量 | Sleep Quality |
| 177 | 活动步数卡片 (comment) | Activity Steps Card |
| 188 | 今日步数 | Steps Today |
| 193 | 分钟活动 | min active |
| 200 | 水分补充卡片 (comment) | Hydration Card |
| 204 | 水分补充 | Hydration |
| 216 | 水分 | Water |
| 222 | 还需 | Still need |
| 224 | 建议每小时补充200ml水分 | Drink 200ml water every hour |

### components/ui/OmniLoggerButton.tsx
| Line | Chinese | English |
|------|---------|---------|
| 24 | 液态波形动画组件 (comment) | Liquid wave animation component |
| 31 | 启动波纹动画 (comment) | Start ripple animation |
| 64 | 停止动画 (comment) | Stop animation |
| 93 | 语音输入状态指示器 (comment) | Voice input status indicator |
| 152 | Omni-Logger浮动按钮主组件 (comment) | Omni-Logger floating button |
| 173 | 根据状态决定颜色和图标 (comment) | Determine color/icon by state |
| 178 | 绿色 (comment) | Green |
| 184 | 橙色 (comment) | Orange |
| 190 | 紫色 (comment) | Purple |
| 196 | 绿色 (comment) | Green |
| 202 | 红色 (comment) | Red |
| 208 | 蓝色 (comment) | Blue |
| 217 | 按钮动画效果 (comment) | Button animation effect |
| 220 | 激活状态动画 (comment) | Active state animation |
| 235 | 恢复默认状态 (comment) | Restore default state |
| 252 | 处理按钮点击 (comment) | Handle button press |
| 257 | 如果在激活状态，停止监听 (comment) | If active, stop listening |
| 261 | 如果在空闲状态，开始监听 (comment) | If idle, start listening |
| 268 | 处理长按 (comment) | Handle long press |
| 270 | 长按可以触发其他功能 (comment) | Long press for other functions |
| 280 | 波形动画 (comment) | Wave animation |
| 283 | 语音输入指示器 (comment) | Voice input indicator |
| 286 | 浮动按钮 (comment) | Floating button |
| 314 | 状态文本显示 (comment) | Status text display |
| 323 | 状态指示器 (comment) | Status indicator |
| 342 | 获取状态文本 (comment) | Get status text |
| 346 | 聆听中... | Listening... |
| 348 | 分析中... | Analyzing... |
| 350 | 执行中... | Processing... |
| 352 | 完成 | Done |
| 354 | 错误 | Error |
| 356 | 点击说话 | Tap to speak |

### components/features/social/Leaderboard.tsx
| Line | Chinese | English |
|------|---------|---------|
| 28 | 物理碰撞排名系统 - Social Physics核心组件 (comment) | Physics collision ranking - Social Physics |
| 46 | 如果没有小队数据，显示空状态 (comment) | Show empty state if no squad data |
| 77 | 排行榜 | Leaderboard |
| 85 | 加入小队后，在这里查看成员排名和互动 | Join a squad to see rankings and interact |
| 92 | 计算成员排名 (comment) | Calculate member rankings |
| 99 | 处理排名项点击 (comment) | Handle rank item press |
| 106 | 触发触觉反馈 (comment) | Trigger haptic feedback |
| 109 | 物理碰撞动画 (comment) | Physics collision animation |
| 131 | 重置状态 (comment) | Reset state |
| 137 | 获取排名颜色 (comment) | Get rank color |
| 140 | 金牌 (comment) | Gold |
| 141 | 银牌 (comment) | Silver |
| 142 | 铜牌 (comment) | Bronze |
| 147 | 获取排名图标 (comment) | Get rank icon |
| 178 | 点击成员查看详细信息，体验物理碰撞效果 | Tap member for details and physics effect |
| 236 | 排名图标 (comment) | Rank icon |
| 251 | 成员信息 (comment) | Member info |
| 271 | 你 | You |
| 277 | 连续打卡天数 (comment) | Consecutive check-in days |
| 285 | 天 | days |
| 289 | 一致性分数 (comment) | Consistency score |
| 299 | 综合分数 (comment) | Overall score |
| 308 | 综合分 | Score |
| 313 | 选中状态指示器 (comment) | Selected state indicator |
| 334 | 物理效果说明 (comment) | Physics effect note |
| 350 | 点击排名卡片体验物理碰撞效果和触觉反馈 | Tap rank cards for physics & haptics |

### app/(modals)/import.tsx
| Line | Chinese | English |
|------|---------|---------|
| 27 | Legacy Bridge导入界面 - MyFitnessPal数据迁移 (comment) | Legacy Bridge - MFP data migration |
| 36 | 选择CSV文件 (comment) | Select CSV file |
| 48 | 无法访问文件 | Cannot access file |
| 53 | 文件选择错误 (logger) | File selection error |
| 55 | 导入失败 | Import Failed |
| 55 | 请选择有效的CSV文件 | Please select a valid CSV file |
| 59 | 处理CSV文件 (comment) | Process CSV file |
| 65 | 读取文件内容 (comment) | Read file content |
| 68 | 验证文件格式 (comment) | Validate file format |
| 70 | 文件格式不符合MyFitnessPal标准 | File format doesn't match MFP standard |
| 73 | 解析CSV数据 (comment) | Parse CSV data |
| 80 | 导入成功 | Import Successful |
| 80 | 成功导入 X 条记录 | Successfully imported X records |
| 83 | 导入失败 | Import Failed |
| 83 | 发现 X 个错误 | Found X errors |
| 86 | CSV处理错误 (logger) | CSV processing error |
| 88 | 未知错误 | Unknown error |
| 93 | 导入数据到用户存储 (comment) | Import data to user store |
| 97 | 添加小延迟避免UI阻塞 (comment) | Add delay to avoid UI blocking |
| 102 | 重新开始导入 (comment) | Restart import |
| 107 | 关闭模态框 (comment) | Close modal |
| 116 | 背景遮罩 (comment) | Background mask |
| 122 | 导入界面内容 (comment) | Import content |
| 139 | 标题区域 (comment) | Title area |
| 158 | 从MyFitnessPal迁移您的历史数据 | Migrate your history from MyFitnessPal |
| 165 | 初始导入界面 (comment) | Initial import UI |
| 168 | 功能介绍 (comment) | Feature intro |
| 181 | 支持的数据类型 | Supported Data Types |
| 184 | 每日卡路里摄入 | Daily calorie intake |
| 185 | 营养元素分布 | Nutrient distribution |
| 186 | 饮食记录时间线 | Diet log timeline |
| 187 | 长达数年的历史数据 | Years of historical data |
| 191 | 文件选择区域 (comment) | File selection area |
| 217 | 选择CSV文件 | Select CSV File |
| 220 | 支持MyFitnessPal导出的标准CSV格式 | Supports standard MFP CSV export format |
| 226 | 使用说明 (comment) | Usage instructions |
| 238 | 在MyFitnessPal中：设置 → 导出数据 → 选择CSV格式 | In MFP: Settings → Export Data → Choose CSV |
| 244 | 导入结果界面 (comment) | Import results UI |
| 247 | 结果统计 (comment) | Results stats |
| 264 | 导入成功 / 导入失败 | Import Successful / Import Failed |
| 272 | 成功导入 | Imported |
| 278 | 错误数量 | Errors |
| 284 | 成功率 | Success Rate |
| 289 | 错误详情 (comment) | Error details |
| 302 | 错误详情 | Error Details |
| 319 | 操作按钮 (comment) | Action buttons |
| 331 | 重新导入 | Re-import |
| 343 | 查看数据 | View Data |

### components/features/intelligence/MagicAdjustmentCard.tsx
| Line | Chinese | English |
|------|---------|---------|
| 16 | 魔法调整卡片组件 (comment) | Magic adjustment card component |
| 27 | 条件渲染 (comment) | Conditional rendering |
| 46 | 应用调整 (X/2 本周免费) | Apply Adjustment (X/2 free this week) |
| 48 | 升级到Pro享受无限调整 | Upgrade to Pro for unlimited adjustments |
| 70 | 智能调整建议 | Smart Adjustment |
| 70 | 调整次数已用尽 | Adjustments Used Up |
| 77 | 检测到活动，建议增加X千卡 | Activity detected, add X kcal |
| 86 | 本周已使用: X/2 次免费调整 | Used this week: X/2 free adjustments |
| 104 | 升级到Pro会员享受无限智能调整 | Upgrade to Pro for unlimited smart adjustments |

### store/groceryStore.ts
| Line | Chinese | English |
|------|---------|---------|
| 19 | 杂货清单状态 (comment) | Grocery list state |
| 25 | 加载状态 (comment) | Loading state |
| 43 | 水果蔬菜 | Fruits & Vegetables |
| 44-46 | 肉类海鲜, 乳制品, 谷物面包 | Meat & Seafood, Dairy, Grains & Bread |
| 49-54 | 调味品, 其他 (categories) | Seasonings, Other |
| 58 | 杂货清单状态管理Store (comment) | Grocery list state store |
| 67 | 水果蔬菜, 肉类海鲜... (categories) | Fruits & Veg, Meat & Seafood... |
| 74 | 添加单个商品 (comment) | Add single item |
| 92 | 从食谱自动添加缺失食材 (comment) | Auto-add missing ingredients |
| 96 | 模拟智能检测缺失食材 (comment) | Simulate smart detection |
| 117 | 切换商品选中状态 (comment) | Toggle item checked state |
| 129 | 移除商品 (comment) | Remove item |
| 136 | 清除已选中的商品 (comment) | Clear checked items |
| 143 | 更新商品信息 (comment) | Update item info |
| 153 | 生成分享文本 (comment) | Generate share text |
| 159 | 购物清单已完成！ | Shopping list complete! |
| 170 | MyMacro AI 购物清单 | MyMacro AI Shopping List |
| 180 | 总计: X 件商品 | Total: X items |
| 184 | 设置加载状态 (comment) | Set loading state |
| 189 | 设置错误信息 (comment) | Set error message |

### services/integration/GroceryDeepLinker.ts
| Line | Chinese | English |
|------|---------|---------|
| 14 | 杂货应用深度链接服务 (comment) | Grocery app deep linking service |
| 39 | 构建Instacart搜索链接 (comment) | Build Instacart search link |
| 71 | 智能选择最佳杂货服务 (comment) | Smart select best grocery service |
| 77 | 水果蔬菜, 肉类海鲜 (categories) | Fruits & Veg, Meat & Seafood |
| 78 | 生鲜食材优先Instacart (comment) | Fresh produce prefers Instacart |
| 79 | 大量商品选择Amazon (comment) | Bulk items prefer Amazon |
| 81 | 家居用品选择Walmart (comment) | Household items prefer Walmart |
| 83 | 其他情况选择Target (comment) | Others prefer Target |
| 88 | 打开杂货应用 (comment) | Open grocery app |
| 100 | 构建带搜索项的链接 (comment) | Build link with search items |
| 124 | 直接打开应用首页 (comment) | Open app homepage |
| 128 | 尝试打开应用 (comment) | Try to open app |
| 134 | 应用未安装，回退到浏览器 (comment) | App not installed, fallback |
| 141 | 应用未安装 | App Not Installed |
| 143 | 请先安装X应用，或使用浏览器版本 | Please install X app or use browser |
| 144 | 确定 | OK |
| 153 | 打开失败 | Failed to Open |
| 155 | 无法打开X，请检查网络连接或应用安装 | Cannot open X, check network/install |
| 156 | 确定 | OK |
| 163 | 批量打开多个服务进行比较 (comment) | Batch open multiple services |
| 180 | 添加短暂延迟避免过快连续打开 (comment) | Add delay to avoid rapid opens |
| 191 | 检查设备是否安装了指定服务 (comment) | Check if service installed |
| 204 | 获取所有可用服务 (comment) | Get all available services |
| 221 | 获取服务显示名称 (comment) | Get service display name |
| 234 | 获取网页版URL (comment) | Get web URL |
| 258 | 分享购物清单到多个平台 (comment) | Share list to multiple platforms |
| 263 | 无可用应用 | No Apps Available |
| 265 | 请先安装X等购物应用 | Please install shopping apps first |
| 266 | 确定 | OK |
| 276 | 选择购物平台 | Choose Shopping Platform |
| 278 | 推荐使用X，或选择其他平台 | Recommend X, or choose another |
| 284 | 取消 | Cancel |

### src/data/recipes.ts
| Line | Chinese | English |
|------|---------|---------|
| 12 | 营养信息 (comment) | Nutrition info |
| 21 | 标签和分类 (comment) | Tags and categories |
| 25 | 食材和步骤 (comment) | Ingredients and steps |
| 29 | 推荐逻辑参数 (comment) | Recommendation logic params |
| 31 | 疲劳度阈值 (comment) | Fatigue threshold |
| 32 | 睡眠质量阈值 (comment) | Sleep quality threshold |
| 44 | 是否为核心食材 (comment) | Is essential ingredient |
| 65 | 英雄食谱数据库 (comment) | Hero recipe database |
| 69 | 恢复碗 | Recovery Bowl |
| 70 | 高蛋白餐后恢复配方... | High-protein post-meal recovery recipe... |
| 85 | 鸡胸肉 | Chicken Breast |
| 86 | 糙米 | Brown Rice |
| 87 | 牛油果 | Avocado |
| 88 | 菠菜 | Spinach |
| 89 | 橄榄油, 汤匙 | Olive Oil, tbsp |
| 91-96 | Instructions in Chinese | (See full recipe translations) |
| 99 | 疲劳度>80时推荐 (comment) | Recommend when fatigue > 80 |
| 105 | 深度睡眠三文鱼 | Deep Sleep Salmon |
| 106 | 富含omega-3和镁的晚餐... | Omega-3 and magnesium dinner... |
| 121 | 三文鱼排 | Salmon Fillet |
| 122 | 芦笋 | Asparagus |
| 123 | 杏仁 | Almonds |
| 124 | 柠檬, 个 | Lemon, whole |
| 125 | 大蒜, 瓣 | Garlic, cloves |
| 127-132 | Instructions in Chinese | (See full recipe translations) |
| 135 | 睡眠质量<50时推荐 (comment) | Recommend when sleep < 50 |
| 141 | 训练前碳负载 | Pre-Workout Carb Load |
| 142 | 训练前2小时的理想碳水化合物补充 | Ideal carb fuel 2hrs before training |
| 157 | 燕麦 | Oats |
| 158 | 香蕉, 根 | Banana, whole |
| 159 | 蜂蜜, 汤匙 | Honey, tbsp |
| 160 | 肉桂粉, 茶匙 | Cinnamon, tsp |
| 162-166 | Instructions in Chinese | (See full recipe translations) |
| 174 | 经济鸡肉饭 | Budget Chicken Rice |
| 175 | 使用储藏室常见食材的经济实惠选择 | Affordable using pantry staples |
| 191 | 鸡腿肉 | Chicken Thigh |
| 192 | 白米 | White Rice |
| 193 | 胡萝卜, 根 | Carrot, whole |
| 194 | 洋葱, 个 | Onion, whole |
| 195 | 酱油, 汤匙 | Soy Sauce, tbsp |
| 197-202 | Instructions in Chinese | (See full recipe translations) |
| 205 | 经济型食谱，无特定条件限制 (comment) | Budget recipe, no conditions |
| 209 | 快速素食盘 | Quick Veggie Plate |
| 210 | 15分钟内完成的简单素食选择 | Simple vegetarian done in 15min |
| 226 | 花椰菜, 个 | Cauliflower, head |
| 227 | 鹰嘴豆 | Chickpeas |
| 228 | 彩椒, 个 | Bell Pepper, whole |
| 229 | 橄榄油, 汤匙 | Olive Oil, tbsp |
| 230 | 香料混合, 茶匙 | Spice Mix, tsp |
| 232-237 | Instructions in Chinese | (See full recipe translations) |
| 245 | 工具函数：根据健康指标筛选食谱 (comment) | Utility: filter recipes by health |
| 259 | 检查疲劳度条件 (comment) | Check fatigue condition |
| 266 | 检查睡眠质量条件 (comment) | Check sleep condition |
| 273 | 检查训练状态 (comment) | Check training state |
| 280 | 检查时间段 (comment) | Check time of day |
| 292 | 工具函数：根据储藏室食材匹配食谱 (comment) | Utility: match recipes by pantry |

---

# F) IMPLEMENTATION NOTES (Expo RN)

## Core Stack

```typescript
// Required dependencies
{
  "expo": "~52.0.31",
  "expo-blur": "~14.0.3",
  "react-native-reanimated": "~3.16.1",
  "nativewind": "^4.2.1",
  "react-native-svg": "15.8.0",
  "expo-haptics": "~14.0.1",
  "expo-linear-gradient": "~14.0.2"
}
```

## NativeWind Theme Extension

Update `tailwind.config.js` with new design tokens:

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep Forest (Dark)
        forest: {
          bg: '#0B1410',
          card: '#13201C',
          elevated: '#1A2B25',
        },
        // Morning Mist (Light)
        mist: {
          bg: '#F2F5F3',
          card: '#FFFFFF',
          elevated: '#FAFAFA',
        },
        // Accents
        lime: {
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
        },
        // Glass
        glass: {
          dark: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.70)',
          border: 'rgba(255, 255, 255, 0.10)',
        },
      },
      borderRadius: {
        '2xl': '28px',
        '3xl': '32px',
        '4xl': '36px',
      },
    },
  },
};
```

## BlurView Best Practices

```typescript
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

// Performance-optimized glass component
const GlassCard = ({ children, intensity = 40 }) => {
  // Limit BlurViews on screen (max 3-4 visible at once)
  // Use lower intensity on Android for performance
  const adjustedIntensity = Platform.OS === 'android'
    ? Math.min(intensity, 50)
    : intensity;

  return (
    <BlurView
      intensity={adjustedIntensity}
      tint="dark"
      style={styles.glass}
      // Reduce blur updates during animations
      reducedTransparencyFallbackColor="rgba(19, 32, 28, 0.95)"
    >
      {children}
    </BlurView>
  );
};
```

## Reanimated Spring Config

```typescript
import { withSpring, WithSpringConfig } from 'react-native-reanimated';

// Soft-Spartan viscous spring
const VISCOUS_SPRING: WithSpringConfig = {
  damping: 30,
  stiffness: 300,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

// Snappy feedback spring
const SNAPPY_SPRING: WithSpringConfig = {
  damping: 20,
  stiffness: 400,
  mass: 0.8,
};

// Usage for press scaling
const handlePressIn = () => {
  scale.value = withSpring(0.96, VISCOUS_SPRING);
};
```

## Gradient Background Implementation

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// Bioluminescent bloom background
const DreamyBackground = () => (
  <View style={StyleSheet.absoluteFill}>
    {/* Base color */}
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0B1410' }]} />

    {/* Bloom 1 - Violet */}
    <AnimatedGradient
      colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.5 }] }]}
    />

    {/* Bloom 2 - Teal */}
    <AnimatedGradient
      colors={['transparent', 'rgba(20, 184, 166, 0.12)']}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.3 }] }]}
    />
  </View>
);
```

## Performance Rules

### BlurView Limits
```typescript
// ❌ BAD: Too many blur layers
<BlurView>
  <BlurView>
    <BlurView>
      {content}
    </BlurView>
  </BlurView>
</BlurView>

// ✅ GOOD: Single blur with styled children
<BlurView intensity={60}>
  <View style={innerCardStyle}>
    <View style={nestedContentStyle}>
      {content}
    </View>
  </View>
</BlurView>
```

### Memoization
```typescript
import { memo, useMemo } from 'react';

// Memoize glass cards that don't change often
const MemoizedGlassCard = memo(GlassCard);

// Memoize expensive style calculations
const cardStyle = useMemo(() => ({
  ...baseStyle,
  shadowColor: theme.accent,
}), [theme.accent]);
```

### Avoid Overdraw
```typescript
// ❌ BAD: Overlapping opaque backgrounds
<View style={{ backgroundColor: '#0B1410' }}>
  <View style={{ backgroundColor: '#13201C' }}>
    <BlurView>...</BlurView>
  </View>
</View>

// ✅ GOOD: Single background, transparent layers
<View style={{ backgroundColor: '#0B1410' }}>
  <BlurView style={{ backgroundColor: 'transparent' }}>
    {content}
  </BlurView>
</View>
```

## Android Fallbacks

```typescript
import { Platform } from 'react-native';

const GlassCard = ({ children }) => {
  if (Platform.OS === 'android') {
    // Fallback to semi-transparent background
    return (
      <View style={[styles.card, styles.androidFallback]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={40} tint="dark" style={styles.card}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  androidFallback: {
    backgroundColor: 'rgba(19, 32, 28, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});
```

## Icon Implementation

```typescript
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface CustomIconProps {
  size?: 24 | 28 | 32;
  monochrome?: boolean;
  color?: string;
}

const StreakFireIcon = ({ size = 24, monochrome = false, color }: CustomIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    {!monochrome && (
      <Defs>
        <LinearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#EF4444" />
        </LinearGradient>
      </Defs>
    )}
    <Path
      d="M16 4c... (fire path data)"
      fill={monochrome ? color || 'currentColor' : 'url(#fireGrad)'}
    />
  </Svg>
);
```

---

# G) ACCEPTANCE CHECKS

## Visual Alignment (5 checks)

- [ ] **Check 1: Gradient Background**
  - Dark mode shows Deep Forest base (#0B1410) with visible violet/teal bioluminescent blooms
  - Light mode shows Morning Mist base (#F2F5F3) with subtle lavender/sky tinting
  - Gradients are soft and dreamy, not harsh or saturated

- [ ] **Check 2: Glass Surface Quality**
  - Cards use real BlurView with visible frosted effect on iOS
  - Border highlight visible (1px, ~10% white opacity)
  - Inner sheen visible on hero cards (top-left gradient)
  - Corner radius is generous (28-36px range)

- [ ] **Check 3: Shadow + Glow System**
  - Shadows are soft and diffused, not sharp drop shadows
  - Active/accent elements have subtle colored glow
  - Cards appear to float above the gradient backdrop

- [ ] **Check 4: Typography Hierarchy**
  - Hero numbers are large and bold (28-48px, 700+ weight)
  - Secondary text is calm (14-16px, 400-500 weight)
  - Contrast meets WCAG AA on all glass surfaces

- [ ] **Check 5: Lime Accent Restraint**
  - Primary accent (#A3E635 dark / #65A30D light) only on CTAs, progress rings, streaks
  - Accent is purposeful, not decorative everywhere
  - Leaf/lime elements feel intentional and on-brand

## Soft-Spartan Motion (2 checks)

- [ ] **Check 6: Spring Animation Feel**
  - All transitions use spring physics (damping ~30, stiffness ~300)
  - Press interactions feel viscous and satisfying (scale to 0.96-0.98)
  - No linear easing or jarring stops

- [ ] **Check 7: Jarvis Button States**
  - Idle: Blue with subtle glow
  - Listening: Green with pulse animation
  - Processing: Orange with rotation
  - Success/Error: Appropriate color feedback

## Translation Completeness (2 checks)

- [ ] **Check 8: No Chinese in UI**
  - All tab labels in English (Dashboard, Health, Nutrition, Squads)
  - All card titles, button labels, status text in English
  - All alert messages, error text in English

- [ ] **Check 9: Recipes Translated**
  - All recipe titles in English
  - All ingredient names in English
  - All cooking instructions in English

## Technical Quality (1 check)

- [ ] **Check 10: Performance & Compatibility**
  - Max 3 BlurViews visible simultaneously on any screen
  - Android gracefully falls back to semi-transparent backgrounds
  - No visible overdraw or layer stacking issues
  - Scrolling remains smooth (60fps) on mid-range devices

---

# APPENDIX: SCREEN DESIGNS

## 1. Home Dashboard (Health OS)

```
┌─────────────────────────────────┐
│  [Gradient Background]          │
│  ┌───────────────────────────┐  │
│  │ 🌿 MyMacro AI     🪙 150  │  │  ← Header
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ TODAY                      │  │  ← Hero Glass Panel
│  │ ┌─────────────────────────┐│  │
│  ││ Calories     1,847        ││  │
│  ││ Remaining    ━━━━━○ 653  ││  │
│  │├─────────────────────────┤│  │
│  ││ Protein 85g │ Recovery 78││  │
│  │└─────────────────────────┘│  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────┐  ┌─────────┐      │  ← Floating Cards
│  │Nutrition│  │Training │      │
│  │ 1,847   │  │ 45min   │      │
│  │ kcal    │  │ active  │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  ┌─────────────────────────────┐│  ← Recovery Card
│  │ Recovery    ○━━━━━━━ 78%    ││
│  │ Sleep debt: -1.2h           ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│  ← Weekly League Strip
│  │ 🏆 #3 │ 🥇 Sarah │ 🥈 Mike  ││
│  └─────────────────────────────┘│
│                                 │
│                        [🎙️]    │  ← Jarvis Mic Button
│  ╔═══════════════════════════╗  │
│  ║ Dashboard  Health  ...    ║  │  ← Glass Dock Nav
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

## 2. Omni-Logger (Jarvis) Sheet

```
┌─────────────────────────────────┐
│ [Dimmed Background]             │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ━━━  (drag handle)       │  │  ← Glass Sheet
│  │                            │  │
│  │  🎙️  "What did you eat?"  │  │  ← Mic + Prompt
│  │                            │  │
│  │  ┌──────────────────────┐ │  │
│  │  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿ │ │  │  ← Waveform Area
│  │  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿ │ │  │
│  │  └──────────────────────┘ │  │
│  │                            │  │
│  │  ┌────┐ ┌────┐ ┌────┐     │  │  ← Quick Intent Pills
│  │  │Food│ │Gym │ │Wt. │     │  │
│  │  └────┘ └────┘ └────┘     │  │
│  │  ┌────┐ ┌────┐ ┌────┐     │  │
│  │  │Scan│ │📷  │ │Inv.│     │  │
│  │  └────┘ └────┘ └────┘     │  │
│  │                            │  │
│  │  ┌────────────────────┐   │  │
│  │  │       Send  →      │   │  │  ← Send Button
│  │  └────────────────────┘   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## 3. Recovery + Insights

```
┌─────────────────────────────────┐
│  [Gradient Background]          │
│  ┌───────────────────────────┐  │
│  │ Recovery & Insights       │  │  ← Header
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ RECOVERY SCORE            │  │  ← Hero Gauge
│  │        ╭───╮              │  │
│  │       │ 78 │              │  │
│  │        ╰───╯              │  │
│  │   Low ━━━━━━○━━━ High     │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Sleep Debt  │ HRV Status  │  │  ← Metrics Row
│  │   -1.2h     │   Normal    │  │
│  │ vs 7d avg   │   52ms      │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💡 INSIGHT                │  │  ← Insight Card
│  │ We reduced your deficit   │  │
│  │ today because Sleep Debt  │  │
│  │ is high. Get rest tonight.│  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Cycle Phase (if enabled)  │  │  ← Optional Toggle
│  │ ○ Follicular ● Luteal ... │  │
│  └───────────────────────────┘  │
│                                 │
│  ╔═══════════════════════════╗  │
│  ║ Dashboard  Health  ...    ║  │  ← Glass Dock Nav
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

---

*Document Version: 2.1.0*
*Last Updated: 2026-01-12*
*Visual Philosophy: Soft-Spartan*
