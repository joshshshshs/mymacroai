/**
 * CalendarService - Date Management & Navigation
 * 
 * Handles:
 * - Selected date tracking
 * - Date-based data loading
 * - Calendar navigation
 * - Date formatting with locale support
 * - Proper data persistence per date
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore, getIntakeForDate, getLogsForDate } from '@/src/store/UserStore';
import { formatDate, getCurrentLanguage, isRTL } from '@/src/i18n';

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarState {
  // Currently selected date (YYYY-MM-DD format)
  selectedDate: string;
  
  // View mode
  viewMode: 'day' | 'week' | 'month';
  
  // Calendar expanded state
  isCalendarExpanded: boolean;
  
  // Actions
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  toggleCalendarExpanded: () => void;
}

export interface DayData {
  date: string;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
  hasLogs: boolean;
  caloriesLogged: number;
  caloriesTarget: number;
  completionPercent: number;
  streakDay: boolean;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Parse a date string to Date object
 */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a date string for display
 */
export const formatDisplayDate = (dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const date = parseDate(dateString);
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  // Use localized relative names
  if (dateString === today) {
    return getCurrentLanguage().startsWith('ar') ? 'اليوم' : 'Today';
  }
  if (dateString === yesterday) {
    return getCurrentLanguage().startsWith('ar') ? 'أمس' : 'Yesterday';
  }
  if (dateString === tomorrow) {
    return getCurrentLanguage().startsWith('ar') ? 'غداً' : 'Tomorrow';
  }

  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { month: 'short', day: 'numeric' } :
    format === 'medium' ? { weekday: 'short', month: 'short', day: 'numeric' } :
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

  return formatDate(date, options);
};

/**
 * Add days to a date string
 */
export const addDays = (dateString: string, days: number): string => {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Add weeks to a date string
 */
export const addWeeks = (dateString: string, weeks: number): string => {
  return addDays(dateString, weeks * 7);
};

/**
 * Add months to a date string
 */
export const addMonths = (dateString: string, months: number): string => {
  const date = parseDate(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

/**
 * Get the start of week for a date
 */
export const getStartOfWeek = (dateString: string): string => {
  const date = parseDate(dateString);
  const day = date.getDay();
  const diff = date.getDate() - day; // Sunday as first day
  date.setDate(diff);
  return date.toISOString().split('T')[0];
};

/**
 * Get the end of week for a date
 */
export const getEndOfWeek = (dateString: string): string => {
  const start = getStartOfWeek(dateString);
  return addDays(start, 6);
};

/**
 * Get all dates in a week
 */
export const getWeekDates = (dateString: string): string[] => {
  const start = getStartOfWeek(dateString);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/**
 * Get all dates in a month
 */
export const getMonthDates = (dateString: string): string[] => {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const dates: string[] = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }
  
  return dates;
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Check if date is in the future
 */
export const isFuture = (dateString: string): boolean => {
  return dateString > getTodayString();
};

/**
 * Check if date is in the past
 */
export const isPast = (dateString: string): boolean => {
  return dateString < getTodayString();
};

/**
 * Get the difference in days between two dates
 */
export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================================================
// CALENDAR STORE
// ============================================================================

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      selectedDate: getTodayString(),
      viewMode: 'day',
      isCalendarExpanded: false,

      setSelectedDate: (date) => {
        // Don't allow selecting future dates for logging
        const today = getTodayString();
        const finalDate = date > today ? today : date;
        set({ selectedDate: finalDate });
      },

      goToToday: () => {
        set({ selectedDate: getTodayString() });
      },

      goToPreviousDay: () => {
        const current = get().selectedDate;
        set({ selectedDate: addDays(current, -1) });
      },

      goToNextDay: () => {
        const current = get().selectedDate;
        const today = getTodayString();
        const nextDay = addDays(current, 1);
        // Don't go beyond today
        if (nextDay <= today) {
          set({ selectedDate: nextDay });
        }
      },

      goToPreviousWeek: () => {
        const current = get().selectedDate;
        set({ selectedDate: addWeeks(current, -1) });
      },

      goToNextWeek: () => {
        const current = get().selectedDate;
        const today = getTodayString();
        const nextWeek = addWeeks(current, 1);
        // Clamp to today if it would go into future
        if (nextWeek <= today) {
          set({ selectedDate: nextWeek });
        } else {
          set({ selectedDate: today });
        }
      },

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleCalendarExpanded: () => {
        set((state) => ({ isCalendarExpanded: !state.isCalendarExpanded }));
      },
    }),
    {
      name: 'mymacro-calendar',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        // Don't persist selectedDate - always start on today
      }),
    }
  )
);

// ============================================================================
// DATA HOOKS
// ============================================================================

/**
 * Get data for the selected date
 */
export const useSelectedDateData = () => {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const intakeData = getIntakeForDate(selectedDate);
  const logsData = getLogsForDate(selectedDate);
  const targets = useUserStore((s) => s.dailyTarget);

  return {
    date: selectedDate,
    intake: intakeData,
    logs: logsData,
    targets,
    isToday: isToday(selectedDate),
    formattedDate: formatDisplayDate(selectedDate),
  };
};

/**
 * Get day data for calendar display
 */
export const useDayData = (dateString: string): DayData => {
  const intakeData = getIntakeForDate(dateString);
  const logsData = getLogsForDate(dateString);
  const targets = useUserStore((s) => s.dailyTarget);
  const today = getTodayString();

  const hasLogs = logsData.length > 0;
  const caloriesLogged = intakeData.calories;
  const caloriesTarget = targets.calories;
  const completionPercent = caloriesTarget > 0 
    ? Math.round((caloriesLogged / caloriesTarget) * 100) 
    : 0;

  return {
    date: dateString,
    isToday: dateString === today,
    isFuture: dateString > today,
    isPast: dateString < today,
    hasLogs,
    caloriesLogged,
    caloriesTarget,
    completionPercent,
    streakDay: hasLogs, // Simplified - could be more sophisticated
  };
};

/**
 * Get week data for calendar display
 */
export const useWeekData = (dateString?: string): DayData[] => {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const targetDate = dateString || selectedDate;
  const weekDates = getWeekDates(targetDate);

  return weekDates.map((date) => {
    const intakeData = getIntakeForDate(date);
    const logsData = getLogsForDate(date);
    const targets = useUserStore.getState().dailyTarget;
    const today = getTodayString();

    return {
      date,
      isToday: date === today,
      isFuture: date > today,
      isPast: date < today,
      hasLogs: logsData.length > 0,
      caloriesLogged: intakeData.calories,
      caloriesTarget: targets.calories,
      completionPercent: targets.calories > 0 
        ? Math.round((intakeData.calories / targets.calories) * 100) 
        : 0,
      streakDay: logsData.length > 0,
    };
  });
};

// ============================================================================
// CALENDAR SERVICE CLASS
// ============================================================================

class CalendarServiceClass {
  /**
   * Initialize calendar on app start - ensure selected date is valid
   */
  initialize(): void {
    const today = getTodayString();
    const state = useCalendarStore.getState();
    
    // If stored date is in future, reset to today
    if (state.selectedDate > today) {
      useCalendarStore.getState().goToToday();
    }
  }

  /**
   * Check if a date can be edited (not in future)
   */
  canEditDate(dateString: string): boolean {
    return !isFuture(dateString);
  }

  /**
   * Get summary for a date range
   */
  getDateRangeSummary(startDate: string, endDate: string) {
    const dates: string[] = [];
    let current = startDate;
    
    while (current <= endDate) {
      dates.push(current);
      current = addDays(current, 1);
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let daysWithLogs = 0;

    dates.forEach((date) => {
      const intake = getIntakeForDate(date);
      const logs = getLogsForDate(date);
      
      if (logs.length > 0) {
        daysWithLogs++;
        totalCalories += intake.calories;
        totalProtein += intake.protein;
        totalCarbs += intake.carbs;
        totalFats += intake.fats;
      }
    });

    return {
      startDate,
      endDate,
      totalDays: dates.length,
      daysWithLogs,
      averageCalories: daysWithLogs > 0 ? Math.round(totalCalories / daysWithLogs) : 0,
      averageProtein: daysWithLogs > 0 ? Math.round(totalProtein / daysWithLogs) : 0,
      averageCarbs: daysWithLogs > 0 ? Math.round(totalCarbs / daysWithLogs) : 0,
      averageFats: daysWithLogs > 0 ? Math.round(totalFats / daysWithLogs) : 0,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
    };
  }

  /**
   * Get streak data from dates
   */
  calculateStreak(): { current: number; longest: number } {
    const today = getTodayString();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = today;

    // Count backward from today
    while (true) {
      const logs = getLogsForDate(checkDate);
      
      if (logs.length > 0) {
        if (checkDate === today || checkDate === addDays(today, -currentStreak)) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === tempStreak) {
          // Streak broken
        }
        tempStreak = 0;
      }

      checkDate = addDays(checkDate, -1);

      // Stop after checking 365 days back
      if (getDaysDifference(checkDate, today) > 365) break;
    }

    return { current: currentStreak, longest: longestStreak };
  }
}

export const CalendarService = new CalendarServiceClass();
export default CalendarService;
