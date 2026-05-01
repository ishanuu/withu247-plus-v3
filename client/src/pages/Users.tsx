import React, { useState } from 'react';
import { Link } from 'wouter';
import { ClayCard } from '../components/Clay/ClayCard';
import { ClayButton } from '../components/Clay/ClayButton';
import { ClayInput } from '../components/Clay/ClayInput';
import { ClayBadge } from '../components/Clay/ClayBadge';
import { trpc } from '../lib/trpc';
import '../styles/claymorphism.css';

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data: usersData, isLoading } = trpc.tenant.users.useQuery({
    limit,
    offset: page * limit,
  });

  const filteredUsers = usersData?.users?.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-bg-primary via-clay-bg-secondary to-clay-bg-tertiary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-clay-text-primary mb-2">Users</h1>
            <p className="text-clay-text-secondary">Manage tenant users and permissions</p>
          </div>
          <div className="flex gap-3">
            <ClayButton variant="primary">Add User</ClayButton>
            <Link href="/dashboard">
              <ClayButton variant="secondary">Back</ClayButton>
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <ClayCard className="mb-6">
          <ClayInput
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={setSearchTerm}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </ClayCard>

        {/* Users Table */}
        <ClayCard elevated>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
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
                    <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-clay-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="border-b border-clay-border hover:bg-clay-bg-tertiary transition">
                      <td className="py-3 px-4 text-clay-text-primary">{user.name}</td>
                      <td className="py-3 px-4 text-clay-text-secondary">{user.email}</td>
                      <td className="py-3 px-4">
                        <ClayBadge variant={user.role === 'admin' ? 'primary' : 'default'}>
                          {user.role}
                        </ClayBadge>
                      </td>
                      <td className="py-3 px-4 text-clay-text-secondary text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-clay-primary hover:underline text-sm">Edit</button>
                          <button className="text-red-500 hover:underline text-sm">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-clay-border">
            <p className="text-sm text-clay-text-secondary">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, usersData?.total || 0)} of {usersData?.total || 0} users
            </p>
            <div className="flex gap-2">
              <ClayButton
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </ClayButton>
              <ClayButton
                variant="secondary"
                disabled={!usersData || (page + 1) * limit >= usersData.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </ClayButton>
            </div>
          </div>
        </ClayCard>
      </div>
    </div>
  );
};

export default Users;
