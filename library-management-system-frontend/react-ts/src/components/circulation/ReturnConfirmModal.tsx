import React, { useState } from 'react';
import type { BorrowResponse } from '../../types';
import { formatDate, formatCurrency, getDueStatus } from '../../utils/formatUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, Card, StatusBadge, Alert } from '../common';

interface ReturnConfirmModalProps {
  isOpen: boolean;
  loan: BorrowResponse | null;
  onClose: () => void;
  onConfirm: (borrowId: number) => Promise<void>;
  isPending: boolean;
}

export const ReturnConfirmModal: React.FC<ReturnConfirmModalProps> = ({
  isOpen,
  loan,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !loan) return null;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setServerError(null);
    try {
      await onConfirm(loan.id);
      handleClose();
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(
          err,
          'Failed to submit return request. Please check whether a return request is already pending.'
        )
      );
    }
  };

  const dueInfo = getDueStatus(loan.dueDate, loan.status === 'RETURNED');
  const hasFine = Boolean(loan.fine && loan.fine > 0);

  const footer = (
    <div className="flex items-center justify-end space-x-3 w-full">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClose}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleConfirm}
        isLoading={isPending}
        disabled={isPending}
      >
        Confirm Return Request
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Return Request"
      description="Initiate book check-in process for library desk staff verification."
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Server Error Alert */}
        {serverError && (
          <Alert variant="danger" title="Return Request Failed" description={serverError} />
        )}

        {/* Loan Details Box */}
        <Card className="p-4 bg-surface-subtle border border-border space-y-2 text-xs">
          <div className="font-semibold text-text text-sm leading-snug">
            {loan.bookTitle}
          </div>
          <div className="grid grid-cols-2 gap-2 text-text-secondary pt-2 border-t border-border">
            <div>
              <span className="text-text-muted">Loan ID: </span>
              <span className="font-mono font-medium text-text tabular-nums">#{loan.id}</span>
            </div>
            <div>
              <span className="text-text-muted">Issue Date: </span>
              <span className="font-medium text-text tabular-nums">{formatDate(loan.issueDate)}</span>
            </div>
            <div>
              <span className="text-text-muted">Due Date: </span>
              <span className="font-medium text-text tabular-nums">{formatDate(loan.dueDate)}</span>
            </div>
            <div>
              <span className="text-text-muted">Status: </span>
              {dueInfo.isOverdue ? (
                <StatusBadge variant="danger" size="sm" label={`Overdue (${dueInfo.days}d)`} />
              ) : (
                <StatusBadge variant="success" size="sm" label="Current" />
              )}
            </div>
            {hasFine && (
              <div className="col-span-2 pt-1 border-t border-border">
                <span className="text-text-muted">Accrued Fine: </span>
                <span className="font-bold text-danger tabular-nums">{formatCurrency(loan.fine)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Instructions Banner */}
        <Alert variant="warning" title="Important Physical Return Notice">
          <ul className="list-disc list-inside space-y-1 text-text-secondary text-xs mt-1">
            <li>
              Submitting this request alerts library staff that you are ready to return the book.
            </li>
            <li>
              <strong className="text-text">The loan remains active</strong> on your account until you physically present the book at the circulation desk for staff check-in.
            </li>
            <li>
              Any overdue fines will be finalized upon physical book return.
            </li>
          </ul>
        </Alert>
      </div>
    </Modal>
  );
};

export default ReturnConfirmModal;
