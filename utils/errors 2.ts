/**
 * Centralized Error Handling Utilities
 * Provides typed errors, error codes, and retry logic for consistent error handling
 */

import { logger } from './logger';

// ============================================================================
// Error Codes
// ============================================================================

export enum ErrorCode {
  // Network errors (1xxx)
  NETWORK_ERROR = 'E1000',
  NETWORK_TIMEOUT = 'E1001',
  NETWORK_OFFLINE = 'E1002',

  // Authentication errors (2xxx)
  AUTH_INVALID_CREDENTIALS = 'E2000',
  AUTH_SESSION_EXPIRED = 'E2001',
  AUTH_EMAIL_NOT_CONFIRMED = 'E2002',
  AUTH_USER_NOT_FOUND = 'E2003',
  AUTH_EMAIL_IN_USE = 'E2004',
  AUTH_WEAK_PASSWORD = 'E2005',
  AUTH_RATE_LIMITED = 'E2006',

  // Validation errors (3xxx)
  VALIDATION_REQUIRED = 'E3000',
  VALIDATION_INVALID_FORMAT = 'E3001',
  VALIDATION_OUT_OF_RANGE = 'E3002',
  VALIDATION_INPUT_TOO_LONG = 'E3003',
  VALIDATION_FORBIDDEN_INPUT = 'E3004',

  // Storage errors (4xxx)
  STORAGE_READ_ERROR = 'E4000',
  STORAGE_WRITE_ERROR = 'E4001',
  STORAGE_NOT_FOUND = 'E4002',
  STORAGE_ENCRYPTION_ERROR = 'E4003',

  // Health data errors (5xxx)
  HEALTH_NOT_AVAILABLE = 'E5000',
  HEALTH_PERMISSION_DENIED = 'E5001',
  HEALTH_SYNC_FAILED = 'E5002',
  HEALTH_NOT_INITIALIZED = 'E5003',

  // AI Service errors (6xxx)
  AI_SERVICE_ERROR = 'E6000',
  AI_RATE_LIMITED = 'E6001',
  AI_INVALID_RESPONSE = 'E6002',
  AI_CONTEXT_TOO_LARGE = 'E6003',

  // Generic errors (9xxx)
  UNKNOWN_ERROR = 'E9000',
  OPERATION_CANCELLED = 'E9001',
  NOT_IMPLEMENTED = 'E9002',
}

// ============================================================================
// User-friendly Error Messages
// ============================================================================

const userFriendlyMessages: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
  [ErrorCode.NETWORK_TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorCode.NETWORK_OFFLINE]: 'You appear to be offline. Please check your connection.',

  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.AUTH_EMAIL_NOT_CONFIRMED]: 'Please verify your email address to continue.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
  [ErrorCode.AUTH_EMAIL_IN_USE]: 'This email is already registered.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Please choose a stronger password.',
  [ErrorCode.AUTH_RATE_LIMITED]: 'Too many attempts. Please wait a moment and try again.',

  [ErrorCode.VALIDATION_REQUIRED]: 'This field is required.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Please enter a valid format.',
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: 'The value is out of the allowed range.',
  [ErrorCode.VALIDATION_INPUT_TOO_LONG]: 'The input is too long.',
  [ErrorCode.VALIDATION_FORBIDDEN_INPUT]: 'The input contains invalid characters.',

  [ErrorCode.STORAGE_READ_ERROR]: 'Unable to load your data. Please try again.',
  [ErrorCode.STORAGE_WRITE_ERROR]: 'Unable to save your data. Please try again.',
  [ErrorCode.STORAGE_NOT_FOUND]: 'The requested data was not found.',
  [ErrorCode.STORAGE_ENCRYPTION_ERROR]: 'A security error occurred. Please restart the app.',

  [ErrorCode.HEALTH_NOT_AVAILABLE]: 'Health data is not available on this device.',
  [ErrorCode.HEALTH_PERMISSION_DENIED]: 'Please grant health data permissions in Settings.',
  [ErrorCode.HEALTH_SYNC_FAILED]: 'Unable to sync health data. Please try again.',
  [ErrorCode.HEALTH_NOT_INITIALIZED]: 'Health service is starting up. Please wait.',

  [ErrorCode.AI_SERVICE_ERROR]: 'Our AI assistant is temporarily unavailable.',
  [ErrorCode.AI_RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  [ErrorCode.AI_INVALID_RESPONSE]: 'Unable to process the response. Please try again.',
  [ErrorCode.AI_CONTEXT_TOO_LARGE]: 'The request is too large to process.',

  [ErrorCode.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
  [ErrorCode.OPERATION_CANCELLED]: 'The operation was cancelled.',
  [ErrorCode.NOT_IMPLEMENTED]: 'This feature is coming soon.',
};

// ============================================================================
// Custom Error Classes
// ============================================================================

export interface AppErrorOptions {
  code: ErrorCode;
  message?: string;
  userMessage?: string;
  cause?: Error;
  context?: Record<string, unknown>;
  recoverable?: boolean;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly userMessage: string;
  readonly cause?: Error;
  readonly context?: Record<string, unknown>;
  readonly recoverable: boolean;
  readonly timestamp: Date;

  constructor(options: AppErrorOptions) {
    const message = options.message || userFriendlyMessages[options.code];
    super(message);

    this.name = 'AppError';
    this.code = options.code;
    this.userMessage = options.userMessage || userFriendlyMessages[options.code];
    this.cause = options.cause;
    this.context = options.context;
    this.recoverable = options.recoverable ?? true;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

// Specialized error classes
export class NetworkError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({ ...options, code: options.code || ErrorCode.NETWORK_ERROR });
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({ ...options, code: options.code || ErrorCode.AUTH_INVALID_CREDENTIALS });
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  readonly field?: string;

  constructor(options: Omit<AppErrorOptions, 'code'> & { code?: ErrorCode; field?: string }) {
    super({ ...options, code: options.code || ErrorCode.VALIDATION_INVALID_FORMAT });
    this.name = 'ValidationError';
    this.field = options.field;
  }
}

export class StorageError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({ ...options, code: options.code || ErrorCode.STORAGE_READ_ERROR });
    this.name = 'StorageError';
  }
}

export class HealthError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({ ...options, code: options.code || ErrorCode.HEALTH_SYNC_FAILED });
    this.name = 'HealthError';
  }
}

export class AIServiceError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'code'> & { code?: ErrorCode }) {
    super({ ...options, code: options.code || ErrorCode.AI_SERVICE_ERROR });
    this.name = 'AIServiceError';
  }
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Wraps any error into an AppError
 */
export function wrapError(error: unknown, defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      code: defaultCode,
      message: error.message,
      cause: error,
    });
  }

  return new AppError({
    code: defaultCode,
    message: String(error),
  });
}

/**
 * Checks if an error is a specific type
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return error instanceof AppError && error.code === code;
}

/**
 * Gets a user-friendly message from any error
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return userFriendlyMessages[ErrorCode.NETWORK_ERROR];
    }
    if (message.includes('timeout')) {
      return userFriendlyMessages[ErrorCode.NETWORK_TIMEOUT];
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return userFriendlyMessages[ErrorCode.AUTH_SESSION_EXPIRED];
    }
  }

  return userFriendlyMessages[ErrorCode.UNKNOWN_ERROR];
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  shouldRetry: (error) => {
    // Don't retry validation or auth errors
    if (error instanceof ValidationError) return false;
    if (error instanceof AuthError) return false;
    // Retry network errors
    if (error instanceof NetworkError) return true;
    // Retry unknown errors by default
    return true;
  },
  onRetry: () => {},
};

/**
 * Executes a function with automatic retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: unknown;
  let currentDelay = opts.delayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts) {
        break;
      }

      if (!opts.shouldRetry(error, attempt)) {
        break;
      }

      logger.warn(`Retry attempt ${attempt}/${opts.maxAttempts}`, { error });
      opts.onRetry(error, attempt);

      await sleep(currentDelay);
      currentDelay = Math.min(currentDelay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError;
}

// ============================================================================
// Result Type (for explicit error handling)
// ============================================================================

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Wraps an async function to return a Result instead of throwing
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): Promise<Result<T>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    const appError = wrapError(error, errorCode);
    logger.error('Operation failed', appError.toJSON());
    return failure(appError);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Logs an error with context and returns the user message
 */
export function handleError(error: unknown, context?: string): string {
  const appError = wrapError(error);

  logger.error(context || 'Error occurred', {
    code: appError.code,
    message: appError.message,
    context: appError.context,
    stack: appError.stack,
  });

  return appError.userMessage;
}
