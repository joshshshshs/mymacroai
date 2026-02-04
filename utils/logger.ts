/**
 * 安全的日志工具 - 兼容React Native Bridgeless模式
 * 在console不可用时提供安全的日志功能
 */

interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

// 检查console是否可用 - 增强无桥接模式兼容性
const isConsoleAvailable = (): boolean => {
  try {
    // 在无桥接模式下，console对象可能部分未定义
    return typeof console !== 'undefined' && 
           console !== null &&
           typeof console.log === 'function' &&
           typeof console.warn === 'function' &&
           typeof console.error === 'function' &&
           typeof console.info === 'function' &&
           typeof console.debug === 'function';
  } catch {
    return false;
  }
};

// 安全的console包装器 - 完全无桥接模式兼容
const safeConsole: Logger = {
  log: (...args: any[]) => {
    try {
      if (isConsoleAvailable()) {
        console.log(...args);
      }
    } catch {
      // 完全静默失败，避免在无桥接模式下抛出错误
    }
  },
  warn: (...args: any[]) => {
    try {
      if (isConsoleAvailable()) {
        console.warn(...args);
      }
    } catch {
      // 完全静默失败
    }
  },
  error: (...args: any[]) => {
    try {
      if (isConsoleAvailable()) {
        console.error(...args);
      }
    } catch {
      // 完全静默失败
    }
  },
  info: (...args: any[]) => {
    try {
      if (isConsoleAvailable()) {
        console.info(...args);
      }
    } catch {
      // 完全静默失败
    }
  },
  debug: (...args: any[]) => {
    try {
      if (isConsoleAvailable()) {
        console.debug(...args);
      }
    } catch {
      // 完全静默失败
    }
  }
};

// 开发环境下的详细日志
const isDev = process.env.NODE_ENV === 'development';

export const logger: Logger = {
  log: (...args: any[]) => {
    if (isDev) {
      safeConsole.log('[LOG]', ...args);
    }
  },
  warn: (...args: any[]) => {
    safeConsole.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    safeConsole.error('[ERROR]', ...args);
  },
  info: (...args: any[]) => {
    safeConsole.info('[INFO]', ...args);
  },
  debug: (...args: any[]) => {
    if (isDev) {
      safeConsole.debug('[DEBUG]', ...args);
    }
  }
};

// 导出默认实例
export default logger;