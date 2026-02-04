import { MMKV } from 'react-native-mmkv';
import { logger } from '../../utils/logger';

const CACHE_STORAGE_ID = 'my-macro-ai-cache';
const CACHE_META_PREFIX = '_meta:';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheOptions {
  ttlSeconds?: number;
  staleWhileRevalidate?: boolean;
}

// Default TTLs for different data types (in seconds)
export const CacheTTL = {
  USER_PROFILE: 5 * 60,        // 5 minutes
  MACRO_GOALS: 10 * 60,        // 10 minutes
  FOOD_DATABASE: 60 * 60,      // 1 hour
  DAILY_INTAKE: 30,            // 30 seconds (changes frequently)
  WEARABLE_DATA: 2 * 60,       // 2 minutes
  RECIPES: 30 * 60,            // 30 minutes
  STATIC_CONFIG: 24 * 60 * 60, // 24 hours
} as const;

class CacheService {
  private storage: MMKV;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly maxMemoryCacheSize = 100;

  constructor() {
    this.storage = new MMKV({ id: CACHE_STORAGE_ID });
  }

  /**
   * Get cached data with automatic expiration handling
   * Returns null if expired or not found
   */
  get<T>(key: string): T | null {
    // Check memory cache first (fastest)
    const memEntry = this.memoryCache.get(key);
    if (memEntry && memEntry.expiresAt > Date.now()) {
      return memEntry.data as T;
    }

    // Check disk cache
    try {
      const raw = this.storage.getString(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);

      if (entry.expiresAt < Date.now()) {
        // Expired - clean up
        this.delete(key);
        return null;
      }

      // Promote to memory cache
      this.setMemoryCache(key, entry);

      return entry.data;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttlSeconds = options.ttlSeconds ?? CacheTTL.MACRO_GOALS;
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      expiresAt: now + (ttlSeconds * 1000),
      createdAt: now,
    };

    try {
      // Store in disk cache
      this.storage.set(key, JSON.stringify(entry));

      // Store in memory cache
      this.setMemoryCache(key, entry);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Get or fetch pattern - returns cached data or fetches fresh data
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }

  /**
   * Delete a cached item
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.storage.delete(key);
  }

  /**
   * Delete all items matching a prefix
   */
  deleteByPrefix(prefix: string): void {
    const keys = this.storage.getAllKeys();
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }
  }

  /**
   * Invalidate user-specific cache (call on logout or profile update)
   */
  invalidateUserCache(userId: string): void {
    this.deleteByPrefix(`user:${userId}`);
    this.deleteByPrefix('profile:');
    this.deleteByPrefix('goals:');
    this.deleteByPrefix('intake:');
    logger.log('User cache invalidated');
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.memoryCache.clear();
    this.storage.clearAll();
    logger.log('All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): { memorySize: number; diskSize: number; keys: string[] } {
    const keys = this.storage.getAllKeys();
    return {
      memorySize: this.memoryCache.size,
      diskSize: keys.length,
      keys,
    };
  }

  /**
   * Prune expired entries (call periodically)
   */
  pruneExpired(): number {
    let pruned = 0;
    const now = Date.now();

    // Prune memory cache
    for (const [key, entry] of this.memoryCache) {
      if (entry.expiresAt < now) {
        this.memoryCache.delete(key);
        pruned++;
      }
    }

    // Prune disk cache
    const keys = this.storage.getAllKeys();
    for (const key of keys) {
      if (key.startsWith(CACHE_META_PREFIX)) continue;

      try {
        const raw = this.storage.getString(key);
        if (raw) {
          const entry = JSON.parse(raw);
          if (entry.expiresAt < now) {
            this.storage.delete(key);
            pruned++;
          }
        }
      } catch {
        // Invalid entry, delete it
        this.storage.delete(key);
        pruned++;
      }
    }

    if (pruned > 0) {
      logger.log(`Pruned ${pruned} expired cache entries`);
    }
    return pruned;
  }

  /**
   * Helper to manage memory cache size
   */
  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    // Evict oldest entries if at capacity
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
    this.memoryCache.set(key, entry);
  }
}

// Cache key builders for consistency
export const CacheKeys = {
  userProfile: (userId: string) => `user:${userId}:profile`,
  macroGoals: (userId: string) => `user:${userId}:goals`,
  dailyIntake: (userId: string, date: string) => `intake:${userId}:${date}`,
  wearableData: (userId: string, source: string) => `wearable:${userId}:${source}`,
  foodItem: (foodId: string) => `food:${foodId}`,
  recipe: (recipeId: string) => `recipe:${recipeId}`,
  searchResults: (query: string) => `search:${query.toLowerCase().slice(0, 50)}`,
};

// Singleton instance
export const cacheService = new CacheService();
export default cacheService;
