/**
 * Structured Logging Utility
 *
 * Provides consistent logging format across the application
 * with log levels, context, and error details.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  consultantId?: string;
  leadId?: string;
  conversationId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration?: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (can be configured via environment)
const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLogEntry(entry: LogEntry): string {
  const nodeEnv = process.env.NODE_ENV as string;
  if (nodeEnv === 'production') {
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify(entry);
  }

  // Human-readable format for development
  const { timestamp, level, message, context, error, duration } = entry;
  let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

  if (duration !== undefined) {
    formatted += ` (${duration}ms)`;
  }

  if (context && Object.keys(context).length > 0) {
    formatted += ` | ${JSON.stringify(context)}`;
  }

  if (error) {
    formatted += `\n  Error: ${error.name}: ${error.message}`;
    if (error.stack && process.env.NODE_ENV !== 'production') {
      formatted += `\n  ${error.stack}`;
    }
  }

  return formatted;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
  duration?: number
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined,
    duration,
  };
}

function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
  duration?: number
): void {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, context, error, duration);
  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: Error) =>
    log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: Error) =>
    log('error', message, context, error),

  /**
   * Log with timing information
   */
  timed: (level: LogLevel, message: string, startTime: number, context?: LogContext) => {
    const duration = Date.now() - startTime;
    log(level, message, context, undefined, duration);
  },

  /**
   * Create a child logger with preset context
   */
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) =>
      log('warn', message, { ...baseContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: Error) =>
      log('error', message, { ...baseContext, ...context }, error),
  }),
};

/**
 * Request logger middleware helper
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  startTime: number,
  context?: LogContext
): void {
  const duration = Date.now() - startTime;
  const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  log(level, `${method} ${path} ${statusCode}`, { ...context, statusCode }, undefined, duration);
}
