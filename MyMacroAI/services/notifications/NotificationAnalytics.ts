import * as Notifications from 'expo-notifications';
import { storageService } from '../storage/storage';
import type { GroceryItem } from '../../store/groceryStore';
import { logger } from '../../utils/logger';

export interface NotificationEvent {
  id: string;
  type: 'SENT' | 'TAP' | 'DISMISS';
  campaign: string;
  timestamp: number;
  payload?: any;
  userId?: string;
  deviceId?: string;
}

export interface CampaignMetrics {
  campaign: string;
  sent: number;
  taps: number;
  dismissals: number;
  openRate: number;
  lastSent: number;
  createdAt: number;
}

export interface AnalyticsSummary {
  totalSent: number;
  totalTaps: number;
  overallOpenRate: number;
  topCampaigns: CampaignMetrics[];
  recentActivity: NotificationEvent[];
  trends: {
    daily: { date: string; sent: number; taps: number }[];
    weekly: { week: string; sent: number; taps: number }[];
  };
}

/**
 * 通知分析服务
 * 跟踪通知点击率，优化推送策略
 */
export class NotificationAnalytics {
  private static readonly STORAGE_KEY = 'notification-analytics';
  private static readonly EVENTS_KEY = 'notification-events';
  private static readonly CAMPAIGNS_KEY = 'notification-campaigns';

  private events: NotificationEvent[] = [];
  private campaigns: Map<string, CampaignMetrics> = new Map();
  private isInitialized = false;

  /**
   * 初始化分析服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 加载历史数据
      await this.loadHistoricalData();
      
      // 设置通知监听器
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      logger.log('Notification analytics initialized');
    } catch (error) {
      logger.error('Failed to initialize notification analytics:', error);
    }
  }

  /**
   * 设置通知监听器
   */
  private setupNotificationListeners(): void {
    // 监听通知点击事件
    Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
      this.logEvent({
        type: 'TAP',
        campaign: response.notification.request.content.data?.campaign || 'unknown',
        timestamp: Date.now(),
        payload: response.notification.request.content.data
      });
      }
    );

    // 监听通知接收事件（仅限Android）
    Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
      this.logEvent({
        type: 'SENT',
        campaign: notification.request.content.data?.campaign || 'unknown',
        timestamp: Date.now(),
        payload: notification.request.content.data
      });
      }
    );
  }

  /**
   * 记录通知事件
   */
  async logEvent(event: Omit<NotificationEvent, 'id'>): Promise<void> {
    try {
      const fullEvent: NotificationEvent = {
        ...event,
        id: this.generateEventId(),
        timestamp: event.timestamp || Date.now()
      };

      this.events.push(fullEvent);
      
      // 更新活动指标
      await this.updateCampaignMetrics(fullEvent);
      
      // 保存到持久化存储
      await this.saveEvents();
      
      logger.log('Notification event logged:', fullEvent);
    } catch (error) {
      logger.error('Failed to log notification event:', error);
    }
  }

  /**
   * 手动记录发送事件（用于iOS）
   */
  async logSentEvent(campaign: string, payload?: any): Promise<void> {
    await this.logEvent({
      type: 'SENT',
      campaign,
      timestamp: Date.now(),
      payload
    });
  }

  /**
   * 手动记录点击事件
   */
  async logTapEvent(campaign: string, payload?: any): Promise<void> {
    await this.logEvent({
      type: 'TAP',
      campaign,
      timestamp: Date.now(),
      payload
    });
  }

  /**
   * 手动记录忽略事件
   */
  async logDismissEvent(campaign: string, payload?: any): Promise<void> {
    await this.logEvent({
      type: 'DISMISS',
      campaign,
      timestamp: Date.now(),
      payload
    });
  }

  /**
   * 更新活动指标
   */
  private async updateCampaignMetrics(event: NotificationEvent): Promise<void> {
    const campaignKey = event.campaign;
    let campaign = this.campaigns.get(campaignKey);

    if (!campaign) {
      campaign = {
        campaign: campaignKey,
        sent: 0,
        taps: 0,
        dismissals: 0,
        openRate: 0,
        lastSent: 0,
        createdAt: Date.now()
      };
    }

    // 更新计数
    switch (event.type) {
      case 'SENT':
        campaign.sent += 1;
        campaign.lastSent = event.timestamp;
        break;
      case 'TAP':
        campaign.taps += 1;
        break;
      case 'DISMISS':
        campaign.dismissals += 1;
        break;
    }

    // 计算打开率
    campaign.openRate = campaign.sent > 0 ? (campaign.taps / campaign.sent) * 100 : 0;

    this.campaigns.set(campaignKey, campaign);
    await this.saveCampaigns();
  }

  /**
   * 获取活动指标
   */
  getCampaignMetrics(campaign: string): CampaignMetrics | null {
    return this.campaigns.get(campaign) || null;
  }

  /**
   * 获取所有活动指标
   */
  getAllCampaignMetrics(): CampaignMetrics[] {
    return Array.from(this.campaigns.values()).sort((a, b) => b.lastSent - a.lastSent);
  }

  /**
   * 获取分析摘要
   */
  getAnalyticsSummary(): AnalyticsSummary {
    const allCampaigns = this.getAllCampaignMetrics();
    const totalSent = allCampaigns.reduce((sum, campaign) => sum + campaign.sent, 0);
    const totalTaps = allCampaigns.reduce((sum, campaign) => sum + campaign.taps, 0);
    const overallOpenRate = totalSent > 0 ? (totalTaps / totalSent) * 100 : 0;

    // 生成趋势数据（简化版）
    const last7Days = this.generateDailyTrends(7);
    const last4Weeks = this.generateWeeklyTrends(4);

    return {
      totalSent,
      totalTaps,
      overallOpenRate,
      topCampaigns: allCampaigns.slice(0, 5),
      recentActivity: this.events.slice(-10).reverse(),
      trends: {
        daily: last7Days,
        weekly: last4Weeks
      }
    };
  }

  /**
   * 生成每日趋势数据
   */
  private generateDailyTrends(days: number): { date: string; sent: number; taps: number }[] {
    const trends = [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * dayInMs);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStart = date.setHours(0, 0, 0, 0);
      const dayEnd = dayStart + dayInMs;

      const dayEvents = this.events.filter(event => 
        event.timestamp >= dayStart && event.timestamp < dayEnd
      );

      trends.push({
        date: dateStr,
        sent: dayEvents.filter(e => e.type === 'SENT').length,
        taps: dayEvents.filter(e => e.type === 'TAP').length
      });
    }

    return trends;
  }

  /**
   * 生成每周趋势数据
   */
  private generateWeeklyTrends(weeks: number): { week: string; sent: number; taps: number }[] {
    const trends = [];
    const now = Date.now();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now - (i + 1) * weekInMs);
      const weekEnd = new Date(now - i * weekInMs);
      
      const weekStr = `${weekStart.toISOString().split('T')[0]} 至 ${weekEnd.toISOString().split('T')[0]}`;

      const weekEvents = this.events.filter(event => 
        event.timestamp >= weekStart.getTime() && event.timestamp < weekEnd.getTime()
      );

      trends.push({
        week: weekStr,
        sent: weekEvents.filter(e => e.type === 'SENT').length,
        taps: weekEvents.filter(e => e.type === 'TAP').length
      });
    }

    return trends;
  }

  /**
   * 获取低效活动（打开率低于阈值）
   */
  getUnderperformingCampaigns(threshold: number = 10): CampaignMetrics[] {
    return this.getAllCampaignMetrics().filter(campaign => 
      campaign.sent >= 5 && campaign.openRate < threshold
    );
  }

  /**
   * 清理旧数据（保留最近90天）
   */
  async cleanupOldData(daysToKeep: number = 90): Promise<void> {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    this.events = this.events.filter(event => event.timestamp >= cutoffTime);
    
    // 清理无效活动
    for (const [campaignKey, campaign] of this.campaigns.entries()) {
      if (campaign.lastSent < cutoffTime && campaign.sent === 0) {
        this.campaigns.delete(campaignKey);
      }
    }
    
    await this.saveData();
  }

  /**
   * 导出分析数据
   */
  exportData(): string {
    return JSON.stringify({
      events: this.events,
      campaigns: this.getAllCampaignMetrics(),
      summary: this.getAnalyticsSummary(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * 加载历史数据
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      const eventsData = storageService.getItem<string>(NotificationAnalytics.EVENTS_KEY);
      const campaignsData = storageService.getItem<string>(NotificationAnalytics.CAMPAIGNS_KEY);

      if (eventsData) {
        this.events = JSON.parse(eventsData);
      }

      if (campaignsData) {
        const campaignsArray: CampaignMetrics[] = JSON.parse(campaignsData);
        this.campaigns = new Map(campaignsArray.map(campaign => [campaign.campaign, campaign]));
      }
    } catch (error) {
      logger.error('Failed to load historical data:', error);
      this.events = [];
    }
  }

  /**
   * 保存事件数据
   */
  private async saveEvents(): Promise<void> {
    try {
      storageService.setItem(NotificationAnalytics.EVENTS_KEY, JSON.stringify(this.events));
    } catch (error) {
      logger.error('Failed to save events:', error);
    }
  }

  /**
   * 保存活动数据
   */
  private async saveCampaigns(): Promise<void> {
    try {
      const campaignsArray = this.getAllCampaignMetrics();
      storageService.setItem(NotificationAnalytics.CAMPAIGNS_KEY, JSON.stringify(campaignsArray));
    } catch (error) {
      logger.error('Failed to save campaigns:', error);
    }
  }

  /**
   * 保存所有数据
   */
  private async saveData(): Promise<void> {
    await this.saveEvents();
    await this.saveCampaigns();
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 创建全局实例
export const notificationAnalytics = new NotificationAnalytics();

export default NotificationAnalytics;
