/**
 * AI Coach Type Definitions
 * 
 * Comprehensive types for the AI brain that powers personalized coaching
 * with full context awareness across all app features.
 */

// ============================================================================
// USER CONTEXT TYPES
// ============================================================================

/**
 * Complete user context aggregated from all app sources
 */
export interface UserContext {
  // Core profile
  profile: UserProfile;
  
  // Today's data
  todaySnapshot: DailySnapshot;
  
  // Recent history (last 7 days)
  recentHistory: DailySnapshot[];
  
  // Health metrics
  healthMetrics: HealthMetrics;
  
  // Goals and preferences
  goals: UserGoals;
  preferences: UserPreferences;
  
  // Active protocols
  activeProtocols: ActiveProtocols;
  
  // Social context
  socialContext: SocialContext;
  
  // Timestamp of context generation
  generatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal: 'lose_fat' | 'maintain' | 'build_muscle' | 'recomp' | 'performance';
  dietType?: 'standard' | 'keto' | 'vegan' | 'vegetarian' | 'paleo' | 'mediterranean';
  allergies: string[];
  medicalConditions: string[];
  isPro: boolean;
  isFounder: boolean;
  joinedAt: string;
}

export interface DailySnapshot {
  date: string;
  
  // Nutrition
  nutrition: {
    calories: { consumed: number; target: number; };
    protein: { consumed: number; target: number; };
    carbs: { consumed: number; target: number; };
    fat: { consumed: number; target: number; };
    fiber?: number;
    water: { consumed: number; target: number; }; // ml
    meals: MealEntry[];
  };
  
  // Activity
  activity: {
    steps: number;
    stepsGoal: number;
    activeMinutes: number;
    caloriesBurned: number;
    workouts: WorkoutEntry[];
  };
  
  // Health
  health: {
    sleep?: SleepData;
    hrv?: number;
    restingHR?: number;
    stress?: 'low' | 'moderate' | 'high';
    recovery?: number; // 0-100
    weight?: number;
    bodyFat?: number;
  };
  
  // Cycle (if applicable)
  cycle?: {
    phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    day: number;
    symptoms?: string[];
  };
  
  // Mood & notes
  journal?: {
    mood?: 1 | 2 | 3 | 4 | 5;
    energy?: 1 | 2 | 3 | 4 | 5;
    notes?: string;
    sharedWithAI: boolean;
  };
}

export interface MealEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  foods: FoodLogEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  loggedAt: string;
  source: 'manual' | 'voice' | 'photo' | 'barcode';
}

export interface FoodLogEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

export interface WorkoutEntry {
  id: string;
  type: string; // 'strength', 'cardio', 'hiit', 'yoga', etc.
  name: string;
  duration: number; // minutes
  caloriesBurned?: number;
  intensity?: 'light' | 'moderate' | 'intense';
  exercises?: ExerciseEntry[];
  source: 'manual' | 'wearable' | 'voice' | 'detected';
  loggedAt: string;
}

export interface ExerciseEntry {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
}

export interface SleepData {
  duration: number; // hours
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  bedtime?: string;
  wakeTime?: string;
  deepSleep?: number; // hours
  remSleep?: number; // hours
}

export interface HealthMetrics {
  // Wearable data
  wearables: {
    connected: string[]; // ['oura', 'whoop', 'apple_health']
    lastSync?: string;
  };
  
  // Body composition
  body: {
    currentWeight: number;
    weightTrend: 'losing' | 'stable' | 'gaining';
    weeklyWeightChange?: number;
    bodyFat?: number;
    muscleMass?: number;
    lastBodyScan?: string;
  };
  
  // Averages (7-day)
  averages: {
    sleep: number;
    hrv: number;
    restingHR: number;
    steps: number;
    calories: number;
  };
}

export interface UserGoals {
  // Primary goal
  primary: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health' | 'performance';
  
  // Specific targets
  targetWeight?: number;
  targetBodyFat?: number;
  weeklyWeightChange?: number; // kg per week (-0.5 to +0.5)
  
  // Macro targets
  dailyCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  
  // Other goals
  dailySteps?: number;
  weeklyWorkouts?: number;
  waterTarget?: number; // ml
}

export interface UserPreferences {
  // Units
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft';
  energyUnit: 'kcal' | 'kj';
  
  // AI preferences
  coachPersonality: 'supportive' | 'strict' | 'scientific' | 'friendly';
  notificationFrequency: 'minimal' | 'moderate' | 'frequent';
  proactiveInsights: boolean;
  
  // Diet preferences
  mealFrequency: number; // meals per day
  fastingWindow?: { start: string; end: string; };
  avoidFoods: string[];
  favoriteFoods: string[];
}

export interface ActiveProtocols {
  // Peptide protocol
  peptides?: {
    active: boolean;
    compounds: string[];
    schedule: string;
    startDate: string;
    notes?: string;
  };
  
  // Supplement stack
  supplements?: {
    items: string[];
    timing: string;
  };
  
  // Training program
  trainingProgram?: {
    name: string;
    split: string; // 'PPL', 'Upper/Lower', 'Full Body', etc.
    daysPerWeek: number;
    currentWeek: number;
    startDate: string;
  };
  
  // Diet protocol
  dietProtocol?: {
    type: string;
    phase?: 'bulk' | 'cut' | 'maintain' | 'reverse';
    weekNumber?: number;
    notes?: string;
  };
}

export interface SocialContext {
  // Squad info
  squad?: {
    id: string;
    name: string;
    memberCount: number;
    activeChallenge?: string;
  };
  
  // Recipes
  savedRecipes: number;
  publishedRecipes: number;
  
  // Achievements
  currentStreak: number;
  totalMilestones: number;
  recentMilestones: string[];
}

// ============================================================================
// CONVERSATION & MEMORY TYPES
// ============================================================================

export interface Conversation {
  id: string;
  date: string; // YYYY-MM-DD
  messages: Message[];
  summary?: string; // AI-generated summary of the day's conversation
  topics: string[]; // Key topics discussed
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  
  // Rich content
  richContent?: RichContent[];
  
  // Metadata
  metadata?: {
    intent?: string; // What the user was asking about
    contextUsed?: string[]; // Which context areas were referenced
    webSearchUsed?: boolean;
    tokensUsed?: number;
  };
}

export interface RichContent {
  type: 'action_button' | 'data_table' | 'chart' | 'plan_card' | 'image' | 'progress_ring';
  data: ActionButtonData | DataTableData | ChartData | PlanCardData | ImageData | ProgressRingData;
}

export interface ActionButtonData {
  label: string;
  icon?: string;
  route: string;
  params?: Record<string, string>;
  style?: 'primary' | 'secondary' | 'outline';
}

export interface DataTableData {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  highlightRows?: number[];
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'progress';
  title?: string;
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  height?: number;
}

export interface PlanCardData {
  type: 'workout' | 'meal' | 'weekly';
  title: string;
  subtitle?: string;
  items: PlanItem[];
  actionLabel?: string;
  actionRoute?: string;
}

export interface PlanItem {
  name: string;
  detail?: string;
  value?: string | number;
  completed?: boolean;
}

export interface ImageData {
  url: string;
  alt: string;
  caption?: string;
}

export interface ProgressRingData {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}

// ============================================================================
// AI REQUEST/RESPONSE TYPES
// ============================================================================

export interface AICoachRequest {
  // The user's message
  message: string;
  
  // Current user context
  context: UserContext;
  
  // Conversation history for this day
  conversationHistory: Message[];
  
  // Request options
  options?: {
    includeWebSearch?: boolean;
    includeRichContent?: boolean;
    maxTokens?: number;
  };
}

export interface AICoachResponse {
  // The AI's text response
  text: string;
  
  // Rich content to display
  richContent?: RichContent[];
  
  // Suggested follow-up questions
  suggestions?: string[];
  
  // Any macro adjustments recommended
  macroAdjustments?: MacroAdjustment;
  
  // Web sources used (if any)
  sources?: WebSource[];
  
  // Metadata
  metadata: {
    processingTime: number;
    tokensUsed: number;
    contextAreasUsed: string[];
    confidence: number;
  };
}

export interface MacroAdjustment {
  reason: string;
  originalCalories: number;
  adjustedCalories: number;
  originalProtein: number;
  adjustedProtein: number;
  originalCarbs: number;
  adjustedCarbs: number;
  originalFat: number;
  adjustedFat: number;
  validForDate: string;
}

export interface WebSource {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

// ============================================================================
// MEMORY & SEARCH TYPES
// ============================================================================

export interface MemorySearchQuery {
  query: string;
  dateRange?: { start: string; end: string; };
  topics?: string[];
  limit?: number;
}

export interface MemorySearchResult {
  conversationId: string;
  date: string;
  relevantMessages: Message[];
  score: number;
  summary?: string;
}

export interface ConversationSummary {
  date: string;
  topics: string[];
  summary: string;
  keyDecisions: string[]; // e.g., "Set new macro targets", "Created leg day workout"
  plansCreated: string[]; // References to plans created
}

// ============================================================================
// MACRO ADJUSTMENT ENGINE TYPES
// ============================================================================

export interface MacroCalculationInput {
  baseMetrics: {
    bmr: number;
    tdee: number;
    targetCalories: number;
  };
  
  todayActivity: {
    steps: number;
    workouts: WorkoutEntry[];
    activeMinutes: number;
    estimatedBurn: number;
  };
  
  nutritionConsumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  
  healthFactors: {
    sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
    recoveryScore?: number;
    stressLevel?: 'low' | 'moderate' | 'high';
    cyclePhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  };
  
  goal: 'lose_fat' | 'maintain' | 'build_muscle';
}

export interface MacroCalculationResult {
  adjustedCalories: number;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  
  adjustments: {
    activityAdjustment: number;
    recoveryAdjustment: number;
    cycleAdjustment: number;
    totalAdjustment: number;
  };
  
  reasoning: string;
  confidence: number;
}
