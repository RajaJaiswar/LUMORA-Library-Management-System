import React, { useState } from 'react';
import type { UserResponse, UserStatus } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, StatusBadge, Alert, Card } from '../common';

interface ToggleStatusModalProps {
  isOpen: boolean;
  user: UserResponse | null;
  isCurrentUser: boolean;
  currentAdminCount: number;
  onClose: () => void;
  onConfirm: (id: number, newStatus: UserStatus) => Promise<void>;
  isPending: boolean;
}

export const ToggleStatusModal: React.FC<ToggleStatusModalProps> = ({
  isOpen,
  user,
  isCurrentUser,
  currentAdminCount,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isDeactivating = user.status === 'ACTIVE';
  const targetStatus: UserStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

  const isSelfDeactivation = isDeactivating && isCurrentUser;
  const isLastAdminDeactivation =
    isDeactivating && user.role === 'ADMIN' && currentAdminCount <= 1;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setServerError(null);
    try {
      await onConfirm(user.id, targetStatus);
      handleClose();
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(
          err,
          'Failed to update user status. Please verify account status rules and safeguards.'
        )
      );
    }
  };

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
        variant={isDeactivating ? 'danger' : 'primary'}
        size="sm"
        onClick={handleConfirm}
        isLoading={isPending}
        disabled={isPending || isSelfDeactivation || isLastAdminDeactivation}
      >
        {isDeactivating ? 'Confirm Deactivation' : 'Confirm Activation'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isDeactivating ? 'Deactivate User Account' : 'Activate User Account'}
      description={
        isDeactivating
          ? 'Suspend user authentication and prevent system access.'
          : 'Restore user access and allow immediate authentication.'
      }
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* User Details */}
        <Card className="p-3.5 bg-surface-subtle text-xs space-y-1">
          <div className="font-semibold text-text text-sm flex items-center space-x-2">
            <span>{user.name}</span>
            {isCurrentUser && (
              <span className="text-[10px] bg-primary-soft text-primary font-semibold px-2 py-0.5 rounded-full border border-primary-border">
                You
              </span>
            )}
          </div>
          <div className="text-text-secondary font-mono text-[11px]">{user.email}</div>
          <div className="pt-2 flex items-center justify-between border-t border-border mt-2">
            <span className="text-text-secondary flex items-center space-x-1.5">
              <span>Role:</span>
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
            <span className="flex items-center space-x-1.5">
              <span className="text-text-secondary">Current Status:</span>
              <StatusBadge
                variant={user.status === 'ACTIVE' ? 'success' : 'neutral'}
                label={user.status}
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

        {/* Self-Deactivation Guard Banner */}
        {isSelfDeactivation && (
          <Alert
            variant="danger"
            title="Self-Deactivation Prohibited"
            description="You cannot deactivate your own account. The backend safeguard strictly rejects this action to prevent administrative lockout."
          />
        )}

        {/* Last Active Admin Guard Banner */}
        {!isSelfDeactivation && isLastAdminDeactivation && (
          <Alert
            variant="warning"
            title="Last Active Administrator Guard"
            description="This user is the only active administrator. The backend will reject deactivation to ensure continued system administration."
          />
        )}

        {/* Policy Notice */}
        <Alert
          variant="info"
          title="Security Notice"
          description={
            isDeactivating
              ? 'Deactivated accounts cannot authenticate. In-flight token refreshes will be blocked immediately upon status change.'
              : 'Reactivating this account restores full system access with their existing role privileges.'
          }
        />
      </div>
    </Modal>
  );
};

export default ToggleStatusModal;
