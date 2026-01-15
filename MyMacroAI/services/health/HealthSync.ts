import { Platform } from 'react-native';
import AppleHealthKit, {
  type HealthKitPermissions,
  HealthStatusCode,
  type HealthStatusResult,
  type HealthValue,
} from 'react-native-health';
// HealthConnect is Android-only, imported dynamically to prevent iOS errors
// Types are defined inline to avoid triggering native module resolution
type HealthConnectPermission = string;
import type { HealthData, HealthSyncConfig, SyncResult } from '@/src/types';
import { logger } from '../../utils/logger';
import {
  HealthError,
  ErrorCode,
  withRetry,
  handleError,
} from '../../utils/errors';

/**
 * 健康数据同步服务
 * 跨平台适配HealthKit(iOS)和HealthConnect(Android)
 */
class HealthSyncService {
  private healthKit: typeof AppleHealthKit | null = null;
  private healthConnect: any | null = null;
  private config: HealthSyncConfig;
  private isInitialized = false;

  constructor(config?: Partial<HealthSyncConfig>) {
    this.config = {
      enableBackgroundSync: true,
      syncInterval: 3600000, // 1小时
      dataTypes: [
        'steps',
        'calories',
        'distance',
        'heartRate',
        'sleep',
        'weight',
        'bodyFat',
        'hydration'
      ],
      ...config
    };
  }

  private healthKitAsync<T>(
    executor: (callback: (error: string, results: T) => void) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      executor((error, results) => {
        if (error) {
          reject(
            new HealthError({
              code: ErrorCode.HEALTH_SYNC_FAILED,
              message: error,
            })
          );
          return;
        }
        resolve(results);
      });
    });
  }

  /**
   * 初始化健康数据同步服务
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      if (Platform.OS === 'ios') {
        await this.initializeHealthKit();
      } else if (Platform.OS === 'android') {
        await this.initializeHealthConnect();
      }

      this.isInitialized = true;
      logger.log('HealthSync service initialized successfully');
      return true;
    } catch (error) {
      logger.error('HealthSync initialization failed:', error);
      return false;
    }
  }

  /**
   * 初始化iOS HealthKit
   */
  private async initializeHealthKit(): Promise<void> {
    try {
      this.healthKit = AppleHealthKit;

      // 请求权限 with retry logic
      const permissions = this.getHealthKitPermissions();
      await withRetry(
        async () => {
          await this.healthKitAsync<HealthValue>((callback) =>
            this.healthKit?.initHealthKit(permissions, callback)
          );
        },
        { maxAttempts: 2, delayMs: 500 }
      );
    } catch (error) {
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_AVAILABLE,
        message: `HealthKit initialization failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 初始化Android HealthConnect
   */
  private async initializeHealthConnect(): Promise<void> {
    try {
      // Dynamic import to prevent TurboModule error on iOS
      const HealthConnectModule = require('react-native-health-connect');
      this.healthConnect = HealthConnectModule;

      // 检查HealthConnect可用性
      const status = await this.healthConnect.getSdkStatus();
      if (status !== this.healthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) {
        throw new HealthError({
          code: ErrorCode.HEALTH_NOT_AVAILABLE,
          message: 'HealthConnect not available on this device',
        });
      }

      const initialized = await this.healthConnect.initialize();
      if (!initialized) {
        throw new HealthError({
          code: ErrorCode.HEALTH_NOT_AVAILABLE,
          message: 'HealthConnect initialization failed',
        });
      }

      // 请求权限
      const permissions = this.getHealthConnectPermissions();
      await this.healthConnect.requestPermission(permissions);
    } catch (error) {
      if (error instanceof HealthError) {
        throw error;
      }
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_AVAILABLE,
        message: `HealthConnect initialization failed: ${error}`,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * 获取HealthKit权限配置
   */
  private getHealthKitPermissions(): HealthKitPermissions {
    const permissions = AppleHealthKit.Constants.Permissions;
    return {
      permissions: {
        read: [
          permissions.Steps,
          permissions.ActiveEnergyBurned,
          permissions.DistanceWalkingRunning,
          permissions.HeartRate,
          permissions.SleepAnalysis,
          permissions.BodyMass,
          permissions.BodyFatPercentage,
          permissions.Water
        ],
        write: [
          permissions.BodyMass,
          permissions.BodyFatPercentage,
          permissions.Water
        ]
      }
    };
  }

  /**
   * 获取HealthConnect权限配置
   */
  private getHealthConnectPermissions(): HealthConnectPermission[] {
    return [
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_CALORIES',
      'android.permission.health.READ_DISTANCE',
      'android.permission.health.READ_HEART_RATE',
      'android.permission.health.READ_SLEEP',
      'android.permission.health.READ_WEIGHT',
      'android.permission.health.READ_BODY_FAT',
      'android.permission.health.READ_HYDRATION',
      'android.permission.health.WRITE_WEIGHT',
      'android.permission.health.WRITE_BODY_FAT',
      'android.permission.health.WRITE_HYDRATION'
    ];
  }

  /**
   * 同步健康数据
   */
  async syncHealthData(startDate: Date, endDate: Date): Promise<SyncResult> {
    if (!this.isInitialized) {
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_INITIALIZED,
        message: 'HealthSync service not initialized',
      });
    }

    try {
      const syncResult: SyncResult = {
        success: true,
        data: [],
        syncedAt: new Date(),
        errors: []
      };

      // 根据平台调用不同的同步方法 with retry logic
      if (Platform.OS === 'ios') {
        syncResult.data = await withRetry(
          () => this.syncWithHealthKit(startDate, endDate),
          { maxAttempts: 3, delayMs: 1000 }
        );
      } else if (Platform.OS === 'android') {
        syncResult.data = await withRetry(
          () => this.syncWithHealthConnect(startDate, endDate),
          { maxAttempts: 3, delayMs: 1000 }
        );
      }

      return syncResult;
    } catch (error) {
      const userMessage = handleError(error, 'Health data sync failed');
      return {
        success: false,
        data: [],
        syncedAt: new Date(),
        errors: [userMessage]
      };
    }
  }

  /**
   * 与HealthKit同步数据
   */
  private async syncWithHealthKit(startDate: Date, endDate: Date): Promise<HealthData[]> {
    if (!this.healthKit) {
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_AVAILABLE,
        message: 'HealthKit not available',
      });
    }

    const healthData: HealthData[] = [];

    // 同步步数数据
    if (this.config.dataTypes.includes('steps')) {
      try {
        const steps = await this.healthKitAsync<HealthValue[]>((callback) =>
          this.healthKit?.getDailyStepCountSamples(
            {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            },
            callback
          )
        );

        healthData.push({
          type: 'steps',
          value: steps.reduce((sum: number, sample) => sum + (sample.value || 0), 0),
          unit: 'count',
          source: 'healthkit',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to sync steps from HealthKit:', error);
      }
    }

    // 同步卡路里数据
    if (this.config.dataTypes.includes('calories')) {
      try {
        const calories = await this.healthKitAsync<HealthValue[]>((callback) =>
          this.healthKit?.getActiveEnergyBurned(
            {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            },
            callback
          )
        );

        healthData.push({
          type: 'calories',
          value: calories.reduce((sum: number, sample) => sum + (sample.value || 0), 0),
          unit: 'kcal',
          source: 'healthkit',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to sync calories from HealthKit:', error);
      }
    }

    // 同步其他数据类型...
    // 实现类似的心率、睡眠、体重等数据同步

    return healthData;
  }

  /**
   * 与HealthConnect同步数据
   */
  private async syncWithHealthConnect(startDate: Date, endDate: Date): Promise<HealthData[]> {
    if (!this.healthConnect) {
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_AVAILABLE,
        message: 'HealthConnect not available',
      });
    }

    const healthData: HealthData[] = [];

    // 同步步数数据
    if (this.config.dataTypes.includes('steps')) {
      try {
        const steps = await this.healthConnect.readRecords('Steps', {
          timeRangeFilter: {
            operator: 'between',
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });

        healthData.push({
          type: 'steps',
          value: steps.records.reduce((sum: number, record: any) => sum + (record.count || 0), 0),
          unit: 'count',
          source: 'healthconnect',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to sync steps from HealthConnect:', error);
      }
    }

    // 同步其他数据类型...
    // 实现类似的卡路里、距离、心率等数据同步

    return healthData;
  }

  /**
   * 写入健康数据到平台
   */
  async writeHealthData(data: Omit<HealthData, 'source' | 'timestamp'>): Promise<boolean> {
    if (!this.isInitialized) {
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_INITIALIZED,
        message: 'HealthSync service not initialized',
      });
    }

    try {
      const healthData: HealthData = {
        ...data,
        source: Platform.OS === 'ios' ? 'healthkit' : 'healthconnect',
        timestamp: new Date().toISOString()
      };

      if (Platform.OS === 'ios' && this.healthKit) {
        await this.writeToHealthKit(healthData);
      } else if (Platform.OS === 'android' && this.healthConnect) {
        await this.writeToHealthConnect(healthData);
      }

      return true;
    } catch (error) {
      logger.error('Failed to write health data:', error);
      return false;
    }
  }

  /**
   * 写入数据到HealthKit
   */
  private async writeToHealthKit(data: HealthData): Promise<void> {
    if (!this.healthKit) return;

    switch (data.type) {
      case 'weight':
        await this.healthKitAsync<HealthValue>((callback) =>
          this.healthKit?.saveWeight(
            {
              value: data.value,
              startDate: new Date().toISOString()
            },
            callback
          )
        );
        break;
      case 'bodyFat':
        await this.healthKitAsync<HealthValue>((callback) =>
          this.healthKit?.saveBodyFatPercentage(
            {
              value: data.value,
              startDate: new Date().toISOString()
            },
            callback
          )
        );
        break;
      case 'hydration':
        await this.healthKitAsync<HealthValue>((callback) =>
          this.healthKit?.saveWater(
            {
              value: data.value,
              startDate: new Date().toISOString()
            },
            callback
          )
        );
        break;
      default:
        logger.warn(`Unsupported data type for HealthKit write: ${data.type}`);
    }
  }

  /**
   * 写入数据到HealthConnect
   */
  private async writeToHealthConnect(data: HealthData): Promise<void> {
    if (!this.healthConnect) return;

    // HealthConnect写入逻辑实现
    // 根据数据类型调用相应的写入方法
  }

  /**
   * 检查权限状态
   */
  async checkPermissions(): Promise<{ [key: string]: boolean }> {
    if (!this.isInitialized) {
      throw new HealthError({
        code: ErrorCode.HEALTH_NOT_INITIALIZED,
        message: 'HealthSync service not initialized',
      });
    }

    const permissions: { [key: string]: boolean } = {};

    if (Platform.OS === 'ios' && this.healthKit) {
      const authStatus = await this.healthKitAsync<HealthStatusResult>((callback) =>
        this.healthKit?.getAuthStatus(this.getHealthKitPermissions(), callback)
      );
      const allAuthorized = authStatus.permissions.read.every(
        status => status === HealthStatusCode.SharingAuthorized
      );
      this.config.dataTypes.forEach(type => {
        permissions[type] = allAuthorized;
      });
    } else if (Platform.OS === 'android' && this.healthConnect) {
      const healthConnectPermissions = await this.healthConnect.getGrantedPermissions();
      this.config.dataTypes.forEach(type => {
        permissions[type] = healthConnectPermissions.includes(
          `android.permission.health.READ_${type.toUpperCase()}`
        );
      });
    }

    return permissions;
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      platform: Platform.OS,
      config: this.config
    };
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.healthKit = null;
    this.healthConnect = null;
    this.isInitialized = false;
  }
}

// 单例模式导出
export const healthSyncService = new HealthSyncService();
export default healthSyncService;
