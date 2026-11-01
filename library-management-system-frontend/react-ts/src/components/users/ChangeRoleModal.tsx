import React, { useState } from 'react';
import type { Role, UserResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, StatusBadge, Alert, Card } from '../common';

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: UserResponse | null;
  currentAdminCount: number;
  onClose: () => void;
  onConfirm: (id: number, newRole: Role) => Promise<void>;
  isPending: boolean;
}

const AVAILABLE_ROLES: {
  role: Role;
  label: string;
  description: string;
  variant: 'success' | 'info' | 'neutral';
}[] = [
  {
    role: 'MEMBER',
    label: 'Member',
    description: 'Can browse catalogues, request books, and view personal borrowing history.',
    variant: 'success',
  },
  {
    role: 'LIBRARIAN',
    label: 'Librarian',
    description: 'Can manage catalog inventory, approve/reject borrow and return requests, and issue loans.',
    variant: 'neutral',
  },
  {
    role: 'ADMIN',
    label: 'Administrator',
    description: 'Full administrative access including user management, system metrics, and catalogue control.',
    variant: 'info',
  },
];

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  user,
  currentAdminCount,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const activeRole = selectedRole ?? user.role;

  const handleClose = () => {
    setServerError(null);
    setSelectedRole(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!activeRole || activeRole === user.role) return;
    setServerError(null);
    try {
      await onConfirm(user.id, activeRole);
      handleClose();
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(
          err,
          'Failed to update user role. Please verify administrative safeguards.'
        )
      );
    }
  };

  const isLastActiveAdminDemotion =
    user.role === 'ADMIN' &&
    user.status === 'ACTIVE' &&
    currentAdminCount <= 1 &&
    activeRole !== 'ADMIN';

  const isUnchanged = activeRole === user.role;

  const footer = (
    <div className="flex items-center justify-end space-x-3 w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleConfirm}
        isLoading={isPending}
        disabled={isPending || isUnchanged || isLastActiveAdminDemotion}
      >
        Save Role Change
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modify User Role"
      description="Update authorization role and permission tier for this account."
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* User Context Card */}
        <Card className="p-3.5 bg-surface-subtle text-xs flex items-center justify-between">
          <div>
            <div className="font-semibold text-text text-sm">{user.name}</div>
            <div className="text-text-secondary font-mono text-[11px] mt-0.5">{user.email}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
              Current Role
            </div>
            <span className="inline-block mt-0.5">
              <StatusBadge
                variant={
                  user.role === 'ADMIN'
                    ? 'info'
                    : user.role === 'LIBRARIAN'
                    ? 'neutral'
                    : 'success'
                }
                label={user.role}
                size="sm"
              />
            </span>
          </div>
        </Card>

        {/* Server Error Alert */}
        {serverError && (
          <Alert variant="danger">
            {serverError}
          </Alert>
        )}

        {/* Safeguard Warning Banner */}
        {isLastActiveAdminDemotion && (
          <Alert
            variant="warning"
            title="Backend Safeguard Warning"
            description="This user is the only active administrator in the system. The backend will strictly reject demoting them to preserve administrative access."
          />
        )}

        {/* Role Options */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-text">Select New Role</label>
          {AVAILABLE_ROLES.map((item) => {
            const isSelected = activeRole === item.role;
            const isCurrent = user.role === item.role;
            return (
              <label
                key={item.role}
                className={`relative flex items-start p-3.5 rounded-control border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary'
                    : 'border-border bg-surface hover:border-border-strong'
                }`}
              >
                <input
                  type="radio"
                  name="user-role"
                  value={item.role}
                  checked={isSelected}
                  onChange={() => setSelectedRole(item.role)}
                  className="mt-0.5 h-4 w-4 text-primary border-border focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isPending}
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-text text-xs">{item.label}</span>
                    <StatusBadge variant={item.variant} label={item.role} size="sm" />
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-text-muted bg-surface-subtle px-1.5 py-0.5 rounded-sm border border-border">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ChangeRoleModal;
