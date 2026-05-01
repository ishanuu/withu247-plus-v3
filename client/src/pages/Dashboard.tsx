import React from 'react';
import { Link } from 'wouter';
import { ClayCard } from '../components/Clay/ClayCard';
import { ClayButton } from '../components/Clay/ClayButton';
import { ClayBadge } from '../components/Clay/ClayBadge';
import { trpc } from '../lib/trpc';
import '../styles/claymorphism.css';

export const Dashboard: React.FC = () => {
  // Fetch user, tenant info, and usage data
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: tenant, isLoading: tenantLoading } = trpc.tenant.info.useQuery();
  const { data: usage, isLoading: usageLoading } = trpc.tenant.usage.useQuery();
  const { data: tenantUsers } = trpc.tenant.users.useQuery({ limit: 5, offset: 0 });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in first</p>
      </div>
    );
  }

  const isLoading = userLoading || tenantLoading || usageLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-bg-primary via-clay-bg-secondary to-clay-bg-tertiary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-clay-text-primary mb-2">Dashboard</h1>
            <p className="text-clay-text-secondary">Welcome back, {user?.name || user?.email}</p>
          </div>
          <div className="flex gap-3">
            <ClayButton variant="secondary">Settings</ClayButton>
            <ClayButton variant="primary">
              <Link href="/logout">Logout</Link>
            </ClayButton>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tenant Info Card */}
          <ClayCard elevated>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-clay-text-primary">Tenant Information</h3>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-clay-skeleton rounded"></div>
                <div className="h-4 bg-clay-skeleton rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-clay-text-secondary">Tenant Name</p>
                  <p className="text-lg font-semibold text-clay-text-primary">{tenant?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-clay-text-secondary">Plan</p>
                  <ClayBadge variant="primary">{tenant?.plan?.toUpperCase()}</ClayBadge>
                </div>
                <div>
                  <p className="text-sm text-clay-text-secondary">Domain</p>
                  <p className="text-sm text-clay-text-primary font-mono">{tenant?.domain}</p>
                </div>
              </div>
            )}
          </ClayCard>

          {/* Usage Card */}
          <ClayCard elevated>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-clay-text-primary">API Usage</h3>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-clay-skeleton rounded"></div>
                <div className="h-4 bg-clay-skeleton rounded"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-clay-text-secondary">Requests</p>
                    <p className="text-sm font-semibold text-clay-text-primary">
                      {usage?.currentUsage} / {usage?.rateLimit}
                    </p>
                  </div>
                  <div className="w-full bg-clay-bg-tertiary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-clay-accent-warm to-clay-accent-vibrant h-2 rounded-full"
                      style={{ width: `${usage?.percentageUsed || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-clay-text-secondary">Reset In</p>
                  <p className="text-sm text-clay-text-primary">{usage?.resetAt}</p>
                </div>
              </div>
            )}
          </ClayCard>

          {/* Quick Stats */}
          <ClayCard elevated>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-clay-text-primary">Quick Stats</h3>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-clay-skeleton rounded"></div>
                <div className="h-4 bg-clay-skeleton rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-clay-text-secondary">Active Users</p>
                  <p className="text-2xl font-bold text-clay-text-primary">{usage?.currentUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-clay-text-secondary">User Limit</p>
                  <p className="text-sm text-clay-text-primary">{usage?.maxUsers} total</p>
                </div>
              </div>
            )}
          </ClayCard>
        </div>

        {/* Users Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClayCard elevated>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-clay-text-primary">Recent Users</h3>
              <Link href="/users">
                <span className="text-sm text-clay-primary hover:underline cursor-pointer">View All</span>
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-clay-skeleton rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {tenantUsers?.users?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-clay-bg-tertiary rounded-lg">
                    <div>
                      <p className="font-medium text-clay-text-primary">{u.name}</p>
                      <p className="text-sm text-clay-text-secondary">{u.email}</p>
                    </div>
                    <ClayBadge variant={u.role === 'admin' ? 'primary' : 'default'}>
                      {u.role}
                    </ClayBadge>
                  </div>
                ))}
              </div>
            )}
          </ClayCard>

          {/* Features Section */}
          <ClayCard elevated>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-clay-text-primary">Available Features</h3>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-clay-skeleton rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {tenant?.features?.map((feature: string) => (
                  <div key={feature} className="flex items-center p-3 bg-clay-bg-tertiary rounded-lg">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-clay-text-primary capitalize">{feature.replace(/-/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </ClayCard>
        </div>

        {/* Plan Upgrade Section */}
        {tenant?.plan !== 'enterprise' && (
          <ClayCard elevated className="mt-6 bg-gradient-to-r from-clay-accent-warm to-clay-accent-vibrant text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Upgrade Your Plan</h3>
                <p className="opacity-90">Get access to advanced features and higher limits</p>
              </div>
              <Link href="/billing">
                <ClayButton variant="secondary" className="bg-white text-clay-text-primary">
                  View Plans
                </ClayButton>
              </Link>
            </div>
          </ClayCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
