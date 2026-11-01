import React, { useState } from 'react';
import type { ReturnRequestResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { formatDate, formatDateTime } from '../../utils/formatUtils';
import { Modal, Button, Alert, Card } from '../common';

interface RejectReturnModalProps {
  isOpen: boolean;
  request: ReturnRequestResponse | null;
  onClose: () => void;
  onConfirm: (requestId: number) => Promise<void>;
  isPending: boolean;
}

export const RejectReturnModal: React.FC<RejectReturnModalProps> = ({
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
          'Failed to reject return request. The request may have already been processed.'
        )
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Return Request"
      description="Decline this pending return request at the circulation desk."
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

        {/* Request Details Card */}
        <Card variant="subtle" className="p-3.5 space-y-2 text-xs">
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
              <span className="text-slate-400">Due Date: </span>
              <span className="text-slate-800">{formatDate(request.dueDate)}</span>
            </div>
            <div>
              <span className="text-slate-400">Requested: </span>
              <span className="text-slate-800">{formatDateTime(request.requestedAt)}</span>
            </div>
          </div>
        </Card>

        {/* Rejection Policy Note */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
          <p className="font-medium text-slate-800">Desk Policy & Impact:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 pl-1">
            <li>The return request will be marked as <strong className="text-slate-700">REJECTED</strong>.</li>
            <li>The borrow loan remains active (<strong className="text-slate-700">{request.borrowStatus}</strong>).</li>
            <li>Physical book inventory is <strong className="text-slate-700">not restored</strong>.</li>
            <li>The member will remain responsible for physically returning the book.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default RejectReturnModal;

