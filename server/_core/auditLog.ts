/**
 * Audit Logging System
 * Tracks all user actions for compliance and security monitoring
 */

import { Request, Response, NextFunction } from 'express';

export interface AuditLogEntry {
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  ipAddress?: string;
  userAgent?: string;
  status: number;
  duration: number;
  changes?: Record<string, any>;
  error?: string;
}

// In-memory audit log (in production, use a database)
const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000; // Keep last 10000 logs in memory

/**
 * Log an audit entry
 */
export const logAudit = (entry: AuditLogEntry): void => {
  auditLogs.push(entry);

  // Keep only recent logs
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.splice(0, auditLogs.length - MAX_LOGS);
  }

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUDIT] ${entry.action} - ${entry.resource} - ${entry.status}`);
  }
};

/**
 * Middleware to capture HTTP requests for audit logging
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Capture response
  const originalJson = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - startTime;

    const auditEntry: AuditLogEntry = {
      timestamp: new Date(),
      userId: (req as any).user?.id,
      action: req.method,
      resource: req.baseUrl.split('/')[2] || 'unknown',
      resourceId: req.params.id,
      method: req.method,
      path: req.path,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: res.statusCode,
      duration,
    };

    // Log sensitive operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      logAudit(auditEntry);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Get audit logs with filtering
 */
export const getAuditLogs = (options: {
  userId?: string;
  action?: string;
  resource?: string;
  status?: number;
  limit?: number;
  offset?: number;
}): AuditLogEntry[] => {
  let filtered = [...auditLogs];

  if (options.userId) {
    filtered = filtered.filter((log) => log.userId === options.userId);
  }

  if (options.action) {
    filtered = filtered.filter((log) => log.action === options.action);
  }

  if (options.resource) {
    filtered = filtered.filter((log) => log.resource === options.resource);
  }

  if (options.status) {
    filtered = filtered.filter((log) => log.status === options.status);
  }

  const offset = options.offset || 0;
  const limit = options.limit || 100;

  return filtered.slice(offset, offset + limit);
};

/**
 * Get audit statistics
 */
export const getAuditStats = (): {
  totalLogs: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byStatus: Record<number, number>;
  recentErrors: AuditLogEntry[];
} => {
  const stats = {
    totalLogs: auditLogs.length,
    byAction: {} as Record<string, number>,
    byResource: {} as Record<string, number>,
    byStatus: {} as Record<number, number>,
    recentErrors: auditLogs.filter((log) => log.status >= 400).slice(-10),
  };

  auditLogs.forEach((log) => {
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
  });

  return stats;
};

/**
 * Clear old audit logs
 */
export const clearOldLogs = (daysOld: number = 30): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const initialLength = auditLogs.length;
  const filtered = auditLogs.filter((log) => log.timestamp > cutoffDate);
  auditLogs.length = 0;
  auditLogs.push(...filtered);

  return initialLength - auditLogs.length;
};

/**
 * Export audit logs as JSON
 */
export const exportAuditLogs = (): string => {
  return JSON.stringify(auditLogs, null, 2);
};

export default {
  logAudit,
  auditMiddleware,
  getAuditLogs,
  getAuditStats,
  clearOldLogs,
  exportAuditLogs,
};
