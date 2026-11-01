import React, { useState, useMemo } from 'react';
import type { Role, UserResponse, UserStatus } from '../../types';
import { formatDate } from '../../utils/formatUtils';
import { Button, Input, StatusBadge, Card, Select } from '../common';

interface UserTableProps {
  users: UserResponse[];
  currentUserId?: number;
  currentAdminCount: number;
  onOpenChangeRole: (user: UserResponse) => void;
  onOpenToggleStatus: (user: UserResponse) => void;
  isLoading: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUserId,
  onOpenChangeRole,
  onOpenToggleStatus,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter users client-side
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, safePage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <StatusBadge variant="info" label="ADMIN" size="sm" />;
      case 'LIBRARIAN':
        return <StatusBadge variant="neutral" label="LIBRARIAN" size="sm" />;
      case 'MEMBER':
      default:
        return <StatusBadge variant="success" label="MEMBER" size="sm" />;
    }
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <StatusBadge variant="success" dot={true} label="Active" size="sm" />;
      case 'INACTIVE':
      default:
        return <StatusBadge variant="neutral" dot={true} label="Inactive" size="sm" />;
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface-subtle/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search bar */}
          <div className="w-full md:max-w-md">
            <Input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search users by name or email..."
              inputSize="sm"
              aria-label="Search users by name or email"
              leftIcon={
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center space-x-1.5">
              <label htmlFor="role-filter" className="text-xs font-medium text-text-secondary">
                Role:
              </label>
              <Select
                id="role-filter"
                value={roleFilter}
                onChange={handleRoleFilterChange}
                selectSize="sm"
                aria-label="Filter users by role"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="LIBRARIAN">LIBRARIAN</option>
                <option value="MEMBER">MEMBER</option>
              </Select>
            </div>

            <div className="flex items-center space-x-1.5">
              <label htmlFor="status-filter" className="text-xs font-medium text-text-secondary">
                Status:
              </label>
              <Select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                selectSize="sm"
                aria-label="Filter users by status"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </Select>
            </div>

            {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div
        className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
        tabIndex={0}
        role="region"
        aria-label="Users directory table"
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              <th className="py-3.5 px-4 sm:px-6">User</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Registered</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface text-text">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted">
                  <div className="inline-flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Loading users directory...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="h-10 w-10 mx-auto rounded-full bg-surface-subtle flex items-center justify-center text-text-muted">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-text">No users match criteria</p>
                    <p className="text-[11px] text-text-secondary">
                      Try updating your search query or adjusting role and status filters.
                    </p>
                    {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                      <div className="pt-2">
                        <Button variant="secondary" size="sm" onClick={clearFilters}>
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const isCurrentUser = currentUserId !== undefined && u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-surface-subtle/80 transition-colors ${
                      isCurrentUser ? 'bg-primary-soft/30' : ''
                    }`}
                  >
                    {/* User Name & Initials */}
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            u.role === 'ADMIN'
                              ? 'bg-primary-soft text-primary border border-primary-border'
                              : u.role === 'LIBRARIAN'
                              ? 'bg-info-soft text-info border border-sky-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-text flex items-center space-x-1.5">
                            <span>{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-semibold bg-primary-soft text-primary px-1.5 py-0.5 rounded-full border border-primary-border">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-text-muted tabular-nums">ID #{u.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-[11px] text-text-secondary">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">{renderRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td className="py-3 px-4">{renderStatusBadge(u.status)}</td>

                    {/* Registered Date */}
                    <td className="py-3 px-4 text-text-secondary text-[11px] tabular-nums">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        {/* Change Role Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onOpenChangeRole(u)}
                          title="Modify user access role"
                        >
                          Change Role
                        </Button>

                        {/* Toggle Status Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onOpenToggleStatus(u)}
                          className={
                            u.status === 'ACTIVE'
                              ? 'text-danger hover:bg-danger-soft hover:border-red-300'
                              : 'text-success hover:bg-success-soft hover:border-emerald-300'
                          }
                          title={
                            isCurrentUser && u.status === 'ACTIVE'
                              ? 'Self-deactivation is prohibited by backend safeguards'
                              : u.status === 'ACTIVE'
                              ? 'Deactivate account'
                              : 'Reactivate account'
                          }
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer */}
      {!isLoading && totalItems > 0 && (
        <div className="p-4 sm:p-5 border-t border-border bg-surface-subtle/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-text-secondary">
          <div className="flex items-center space-x-2">
            <span className="tabular-nums">
              Showing {(safePage - 1) * pageSize + 1} to{' '}
              {Math.min(safePage * pageSize, totalItems)} of {totalItems} users
            </span>
            <span className="text-text-muted">|</span>
            <div className="flex items-center space-x-1.5">
              <span>Show</span>
              <Select<number>
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                selectSize="sm"
                aria-label="Users per page"
                className="w-16"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <span className="font-semibold text-text tabular-nums">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserTable;
