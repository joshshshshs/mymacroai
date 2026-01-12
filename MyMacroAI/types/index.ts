// Common Types
export * from './user';
export * from './health';
export * from './nutrition';
export * from './ai';

export type Theme = 'light' | 'dark' | 'auto';

// Generic response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
