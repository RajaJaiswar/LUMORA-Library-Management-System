import React, { useState } from 'react';
import type { ReturnRequestResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatUtils';
import { Modal, Button, Alert, Card, StatusBadge } from '../common';

interface ConfirmReturnModalProps {
  isOpen: boolean;
  request: ReturnRequestResponse | null;
  onClose: () => void;
  onConfirm: (requestId: number) => Promise<void>;
  isPending: boolean;
}

export const ConfirmReturnModal: React.FC<ConfirmReturnModalProps> = ({
  isOpen,
  request,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setServerError(null);
    try {
      await onConfirm(request.id);
      handleClose();
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(
          err,
          'Failed to confirm book return. The request may have already been processed.'
        )
      );
    }
  };

  const hasFine = Boolean(request.fine && request.fine > 0);
  const isOverdue = request.daysOverdue > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirm Physical Book Return"
      description="Verify the returned copy at the desk and finalize check-in."
      size="md"
      preventClose={isPending}
      footer={
        <div className="flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            Confirm Return & Restock
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {serverError && (
          <Alert
            variant="danger"
            onClose={() => setServerError(null)}
          >
            {serverError}
          </Alert>
        )}

        {/* Request & Book Details Box */}
        <Card variant="subtle" className="p-3.5 space-y-2.5 text-xs">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Book Details
            </div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5 leading-snug">
              {request.bookTitle}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              ISBN: {request.isbn}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="text-slate-400">Member: </span>
              <span className="font-semibold text-slate-800">{request.userName}</span>
            </div>
            <div>
              <span className="text-slate-400">Member ID: </span>
              <span className="font-mono text-slate-800">
                {request.libraryMemberId || `#USER-${request.userId}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Request ID: </span>
              <span className="font-mono text-slate-800">#{request.id}</span>
            </div>
            <div>
              <span className="text-slate-400">Loan ID: </span>
              <span className="font-mono text-slate-800">#{request.borrowId}</span>
            </div>
            <div>
              <span className="text-slate-400">Issue Date: </span>
              <span className="text-slate-800">{formatDate(request.issueDate)}</span>
            </div>
            <div>
              <span className="text-slate-400">Due Date: </span>
              <span className="text-slate-800 font-medium">{formatDate(request.dueDate)}</span>
            </div>
            <div>
              <span className="text-slate-400">Requested At: </span>
              <span className="text-slate-800">{formatDateTime(request.requestedAt)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Loan Status: </span>
              <StatusBadge
                variant={isOverdue ? 'danger' : 'info'}
                label={request.borrowStatus}
                size="sm"
              />
            </div>
          </div>
        </Card>

        {/* Fine Assessment Preview */}
        {hasFine || isOverdue ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start space-x-2.5">
            <svg className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-amber-950">Overdue Penalty Assessed</div>
              <div className="mt-0.5 text-[11px] text-amber-800">
                This item is <strong className="font-semibold">{request.daysOverdue} day{request.daysOverdue === 1 ? '' : 's'} overdue</strong>.
                Authoritative backend fine: <strong className="font-bold text-amber-950">{formatCurrency(request.fine)}</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">Fine Assessment:</span>
            <span className="font-semibold text-emerald-700">₹0.00 (On-time return)</span>
          </div>
        )}

        {/* Desk Return Workflow Note */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-950 space-y-1">
          <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Desk Check-in Summary</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
            <li>Loan record will be marked <strong className="text-slate-800">RETURNED</strong> with today's date.</li>
            <li>Available book inventory will automatically <strong className="text-slate-800">increase by 1 copy</strong>.</li>
            <li>Return request will update to <strong className="text-slate-800">COMPLETED</strong>.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmReturnModal;

