/**
 * Storage service for root services directory
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';
import {
  AppError,
  ErrorCode,
  StorageError,
  wrapError,
} from '../../utils/errors';

// Re-export utilities
export { logger };
export { AppError, ErrorCode, StorageError, wrapError };

// Storage key constants
export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  PREFERENCES: 'preferences',
  CACHE: 'cache',
  AUTH_TOKEN: 'auth_token',
  NOTIFICATION_ANALYTICS: 'notification_analytics',
} as const;

// Storage service class
class StorageService {
  private prefix = '@mymacro/';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Storage get error for ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.getKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Storage set error for ${key}:`, error);
      return false;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      logger.error(`Storage remove error for ${key}:`, error);
      return false;
    }
  }

  // Alias methods for compatibility
  async getItem<T>(key: string): Promise<T | null> {
    return this.get<T>(key);
  }

  async setItem<T>(key: string, value: T): Promise<boolean> {
    return this.set<T>(key, value);
  }

  async clear(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
      return true;
    } catch (error) {
      logger.error('Storage clear error:', error);
      return false;
    }
  }

  // Zustand persistence adapter
  getZustandStorage() {
    return {
      getItem: async (name: string): Promise<string | null> => {
        try {
          const value = await AsyncStorage.getItem(this.getKey(name));
          return value;
        } catch {
          return null;
        }
      },
      setItem: async (name: string, value: string): Promise<void> => {
        await AsyncStorage.setItem(this.getKey(name), value);
      },
      removeItem: async (name: string): Promise<void> => {
        await AsyncStorage.removeItem(this.getKey(name));
      },
    };
  }
}

export const storageService = new StorageService();
export default storageService;
