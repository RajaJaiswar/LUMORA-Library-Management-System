import React, { useState } from 'react';
import type { BookResponse, BookRequest, BookUpdateRequest } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, FormField, Input, Alert } from '../common';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate?: (data: BookRequest) => Promise<void>;
  onSubmitUpdate?: (id: number, data: BookUpdateRequest) => Promise<void>;
  bookToEdit?: BookResponse | null;
  isPending: boolean;
}

const COMMON_CATEGORIES = [
  'Programming',
  'Database',
  'Testing',
  'Science',
  'Fiction',
  'History',
  'Mathematics',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  bookToEdit,
  isPending,
}) => {
  const isEditMode = Boolean(bookToEdit);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Synchronize state when modal opens or bookToEdit changes during render (per React guidelines)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevBookToEditId, setPrevBookToEditId] = useState(bookToEdit?.id);

  if (isOpen !== prevIsOpen || bookToEdit?.id !== prevBookToEditId) {
    setPrevIsOpen(isOpen);
    setPrevBookToEditId(bookToEdit?.id);
    if (isOpen) {
      if (bookToEdit) {
        setTitle(bookToEdit.title);
        setAuthor(bookToEdit.author || '');
        setIsbn(bookToEdit.isbn);
        setCategory(bookToEdit.category);
        setQuantity(bookToEdit.quantity);
      } else {
        setTitle('');
        setAuthor('');
        setIsbn('');
        setCategory('');
        setQuantity(1);
      }
      setValidationErrors({});
      setServerError(null);
    }
  }

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    }

    if (!isbn.trim()) {
      errors.isbn = 'ISBN is required';
    }

    if (!category.trim()) {
      errors.category = 'Category is required';
    }

    if (!isEditMode) {
      if (quantity === '' || quantity === null || quantity === undefined) {
        errors.quantity = 'Quantity is required';
      } else if (quantity < 1) {
        errors.quantity = 'Quantity must be at least 1';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      if (isEditMode && bookToEdit && onSubmitUpdate) {
        const updateData: BookUpdateRequest = {
          title: title.trim(),
          author: author.trim() ? author.trim() : undefined,
          isbn: isbn.trim(),
          category: category.trim(),
        };
        await onSubmitUpdate(bookToEdit.id, updateData);
        onClose();
      } else if (!isEditMode && onSubmitCreate) {
        const createData: BookRequest = {
          title: title.trim(),
          author: author.trim() ? author.trim() : undefined,
          isbn: isbn.trim(),
          category: category.trim(),
          quantity: Number(quantity),
        };
        await onSubmitCreate(createData);
        onClose();
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, 'Failed to save book. Please verify your inputs.'));
    }
  };

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
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending
          ? isEditMode
            ? 'Saving Changes...'
            : 'Creating Book...'
          : isEditMode
          ? 'Save Changes'
          : 'Create Book'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Book Details' : 'Add New Book'}
      description={
        isEditMode
          ? 'Update metadata attributes for this catalogue record.'
          : 'Enter catalogue information to register a new book in the library.'
      }
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Server Error Banner */}
        {serverError && (
          <Alert variant="danger" title="Operation Failed" description={serverError} />
        )}

        {/* Title */}
        <FormField label="Book Title" required error={validationErrors.title}>
          <Input
            id="book-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Design Patterns: Elements of Reusable Object-Oriented Software"
            inputSize="sm"
          />
        </FormField>

        {/* Author */}
        <FormField label="Author(s)" helperText="Optional. Leave blank if unknown.">
          <Input
            id="book-author-input"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides"
            inputSize="sm"
          />
        </FormField>

        {/* ISBN & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* ISBN */}
          <FormField
            label="ISBN"
            required
            error={validationErrors.isbn}
            helperText="10 or 13-digit ISBN format"
          >
            <Input
              id="book-isbn-input"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              disabled={isPending}
              placeholder="e.g. 978-0201633610"
              inputSize="sm"
              className="font-mono"
            />
          </FormField>

          {/* Category */}
          <FormField
            label="Category"
            required
            error={validationErrors.category}
            helperText="Type or select a category"
          >
            <Input
              id="book-category-input"
              type="text"
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Programming"
              inputSize="sm"
            />
            <datalist id="category-suggestions">
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </FormField>
        </div>

        {/* Quantity (Create Mode Only) */}
        {!isEditMode ? (
          <FormField
            label="Initial Stock Copies"
            required
            error={validationErrors.quantity}
            helperText="Initial total and available copy count for this title."
          >
            <Input
              id="book-quantity-input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))
              }
              disabled={isPending}
              placeholder="1"
              inputSize="sm"
            />
          </FormField>
        ) : (
          <div className="rounded-control border border-border bg-surface-subtle p-3 text-xs text-text-secondary">
            <span className="font-semibold text-text">Stock Preservation: </span>
            Current stock ({bookToEdit?.availableQuantity} available / {bookToEdit?.quantity} total)
            is managed via the Inventory Stock workflow and cannot be altered during metadata edits.
          </div>
        )}
      </form>
    </Modal>
  );
};

export default BookFormModal;
