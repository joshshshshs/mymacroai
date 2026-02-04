/**
 * Storage service for src directory
 * Re-exports from root utils for path compatibility
 */

import { logger } from '../../../utils/logger';
import {
  AppError,
  ErrorCode,
  StorageError,
  wrapError,
} from '../../../utils/errors';

// Re-export storage utilities
export { logger };
export { AppError, ErrorCode, StorageError, wrapError };

// Storage key constants
export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  PREFERENCES: 'preferences',
  CACHE: 'cache',
  AUTH_TOKEN: 'auth_token',
} as const;

// Simple storage helpers
export const storageHelpers = {
  getKey: (key: string): string => `@mymacro/${key}`,
};

export default storageHelpers;
