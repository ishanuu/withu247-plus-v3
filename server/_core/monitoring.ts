/**
 * Monitoring and Metrics System
 * Tracks performance metrics and system health
 */

import { Request, Response, NextFunction } from 'express';

export interface Metrics {
  timestamp: Date;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  memoryUsed: number;
  cpuUsage: number;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowRequests: Metrics[];
}

const metrics: Metrics[] = [];
const MAX_METRICS = 5000;
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

/**
 * Record request metric
 */
export const recordMetric = (metric: Metrics): void => {
  metrics.push(metric);

  // Keep only recent metrics
  if (metrics.length > MAX_METRICS) {
    metrics.splice(0, metrics.length - MAX_METRICS);
  }

  requestCount++;
  totalResponseTime += metric.duration;

  if (metric.statusCode >= 400) {
    errorCount++;
  }
};

/**
 * Middleware to capture metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  const originalJson = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();

    const metric: Metrics = {
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
      cpuUsage: process.cpuUsage().user,
    };

    recordMetric(metric);

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Get system metrics
 */
export const getSystemMetrics = (): SystemMetrics => {
  const memUsage = process.memoryUsage();
  const slowRequests = metrics
    .filter((m) => m.duration > 1000) // Requests slower than 1 second
    .slice(-10);

  return {
    uptime: process.uptime(),
    memoryUsage: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
    },
    requestCount,
    errorCount,
    averageResponseTime: requestCount > 0 ? totalResponseTime / requestCount : 0,
    slowRequests,
  };
};

/**
 * Get metrics by path
 */
export const getMetricsByPath = (path: string): Metrics[] => {
  return metrics.filter((m) => m.path === path);
};

/**
 * Get metrics by status code
 */
export const getMetricsByStatus = (statusCode: number): Metrics[] => {
  return metrics.filter((m) => m.statusCode === statusCode);
};

/**
 * Get performance statistics
 */
export const getPerformanceStats = (): {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestRequests: Metrics[];
} => {
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      totalErrors: 0,
      errorRate: 0,
      averageResponseTime: 0,
      p50ResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      slowestRequests: [],
    };
  }

  const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
  const errors = metrics.filter((m) => m.statusCode >= 400).length;

  return {
    totalRequests: metrics.length,
    totalErrors: errors,
    errorRate: (errors / metrics.length) * 100,
    averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50ResponseTime: durations[Math.floor(durations.length * 0.5)],
    p95ResponseTime: durations[Math.floor(durations.length * 0.95)],
    p99ResponseTime: durations[Math.floor(durations.length * 0.99)],
    slowestRequests: metrics.sort((a, b) => b.duration - a.duration).slice(0, 10),
  };
};

/**
 * Clear metrics
 */
export const clearMetrics = (): void => {
  metrics.length = 0;
  requestCount = 0;
  errorCount = 0;
  totalResponseTime = 0;
};

/**
 * Export metrics as JSON
 */
export const exportMetrics = (): string => {
  return JSON.stringify(
    {
      systemMetrics: getSystemMetrics(),
      performanceStats: getPerformanceStats(),
      recentMetrics: metrics.slice(-100),
    },
    null,
    2
  );
};

export default {
  recordMetric,
  metricsMiddleware,
  getSystemMetrics,
  getMetricsByPath,
  getMetricsByStatus,
  getPerformanceStats,
  clearMetrics,
  exportMetrics,
};
