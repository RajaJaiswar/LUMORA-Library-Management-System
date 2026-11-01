import React, { useState } from 'react';
import type { ReturnRequestResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { formatDateTime } from '../../utils/formatUtils';
import { Modal, Button, Alert, Card } from '../common';

interface CancelReturnModalProps {
  isOpen: boolean;
  request: ReturnRequestResponse | null;
  onClose: () => void;
  onConfirm: (requestId: number) => Promise<void>;
  isPending: boolean;
}

export const CancelReturnModal: React.FC<CancelReturnModalProps> = ({
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
          'Failed to cancel return request. Only pending return requests can be cancelled.'
        )
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Return Request"
      description="Withdraw this pending book return notification."
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
            Keep Return Request
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isPending}
          >
            Confirm Cancellation
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
          <div className="font-semibold text-slate-900 text-sm">
            {request.bookTitle}
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400">Request ID: </span>
              <span className="font-mono font-medium text-slate-800">#{request.id}</span>
            </div>
            <div>
              <span className="text-slate-400">Loan ID: </span>
              <span className="font-mono font-medium text-slate-800">#{request.borrowId}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Requested On: </span>
              <span className="font-medium text-slate-800">{formatDateTime(request.requestedAt)}</span>
            </div>
          </div>
        </Card>

        <p className="text-xs text-slate-500">
          Cancelling this return request will remove it from the staff check-in queue. <strong className="text-slate-700">The book remains active on your loan record</strong>.
        </p>
      </div>
    </Modal>
  );
};

export default CancelReturnModal;

