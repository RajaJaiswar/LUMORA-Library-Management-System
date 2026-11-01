import React, { useState } from 'react';
import type { BorrowRequestResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { formatDateTime } from '../../utils/formatUtils';
import { Modal, Button, Alert, Card } from '../common';

interface RejectBorrowModalProps {
  isOpen: boolean;
  request: BorrowRequestResponse | null;
  onClose: () => void;
  onConfirm: (requestId: number) => Promise<void>;
  isPending: boolean;
}

export const RejectBorrowModal: React.FC<RejectBorrowModalProps> = ({
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
          'Failed to reject borrow request. The request may no longer be pending.'
        )
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Borrow Request"
      description="Decline this pending request and notify the member."
      size="sm"
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
            variant="danger"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            Confirm Rejection
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

        <p className="text-xs text-slate-500">
          Rejecting this request will mark it as <strong className="text-slate-700">REJECTED</strong>. No loan will be created, and the book stock remains unchanged.
        </p>
      </div>
    </Modal>
  );
};

export default RejectBorrowModal;

