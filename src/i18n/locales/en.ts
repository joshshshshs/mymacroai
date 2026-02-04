/**
 * English Translations - Base Language
 * Complete translation file for MyMacro AI
 */

export default {
  // ============================================================================
  // COMMON
  // ============================================================================
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    retry: 'Retry',
    skip: 'Skip',
    continue: 'Continue',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    none: 'None',
    select: 'Select',
    add: 'Add',
    remove: 'Remove',
    update: 'Update',
    refresh: 'Refresh',
    share: 'Share',
    copy: 'Copy',
    paste: 'Paste',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  },

  // ============================================================================
  // TIME & DATES
  // ============================================================================
  time: {
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    ago: 'ago',
    left: 'left',
    remaining: 'remaining',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  },

  days: {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  },

  months: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: {
    title: 'Dashboard',
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good night',
    },
    dailyGoal: 'Daily Goal',
    calories: 'Calories',
    caloriesLeft: 'calories left',
    caloriesOver: 'calories over',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    macros: 'Macros',
    water: 'Water',
    streak: 'Streak',
    streakDays: '{{count}} day streak',
    recovery: 'Recovery',
    sleep: 'Sleep',
    steps: 'Steps',
    quickLog: 'Quick Log',
    viewAll: 'View All',
    summary: 'Summary',
    progress: 'Progress',
    insights: 'Insights',
  },

  // ============================================================================
  // NUTRITION
  // ============================================================================
  nutrition: {
    title: 'Nutrition',
    logMeal: 'Log Meal',
    logFood: 'Log Food',
    scanBarcode: 'Scan Barcode',
    takePhoto: 'Take Photo',
    voiceLog: 'Voice Log',
    searchFood: 'Search food...',
    recentFoods: 'Recent Foods',
    favorites: 'Favorites',
    myRecipes: 'My Recipes',
    
    meals: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snacks: 'Snacks',
      preworkout: 'Pre-Workout',
      postworkout: 'Post-Workout',
    },

    macros: {
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbohydrates',
      fats: 'Fats',
      fiber: 'Fiber',
      sugar: 'Sugar',
      sodium: 'Sodium',
      cholesterol: 'Cholesterol',
    },

    serving: {
      serving: 'Serving',
      servings: 'Servings',
      servingSize: 'Serving Size',
      grams: 'grams',
      ml: 'ml',
      oz: 'oz',
      cup: 'cup',
      tbsp: 'tbsp',
      tsp: 'tsp',
      piece: 'piece',
      slice: 'slice',
    },

    actions: {
      addToMeal: 'Add to Meal',
      removeFromMeal: 'Remove from Meal',
      editServing: 'Edit Serving',
      viewNutrition: 'View Nutrition Facts',
      addToFavorites: 'Add to Favorites',
      createRecipe: 'Create Recipe',
    },

    messages: {
      foodAdded: 'Food added successfully',
      mealLogged: 'Meal logged successfully',
      noResults: 'No foods found',
      scanFailed: 'Could not scan barcode',
      photoAnalyzing: 'Analyzing your food...',
    },
  },

  // ============================================================================
  // WATER
  // ============================================================================
  water: {
    title: 'Hydration',
    intake: 'Water Intake',
    goal: 'Daily Goal',
    addWater: 'Add Water',
    quickAdd: 'Quick Add',
    glasses: 'glasses',
    ml: 'ml',
    liters: 'L',
    oz: 'oz',
    remaining: '{{amount}} left to reach your goal',
    completed: 'You reached your hydration goal!',
    reminder: 'Time to drink water!',
  },

  // ============================================================================
  // HEALTH & FITNESS
  // ============================================================================
  health: {
    title: 'Health',
    overview: 'Health Overview',
    metrics: 'Health Metrics',
    
    weight: {
      title: 'Weight',
      current: 'Current Weight',
      goal: 'Goal Weight',
      change: 'Change',
      log: 'Log Weight',
      history: 'Weight History',
    },

    sleep: {
      title: 'Sleep',
      duration: 'Sleep Duration',
      quality: 'Sleep Quality',
      bedtime: 'Bedtime',
      wakeTime: 'Wake Time',
      deep: 'Deep Sleep',
      rem: 'REM Sleep',
      light: 'Light Sleep',
      awake: 'Awake',
    },

    activity: {
      title: 'Activity',
      steps: 'Steps',
      distance: 'Distance',
      activeCalories: 'Active Calories',
      exerciseMinutes: 'Exercise Minutes',
      standHours: 'Stand Hours',
    },

    heart: {
      title: 'Heart',
      heartRate: 'Heart Rate',
      restingHR: 'Resting Heart Rate',
      hrv: 'Heart Rate Variability',
      bpm: 'BPM',
    },

    body: {
      title: 'Body Composition',
      bodyFat: 'Body Fat',
      muscleMass: 'Muscle Mass',
      bmi: 'BMI',
      hydration: 'Hydration Level',
    },

    recovery: {
      title: 'Recovery',
      score: 'Recovery Score',
      readiness: 'Readiness',
      strain: 'Strain',
      recommendation: 'Recommendation',
      rest: 'Take it easy today',
      light: 'Light activity recommended',
      moderate: 'Ready for moderate activity',
      intense: 'Ready for intense training',
    },
  },

  // ============================================================================
  // AI COACH
  // ============================================================================
  coach: {
    title: 'AI Coach',
    chat: 'Chat with Coach',
    greeting: "Hi! I'm your AI nutrition coach. How can I help you today?",
    placeholder: 'Ask me anything about nutrition, fitness, or your goals...',
    thinking: 'Thinking...',
    typing: 'Coach is typing...',
    
    suggestions: {
      title: 'Suggestions',
      whatToEat: 'What should I eat?',
      mealPlan: 'Create a meal plan',
      macroHelp: 'Help with my macros',
      workoutTips: 'Workout tips',
      progressReview: 'Review my progress',
    },

    personas: {
      balanced: 'Balanced Coach',
      prepCoach: 'Prep Coach',
      bioHacker: 'Bio-Hacker',
      performance: 'Performance Coach',
      mindful: 'Mindful Coach',
      scientist: 'Science-Based Coach',
    },

    actions: {
      regenerate: 'Regenerate Response',
      copy: 'Copy',
      share: 'Share',
      feedback: 'Give Feedback',
    },
  },

  // ============================================================================
  // SOCIAL & COMMUNITY
  // ============================================================================
  social: {
    title: 'Community',
    feed: 'Feed',
    squads: 'Squads',
    recipes: 'Recipes',
    challenges: 'Challenges',
    leaderboard: 'Leaderboard',
    
    squad: {
      title: 'Squad',
      create: 'Create Squad',
      join: 'Join Squad',
      leave: 'Leave Squad',
      invite: 'Invite Members',
      members: 'Members',
      activity: 'Squad Activity',
    },

    recipe: {
      title: 'Recipe',
      share: 'Share Recipe',
      save: 'Save Recipe',
      ingredients: 'Ingredients',
      instructions: 'Instructions',
      prepTime: 'Prep Time',
      cookTime: 'Cook Time',
      servings: 'Servings',
      nutrition: 'Nutrition per Serving',
    },

    reactions: {
      like: 'Like',
      love: 'Love',
      fire: 'Fire',
      clap: 'Clap',
    },
  },

  // ============================================================================
  // GAMIFICATION
  // ============================================================================
  gamification: {
    streak: {
      title: 'Streak',
      current: 'Current Streak',
      longest: 'Longest Streak',
      days: 'days',
      keepItUp: 'Keep it up!',
      almostThere: "Don't break your streak!",
      newRecord: 'New Record!',
      frozen: 'Streak Frozen',
      lost: 'Streak Lost',
    },

    coins: {
      title: 'MacroCoins',
      balance: 'Balance',
      earn: 'Earn Coins',
      spend: 'Spend Coins',
      history: 'Coin History',
    },

    achievements: {
      title: 'Achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress',
      newAchievement: 'New Achievement!',
    },

    milestones: {
      title: 'Milestones',
      streak7: '7 Day Streak',
      streak30: '30 Day Streak',
      streak100: '100 Day Streak',
      streak365: '365 Day Streak',
    },
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================
  settings: {
    title: 'Settings',
    
    account: {
      title: 'Account',
      profile: 'Profile',
      email: 'Email',
      password: 'Password',
      subscription: 'Subscription',
      signOut: 'Sign Out',
      deleteAccount: 'Delete Account',
    },

    preferences: {
      title: 'Preferences',
      language: 'Language',
      theme: 'Theme',
      units: 'Units',
      notifications: 'Notifications',
      sounds: 'Sounds',
      haptics: 'Haptics',
    },

    goals: {
      title: 'Goals',
      dailyCalories: 'Daily Calories',
      macroTargets: 'Macro Targets',
      waterGoal: 'Water Goal',
      weightGoal: 'Weight Goal',
      fitnessGoal: 'Fitness Goal',
    },

    connected: {
      title: 'Connected Devices',
      appleHealth: 'Apple Health',
      googleFit: 'Google Fit',
      oura: 'Oura Ring',
      whoop: 'WHOOP',
      garmin: 'Garmin',
      fitbit: 'Fitbit',
    },

    privacy: {
      title: 'Privacy',
      dataExport: 'Export Data',
      dataDelete: 'Delete All Data',
      analytics: 'Analytics',
      personalization: 'Personalization',
    },

    about: {
      title: 'About',
      version: 'Version',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      support: 'Support',
      feedback: 'Send Feedback',
      rate: 'Rate the App',
    },
  },

  // ============================================================================
  // ONBOARDING
  // ============================================================================
  onboarding: {
    welcome: {
      title: 'Welcome to MyMacro AI',
      subtitle: 'Your personal AI nutrition coach',
    },
    
    goals: {
      title: 'What are your goals?',
      loseWeight: 'Lose Weight',
      gainMuscle: 'Build Muscle',
      maintain: 'Maintain Weight',
      improveHealth: 'Improve Health',
      performance: 'Athletic Performance',
    },

    metrics: {
      title: 'Tell us about yourself',
      age: 'Age',
      gender: 'Gender',
      height: 'Height',
      weight: 'Current Weight',
      targetWeight: 'Target Weight',
      activity: 'Activity Level',
    },

    activity: {
      sedentary: 'Sedentary',
      sedentaryDesc: 'Little to no exercise',
      light: 'Lightly Active',
      lightDesc: 'Light exercise 1-3 days/week',
      moderate: 'Moderately Active',
      moderateDesc: 'Moderate exercise 3-5 days/week',
      active: 'Very Active',
      activeDesc: 'Hard exercise 6-7 days/week',
      athlete: 'Athlete',
      athleteDesc: 'Professional athlete or very intense training',
    },

    diet: {
      title: 'Any dietary preferences?',
      none: 'No Restrictions',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
      paleo: 'Paleo',
      halal: 'Halal',
      kosher: 'Kosher',
      glutenFree: 'Gluten-Free',
      dairyFree: 'Dairy-Free',
    },

    permissions: {
      title: 'Enable Features',
      health: 'Health Data',
      healthDesc: 'Sync with Apple Health or Google Fit',
      notifications: 'Notifications',
      notificationsDesc: 'Get reminders and updates',
      camera: 'Camera',
      cameraDesc: 'Scan barcodes and food photos',
    },

    complete: {
      title: "You're all set!",
      subtitle: 'Your personalized plan is ready',
      start: 'Start Your Journey',
    },
  },

  // ============================================================================
  // ERRORS & MESSAGES
  // ============================================================================
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'No internet connection. Please check your network.',
    server: 'Server error. Please try again later.',
    auth: 'Authentication failed. Please sign in again.',
    notFound: 'Not found.',
    permission: 'Permission denied.',
    validation: 'Please check your input.',
  },

  messages: {
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    copied: 'Copied to clipboard',
    shared: 'Shared successfully',
    comingSoon: 'Coming soon!',
  },

  // ============================================================================
  // UNITS
  // ============================================================================
  units: {
    metric: 'Metric',
    imperial: 'Imperial',
    kg: 'kg',
    lbs: 'lbs',
    cm: 'cm',
    ft: 'ft',
    in: 'in',
    kcal: 'kcal',
    g: 'g',
    mg: 'mg',
    ml: 'ml',
    L: 'L',
    oz: 'oz',
  },

  // ============================================================================
  // PREMIUM
  // ============================================================================
  premium: {
    title: 'Premium',
    upgrade: 'Upgrade to Premium',
    features: 'Premium Features',
    trial: 'Start Free Trial',
    restore: 'Restore Purchase',
    
    benefits: {
      aiCoach: 'Unlimited AI coaching',
      personas: 'All coach personas',
      analytics: 'Advanced analytics',
      mealPlans: 'Custom meal plans',
      noAds: 'Ad-free experience',
      priority: 'Priority support',
    },
  },
};
