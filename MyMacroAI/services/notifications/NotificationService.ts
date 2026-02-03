/**
 * NotificationService
 * Handles sending local and push notifications for MyMacroAI
 * Includes AI-powered activity detection notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationAnalytics } from './NotificationAnalytics';
import { logger } from '../../utils/logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ActivityDetectedPayload {
  activityType: 'run' | 'walk' | 'cycle' | 'swim' | 'workout' | 'hike';
  distance?: number; // in km
  duration?: number; // in minutes
  calories?: number;
  adjustments: {
    calorieIncrease: number;
    proteinIncrease: number;
    carbIncrease: number;
  };
}

export interface NotificationPayload {
  campaign: string;
  type: string;
  data?: Record<string, any>;
}

class NotificationService {
  private isInitialized = false;

  /**
   * Initialize notification service and request permissions
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted');
        return false;
      }

      // Initialize analytics
      await notificationAnalytics.initialize();

      this.isInitialized = true;
      logger.log('NotificationService initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize NotificationService:', error);
      return false;
    }
  }

  /**
   * Send a local notification immediately
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: NotificationPayload
  ): Promise<string | null> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || { campaign: 'general', type: 'local' },
          sound: true,
          badge: 1,
        },
        trigger: null, // Send immediately
      });

      // Log to analytics
      await notificationAnalytics.logSentEvent(
        data?.campaign || 'general',
        { title, body, ...data }
      );

      logger.log('Notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      logger.error('Failed to send notification:', error);
      return null;
    }
  }

  /**
   * AI Activity Detection Notification
   * Sent when wearable detects a workout and AI adjusts the plan
   */
  async sendActivityDetectedNotification(payload: ActivityDetectedPayload): Promise<string | null> {
    const activityEmoji: Record<string, string> = {
      run: '🏃',
      walk: '🚶',
      cycle: '🚴',
      swim: '🏊',
      workout: '💪',
      hike: '🥾',
    };

    const activityName: Record<string, string> = {
      run: 'run',
      walk: 'walk',
      cycle: 'ride',
      swim: 'swim',
      workout: 'workout',
      hike: 'hike',
    };

    const emoji = activityEmoji[payload.activityType] || '🏋️';
    const activity = activityName[payload.activityType] || 'workout';

    // Build title
    let title = `${emoji} Activity Detected`;
    if (payload.distance) {
      title = `${emoji} ${payload.distance}km ${activity} detected`;
    }

    // Build body with AI adjustment info
    const adjustments = payload.adjustments;
    let body = `AI adjusted your plan for today.`;

    if (adjustments.calorieIncrease > 0) {
      body += ` +${adjustments.calorieIncrease} kcal`;
    }
    if (adjustments.proteinIncrease > 0) {
      body += `, +${adjustments.proteinIncrease}g protein`;
    }
    if (adjustments.carbIncrease > 0) {
      body += `, +${adjustments.carbIncrease}g carbs`;
    }
    body += ` to fuel your recovery.`;

    return this.sendLocalNotification(title, body, {
      campaign: 'activity-detection',
      type: 'ai-adjustment',
      data: payload,
    });
  }

  /**
   * Quick method to send the demo "10km run" notification
   */
  async sendDemoRunNotification(): Promise<string | null> {
    return this.sendActivityDetectedNotification({
      activityType: 'run',
      distance: 10,
      duration: 52,
      calories: 620,
      adjustments: {
        calorieIncrease: 450,
        proteinIncrease: 25,
        carbIncrease: 60,
      },
    });
  }

  /**
   * Poor sleep detected notification
   */
  async sendPoorSleepNotification(
    sleepHours: number,
    sleepScore: number,
    adjustments: {
      calorieIncrease: number;
      carbIncrease: number;
      caffeineLimit?: string;
    }
  ): Promise<string | null> {
    const title = `😴 Low sleep detected (${sleepHours}h)`;

    let body = `Sleep score: ${sleepScore}/100. AI adjusted your plan: `;
    body += `+${adjustments.calorieIncrease} kcal, +${adjustments.carbIncrease}g carbs for energy.`;

    if (adjustments.caffeineLimit) {
      body += ` Caffeine cutoff: ${adjustments.caffeineLimit}.`;
    }

    return this.sendLocalNotification(title, body, {
      campaign: 'sleep-detection',
      type: 'ai-adjustment',
      data: { sleepHours, sleepScore, adjustments },
    });
  }

  /**
   * Demo poor sleep notification
   */
  async sendDemoSleepNotification(): Promise<string | null> {
    return this.sendPoorSleepNotification(4.5, 42, {
      calorieIncrease: 200,
      carbIncrease: 40,
      caffeineLimit: '2pm',
    });
  }

  /**
   * Elevated heart rate notification
   */
  async sendHeartRateNotification(
    currentHR: number,
    restingHR: number,
    status: 'elevated' | 'high' | 'optimal',
    recommendation: string
  ): Promise<string | null> {
    const statusInfo: Record<string, { emoji: string; title: string }> = {
      elevated: { emoji: '💓', title: 'Elevated heart rate detected' },
      high: { emoji: '❤️‍🔥', title: 'High heart rate alert' },
      optimal: { emoji: '💚', title: 'Heart rate optimal' },
    };

    const info = statusInfo[status];
    const title = `${info.emoji} ${info.title}`;
    const body = `Current: ${currentHR} bpm (Resting: ${restingHR} bpm). ${recommendation}`;

    return this.sendLocalNotification(title, body, {
      campaign: 'heart-rate-detection',
      type: 'ai-adjustment',
      data: { currentHR, restingHR, status, recommendation },
    });
  }

  /**
   * Demo elevated heart rate notification
   */
  async sendDemoHeartRateNotification(): Promise<string | null> {
    return this.sendHeartRateNotification(
      92,
      58,
      'elevated',
      'AI reduced training intensity. Focus on recovery today.'
    );
  }

  /**
   * Recovery alert notification
   */
  async sendRecoveryAlert(
    recoveryScore: number,
    recommendation: 'rest' | 'light' | 'full'
  ): Promise<string | null> {
    const titles: Record<string, string> = {
      rest: '😴 Recovery Priority',
      light: '⚡ Moderate Recovery',
      full: '🔥 Ready to Crush It',
    };

    const bodies: Record<string, string> = {
      rest: `Recovery at ${recoveryScore}%. AI recommends rest today. Macros adjusted for optimal recovery.`,
      light: `Recovery at ${recoveryScore}%. Light training suggested. Extra 150 kcal added for recovery.`,
      full: `Recovery at ${recoveryScore}%. You're fully charged! Go all out today.`,
    };

    return this.sendLocalNotification(
      titles[recommendation],
      bodies[recommendation],
      {
        campaign: 'recovery-alert',
        type: 'ai-insight',
        data: { recoveryScore, recommendation },
      }
    );
  }

  /**
   * Macro goal approaching notification
   */
  async sendMacroAlert(
    currentCalories: number,
    targetCalories: number,
    remaining: number
  ): Promise<string | null> {
    const percentage = Math.round((currentCalories / targetCalories) * 100);

    let title = '';
    let body = '';

    if (percentage >= 100) {
      title = '🎯 Daily Goal Reached!';
      body = `You've hit ${currentCalories} kcal today. Great work staying on track!`;
    } else if (percentage >= 90) {
      title = '🔥 Almost There!';
      body = `${remaining} kcal remaining. You're ${percentage}% to your goal.`;
    } else if (percentage >= 75) {
      title = '💪 Strong Progress';
      body = `${remaining} kcal to go. Keep up the momentum!`;
    }

    if (!title) return null;

    return this.sendLocalNotification(title, body, {
      campaign: 'macro-tracking',
      type: 'progress-alert',
      data: { currentCalories, targetCalories, percentage },
    });
  }

  /**
   * Streak milestone notification
   */
  async sendStreakMilestone(streakDays: number): Promise<string | null> {
    const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

    if (!milestones.includes(streakDays)) return null;

    const title = `🔥 ${streakDays}-Day Streak!`;
    const body = streakDays >= 100
      ? `Legendary! You've logged for ${streakDays} days straight. You're unstoppable.`
      : streakDays >= 30
      ? `Incredible consistency! ${streakDays} days of dedication. Keep crushing it!`
      : `You're on fire! ${streakDays} days in a row. The habit is forming.`;

    return this.sendLocalNotification(title, body, {
      campaign: 'streak-milestone',
      type: 'achievement',
      data: { streakDays },
    });
  }

  /**
   * Cycle phase change notification (for female athletes)
   */
  async sendCyclePhaseNotification(
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal',
    macroAdjustment: string
  ): Promise<string | null> {
    const phaseInfo: Record<string, { emoji: string; name: string }> = {
      menstrual: { emoji: '🌙', name: 'Menstrual Phase' },
      follicular: { emoji: '🌱', name: 'Follicular Phase' },
      ovulatory: { emoji: '☀️', name: 'Ovulatory Phase' },
      luteal: { emoji: '🍂', name: 'Luteal Phase' },
    };

    const info = phaseInfo[phase];
    const title = `${info.emoji} ${info.name} Started`;
    const body = `AI adjusted your macros: ${macroAdjustment}. Optimized for this phase of your cycle.`;

    return this.sendLocalNotification(title, body, {
      campaign: 'cycle-sync',
      type: 'phase-change',
      data: { phase, macroAdjustment },
    });
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: NotificationPayload
  ): Promise<string | null> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || { campaign: 'scheduled', type: 'reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      logger.log('Notification scheduled:', notificationId, 'for', triggerDate);
      return notificationId;
    } catch (error) {
      logger.error('Failed to schedule notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.log('Notification cancelled:', notificationId);
    } catch (error) {
      logger.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.log('All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get all pending notifications
   */
  async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Failed to get pending notifications:', error);
      return [];
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
