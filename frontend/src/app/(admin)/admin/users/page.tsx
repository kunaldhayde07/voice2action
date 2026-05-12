'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  UserX,
  UserCheck,
  Crown,
  RefreshCw,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { User } from '@/types';
import { Avatar } from '@/components/shared/Avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableRowSkeleton } from '@/components/shared/SkeletonCard';
import {
  cn,
  timeAgo,
  formatDate,
  getBadgeLevel,
  getBadgeConfig,
  formatNumber,
} from '@/lib/utils';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'role';
    userId: string;
    currentValue: string | boolean;
    newValue: string | boolean;
    userName: string;
  } | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const { searchValue, handleSearch } = useDebouncedSearch(
    (value) => {
      setPage(1);
      fetchUsers(value);
    },
    400
  );

  const fetchUsers = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 15 };
        if (roleFilter) params.role = roleFilter;
        if (search !== undefined ? search : searchValue)
          params.search = search ?? searchValue;

        const response = await adminApi.getAllUsers(params);
        setUsers(response.data.data.data);
        setTotal(response.data.data.pagination.total);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    },
    [page, roleFilter, searchValue]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setIsActioning(true);

    try {
      if (confirmAction.type === 'toggle') {
        await adminApi.toggleUserStatus(confirmAction.userId);
        toast.success(
          `User ${confirmAction.newValue ? 'activated' : 'deactivated'}`
        );
      } else {
        await adminApi.updateUserRole(
          confirmAction.userId,
          confirmAction.newValue as string
        );
        toast.success(`Role updated to ${confirmAction.newValue}`);
      }
      fetchUsers();
      setConfirmAction(null);
    } catch {
      toast.error('Action failed');
    } finally {
      setIsActioning(false);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        description={`${total} registered citizens`}
        icon={Users}
        actions={
          <button
            onClick={() => fetchUsers()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="civic-card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
        >
          <option value="">All Roles</option>
          <option value="citizen">Citizen</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="civic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['User', 'Role', 'Stats', 'Reputation', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={7} />
                ))
              ) : (
                users.map((user, idx) => {
                  const badgeLevel = getBadgeLevel(user.reputationPoints);
                  const badgeCfg = getBadgeConfig(badgeLevel);

                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar}
                            name={user.name}
                            size="sm"
                            showBadge
                            user={user}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                            user.role === 'super_admin'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : user.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          )}
                        >
                          {user.role === 'super_admin' && <Crown className="w-3 h-3" />}
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                          <p>📋 {user.reportedIssuesCount} reported</p>
                          <p>✅ {user.resolvedIssuesCount} resolved</p>
                          <p>👍 {user.votesCount} votes</p>
                        </div>
                      </td>

                      {/* Reputation */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatNumber(user.reputationPoints)}
                          </p>
                          <span
                            className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                              badgeCfg.bg,
                              badgeCfg.color
                            )}
                          >
                            {badgeCfg.label}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </p>
                        {user.lastLogin && (
                          <p className="text-[10px] text-gray-400">
                            Last: {timeAgo(user.lastLogin)}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                            user.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              user.isActive ? 'bg-green-500' : 'bg-red-500'
                            )}
                          />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Toggle status */}
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'toggle',
                                userId: user._id,
                                currentValue: user.isActive,
                                newValue: !user.isActive,
                                userName: user.name,
                              })
                            }
                            className={cn(
                              'p-1.5 rounded-lg transition-colors text-xs',
                              user.isActive
                                ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500'
                                : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'
                            )}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Promote to admin */}
                          {user.role === 'citizen' && (
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: 'role',
                                  userId: user._id,
                                  currentValue: user.role,
                                  newValue: 'admin',
                                  userName: user.name,
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 transition-colors"
                              title="Make Admin"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}

                          {/* Demote to citizen */}
                          {user.role === 'admin' && (
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: 'role',
                                  userId: user._id,
                                  currentValue: user.role,
                                  newValue: 'citizen',
                                  userName: user.name,
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                              title="Remove Admin"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!isLoading && users.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No users found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type === 'toggle'
            ? `${confirmAction?.newValue ? 'Activate' : 'Deactivate'} User`
            : `Update Role to ${confirmAction?.newValue}`
        }
        description={
          confirmAction?.type === 'toggle'
            ? `Are you sure you want to ${confirmAction?.newValue ? 'activate' : 'deactivate'} ${confirmAction?.userName}?`
            : `Are you sure you want to change ${confirmAction?.userName}'s role to ${confirmAction?.newValue}?`
        }
        confirmLabel="Confirm"
        variant={
          confirmAction?.type === 'toggle' && !confirmAction?.newValue
            ? 'danger'
            : 'warning'
        }
        isLoading={isActioning}
      />
    </div>
  );
}