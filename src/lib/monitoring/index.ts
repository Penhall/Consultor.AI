/**
 * Monitoring Module
 *
 * Centralized exports for logging, performance monitoring, and error tracking.
 */

// Logging
export { logger, logRequest } from './logging';
export type { LogLevel, LogContext, LogEntry } from './logging';

// Performance monitoring
export {
  createTimer,
  measure,
  timed,
  trackApiPerformance,
  trackAiPerformance,
  trackDatabasePerformance,
  getPerformanceSummary,
  flushMetrics,
} from './performance';
export type { PerformanceMetric, PerformanceThresholds } from './performance';

// Sentry / Error tracking
export {
  sentry,
  initSentry,
  captureException,
  captureMessage,
  setUser,
  setContext,
  setTag,
  addBreadcrumb,
  startTransaction,
  withErrorCapture,
  reportComponentError,
} from './sentry';
export type { SentryUser, SentryContext, SentryBreadcrumb } from './sentry';
