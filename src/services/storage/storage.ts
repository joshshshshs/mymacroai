import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { logger } from '../../utils/logger';
import {
  StorageError,
  ErrorCode,
} from '../../utils/errors';

const ENCRYPTION_KEY_ID = 'mmkv_encryption_key';
const STORAGE_ID = 'my-macro-ai-storage';

/**
 * High-performance storage service - MMKV wrapper with secure encryption
 * Provides cross-platform high-performance key-value storage
 *
 * SECURITY: Encryption key is generated per-device and stored in secure enclave
 */
class StorageService {
  private storage: MMKV | null = null;
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;

  /**
   * Initialize the storage service with secure encryption
   * Must be called before any storage operations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.storage) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeInternal();
    return this.initPromise;
  }

  private async _initializeInternal(): Promise<void> {
    try {
      const encryptionKey = await this.getOrCreateEncryptionKey();

      this.storage = new MMKV({
        id: STORAGE_ID,
        encryptionKey,
      });

      this.isInitialized = true;
      logger.log('Storage service initialized with secure encryption');
    } catch (error) {
      logger.error('Failed to initialize storage service:', error);
      // Fallback to unencrypted storage in case of secure store failure
      // This can happen in some testing environments
      this.storage = new MMKV({ id: STORAGE_ID });
      this.isInitialized = true;
      logger.warn('Storage initialized without encryption (fallback mode)');
    }
  }

  /**
   * Get or create a secure encryption key
   * Key is stored in device's secure enclave (Keychain on iOS, Keystore on Android)
   */
  private async getOrCreateEncryptionKey(): Promise<string> {
    try {
      // Try to retrieve existing key
      let encryptionKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_ID);

      if (!encryptionKey) {
        // Generate a new random key (32 bytes = 256 bits)
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        encryptionKey = Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        // Store in secure enclave
        await SecureStore.setItemAsync(ENCRYPTION_KEY_ID, encryptionKey, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        logger.log('Generated new secure encryption key');
      }

      return encryptionKey;
    } catch (error) {
      logger.error('Failed to get/create encryption key:', error);
      throw error;
    }
  }

  /**
   * Ensure storage is initialized before operations
   */
  private ensureInitialized(): MMKV {
    if (!this.storage) {
      throw new StorageError({
        code: ErrorCode.STORAGE_READ_ERROR,
        message: 'StorageService not initialized. Call initialize() first.',
        recoverable: true,
      });
    }
    return this.storage;
  }

  /**
   * Set a storage item
   */
  setItem(key: string, value: string | number | boolean): void {
    try {
      const storage = this.ensureInitialized();
      if (typeof value === 'string') {
        storage.set(key, value);
      } else if (typeof value === 'number') {
        storage.set(key, value);
      } else if (typeof value === 'boolean') {
        storage.set(key, value);
      }
    } catch (error) {
      logger.error(`Storage set error for key ${key}:`, error);
      if (error instanceof StorageError) throw error;
      throw new StorageError({
        code: ErrorCode.STORAGE_WRITE_ERROR,
        message: `Failed to set storage item: ${error}`,
        cause: error instanceof Error ? error : undefined,
        context: { key },
      });
    }
  }

  /**
   * Get a storage item
   */
  getItem<T extends string | number | boolean>(key: string): T | null {
    try {
      const storage = this.ensureInitialized();
      if (storage.contains(key)) {
        const strVal = storage.getString(key);
        if (strVal !== undefined) return strVal as unknown as T;

        const numVal = storage.getNumber(key);
        if (numVal !== undefined) return numVal as unknown as T;

        const boolVal = storage.getBoolean(key);
        if (boolVal !== undefined) return boolVal as unknown as T;

        return null;
      }
      return null;
    } catch (error) {
      logger.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a storage item
   */
  removeItem(key: string): void {
    try {
      const storage = this.ensureInitialized();
      storage.delete(key);
    } catch (error) {
      logger.error(`Storage remove error for key ${key}:`, error);
      if (error instanceof StorageError) throw error;
      throw new StorageError({
        code: ErrorCode.STORAGE_WRITE_ERROR,
        message: `Failed to remove storage item: ${error}`,
        cause: error instanceof Error ? error : undefined,
        context: { key },
      });
    }
  }

  /**
   * Check if a storage item exists
   */
  contains(key: string): boolean {
    try {
      const storage = this.ensureInitialized();
      return storage.contains(key);
    } catch (error) {
      logger.error(`Storage contains error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all storage keys
   */
  getAllKeys(): string[] {
    try {
      const storage = this.ensureInitialized();
      return storage.getAllKeys();
    } catch (error) {
      logger.error('Storage getAllKeys error:', error);
      return [];
    }
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    try {
      const storage = this.ensureInitialized();
      storage.clearAll();
    } catch (error) {
      logger.error('Storage clearAll error:', error);
      if (error instanceof StorageError) throw error;
      throw new StorageError({
        code: ErrorCode.STORAGE_WRITE_ERROR,
        message: `Failed to clear storage: ${error}`,
        cause: error instanceof Error ? error : undefined,
        context: { operation: 'clearAll' },
      });
    }
  }

  /**
   * Get storage size (number of keys stored)
   */
  getSize(): number {
    try {
      const storage = this.ensureInitialized();
      return storage.getAllKeys().length;
    } catch (error) {
      logger.error('Storage getSize error:', error);
      return 0;
    }
  }

  /**
   * Convert to Zustand-compatible storage adapter
   * Note: This adapter handles initialization automatically
   */
  getZustandStorage(): StateStorage {
    return {
      getItem: async (name: string) => {
        await this.initialize();
        const value = this.getItem<string>(name);
        return value || null;
      },
      setItem: async (name: string, value: string) => {
        await this.initialize();
        this.setItem(name, value);
      },
      removeItem: async (name: string) => {
        await this.initialize();
        this.removeItem(name);
      },
    };
  }

  /**
   * Check if storage is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.storage !== null;
  }

  /**
   * Reset encryption key (use with caution - will make existing data unreadable)
   */
  async resetEncryptionKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ENCRYPTION_KEY_ID);
      this.storage = null;
      this.isInitialized = false;
      this.initPromise = null;
      logger.warn('Encryption key reset - existing data will be unreadable');
    } catch (error) {
      logger.error('Failed to reset encryption key:', error);
      throw error;
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
export default storageService;
