/**
 * Sentry Integration for Error Tracking
 *
 * Provides error capture, performance monitoring, and user context.
 * Gracefully degrades when Sentry is not configured.
 */

import { logger } from './logging';

// Sentry client placeholder - actual implementation requires @sentry/nextjs
// This module provides a consistent interface regardless of Sentry availability

export interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
}

export interface SentryContext {
  [key: string]: unknown;
}

export interface SentryBreadcrumb {
  category: string;
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

// Check if Sentry is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const nodeEnv = process.env.NODE_ENV as string;
const IS_SENTRY_ENABLED = Boolean(SENTRY_DSN) && nodeEnv === 'production';

// Sentry module interface (subset of @sentry/nextjs)
interface SentryLike {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: Error, options?: Record<string, unknown>) => string;
  captureMessage: (message: string, options?: Record<string, unknown>) => string;
  setUser: (user: SentryUser | null) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  setTag: (key: string, value: string) => void;
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
  startInactiveSpan: (options: Record<string, unknown>) => { end: () => void } | undefined;
}

// Lazy-loaded Sentry module
let SentryModule: SentryLike | null = null;

async function getSentry(): Promise<SentryLike | null> {
  if (!IS_SENTRY_ENABLED) return null;

  if (!SentryModule) {
    try {
      // Dynamic import - will fail gracefully if not installed
      // Use string interpolation to avoid TypeScript module resolution
      const moduleName = '@sentry/nextjs';
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      SentryModule = (await import(/* webpackIgnore: true */ moduleName)) as unknown as SentryLike;
    } catch {
      logger.warn('Sentry module not available');
      return null;
    }
  }

  return SentryModule;
}

/**
 * Initialize Sentry (call in instrumentation.ts or _app.tsx)
 */
export async function initSentry(): Promise<void> {
  if (!IS_SENTRY_ENABLED) {
    logger.info('Sentry disabled (no DSN configured or not in production)');
    return;
  }

  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1,

    // Error filtering
    beforeSend(event: Record<string, unknown>) {
      // Don't send events in development
      const env = process.env.NODE_ENV as string;
      if (env !== 'production') {
        return null;
      }

      // Filter out specific errors
      const exception = event.exception as { values?: Array<{ value?: string }> } | undefined;
      if (exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null;
      }

      return event;
    },

    // Integrations
    integrations: [],
  });

  logger.info('Sentry initialized');
}

/**
 * Capture an exception
 */
export async function captureException(
  error: Error,
  context?: SentryContext
): Promise<string | null> {
  // Always log the error
  logger.error(error.message, context as Record<string, unknown>, error);

  if (!IS_SENTRY_ENABLED) return null;

  const Sentry = await getSentry();
  if (!Sentry) return null;

  return Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message
 */
export async function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: SentryContext
): Promise<string | null> {
  // Always log the message
  logger[level === 'warning' ? 'warn' : level](message, context as Record<string, unknown>);

  if (!IS_SENTRY_ENABLED) return null;

  const Sentry = await getSentry();
  if (!Sentry) return null;

  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for error tracking
 */
export async function setUser(user: SentryUser | null): Promise<void> {
  if (!IS_SENTRY_ENABLED) return;

  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.setUser(user);
}

/**
 * Set additional context
 */
export async function setContext(name: string, context: SentryContext): Promise<void> {
  if (!IS_SENTRY_ENABLED) return;

  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.setContext(name, context);
}

/**
 * Set a tag
 */
export async function setTag(key: string, value: string): Promise<void> {
  if (!IS_SENTRY_ENABLED) return;

  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.setTag(key, value);
}

/**
 * Add a breadcrumb for debugging
 */
export async function addBreadcrumb(breadcrumb: SentryBreadcrumb): Promise<void> {
  if (!IS_SENTRY_ENABLED) return;

  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.addBreadcrumb({
    category: breadcrumb.category,
    message: breadcrumb.message,
    level: breadcrumb.level,
    data: breadcrumb.data,
  });
}

/**
 * Start a performance transaction
 */
export async function startTransaction(
  name: string,
  op: string
): Promise<{ finish: () => void } | null> {
  if (!IS_SENTRY_ENABLED) {
    // Return a no-op transaction
    return { finish: () => {} };
  }

  const Sentry = await getSentry();
  if (!Sentry) return { finish: () => {} };

  const transaction = Sentry.startInactiveSpan({
    name,
    op,
  });

  return {
    finish: () => transaction?.end(),
  };
}

/**
 * Wrap an async function with error capture
 */
export function withErrorCapture<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: SentryContext
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      await captureException(error as Error, context);
      throw error;
    }
  };
}

/**
 * Error boundary helper for React components
 */
export async function reportComponentError(error: Error, componentStack: string): Promise<void> {
  await captureException(error, {
    componentStack,
    type: 'react_error_boundary',
  });
}

// Export a simple interface for common operations
export const sentry = {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  setContext,
  setTag,
  addBreadcrumb,
  startTransaction,
  withErrorCapture,
  reportComponentError,
  isEnabled: IS_SENTRY_ENABLED,
};
