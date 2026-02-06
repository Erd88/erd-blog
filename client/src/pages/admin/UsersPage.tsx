import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import * as usersApi from '../../api/users';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SEOHead } from '../../components/seo/SEOHead';
import { format } from 'date-fns';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const { users, pagination, isLoading, error, refetch } = useUsers(page);

  const handleRoleChange = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await usersApi.changeRole(id, newRole as 'user' | 'admin');
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change role');
    }
  };

  const handleBanToggle = async (id: number, isBanned: number) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await usersApi.toggleBan(id, !isBanned);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  return (
    <>
      <SEOHead title="Manage Users" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">User</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{user.display_name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.is_banned ? 'danger' : 'success'}>
                          {user.is_banned ? 'Banned' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleRoleChange(user.id, user.role)}>
                            {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </Button>
                          <Button
                            variant={user.is_banned ? 'secondary' : 'danger'}
                            size="sm"
                            onClick={() => handleBanToggle(user.id, user.is_banned)}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && (
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        )}
      </div>
    </>
  );
}
