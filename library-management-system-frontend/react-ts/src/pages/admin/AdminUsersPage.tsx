import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAllUsers, useUpdateUserRole, useUpdateUserStatus } from '../../hooks/useUsers';
import { UserTable } from '../../components/users/UserTable';
import { ChangeRoleModal } from '../../components/users/ChangeRoleModal';
import { ToggleStatusModal } from '../../components/users/ToggleStatusModal';
import { Button, StatusBadge, Card, Alert } from '../../components/common';
import { useToast } from '../../components/common/Toast';
import { StatCard } from '../../components/dashboard/StatCard';
import type { Role, UserResponse, UserStatus } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, isFetching, error, refetch } = useAllUsers();
  const { toast } = useToast();

  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();

  // Modal states
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserResponse | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [selectedUserForStatus, setSelectedUserForStatus] = useState<UserResponse | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // KPI Calculations
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveUsers = users.filter((u) => u.status === 'INACTIVE').length;
  const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.status === 'ACTIVE').length;
  const totalLibrarians = users.filter((u) => u.role === 'LIBRARIAN').length;
  const totalMembers = users.filter((u) => u.role === 'MEMBER').length;

  const handleOpenChangeRole = (user: UserResponse) => {
    setSelectedUserForRole(user);
    setIsRoleModalOpen(true);
  };

  const handleOpenToggleStatus = (user: UserResponse) => {
    setSelectedUserForStatus(user);
    setIsStatusModalOpen(true);
  };

  const handleConfirmRoleChange = async (id: number, newRole: Role) => {
    const updated = await updateRoleMutation.mutateAsync({
      id,
      request: { role: newRole },
    });
    toast.success(`Successfully updated ${updated.name}'s role to ${updated.role}.`);
  };

  const handleConfirmStatusToggle = async (id: number, newStatus: UserStatus) => {
    const updated = await updateStatusMutation.mutateAsync({
      id,
      request: { status: newStatus },
    });
    toast.success(
      `Successfully ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} ${updated.name}'s account.`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <StatusBadge variant="info" label="Admin Exclusive" size="sm" />
            <span className="text-text-muted">|</span>
            <span className="text-xs text-text-secondary font-medium">RBAC Directory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl mt-1">
            User Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Administer system user accounts, privilege tiers (RBAC), and access activation states.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            title="Refresh user directory"
            leftIcon={
              <svg
                className={`h-4 w-4 text-text-secondary ${isFetching ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <StatCard
          title="Total Accounts"
          value={totalUsers}
          subtitle="Registered system users"
          colorTone="indigo"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        {/* Active Accounts */}
        <StatCard
          title="Active Access"
          value={activeUsers}
          subtitle="Authorized to login"
          colorTone="emerald"
          badge={{ text: 'Active', variant: 'success' }}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* Inactive Accounts */}
        <StatCard
          title="Inactive / Suspended"
          value={inactiveUsers}
          subtitle="Session access revoked"
          colorTone={inactiveUsers > 0 ? 'rose' : 'slate'}
          badge={inactiveUsers > 0 ? { text: 'Suspended', variant: 'danger' } : undefined}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          }
        />

        {/* Role Distribution */}
        <Card className="p-5 transition hover:border-border-strong hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Role Distribution
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-control bg-info-soft text-info">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2 text-xs font-semibold text-text tabular-nums">
            <span title="Active Admins" className="text-primary font-bold">
              {activeAdmins} Admin{activeAdmins === 1 ? '' : 's'}
            </span>
            <span className="text-text-muted">•</span>
            <span title="Total Librarians" className="text-info font-bold">
              {totalLibrarians} Lib
            </span>
            <span className="text-text-muted">•</span>
            <span title="Total Members" className="text-success font-bold">
              {totalMembers} Mem
            </span>
          </div>
          <p className="mt-1.5 text-xs text-text-secondary tabular-nums">
            Active Admins: <strong className="text-text font-semibold">{activeAdmins}</strong>
          </p>
        </Card>
      </div>

      {/* Query Error State */}
      {error && (
        <Alert
          variant="danger"
          title="Failed to load user directory"
          description={error.message || 'Ensure your account possesses the ADMIN authority.'}
        />
      )}

      {/* User Directory Table */}
      <UserTable
        users={users}
        currentUserId={currentUser?.id}
        currentAdminCount={activeAdmins}
        onOpenChangeRole={handleOpenChangeRole}
        onOpenToggleStatus={handleOpenToggleStatus}
        isLoading={isLoading}
      />

      {/* Modals */}
      <ChangeRoleModal
        isOpen={isRoleModalOpen}
        user={selectedUserForRole}
        currentAdminCount={activeAdmins}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUserForRole(null);
        }}
        onConfirm={handleConfirmRoleChange}
        isPending={updateRoleMutation.isPending}
      />

      <ToggleStatusModal
        isOpen={isStatusModalOpen}
        user={selectedUserForStatus}
        isCurrentUser={currentUser?.id !== undefined && selectedUserForStatus?.id === currentUser.id}
        currentAdminCount={activeAdmins}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedUserForStatus(null);
        }}
        onConfirm={handleConfirmStatusToggle}
        isPending={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default AdminUsersPage;
