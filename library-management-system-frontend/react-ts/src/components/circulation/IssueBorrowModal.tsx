import React, { useState } from 'react';
import type { BorrowRequestResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { formatDateTime } from '../../utils/formatUtils';
import { Modal, Button, Alert, Card } from '../common';

interface IssueBorrowModalProps {
  isOpen: boolean;
  request: BorrowRequestResponse | null;
  onClose: () => void;
  onConfirm: (requestId: number) => Promise<void>;
  isPending: boolean;
}

export const IssueBorrowModal: React.FC<IssueBorrowModalProps> = ({
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
          'Failed to issue book loan. The request may no longer be pending or stock is exhausted.'
        )
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Issue Book Loan"
      description="Approve borrowing request and create an active loan for the member."
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
            Confirm & Issue Book
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

        {/* Request Details Card */}
        <Card variant="subtle" className="p-3.5 space-y-2 text-xs">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Book Details
            </div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">
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
              <span className="text-slate-400">Requested: </span>
              <span className="text-slate-800">{formatDateTime(request.requestedAt)}</span>
            </div>
          </div>
        </Card>

        {/* Loan Policy Note */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-950 space-y-1">
          <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Loan Terms & Stock Update</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
            <li>Loan due date will be set to <strong className="text-slate-800">14 days</strong> from today.</li>
            <li>Available book inventory will automatically <strong className="text-slate-800">decrease by 1 copy</strong>.</li>
            <li>Borrow request status will update to <strong className="text-slate-800">ISSUED</strong>.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default IssueBorrowModal;

