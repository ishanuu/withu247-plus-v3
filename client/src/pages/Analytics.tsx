import React from 'react';
import { Link } from 'wouter';
import { ClayCard } from '../components/Clay/ClayCard';
import { ClayButton } from '../components/Clay/ClayButton';
import { ClayBadge } from '../components/Clay/ClayBadge';
import { trpc } from '../lib/trpc';
import '../styles/claymorphism.css';

export const Analytics: React.FC = () => {
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month'>('week');

  const { data: analytics, isLoading } = trpc.tenant.analytics.useQuery({ period });

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-bg-primary via-clay-bg-secondary to-clay-bg-tertiary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-clay-text-primary mb-2">Analytics</h1>
            <p className="text-clay-text-secondary">API usage and performance metrics</p>
          </div>
          <div className="flex gap-3">
            {(['day', 'week', 'month'] as const).map((p) => (
              <ClayButton
                key={p}
                variant={period === p ? 'primary' : 'secondary'}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </ClayButton>
            ))}
            <Link href="/dashboard">
              <ClayButton variant="secondary">Back</ClayButton>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Requests */}
          <ClayCard elevated>
            <p className="text-sm text-clay-text-secondary mb-2">Total Requests</p>
            {isLoading ? (
              <div className="h-8 bg-clay-skeleton rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-clay-text-primary">
                {analytics?.totalRequests?.toLocaleString()}
              </p>
            )}
          </ClayCard>

          {/* Success Rate */}
          <ClayCard elevated>
            <p className="text-sm text-clay-text-secondary mb-2">Success Rate</p>
            {isLoading ? (
              <div className="h-8 bg-clay-skeleton rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-green-500">
                {((analytics?.successfulRequests / analytics?.totalRequests) * 100).toFixed(1)}%
              </p>
            )}
          </ClayCard>

          {/* Avg Response Time */}
          <ClayCard elevated>
            <p className="text-sm text-clay-text-secondary mb-2">Avg Response Time</p>
            {isLoading ? (
              <div className="h-8 bg-clay-skeleton rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-clay-text-primary">
                {analytics?.averageResponseTime}ms
              </p>
            )}
          </ClayCard>

          {/* P99 Response Time */}
          <ClayCard elevated>
            <p className="text-sm text-clay-text-secondary mb-2">P99 Response Time</p>
            {isLoading ? (
              <div className="h-8 bg-clay-skeleton rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-clay-text-primary">
                {analytics?.p99ResponseTime}ms
              </p>
            )}
          </ClayCard>
        </div>

        {/* Response Time Distribution */}
        <ClayCard elevated className="mb-6">
          <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Response Time Distribution</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-clay-skeleton rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-clay-text-secondary">P50 (Median)</p>
                  <p className="text-sm font-semibold text-clay-text-primary">~{analytics?.averageResponseTime}ms</p>
                </div>
                <div className="w-full bg-clay-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                    style={{ width: '30%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-clay-text-secondary">P95</p>
                  <p className="text-sm font-semibold text-clay-text-primary">~{analytics?.p95ResponseTime}ms</p>
                </div>
                <div className="w-full bg-clay-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-clay-text-secondary">P99</p>
                  <p className="text-sm font-semibold text-clay-text-primary">~{analytics?.p99ResponseTime}ms</p>
                </div>
                <div className="w-full bg-clay-bg-tertiary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                    style={{ width: '90%' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </ClayCard>

        {/* Top Endpoints */}
        <ClayCard elevated>
          <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Top Endpoints</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-clay-skeleton rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {analytics?.topEndpoints?.map((endpoint: any) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between p-4 bg-clay-bg-tertiary rounded-lg">
                  <div>
                    <p className="font-medium text-clay-text-primary font-mono">{endpoint.endpoint}</p>
                    <p className="text-sm text-clay-text-secondary">Avg: {endpoint.avgTime}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-clay-text-primary">{endpoint.requests.toLocaleString()}</p>
                    <p className="text-xs text-clay-text-secondary">requests</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ClayCard>
      </div>
    </div>
  );
};

export default Analytics;
