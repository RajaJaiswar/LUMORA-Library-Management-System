import React, { useState } from 'react';
import type { BookResponse } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, FormField, Input, Alert, Card } from '../common';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookResponse | null;
  mode: 'add' | 'remove';
  onSubmitAdd: (id: number, quantity: number) => Promise<void>;
  onSubmitRemove: (id: number, quantity: number) => Promise<void>;
  isPending: boolean;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  book,
  mode,
  onSubmitAdd,
  onSubmitRemove,
  isPending,
}) => {
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const isAdd = mode === 'add';

  // Synchronize state during render when modal opens or active book/mode changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevMode, setPrevMode] = useState(mode);
  const [prevBookId, setPrevBookId] = useState(book?.id);

  if (isOpen !== prevIsOpen || mode !== prevMode || book?.id !== prevBookId) {
    setPrevIsOpen(isOpen);
    setPrevMode(mode);
    setPrevBookId(book?.id);
    if (isOpen) {
      setQuantityInput('1');
      setValidationError(null);
      setServerError(null);
    }
  }

  if (!isOpen || !book) return null;

  const borrowedCopies = Math.max(0, book.quantity - book.availableQuantity);
  const parsedQuantity = parseInt(quantityInput, 10);
  const isInputValidNumber =
    !isNaN(parsedQuantity) &&
    /^\d+$/.test(quantityInput.trim()) &&
    parsedQuantity > 0;

  // Real-time client-side validation
  const validate = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Quantity is required.';
    }
    if (!/^-?\d+$/.test(trimmed)) {
      return 'Quantity must be a whole integer number.';
    }
    const num = parseInt(trimmed, 10);
    if (num <= 0) {
      return 'Quantity must be at least 1.';
    }
    if (num > 10000) {
      return 'Quantity cannot exceed 10,000 copies in a single adjustment.';
    }
    if (!isAdd && num > book.availableQuantity) {
      return `Cannot remove ${num} copies. Only ${book.availableQuantity} copies are currently available.`;
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setQuantityInput(nextVal);
    setServerError(null);
    setValidationError(validate(nextVal));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(quantityInput);
    if (err) {
      setValidationError(err);
      return;
    }

    setServerError(null);
    try {
      if (isAdd) {
        await onSubmitAdd(book.id, parsedQuantity);
      } else {
        await onSubmitRemove(book.id, parsedQuantity);
      }
      onClose();
    } catch (err: unknown) {
      const fallbackMsg = isAdd
        ? 'Failed to increase book stock. Please check your network and retry.'
        : 'Failed to remove book stock. The requested quantity may exceed available copies.';
      setServerError(getErrorMessage(err, fallbackMsg));
    }
  };

  // Preview projected calculations
  const projectedTotal = isInputValidNumber
    ? isAdd
      ? book.quantity + parsedQuantity
      : Math.max(0, book.quantity - parsedQuantity)
    : null;

  const projectedAvailable = isInputValidNumber
    ? isAdd
      ? book.availableQuantity + parsedQuantity
      : Math.max(0, book.availableQuantity - parsedQuantity)
    : null;

  const footer = (
    <div className="flex items-center justify-end space-x-3 w-full">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant={isAdd ? 'primary' : 'danger'}
        size="sm"
        onClick={handleSubmit}
        isLoading={isPending}
        disabled={isPending || Boolean(validationError) || !isInputValidNumber}
      >
        {isAdd ? 'Confirm Add Stock' : 'Confirm Remove Stock'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdd ? 'Add Book Stock' : 'Remove Book Stock'}
      description={book.title}
      size="sm"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Server Error Alert */}
        {serverError && (
          <Alert variant="danger" title="Adjustment Failed" description={serverError} />
        )}

        {/* Current Inventory Snapshot Card */}
        <Card className="p-3.5 bg-surface-subtle text-xs space-y-2 border border-border">
          <div className="flex justify-between items-center text-text-secondary">
            <span>ISBN:</span>
            <span className="font-mono text-text font-medium">{book.isbn}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
            <div className="rounded-control bg-surface p-2 border border-border">
              <span className="text-[10px] text-text-muted block uppercase font-medium">Total</span>
              <span className="text-sm font-bold text-text tabular-nums">{book.quantity}</span>
            </div>
            <div className="rounded-control bg-surface p-2 border border-border">
              <span className="text-[10px] text-text-muted block uppercase font-medium">Available</span>
              <span className="text-sm font-bold text-success tabular-nums">{book.availableQuantity}</span>
            </div>
            <div className="rounded-control bg-surface p-2 border border-border">
              <span className="text-[10px] text-text-muted block uppercase font-medium">Borrowed</span>
              <span className="text-sm font-bold text-primary tabular-nums">{borrowedCopies}</span>
            </div>
          </div>
        </Card>

        {/* Input */}
        <div>
          <FormField
            label={isAdd ? 'Copies to Add' : 'Copies to Remove'}
            required
            error={validationError || undefined}
            helperText={
              isAdd
                ? 'Newly added physical copies are immediately available for loan checkout.'
                : 'Only unborrowed copies currently on library shelves can be removed.'
            }
          >
            <div className="relative">
              <Input
                id="stock-quantity-input"
                type="number"
                min={1}
                step={1}
                max={!isAdd ? book.availableQuantity : undefined}
                value={quantityInput}
                onChange={handleInputChange}
                disabled={isPending}
                placeholder="Enter quantity (e.g. 5)"
                inputSize="sm"
                autoFocus
              />
            </div>
          </FormField>
          {!isAdd && (
            <p className="mt-1 text-[11px] text-text-muted">
              Max removable: <strong className="text-text tabular-nums">{book.availableQuantity}</strong> copies
            </p>
          )}
        </div>

        {/* Intended Change Preview */}
        {!validationError && isInputValidNumber && projectedTotal !== null && projectedAvailable !== null && (
          <Alert variant="info" title="Projected Stock After Adjustment">
            <div className="mt-1 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span>Total Copies:</span>
                <span className="font-medium tabular-nums">
                  {book.quantity} → <strong className="font-bold">{projectedTotal}</strong>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Available Copies:</span>
                <span className="font-medium tabular-nums">
                  {book.availableQuantity} → <strong className="font-bold">{projectedAvailable}</strong>
                </span>
              </div>
            </div>
          </Alert>
        )}
      </form>
    </Modal>
  );
};

export default StockModal;
