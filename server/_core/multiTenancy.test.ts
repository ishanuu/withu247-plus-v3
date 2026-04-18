/**
 * Multi-Tenancy Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTenant,
  getTenantById,
  getTenantByDomain,
  updateTenant,
  deleteTenant,
  getPlanFeatures,
  upgradeTenantPlan,
  getTenantUsage,
} from './multiTenancy';
import type { Tenant } from './multiTenancy';

describe('Multi-Tenancy Module', () => {
  const mockTenant: Tenant = {
    id: 'tenant-123',
    name: 'Acme Corp',
    domain: 'acme.example.com',
    plan: 'pro',
    rateLimit: 1000,
    maxUsers: 100,
    features: ['basic-analytics', 'api-access', 'advanced-analytics'],
    createdAt: new Date(),
    isActive: true,
  };

  beforeEach(() => {
    // Clear tenants before each test
    // In a real scenario, you'd use a test database
  });

  describe('createTenant', () => {
    it('should create a new tenant', () => {
      const tenant = createTenant(mockTenant);

      expect(tenant).toEqual(mockTenant);
      expect(tenant.id).toBe('tenant-123');
      expect(tenant.name).toBe('Acme Corp');
    });

    it('should create multiple tenants', () => {
      const tenant1 = createTenant(mockTenant);
      const tenant2 = createTenant({
        ...mockTenant,
        id: 'tenant-456',
        name: 'Beta Inc',
      });

      expect(tenant1.id).toBe('tenant-123');
      expect(tenant2.id).toBe('tenant-456');
    });
  });

  describe('getTenantById', () => {
    it('should retrieve tenant by ID', () => {
      createTenant(mockTenant);
      const tenant = getTenantById('tenant-123');

      expect(tenant).not.toBeNull();
      expect(tenant?.name).toBe('Acme Corp');
    });

    it('should return null for non-existent tenant', () => {
      const tenant = getTenantById('non-existent');

      expect(tenant).toBeNull();
    });
  });

  describe('getTenantByDomain', () => {
    it('should retrieve tenant by domain', () => {
      createTenant(mockTenant);
      const tenant = getTenantByDomain('acme.example.com');

      expect(tenant).not.toBeNull();
      expect(tenant?.id).toBe('tenant-123');
    });

    it('should return null for non-existent domain', () => {
      const tenant = getTenantByDomain('non-existent.com');

      expect(tenant).toBeNull();
    });

    it('should handle multiple domains correctly', () => {
      createTenant(mockTenant);
      createTenant({
        ...mockTenant,
        id: 'tenant-456',
        domain: 'beta.example.com',
      });

      const tenant1 = getTenantByDomain('acme.example.com');
      const tenant2 = getTenantByDomain('beta.example.com');

      expect(tenant1?.id).toBe('tenant-123');
      expect(tenant2?.id).toBe('tenant-456');
    });
  });

  describe('updateTenant', () => {
    it('should update tenant properties', () => {
      createTenant(mockTenant);
      const updated = updateTenant('tenant-123', { name: 'Acme Corp Updated' });

      expect(updated?.name).toBe('Acme Corp Updated');
      expect(updated?.id).toBe('tenant-123');
    });

    it('should return null for non-existent tenant', () => {
      const updated = updateTenant('non-existent', { name: 'New Name' });

      expect(updated).toBeNull();
    });

    it('should preserve other properties when updating', () => {
      createTenant(mockTenant);
      const updated = updateTenant('tenant-123', { plan: 'enterprise' });

      expect(updated?.plan).toBe('enterprise');
      expect(updated?.name).toBe('Acme Corp');
      expect(updated?.domain).toBe('acme.example.com');
    });
  });

  describe('deleteTenant', () => {
    it('should delete a tenant', () => {
      createTenant(mockTenant);
      const deleted = deleteTenant('tenant-123');

      expect(deleted).toBe(true);
      expect(getTenantById('tenant-123')).toBeNull();
    });

    it('should return false for non-existent tenant', () => {
      const deleted = deleteTenant('non-existent');

      expect(deleted).toBe(false);
    });
  });

  describe('getPlanFeatures', () => {
    it('should return free plan features', () => {
      const features = getPlanFeatures('free');

      expect(features).toContain('basic-analytics');
      expect(features).toContain('api-access');
      expect(features.length).toBe(2);
    });

    it('should return pro plan features', () => {
      const features = getPlanFeatures('pro');

      expect(features).toContain('basic-analytics');
      expect(features).toContain('advanced-analytics');
      expect(features).toContain('webhooks');
      expect(features.length).toBe(5);
    });

    it('should return enterprise plan features', () => {
      const features = getPlanFeatures('enterprise');

      expect(features).toContain('sso');
      expect(features).toContain('audit-logs');
      expect(features).toContain('priority-support');
      expect(features.length).toBe(8);
    });

    it('should return empty array for unknown plan', () => {
      const features = getPlanFeatures('unknown' as any);

      expect(features).toEqual([]);
    });
  });

  describe('upgradeTenantPlan', () => {
    it('should upgrade tenant plan', () => {
      createTenant(mockTenant);
      const upgraded = upgradeTenantPlan('tenant-123', 'enterprise');

      expect(upgraded?.plan).toBe('enterprise');
      expect(upgraded?.rateLimit).toBe(10000);
      expect(upgraded?.maxUsers).toBe(10000);
    });

    it('should update features on upgrade', () => {
      createTenant(mockTenant);
      const upgraded = upgradeTenantPlan('tenant-123', 'enterprise');

      expect(upgraded?.features).toContain('sso');
      expect(upgraded?.features).toContain('audit-logs');
    });

    it('should return null for non-existent tenant', () => {
      const upgraded = upgradeTenantPlan('non-existent', 'enterprise');

      expect(upgraded).toBeNull();
    });

    it('should handle downgrade', () => {
      createTenant(mockTenant);
      const downgraded = upgradeTenantPlan('tenant-123', 'free');

      expect(downgraded?.plan).toBe('free');
      expect(downgraded?.rateLimit).toBe(100);
      expect(downgraded?.maxUsers).toBe(5);
    });
  });

  describe('getTenantUsage', () => {
    it('should return tenant usage statistics', () => {
      createTenant(mockTenant);
      const usage = getTenantUsage('tenant-123');

      expect(usage).not.toBeNull();
      expect(usage?.plan).toBe('pro');
      expect(usage?.rateLimit).toBe(1000);
      expect(usage?.maxUsers).toBe(100);
    });

    it('should return null for non-existent tenant', () => {
      const usage = getTenantUsage('non-existent');

      expect(usage).toBeNull();
    });

    it('should include all features in usage', () => {
      createTenant(mockTenant);
      const usage = getTenantUsage('tenant-123');

      expect(usage?.features).toContain('basic-analytics');
      expect(usage?.features).toContain('api-access');
    });
  });

  describe('Plan limits', () => {
    it('free plan should have lowest limits', () => {
      const freeTenant = createTenant({
        ...mockTenant,
        id: 'free-tenant',
        plan: 'free',
        rateLimit: 100,
        maxUsers: 5,
      });

      expect(freeTenant.rateLimit).toBe(100);
      expect(freeTenant.maxUsers).toBe(5);
    });

    it('pro plan should have medium limits', () => {
      const proTenant = createTenant({
        ...mockTenant,
        id: 'pro-tenant',
        plan: 'pro',
        rateLimit: 1000,
        maxUsers: 100,
      });

      expect(proTenant.rateLimit).toBe(1000);
      expect(proTenant.maxUsers).toBe(100);
    });

    it('enterprise plan should have highest limits', () => {
      const enterpriseTenant = createTenant({
        ...mockTenant,
        id: 'enterprise-tenant',
        plan: 'enterprise',
        rateLimit: 10000,
        maxUsers: 10000,
      });

      expect(enterpriseTenant.rateLimit).toBe(10000);
      expect(enterpriseTenant.maxUsers).toBe(10000);
    });
  });

  describe('Tenant isolation', () => {
    it('should keep tenants isolated', () => {
      const tenant1 = createTenant({
        ...mockTenant,
        id: 'tenant-1',
        name: 'Tenant 1',
      });

      const tenant2 = createTenant({
        ...mockTenant,
        id: 'tenant-2',
        name: 'Tenant 2',
      });

      updateTenant('tenant-1', { name: 'Tenant 1 Updated' });

      const updated1 = getTenantById('tenant-1');
      const unchanged2 = getTenantById('tenant-2');

      expect(updated1?.name).toBe('Tenant 1 Updated');
      expect(unchanged2?.name).toBe('Tenant 2');
    });
  });
});
