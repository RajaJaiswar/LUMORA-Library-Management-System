import React, { useState } from 'react';
import type { BookResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, Card, StatusBadge, Alert } from '../common';

interface BorrowConfirmModalProps {
  isOpen: boolean;
  book: BookResponse | null;
  onClose: () => void;
  onConfirm: (bookId: number) => Promise<void>;
  isPending: boolean;
}

export const BorrowConfirmModal: React.FC<BorrowConfirmModalProps> = ({
  isOpen,
  book,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);

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
          'Failed to submit borrow request. Please check availability or whether you already hold a pending request.'
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
        onClick={handleConfirm}
        isLoading={isPending}
        disabled={isPending}
      >
        Confirm Borrow Request
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request to Borrow Book"
      description="Submit a borrowing request for staff review and book collection."
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Server Error Alert */}
        {serverError && (
          <Alert variant="danger" title="Request Failed" description={serverError} />
        )}

        {/* Book Details Box */}
        <Card className="p-4 bg-surface-subtle border border-border space-y-2.5">
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Book Title
            </span>
            <StatusBadge variant="neutral" size="sm" label={book.category} />
          </div>
          <div className="text-sm font-bold text-text leading-snug">{book.title}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary pt-1 border-t border-border">
            <div>
              <span className="text-text-muted">Author: </span>
              <span className="font-medium text-text">{book.author || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-text-muted">ISBN: </span>
              <span className="font-mono text-text">{book.isbn}</span>
            </div>
            <div>
              <span className="text-text-muted">Available: </span>
              <span className="font-semibold text-success tabular-nums">{book.availableQuantity} copies</span>
            </div>
            <div>
              <span className="text-text-muted">Total Stock: </span>
              <span className="font-medium text-text tabular-nums">{book.quantity} copies</span>
            </div>
          </div>
        </Card>

        {/* Borrowing Policies & Terms */}
        <Alert variant="info" title="Library Circulation Policies">
          <ul className="list-disc list-inside space-y-1 text-text-secondary text-xs mt-1">
            <li>
              <strong className="text-text">14-Day Loan Period:</strong> The loan term begins on the date the librarian approves and issues the book.
            </li>
            <li>
              <strong className="text-text">Overdue Penalties:</strong> A fine of ₹10.00 / day accumulates for any book returned past the due date.
            </li>
            <li>
              <strong className="text-text">Collection:</strong> Please collect the physical book from the circulation desk once marked as issued.
            </li>
          </ul>
        </Alert>
      </div>
    </Modal>
  );
};

export default BorrowConfirmModal;
