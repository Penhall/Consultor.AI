/**
 * Performance Monitoring Utility
 *
 * Tracks API latencies, AI response times, and database query performance.
 * Integrates with Sentry for production monitoring.
 */

import { logger } from './logging';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  tags?: Record<string, string>;
  success: boolean;
}

export interface PerformanceThresholds {
  api: number; // 500ms target
  ai: number; // 3000ms target
  database: number; // 100ms target
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  api: 500,
  ai: 3000,
  database: 100,
};

// In-memory metrics buffer for batch reporting
const metricsBuffer: PerformanceMetric[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Record a performance metric
 */
function recordMetric(metric: PerformanceMetric): void {
  metricsBuffer.push(metric);

  // Log if threshold exceeded
  const thresholdKey = metric.tags?.type as keyof PerformanceThresholds | undefined;
  const threshold = thresholdKey ? DEFAULT_THRESHOLDS[thresholdKey] : DEFAULT_THRESHOLDS.api;

  if (metric.duration > threshold) {
    logger.warn(`Slow ${metric.tags?.type || 'operation'}: ${metric.name}`, {
      duration: metric.duration,
      threshold,
      ...metric.tags,
    } as Record<string, unknown>);
  }

  // Flush buffer if full
  if (metricsBuffer.length >= MAX_BUFFER_SIZE) {
    flushMetrics();
  }
}

/**
 * Flush metrics buffer (send to monitoring service)
 */
export function flushMetrics(): PerformanceMetric[] {
  const metrics = [...metricsBuffer];
  metricsBuffer.length = 0;

  // In production, would send to monitoring service
  if (process.env.NODE_ENV === 'production' && metrics.length > 0) {
    logger.debug(`Flushing ${metrics.length} performance metrics`);
  }

  return metrics;
}

/**
 * Create a performance timer
 */
export function createTimer(name: string, tags?: Record<string, string>) {
  const startTime = performance.now();

  return {
    /**
     * End the timer and record the metric
     */
    end: (success: boolean = true): number => {
      const duration = Math.round(performance.now() - startTime);

      recordMetric({
        name,
        duration,
        timestamp: new Date().toISOString(),
        tags,
        success,
      });

      return duration;
    },

    /**
     * Get elapsed time without ending the timer
     */
    elapsed: (): number => Math.round(performance.now() - startTime),
  };
}

/**
 * Measure async function execution time
 */
export async function measure<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<{ result: T; duration: number }> {
  const timer = createTimer(name, tags);

  try {
    const result = await fn();
    const duration = timer.end(true);
    return { result, duration };
  } catch (error) {
    timer.end(false);
    throw error;
  }
}

/**
 * Decorator for measuring method execution time
 */
export function timed(name?: string, tags?: Record<string, string>) {
  return function <T>(
    _target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
  ) {
    const originalMethod = descriptor.value!;
    const metricName = name || propertyKey;

    descriptor.value = async function (...args: unknown[]): Promise<T> {
      const timer = createTimer(metricName, tags);
      try {
        const result = await originalMethod.apply(this, args);
        timer.end(true);
        return result;
      } catch (error) {
        timer.end(false);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Track API route performance
 */
export function trackApiPerformance(
  route: string,
  method: string,
  statusCode: number,
  duration: number
): void {
  recordMetric({
    name: `api.${method.toLowerCase()}.${route}`,
    duration,
    timestamp: new Date().toISOString(),
    tags: {
      type: 'api',
      route,
      method,
      statusCode: statusCode.toString(),
    },
    success: statusCode < 400,
  });
}

/**
 * Track AI response performance
 */
export function trackAiPerformance(
  model: string,
  operation: string,
  duration: number,
  success: boolean
): void {
  recordMetric({
    name: `ai.${model}.${operation}`,
    duration,
    timestamp: new Date().toISOString(),
    tags: {
      type: 'ai',
      model,
      operation,
    },
    success,
  });
}

/**
 * Track database query performance
 */
export function trackDatabasePerformance(
  table: string,
  operation: string,
  duration: number,
  success: boolean
): void {
  recordMetric({
    name: `db.${table}.${operation}`,
    duration,
    timestamp: new Date().toISOString(),
    tags: {
      type: 'database',
      table,
      operation,
    },
    success,
  });
}

/**
 * Get performance summary statistics
 */
export function getPerformanceSummary(): {
  total: number;
  success: number;
  failed: number;
  avgDuration: number;
  p95Duration: number;
} {
  const metrics = [...metricsBuffer];

  if (metrics.length === 0) {
    return { total: 0, success: 0, failed: 0, avgDuration: 0, p95Duration: 0 };
  }

  const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
  const p95Index = Math.floor(durations.length * 0.95);

  return {
    total: metrics.length,
    success: metrics.filter(m => m.success).length,
    failed: metrics.filter(m => !m.success).length,
    avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    p95Duration: durations[p95Index] || 0,
  };
}
