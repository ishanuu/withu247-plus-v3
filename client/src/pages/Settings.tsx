import React, { useState } from 'react';
import { Link } from 'wouter';
import { ClayCard } from '../components/Clay/ClayCard';
import { ClayButton } from '../components/Clay/ClayButton';
import { ClayInput } from '../components/Clay/ClayInput';
import { ClayBadge } from '../components/Clay/ClayBadge';
import { trpc } from '../lib/trpc';
import '../styles/claymorphism.css';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'api-keys' | 'webhooks'>('general');
  const [newKeyName, setNewKeyName] = useState('');

  const { data: settings, isLoading: settingsLoading } = trpc.tenant.settings.useQuery();
  const { data: apiKeys, isLoading: keysLoading } = trpc.tenant.apiKeys.useQuery();
  const { data: webhooks } = trpc.tenant.webhookEvents.useQuery({ limit: 10, offset: 0 });

  const updateSettingsMutation = trpc.tenant.updateSettings.useMutation();
  const createKeyMutation = trpc.tenant.createApiKey.useMutation();
  const deleteKeyMutation = trpc.tenant.deleteApiKey.useMutation();

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    await createKeyMutation.mutateAsync({ name: newKeyName });
    setNewKeyName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-bg-primary via-clay-bg-secondary to-clay-bg-tertiary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-clay-text-primary mb-2">Settings</h1>
            <p className="text-clay-text-secondary">Manage your workspace settings</p>
          </div>
          <Link href="/dashboard">
            <ClayButton variant="secondary">Back</ClayButton>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-clay-border">
          {(['general', 'api-keys', 'webhooks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition ${
                activeTab === tab
                  ? 'text-clay-primary border-b-2 border-clay-primary'
                  : 'text-clay-text-secondary hover:text-clay-text-primary'
              }`}
            >
              {tab === 'api-keys' ? 'API Keys' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <ClayCard elevated>
              <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Workspace Settings</h3>
              {settingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-clay-skeleton rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <ClayInput
                    label="Workspace Name"
                    value={settings?.name || ''}
                    onChange={(value) => updateSettingsMutation.mutate({ name: value })}
                  />
                  <ClayInput
                    label="Email"
                    type="email"
                    value={settings?.email || ''}
                    disabled
                  />
                  <div>
                    <label className="block text-sm font-medium text-clay-text-primary mb-2">Timezone</label>
                    <select className="clay-input w-full">
                      <option>UTC</option>
                      <option>EST</option>
                      <option>CST</option>
                      <option>PST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-clay-text-primary mb-2">Theme</label>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg border-2 border-clay-primary bg-clay-primary text-white">
                        Dark
                      </button>
                      <button className="px-4 py-2 rounded-lg border-2 border-clay-border text-clay-text-primary hover:border-clay-primary">
                        Light
                      </button>
                    </div>
                  </div>
                  <ClayButton variant="primary" onClick={() => updateSettingsMutation.mutate({})}>
                    Save Changes
                  </ClayButton>
                </div>
              )}
            </ClayCard>

            {/* Notifications */}
            <ClayCard elevated>
              <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-clay-text-primary">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-clay-text-primary">Slack notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-clay-text-primary">Webhook events</span>
                </label>
              </div>
            </ClayCard>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <ClayCard elevated>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-clay-text-primary">API Keys</h3>
                <ClayButton variant="primary" size="sm">
                  Generate New Key
                </ClayButton>
              </div>

              {keysLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-clay-skeleton rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys?.keys?.map((key: any) => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-clay-bg-tertiary rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-clay-text-primary">{key.name}</p>
                        <p className="text-xs font-mono text-clay-text-secondary mt-1">{key.key}</p>
                        <p className="text-xs text-clay-text-secondary mt-2">
                          Last used: {new Date(key.lastUsed).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteKeyMutation.mutate({ keyId: key.id })}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ClayCard>

            {/* Create New Key */}
            <ClayCard elevated>
              <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Create New API Key</h3>
              <div className="space-y-4">
                <ClayInput
                  label="Key Name"
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={setNewKeyName}
                />
                <ClayButton
                  variant="primary"
                  onClick={handleCreateKey}
                  loading={createKeyMutation.isPending}
                >
                  Create Key
                </ClayButton>
              </div>
            </ClayCard>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <ClayCard elevated>
              <h3 className="text-lg font-semibold text-clay-text-primary mb-4">Recent Webhook Events</h3>
              <div className="space-y-3">
                {webhooks?.events?.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-clay-bg-tertiary rounded-lg">
                    <div>
                      <p className="font-medium text-clay-text-primary font-mono">{event.event}</p>
                      <p className="text-xs text-clay-text-secondary mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <ClayBadge variant={event.status === 'success' ? 'success' : 'warning'}>
                      {event.status}
                    </ClayBadge>
                  </div>
                ))}
              </div>
            </ClayCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
