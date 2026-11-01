import React, { useState } from 'react';
import type { BorrowResponse } from '../../types';
import { formatDate, addDaysToDateString } from '../../utils/formatUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, FormField, Input, Card, Alert } from '../common';

interface ExtendLoanModalProps {
  isOpen: boolean;
  loan: BorrowResponse | null;
  onClose: () => void;
  onConfirm: (payload: { newDueDate: string; reason: string }) => Promise<void>;
  isPending: boolean;
}

interface ExtendLoanFormProps {
  loan: BorrowResponse;
  onClose: () => void;
  onConfirm: (payload: { newDueDate: string; reason: string }) => Promise<void>;
  isPending: boolean;
}

const ExtendLoanForm: React.FC<ExtendLoanFormProps> = ({
  loan,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [newDueDate, setNewDueDate] = useState(() => addDaysToDateString(loan.dueDate, 7));
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Compute allowed date boundaries from current due date
  const minDate = addDaysToDateString(loan.dueDate, 1);
  const maxDate = addDaysToDateString(loan.dueDate, 7);

  const handleClose = () => {
    setValidationError(null);
    setServerError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // Validate inputs
    if (!newDueDate) {
      setValidationError('Please select a new due date.');
      return;
    }

    if (newDueDate <= loan.dueDate) {
      setValidationError('New due date must be after the current due date.');
      return;
    }

    if (newDueDate > maxDate) {
      setValidationError('Extension cannot exceed 7 days from the current due date.');
      return;
    }

    if (!reason.trim()) {
      setValidationError('Please provide a reason for the extension request.');
      return;
    }

    try {
      await onConfirm({
        newDueDate,
        reason: reason.trim(),
      });
      handleClose();
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(
          err,
          'Failed to extend loan. Please verify that this loan has not exceeded the 2-extension limit.'
        )
      );
    }
  };

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
        onClick={handleSubmit}
        isLoading={isPending}
        disabled={isPending}
      >
        Confirm Extension
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Request Loan Extension"
      description="Apply to prolong your borrowing period by up to 7 days from the current due date."
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Server or Validation Errors */}
        {(serverError || validationError) && (
          <Alert variant="danger" title="Extension Error" description={serverError || validationError || undefined} />
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
            <div className="col-span-2">
              <span className="text-text-muted">Current Due Date: </span>
              <span className="font-semibold text-text tabular-nums">{formatDate(loan.dueDate)}</span>
              <span className="text-text-muted font-mono ml-1.5 tabular-nums">({loan.dueDate})</span>
            </div>
          </div>
        </Card>

        {/* New Due Date */}
        <FormField
          label="Requested New Due Date"
          required
          helperText={`Allowed window: ${minDate} to ${maxDate} (up to 7 calendar days).`}
        >
          <Input
            type="date"
            id="newDueDate"
            min={minDate}
            max={maxDate}
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            disabled={isPending}
            inputSize="sm"
            required
            className="font-mono"
          />
        </FormField>

        {/* Reason for Extension */}
        <FormField label="Reason for Extension" required>
          <textarea
            id="reason"
            rows={3}
            placeholder="e.g., Preparing for semester examinations; need additional research time..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
            required
          />
        </FormField>

        {/* Policy Notes */}
        <Alert variant="info" title="Extension Policy Rules">
          <ul className="list-disc list-inside space-y-0.5 text-xs text-text-secondary mt-1">
            <li>Each loan permits a maximum of <strong className="text-text">2 extensions</strong>.</li>
            <li>Extensions must not exceed <strong className="text-text">7 days</strong> per request.</li>
            <li>Overdue items cannot be extended; they must be physically returned.</li>
          </ul>
        </Alert>
      </form>
    </Modal>
  );
};

export const ExtendLoanModal: React.FC<ExtendLoanModalProps> = ({
  isOpen,
  loan,
  onClose,
  onConfirm,
  isPending,
}) => {
  if (!isOpen || !loan) return null;

  return (
    <ExtendLoanForm
      key={loan.id}
      loan={loan}
      onClose={onClose}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
};

export default ExtendLoanModal;
