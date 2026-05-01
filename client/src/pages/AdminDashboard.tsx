import React, { useState } from 'react';
import { Link } from 'wouter';
import { ClayCard } from '../components/Clay/ClayCard';
import { ClayButton } from '../components/Clay/ClayButton';
import { ClayInput } from '../components/Clay/ClayInput';
import { ClayBadge } from '../components/Clay/ClayBadge';
import { useNotification } from '../contexts/NotificationContext';
import { trpc } from '../lib/trpc';
import '../styles/claymorphism.css';

export const AdminDashboard: React.FC = () => {
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'users' | 'health' | 'billing'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenantPage, setTenantPage] = useState(0);

  const { data: systemAnalytics, isLoading: analyticsLoading } = trpc.admin.systemAnalytics.useQuery({ period: 'week' });
  const { data: tenants, isLoading: tenantsLoading } = trpc.admin.tenants.useQuery({
    limit: 10,
    offset: tenantPage * 10,
    search: searchTerm,
  });
  const { data: users, isLoading: usersLoading } = trpc.admin.users.useQuery({ limit: 10, offset: 0 });
  const { data: systemHealth } = trpc.admin.systemHealth.useQuery();
  const { data: billingMetrics } = trpc.admin.billingMetrics.useQuery({ period: 'month' });

  const updateTenantStatusMutation = trpc.admin.updateTenantStatus.useMutation({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Tenant status updated',
        message: 'The tenant status has been updated successfully',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error updating tenant',
        message: error.message,
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-bg-primary via-clay-bg-secondary to-clay-bg-tertiary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-clay-text-primary mb-2">Admin Dashboard</h1>
            <p className="text-clay-text-secondary">System-wide analytics and management</p>
          </div>
          <Link href="/dashboard">
            <ClayButton variant="secondary">Back to Dashboard</ClayButton>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-clay-border overflow-x-auto">
          {(['overview', 'tenants', 'users', 'health', 'billing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'text-clay-primary border-b-2 border-clay-primary'
                  : 'text-clay-text-secondary hover:text-clay-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ClayCard elevated>
                <p className="text-sm text-clay-text-secondary mb-2">Total Tenants</p>
                {analyticsLoading ? (
                  <div className="h-8 bg-clay-skeleton rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-clay-text-primary">{systemAnalytics?.totalTenants}</p>
                )}
              </ClayCard>

              <ClayCard elevated>
                <p className="text-sm text-clay-text-secondary mb-2">Active Tenants</p>
                {analyticsLoading ? (
                  <div className="h-8 bg-clay-skeleton rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-500">{systemAnalytics?.activeTenants}</p>
                )}
              </ClayCard>

              <ClayCard elevated>
                <p className="text-sm text-clay-text-secondary mb-2">Total Users</p>
                {analyticsLoading ? (
                  <div className="h-8 bg-clay-skeleton rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-clay-text-primary">{systemAnalytics?.totalUsers}</p>
                )}
              </ClayCard>

              <ClayCard elevated>
                <p className="text-sm text-clay-text-secondary mb-2">Success Rate</p>
                {analyticsLoading ? (
                  <div className="h-8 bg-clay-skeleton rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-blue-500">{systemAnalytics?.successRate}%</p>
                )}
              </ClayCard>
            </div>

            {/* Top Tenants */}
            <ClayCard elevated>
              <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Top Tenants</h3>
              {analyticsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-clay-skeleton rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {systemAnalytics?.topTenants?.map((tenant: any) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 bg-clay-bg-tertiary rounded-lg">
                      <div>
                        <p className="font-medium text-clay-text-primary">{tenant.name}</p>
                        <p className="text-sm text-clay-text-secondary">{tenant.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-clay-text-primary">{tenant.requests.toLocaleString()}</p>
                        <ClayBadge variant={tenant.plan === 'enterprise' ? 'primary' : 'default'}>
                          {tenant.plan}
                        </ClayBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <ClayCard>
              <ClayInput
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={setSearchTerm}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </ClayCard>

            <ClayCard elevated>
              {tenantsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-clay-skeleton rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-clay-border">
                        <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Users</th>
                        <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants?.tenants?.map((tenant: any) => (
                        <tr key={tenant.id} className="border-b border-clay-border hover:bg-clay-bg-tertiary transition">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-clay-text-primary">{tenant.name}</p>
                              <p className="text-xs text-clay-text-secondary">{tenant.domain}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <ClayBadge variant={tenant.plan === 'enterprise' ? 'primary' : 'default'}>
                              {tenant.plan}
                            </ClayBadge>
                          </td>
                          <td className="py-3 px-4 text-clay-text-primary">{tenant.users}</td>
                          <td className="py-3 px-4">
                            <ClayBadge variant={tenant.status === 'active' ? 'success' : 'warning'}>
                              {tenant.status}
                            </ClayBadge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="text-clay-primary hover:underline text-sm">View</button>
                              <button
                                onClick={() => {
                                  updateTenantStatusMutation.mutate({
                                    tenantId: tenant.id,
                                    status: tenant.status === 'active' ? 'suspended' : 'active',
                                  });
                                }}
                                className="text-orange-500 hover:underline text-sm"
                              >
                                {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ClayCard>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <ClayCard elevated>
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-clay-skeleton rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-clay-border">
                      <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.users?.map((user: any) => (
                      <tr key={user.id} className="border-b border-clay-border hover:bg-clay-bg-tertiary transition">
                        <td className="py-3 px-4 text-clay-text-primary">{user.name}</td>
                        <td className="py-3 px-4 text-clay-text-secondary">{user.email}</td>
                        <td className="py-3 px-4">
                          <ClayBadge variant={user.role === 'admin' ? 'primary' : 'default'}>
                            {user.role}
                          </ClayBadge>
                        </td>
                        <td className="py-3 px-4 text-clay-text-secondary text-sm">
                          {new Date(user.lastLogin).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ClayCard>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <ClayCard elevated>
              <h3 className="text-lg font-semibold text-clay-text-primary mb-4">System Status</h3>
              <div className="space-y-3">
                {systemHealth?.services?.map((service: any) => (
                  <div key={service.name} className="flex items-center justify-between p-4 bg-clay-bg-tertiary rounded-lg">
                    <div>
                      <p className="font-medium text-clay-text-primary">{service.name}</p>
                      <p className="text-sm text-clay-text-secondary">Uptime: {service.uptime}%</p>
                    </div>
                    <ClayBadge variant={service.status === 'healthy' ? 'success' : 'warning'}>
                      {service.status}
                    </ClayBadge>
                  </div>
                ))}
              </div>
            </ClayCard>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ClayCard elevated>
              <p className="text-sm text-clay-text-secondary mb-2">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold text-green-500">${billingMetrics?.mrr}</p>
            </ClayCard>

            <ClayCard elevated>
              <p className="text-sm text-clay-text-secondary mb-2">Annual Recurring Revenue</p>
              <p className="text-3xl font-bold text-green-500">${billingMetrics?.arr}</p>
            </ClayCard>

            <ClayCard elevated>
              <p className="text-sm text-clay-text-secondary mb-2">Churn Rate</p>
              <p className="text-3xl font-bold text-orange-500">{billingMetrics?.churnRate}%</p>
            </ClayCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
