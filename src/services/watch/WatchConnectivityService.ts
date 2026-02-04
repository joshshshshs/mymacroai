/**
 * WatchConnectivityService - Apple Watch Companion App Support
 * 
 * Enables communication between iOS app and Apple Watch companion:
 * - Real-time data sync
 * - Complications data
 * - Quick actions from watch
 * - Health data transfer
 * - Glanceable summaries
 * 
 * Requires native WatchConnectivity framework integration.
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// TYPES
// ============================================================================

export interface WatchMessage {
  type: WatchMessageType;
  payload: any;
  timestamp: string;
  replyHandler?: (response: any) => void;
}

export type WatchMessageType =
  | 'sync_request'
  | 'sync_response'
  | 'log_water'
  | 'log_food'
  | 'log_workout'
  | 'get_macros'
  | 'get_streak'
  | 'get_summary'
  | 'complication_update'
  | 'haptic_feedback'
  | 'navigate';

export interface WatchComplicationData {
  // CLKComplicationFamily variants
  modularSmall: {
    headerText: string;
    body1Text: string;
  };
  modularLarge: {
    headerText: string;
    body1Text: string;
    body2Text: string;
  };
  utilitarianSmall: {
    text: string;
  };
  utilitarianLarge: {
    text: string;
  };
  circularSmall: {
    ringValue: number; // 0-1
    centerText: string;
  };
  graphicCorner: {
    gaugeValue: number;
    text: string;
  };
  graphicCircular: {
    gaugeValue: number;
    centerText: string;
    bottomText: string;
  };
  graphicRectangular: {
    headerText: string;
    body1Text: string;
    body2Text: string;
    gaugeValue: number;
  };
}

export interface WatchDashboardData {
  // Main metrics
  calories: {
    current: number;
    target: number;
    remaining: number;
    percent: number;
  };
  protein: {
    current: number;
    target: number;
    percent: number;
  };
  water: {
    current: number;
    target: number;
    percent: number;
  };
  streak: {
    days: number;
    status: 'active' | 'at_risk';
  };
  
  // Health from watch
  heartRate?: number;
  activeCalories?: number;
  steps?: number;
  
  // Quick actions
  suggestedActions: WatchQuickAction[];
  
  // Timestamp
  lastUpdated: string;
}

export interface WatchQuickAction {
  id: string;
  title: string;
  icon: string;
  type: 'log_water' | 'log_food' | 'start_workout' | 'view_macros';
  payload?: any;
}

export interface WatchSessionState {
  isReachable: boolean;
  isPaired: boolean;
  isWatchAppInstalled: boolean;
  lastSyncTime?: string;
}

// ============================================================================
// DEFAULT QUICK ACTIONS
// ============================================================================

const DEFAULT_QUICK_ACTIONS: WatchQuickAction[] = [
  {
    id: 'water_250',
    title: '+250ml',
    icon: 'drop.fill',
    type: 'log_water',
    payload: { amount: 250 },
  },
  {
    id: 'water_500',
    title: '+500ml',
    icon: 'drop.fill',
    type: 'log_water',
    payload: { amount: 500 },
  },
  {
    id: 'log_meal',
    title: 'Log Meal',
    icon: 'fork.knife',
    type: 'log_food',
  },
  {
    id: 'view_macros',
    title: 'Macros',
    icon: 'chart.pie.fill',
    type: 'view_macros',
  },
];

// ============================================================================
// WATCH CONNECTIVITY SERVICE
// ============================================================================

class WatchConnectivityServiceClass {
  private eventEmitter: NativeEventEmitter | null = null;
  private messageSubscription: any = null;
  private reachabilitySubscription: any = null;
  private sessionState: WatchSessionState = {
    isReachable: false,
    isPaired: false,
    isWatchAppInstalled: false,
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize Watch Connectivity
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[WatchConnectivity] Only available on iOS');
      return false;
    }

    try {
      const { WatchConnectivity } = NativeModules;
      
      if (!WatchConnectivity) {
        console.warn('[WatchConnectivity] Native module not available');
        return false;
      }

      // Set up event emitter
      this.eventEmitter = new NativeEventEmitter(WatchConnectivity);
      
      // Subscribe to messages
      this.messageSubscription = this.eventEmitter.addListener(
        'WatchMessage',
        this.handleWatchMessage.bind(this)
      );

      // Subscribe to reachability changes
      this.reachabilitySubscription = this.eventEmitter.addListener(
        'WatchReachabilityChanged',
        this.handleReachabilityChange.bind(this)
      );

      // Check initial state
      await this.checkSessionState();

      // Send initial data to watch
      await this.syncToWatch();

      console.log('[WatchConnectivity] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[WatchConnectivity] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check watch session state
   */
  async checkSessionState(): Promise<WatchSessionState> {
    if (Platform.OS !== 'ios') {
      return this.sessionState;
    }

    try {
      const { WatchConnectivity } = NativeModules;
      if (WatchConnectivity?.getSessionState) {
        const state = await WatchConnectivity.getSessionState();
        this.sessionState = {
          isReachable: state.reachable || false,
          isPaired: state.paired || false,
          isWatchAppInstalled: state.watchAppInstalled || false,
          lastSyncTime: state.lastSyncTime,
        };
      }
    } catch (error) {
      console.error('[WatchConnectivity] Failed to check session state:', error);
    }

    return this.sessionState;
  }

  /**
   * Clean up
   */
  cleanup(): void {
    if (this.messageSubscription) {
      this.messageSubscription.remove();
    }
    if (this.reachabilitySubscription) {
      this.reachabilitySubscription.remove();
    }
  }

  // ==========================================================================
  // MESSAGE HANDLING
  // ==========================================================================

  /**
   * Handle incoming message from watch
   */
  private handleWatchMessage(message: WatchMessage): void {
    console.log('[WatchConnectivity] Received message:', message.type);

    switch (message.type) {
      case 'sync_request':
        this.handleSyncRequest(message);
        break;
      case 'log_water':
        this.handleLogWater(message);
        break;
      case 'log_food':
        this.handleLogFood(message);
        break;
      case 'get_macros':
        this.handleGetMacros(message);
        break;
      case 'get_streak':
        this.handleGetStreak(message);
        break;
      case 'get_summary':
        this.handleGetSummary(message);
        break;
      default:
        console.warn('[WatchConnectivity] Unknown message type:', message.type);
    }
  }

  /**
   * Handle reachability change
   */
  private handleReachabilityChange(event: { reachable: boolean }): void {
    this.sessionState.isReachable = event.reachable;
    
    if (event.reachable) {
      // Watch became reachable, sync data
      this.syncToWatch();
    }
  }

  /**
   * Handle sync request from watch
   */
  private async handleSyncRequest(message: WatchMessage): Promise<void> {
    const dashboardData = this.generateDashboardData();
    await this.sendMessage({
      type: 'sync_response',
      payload: dashboardData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle water log from watch
   */
  private handleLogWater(message: WatchMessage): void {
    const { amount } = message.payload;
    const store = useUserStore.getState();
    // Update water intake - this would ideally call a proper action
    const currentWater = store.waterIntake || 0;
    console.log('[WatchConnectivity] Log water:', amount, 'Current:', currentWater);
    
    // Send confirmation and updated data
    this.syncToWatch();
    this.sendHapticFeedback('success');
  }

  /**
   * Handle food log from watch
   */
  private handleLogFood(message: WatchMessage): void {
    const { food } = message.payload;
    // Handle food logging
    // Would interact with nutrition service
    
    this.syncToWatch();
    this.sendHapticFeedback('success');
  }

  /**
   * Handle macros request
   */
  private async handleGetMacros(message: WatchMessage): Promise<void> {
    const store = useUserStore.getState();
    const current = store.currentIntake || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const target = store.dailyTarget || { calories: 2000, protein: 150, carbs: 200, fats: 65 };

    await this.sendMessage({
      type: 'sync_response',
      payload: {
        current,
        target,
        remaining: {
          calories: target.calories - current.calories,
          protein: target.protein - current.protein,
          carbs: target.carbs - current.carbs,
          fats: target.fats - current.fats,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle streak request
   */
  private async handleGetStreak(message: WatchMessage): Promise<void> {
    const store = useUserStore.getState();
    
    await this.sendMessage({
      type: 'sync_response',
      payload: {
        streak: store.streak || 0,
        longestStreak: store.longestStreak || 0,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle summary request
   */
  private async handleGetSummary(message: WatchMessage): Promise<void> {
    const dashboardData = this.generateDashboardData();
    await this.sendMessage({
      type: 'sync_response',
      payload: dashboardData,
      timestamp: new Date().toISOString(),
    });
  }

  // ==========================================================================
  // DATA GENERATION
  // ==========================================================================

  /**
   * Generate dashboard data for watch
   */
  generateDashboardData(): WatchDashboardData {
    const store = useUserStore.getState();
    const current = store.currentIntake || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const target = store.dailyTarget || { calories: 2000, protein: 150, carbs: 200, fats: 65 };
    const water = store.waterIntake || 0;
    const waterTarget = store.waterGoal || 2500;
    const streak = store.streak || 0;

    return {
      calories: {
        current: current.calories,
        target: target.calories,
        remaining: Math.max(0, target.calories - current.calories),
        percent: Math.min(100, Math.round((current.calories / target.calories) * 100)),
      },
      protein: {
        current: current.protein,
        target: target.protein,
        percent: Math.min(100, Math.round((current.protein / target.protein) * 100)),
      },
      water: {
        current: water,
        target: waterTarget,
        percent: Math.min(100, Math.round((water / waterTarget) * 100)),
      },
      streak: {
        days: streak,
        status: 'active', // Would check if at risk
      },
      heartRate: store.healthMetrics?.heartRate ?? undefined,
      steps: store.healthMetrics?.steps ?? undefined,
      suggestedActions: DEFAULT_QUICK_ACTIONS,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate complication data
   */
  generateComplicationData(): WatchComplicationData {
    const store = useUserStore.getState();
    const current = store.currentIntake || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const target = store.dailyTarget || { calories: 2000, protein: 150, carbs: 200, fats: 65 };
    const streak = store.streak || 0;
    
    const caloriesPercent = current.calories / target.calories;
    const remaining = Math.max(0, target.calories - current.calories);

    return {
      modularSmall: {
        headerText: 'Calories',
        body1Text: `${current.calories}`,
      },
      modularLarge: {
        headerText: 'MyMacro',
        body1Text: `${current.calories} / ${target.calories} kcal`,
        body2Text: `${streak}🔥 streak`,
      },
      utilitarianSmall: {
        text: `${current.calories}`,
      },
      utilitarianLarge: {
        text: `${remaining} kcal left`,
      },
      circularSmall: {
        ringValue: Math.min(1, caloriesPercent),
        centerText: `${remaining}`,
      },
      graphicCorner: {
        gaugeValue: Math.min(1, caloriesPercent),
        text: `${remaining} left`,
      },
      graphicCircular: {
        gaugeValue: Math.min(1, caloriesPercent),
        centerText: `${current.calories}`,
        bottomText: 'kcal',
      },
      graphicRectangular: {
        headerText: 'MyMacro',
        body1Text: `${current.calories} / ${target.calories} kcal`,
        body2Text: `P: ${current.protein}g • C: ${current.carbs}g • F: ${current.fats}g`,
        gaugeValue: Math.min(1, caloriesPercent),
      },
    };
  }

  // ==========================================================================
  // SENDING DATA
  // ==========================================================================

  /**
   * Send message to watch
   */
  async sendMessage(message: WatchMessage): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    if (!this.sessionState.isReachable) {
      console.warn('[WatchConnectivity] Watch not reachable');
      return false;
    }

    try {
      const { WatchConnectivity } = NativeModules;
      if (WatchConnectivity?.sendMessage) {
        await WatchConnectivity.sendMessage(message);
        return true;
      }
    } catch (error) {
      console.error('[WatchConnectivity] Failed to send message:', error);
    }

    return false;
  }

  /**
   * Sync all data to watch
   */
  async syncToWatch(): Promise<void> {
    const dashboardData = this.generateDashboardData();
    await this.sendMessage({
      type: 'sync_response',
      payload: dashboardData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update complications
   */
  async updateComplications(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      const { WatchConnectivity } = NativeModules;
      if (WatchConnectivity?.updateComplications) {
        const complicationData = this.generateComplicationData();
        await WatchConnectivity.updateComplications(complicationData);
      }
    } catch (error) {
      console.error('[WatchConnectivity] Failed to update complications:', error);
    }
  }

  /**
   * Send haptic feedback to watch
   */
  async sendHapticFeedback(type: 'success' | 'failure' | 'notification'): Promise<void> {
    await this.sendMessage({
      type: 'haptic_feedback',
      payload: { type },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Transfer user info (background transfer)
   */
  async transferUserInfo(): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      const { WatchConnectivity } = NativeModules;
      if (WatchConnectivity?.transferUserInfo) {
        const dashboardData = this.generateDashboardData();
        const complicationData = this.generateComplicationData();
        
        await WatchConnectivity.transferUserInfo({
          dashboard: dashboardData,
          complications: complicationData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[WatchConnectivity] Failed to transfer user info:', error);
    }
  }

  // ==========================================================================
  // STATE GETTERS
  // ==========================================================================

  /**
   * Check if watch is reachable
   */
  isWatchReachable(): boolean {
    return this.sessionState.isReachable;
  }

  /**
   * Check if watch app is installed
   */
  isWatchAppInstalled(): boolean {
    return this.sessionState.isWatchAppInstalled;
  }

  /**
   * Get session state
   */
  getSessionState(): WatchSessionState {
    return this.sessionState;
  }
}

// Export singleton
export const WatchConnectivityService = new WatchConnectivityServiceClass();
export default WatchConnectivityService;
