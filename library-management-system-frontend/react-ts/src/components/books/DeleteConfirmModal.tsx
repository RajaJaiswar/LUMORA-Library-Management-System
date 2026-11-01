import React, { useState } from 'react';
import type { BookResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, Alert, Card } from '../common';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  book: BookResponse | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  isPending: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  book,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setServerError(null);
    }
  }

  if (!isOpen || !book) return null;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setServerError(null);
    try {
      await onConfirm(book.id);
      handleClose();
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(
          err,
          'Failed to delete book. The backend may prevent deletion if circulation history exists.'
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
        variant="danger"
        size="sm"
        onClick={handleConfirm}
        isLoading={isPending}
        disabled={isPending}
      >
        Confirm Deletion
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Book Record"
      description="Confirm permanent catalogue deletion"
      size="sm"
      footer={footer}
    >
      <div className="space-y-3">
        {/* Book Details Box */}
        <Card className="p-4 bg-surface-subtle text-xs space-y-1.5 border border-border">
          <div className="font-semibold text-text line-clamp-2">{book.title}</div>
          <div className="text-text-secondary">
            Author: <span className="text-text font-medium">{book.author || 'Unknown'}</span>
          </div>
          <div className="text-text-muted font-mono text-[11px]">ISBN: {book.isbn}</div>
          <div className="text-text-secondary">
            Stock:{' '}
            <span className="font-medium text-text tabular-nums">
              {book.availableQuantity} available of {book.quantity} copies
            </span>
          </div>
        </Card>

        {/* Policy Notice */}
        <Alert
          variant="warning"
          title="Business Rule Notice"
          description="The backend strictly blocks deletion if this title has any past or active borrowing records in the circulation history."
        />

        {/* Server Error Display */}
        {serverError && (
          <Alert variant="danger">
            {serverError}
          </Alert>
        )}
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
