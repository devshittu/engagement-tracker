// src/lib/logger.ts
const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (...args: any[]) => isDev && console.log('[INFO]', ...args),
  warn: (...args: any[]) => isDev && console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) => isDev && console.debug('[DEBUG]', ...args),
};

// src/lib/logger.ts