/**
 * PushNotificationService - Comprehensive Push Notifications
 * 
 * Handles:
 * - Permission requests
 * - Token registration with backend
 * - Local notifications (reminders, achievements)
 * - Remote push handling
 * - Notification categories and actions
 * - Rich notifications with images
 * - Notification scheduling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationCategory = 
  | 'meal_reminder'
  | 'water_reminder'
  | 'workout_reminder'
  | 'streak_alert'
  | 'achievement'
  | 'social'
  | 'coach_message'
  | 'weekly_summary'
  | 'goal_progress';

export interface NotificationSchedule {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
  enabled: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  mealReminders: boolean;
  waterReminders: boolean;
  workoutReminders: boolean;
  streakAlerts: boolean;
  achievements: boolean;
  socialNotifications: boolean;
  coachMessages: boolean;
  weeklySummary: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string;   // "07:00"
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  createdAt: string;
}

// ============================================================================
// NOTIFICATION CATEGORIES (iOS Actions)
// ============================================================================

const NOTIFICATION_CATEGORIES = [
  {
    identifier: 'meal_reminder',
    actions: [
      {
        identifier: 'log_meal',
        buttonTitle: 'Log Meal',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 30min',
        options: { opensAppToForeground: false },
      },
    ],
  },
  {
    identifier: 'water_reminder',
    actions: [
      {
        identifier: 'log_water',
        buttonTitle: '+ 250ml',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'log_water_large',
        buttonTitle: '+ 500ml',
        options: { opensAppToForeground: false },
      },
    ],
  },
  {
    identifier: 'workout_reminder',
    actions: [
      {
        identifier: 'start_workout',
        buttonTitle: 'Start Workout',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'skip_today',
        buttonTitle: 'Skip Today',
        options: { opensAppToForeground: false },
      },
    ],
  },
  {
    identifier: 'streak_alert',
    actions: [
      {
        identifier: 'open_app',
        buttonTitle: 'Keep Streak',
        options: { opensAppToForeground: true },
      },
    ],
  },
  {
    identifier: 'achievement',
    actions: [
      {
        identifier: 'view_achievement',
        buttonTitle: 'View',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'share',
        buttonTitle: 'Share',
        options: { opensAppToForeground: true },
      },
    ],
  },
  {
    identifier: 'coach_message',
    actions: [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        options: { opensAppToForeground: true },
      },
    ],
  },
];

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  mealReminders: true,
  waterReminders: true,
  workoutReminders: true,
  streakAlerts: true,
  achievements: true,
  socialNotifications: true,
  coachMessages: true,
  weeklySummary: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

// ============================================================================
// PUSH NOTIFICATION SERVICE
// ============================================================================

class PushNotificationServiceClass {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private isInitialized = false;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Set up categories (iOS)
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync('meal_reminder', NOTIFICATION_CATEGORIES[0].actions as any);
        await Notifications.setNotificationCategoryAsync('water_reminder', NOTIFICATION_CATEGORIES[1].actions as any);
        await Notifications.setNotificationCategoryAsync('workout_reminder', NOTIFICATION_CATEGORIES[2].actions as any);
        await Notifications.setNotificationCategoryAsync('streak_alert', NOTIFICATION_CATEGORIES[3].actions as any);
        await Notifications.setNotificationCategoryAsync('achievement', NOTIFICATION_CATEGORIES[4].actions as any);
        await Notifications.setNotificationCategoryAsync('coach_message', NOTIFICATION_CATEGORIES[5].actions as any);
      }

      // Set up Android channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Set up listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('[PushNotifications] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[PushNotifications] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Set up Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    // High priority channel for urgent notifications
    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Urgent Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5C00',
      sound: 'default',
    });

    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100],
      lightColor: '#FF5C00',
    });

    // Reminders channel
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 50],
    });

    // Social channel
    await Notifications.setNotificationChannelAsync('social', {
      name: 'Social',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    // Silent channel for background updates
    await Notifications.setNotificationChannelAsync('silent', {
      name: 'Background Updates',
      importance: Notifications.AndroidImportance.LOW,
      sound: null,
      vibrationPattern: null,
    });
  }

  // ==========================================================================
  // PERMISSIONS
  // ==========================================================================

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('[PushNotifications] Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[PushNotifications] Permission not granted');
      return false;
    }

    return true;
  }

  /**
   * Check current permission status
   */
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // ==========================================================================
  // TOKEN MANAGEMENT
  // ==========================================================================

  /**
   * Get or register push token
   */
  async registerPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      
      this.expoPushToken = tokenData.data;
      console.log('[PushNotifications] Token:', this.expoPushToken);

      // Register with backend
      await this.saveTokenToBackend(this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('[PushNotifications] Token registration failed:', error);
      return null;
    }
  }

  /**
   * Save token to Supabase
   */
  private async saveTokenToBackend(token: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const user = useUserStore.getState().user;
    if (!user?.id) return;

    const supabase = getSupabase();
    await supabase.from('push_tokens').upsert({
      user_id: user.id,
      token,
      platform: Platform.OS,
      device_id: Device.deviceName || 'unknown',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,token',
    });
  }

  /**
   * Remove push token on logout
   */
  async unregisterPushToken(): Promise<void> {
    if (!this.expoPushToken || !isSupabaseConfigured()) return;

    const user = useUserStore.getState().user;
    if (!user?.id) return;

    const supabase = getSupabase();
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('token', this.expoPushToken);

    this.expoPushToken = null;
  }

  // ==========================================================================
  // LISTENERS
  // ==========================================================================

  /**
   * Set up notification listeners
   */
  private setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[PushNotifications] Received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[PushNotifications] Response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification received in foreground
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { data } = notification.request.content;
    
    // Update badge count if needed
    if (data?.incrementBadge) {
      this.incrementBadge();
    }

    // Emit event for in-app handling
    // Could use event emitter here for components to listen
  }

  /**
   * Handle notification tap response
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification, actionIdentifier } = response;
    const data = notification.request.content.data as Record<string, any>;

    // Handle action buttons
    switch (actionIdentifier) {
      case 'log_meal':
        // Navigate to meal logging
        break;
      case 'log_water':
        // Quick log 250ml water
        this.quickLogWater(250);
        break;
      case 'log_water_large':
        // Quick log 500ml water
        this.quickLogWater(500);
        break;
      case 'start_workout':
        // Navigate to workout
        break;
      case 'snooze':
        // Reschedule notification
        this.snoozeNotification(notification, 30);
        break;
      default:
        // Default tap - navigate based on data
        if (data?.screen) {
          // Navigate to screen
        }
    }

    // Clear badge
    this.clearBadge();
  }

  /**
   * Quick log water from notification action
   */
  private quickLogWater(amount: number): void {
    const store = useUserStore.getState();
    // Update water intake in store
    const currentWater = store.waterIntake || 0;
    // This would ideally call a proper action, for now just log
    console.log('[PushNotifications] Quick log water:', amount, 'Current:', currentWater);
  }

  /**
   * Snooze a notification
   */
  private async snoozeNotification(
    notification: Notifications.Notification,
    minutes: number
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data as Record<string, unknown>,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
      } as Notifications.TimeIntervalTriggerInput,
    });
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // ==========================================================================
  // LOCAL NOTIFICATIONS
  // ==========================================================================

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    content: Notifications.NotificationContentInput,
    trigger: Notifications.NotificationTriggerInput,
    identifier?: string
  ): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content,
      trigger,
      identifier,
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  // ==========================================================================
  // REMINDER SCHEDULING
  // ==========================================================================

  /**
   * Schedule meal reminders
   */
  async scheduleMealReminders(meals: { name: string; time: string }[]): Promise<void> {
    // Cancel existing meal reminders
    const existing = await this.getScheduledNotifications();
    for (const notif of existing) {
      if (notif.identifier?.startsWith('meal_')) {
        await this.cancelNotification(notif.identifier);
      }
    }

    // Schedule new reminders
    for (const meal of meals) {
      const [hours, mins] = meal.time.split(':').map(Number);
      
      await this.scheduleNotification(
        {
          title: `Time for ${meal.name}! 🍽️`,
          body: 'Tap to log your meal and stay on track.',
          categoryIdentifier: 'meal_reminder',
          data: { type: 'meal_reminder', meal: meal.name },
          sound: true,
        },
        {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: mins,
        } as Notifications.DailyTriggerInput,
        `meal_${meal.name.toLowerCase()}`
      );
    }
  }

  /**
   * Schedule water reminders
   */
  async scheduleWaterReminders(intervalHours: number = 2): Promise<void> {
    // Cancel existing water reminders
    const existing = await this.getScheduledNotifications();
    for (const notif of existing) {
      if (notif.identifier?.startsWith('water_')) {
        await this.cancelNotification(notif.identifier);
      }
    }

    // Schedule reminders every X hours from 8am to 10pm
    for (let hour = 8; hour <= 22; hour += intervalHours) {
      await this.scheduleNotification(
        {
          title: 'Stay Hydrated! 💧',
          body: 'Time to drink some water.',
          categoryIdentifier: 'water_reminder',
          data: { type: 'water_reminder' },
          sound: true,
        },
        {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        } as Notifications.DailyTriggerInput,
        `water_${hour}`
      );
    }
  }

  /**
   * Schedule streak warning
   */
  async scheduleStreakWarning(): Promise<void> {
    const streak = useUserStore.getState().streak || 0;
    
    if (streak === 0) return;

    // Schedule for 9 PM if user hasn't logged today
    await this.scheduleNotification(
      {
        title: `Don't lose your ${streak} day streak! 🔥`,
        body: 'Log something quick to keep your streak alive.',
        categoryIdentifier: 'streak_alert',
        data: { type: 'streak_alert', streak },
        sound: true,
      },
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      } as Notifications.DailyTriggerInput,
      'streak_warning'
    );
  }

  /**
   * Schedule weekly summary
   */
  async scheduleWeeklySummary(): Promise<void> {
    await this.scheduleNotification(
      {
        title: 'Your Weekly Summary is Ready! 📊',
        body: 'See how you did this week.',
        data: { type: 'weekly_summary', screen: '/weekly-summary' },
        sound: true,
      },
      {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Monday
        hour: 9,
        minute: 0,
      } as Notifications.WeeklyTriggerInput,
      'weekly_summary'
    );
  }

  // ==========================================================================
  // ACHIEVEMENT NOTIFICATIONS
  // ==========================================================================

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    title: string,
    body: string,
    achievementId: string
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 ${title}`,
        body,
        categoryIdentifier: 'achievement',
        data: { type: 'achievement', achievementId, screen: '/achievements' },
        sound: true,
      },
      trigger: null, // Immediate
    });
  }

  /**
   * Send streak milestone notification
   */
  async sendStreakMilestone(days: number): Promise<void> {
    const messages: Record<number, string> = {
      7: "One week strong! 💪",
      14: "Two weeks of consistency! 🌟",
      21: "Three weeks - habit forming! 🚀",
      30: "ONE MONTH! You're unstoppable! 🔥",
      50: "50 days! Elite status! 👑",
      100: "100 DAYS! Legend! 🏆",
      365: "ONE YEAR! Absolute champion! 🎉",
    };

    const message = messages[days];
    if (message) {
      await this.sendAchievementNotification(
        `${days} Day Streak!`,
        message,
        `streak_${days}`
      );
    }
  }

  // ==========================================================================
  // BADGE MANAGEMENT
  // ==========================================================================

  /**
   * Set badge count
   */
  async setBadge(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Increment badge
   */
  async incrementBadge(): Promise<void> {
    const current = await Notifications.getBadgeCountAsync();
    await Notifications.setBadgeCountAsync(current + 1);
  }

  // ==========================================================================
  // PREFERENCES
  // ==========================================================================

  /**
   * Update notification preferences
   */
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    // Store preferences
    // This would update UserStore

    // Re-schedule based on new preferences
    if (prefs.mealReminders !== undefined) {
      if (prefs.mealReminders) {
        await this.scheduleMealReminders([
          { name: 'Breakfast', time: '08:00' },
          { name: 'Lunch', time: '12:00' },
          { name: 'Dinner', time: '18:00' },
        ]);
      } else {
        const existing = await this.getScheduledNotifications();
        for (const n of existing.filter(x => x.identifier?.startsWith('meal_'))) {
          await this.cancelNotification(n.identifier!);
        }
      }
    }

    if (prefs.waterReminders !== undefined) {
      if (prefs.waterReminders) {
        await this.scheduleWaterReminders();
      } else {
        const existing = await this.getScheduledNotifications();
        for (const n of existing.filter(x => x.identifier?.startsWith('water_'))) {
          await this.cancelNotification(n.identifier!);
        }
      }
    }
  }
}

// Export singleton
export const PushNotificationService = new PushNotificationServiceClass();
export default PushNotificationService;
