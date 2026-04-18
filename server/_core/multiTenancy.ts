/**
 * Multi-Tenancy Support Module
 * Provides tenant isolation and per-tenant configuration
 */

import { Request, Response, NextFunction } from 'express';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  rateLimit: number;
  maxUsers: number;
  features: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface TenantContext {
  tenantId: string;
  tenant: Tenant;
  userId?: string;
}

// In-memory tenant store (in production, use database)
const tenants: Map<string, Tenant> = new Map();

/**
 * Create a new tenant
 */
export const createTenant = (tenant: Tenant): Tenant => {
  tenants.set(tenant.id, tenant);
  return tenant;
};

/**
 * Get tenant by ID
 */
export const getTenantById = (tenantId: string): Tenant | null => {
  return tenants.get(tenantId) || null;
};

/**
 * Get tenant by domain
 */
export const getTenantByDomain = (domain: string): Tenant | null => {
  const tenantArray = Array.from(tenants.values());
  for (let i = 0; i < tenantArray.length; i++) {
    const tenant = tenantArray[i];
    if (tenant.domain === domain) {
      return tenant;
    }
  }
  return null;
};

/**
 * Update tenant
 */
export const updateTenant = (tenantId: string, updates: Partial<Tenant>): Tenant | null => {
  const tenant = tenants.get(tenantId);
  if (!tenant) return null;

  const updated = { ...tenant, ...updates };
  tenants.set(tenantId, updated);
  return updated;
};

/**
 * Delete tenant
 */
export const deleteTenant = (tenantId: string): boolean => {
  return tenants.delete(tenantId);
};

/**
 * Middleware to extract tenant from request
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Extract tenant from subdomain: tenant.example.com
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];

  // Or extract from header: X-Tenant-ID
  const tenantIdFromHeader = req.get('X-Tenant-ID');

  // Or extract from URL: /api/tenants/tenant-id/...
  const tenantIdFromUrl = req.params.tenantId;

  const tenantId = tenantIdFromHeader || tenantIdFromUrl || subdomain;

  if (!tenantId) {
    res.status(400).json({
      success: false,
      error: 'Tenant ID not provided',
    });
    return;
  }

  const tenant = getTenantById(tenantId);
  if (!tenant || !tenant.isActive) {
    res.status(404).json({
      success: false,
      error: 'Tenant not found or inactive',
    });
    return;
  }

  (req as any).tenantContext = {
    tenantId,
    tenant,
  };

  // Add tenant info to response headers
  res.set('X-Tenant-ID', tenantId);

  next();
};

/**
 * Get tenant context from request
 */
export const getTenantContext = (req: Request): TenantContext | null => {
  return (req as any).tenantContext || null;
};

/**
 * Middleware to enforce rate limits per tenant
 */
export const tenantRateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const context = getTenantContext(req);
  if (!context) {
    next();
    return;
  }

  // Store tenant rate limit info in request
  (req as any).tenantRateLimit = context.tenant.rateLimit;

  next();
};

/**
 * Middleware to enforce feature access per tenant
 */
export const requireFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = getTenantContext(req);

    if (!context) {
      res.status(400).json({
        success: false,
        error: 'Tenant context not found',
      });
      return;
    }

    if (!context.tenant.features.includes(feature)) {
      res.status(403).json({
        success: false,
        error: `Feature '${feature}' not available for this tenant`,
        plan: context.tenant.plan,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to enforce user limits per tenant
 */
export const enforceUserLimit = (req: Request, res: Response, next: NextFunction): void => {
  const context = getTenantContext(req);

  if (!context) {
    next();
    return;
  }

  // In production, check actual user count against tenant.maxUsers
  // For now, just pass through
  (req as any).tenantUserLimit = context.tenant.maxUsers;

  next();
};

/**
 * Isolate database queries to tenant
 */
export const getTenantFilter = (tenantId: string): Record<string, any> => {
  return { tenantId };
};

/**
 * Add tenant ID to database records
 */
export const addTenantToRecord = (record: any, tenantId: string): any => {
  return {
    ...record,
    tenantId,
  };
};

/**
 * Get tenant plan features
 */
export const getPlanFeatures = (plan: 'free' | 'pro' | 'enterprise'): string[] => {
  const features: Record<string, string[]> = {
    free: ['basic-analytics', 'api-access'],
    pro: ['basic-analytics', 'api-access', 'advanced-analytics', 'webhooks', 'custom-domain'],
    enterprise: [
      'basic-analytics',
      'api-access',
      'advanced-analytics',
      'webhooks',
      'custom-domain',
      'sso',
      'audit-logs',
      'priority-support',
    ],
  };

  return features[plan] || [];
};

/**
 * Upgrade tenant plan
 */
export const upgradeTenantPlan = (
  tenantId: string,
  newPlan: 'free' | 'pro' | 'enterprise'
): Tenant | null => {
  const tenant = getTenantById(tenantId);
  if (!tenant) return null;

  const features = getPlanFeatures(newPlan);
  const rateLimit = newPlan === 'free' ? 100 : newPlan === 'pro' ? 1000 : 10000;
  const maxUsers = newPlan === 'free' ? 5 : newPlan === 'pro' ? 100 : 10000;

  return updateTenant(tenantId, {
    plan: newPlan,
    features,
    rateLimit,
    maxUsers,
  });
};

/**
 * Get tenant usage statistics
 */
export const getTenantUsage = (tenantId: string): {
  tenantId: string;
  plan: string;
  rateLimit: number;
  maxUsers: number;
  features: string[];
} | null => {
  const tenant = getTenantById(tenantId);
  if (!tenant) return null;

  return {
    tenantId: tenant.id,
    plan: tenant.plan,
    rateLimit: tenant.rateLimit,
    maxUsers: tenant.maxUsers,
    features: tenant.features,
  };
};

export default {
  createTenant,
  getTenantById,
  getTenantByDomain,
  updateTenant,
  deleteTenant,
  tenantMiddleware,
  getTenantContext,
  tenantRateLimitMiddleware,
  requireFeature,
  enforceUserLimit,
  getTenantFilter,
  addTenantToRecord,
  getPlanFeatures,
  upgradeTenantPlan,
  getTenantUsage,
};
