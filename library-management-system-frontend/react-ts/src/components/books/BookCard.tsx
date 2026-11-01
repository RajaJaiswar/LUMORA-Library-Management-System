import React from 'react';
import type { BookResponse } from '../../types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

interface BookCardProps {
  book: BookResponse;
  canManage?: boolean;
  onEdit?: (book: BookResponse) => void;
  onDelete?: (book: BookResponse) => void;
  onAddStock?: (book: BookResponse) => void;
  onRemoveStock?: (book: BookResponse) => void;
  // Member borrow actions
  isMember?: boolean;
  onBorrow?: (book: BookResponse) => void;
  borrowingBookId?: number | null;
  pendingBookIds?: Set<number>;
  activeLoanBookIds?: Set<number>;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  canManage = false,
  onEdit,
  onDelete,
  onAddStock,
  onRemoveStock,
  isMember = false,
  onBorrow,
  borrowingBookId,
  pendingBookIds,
  activeLoanBookIds,
}) => {
  return (
    <Card className="flex flex-col justify-between p-5 transition hover:border-border-strong hover:shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-2">
          <StatusBadge variant="neutral" size="sm" label={book.category} />
          <AvailabilityBadge
            availableQuantity={book.availableQuantity}
            quantity={book.quantity}
          />
        </div>

        <h3 className="mt-3 text-base font-semibold leading-snug text-text line-clamp-2">
          {book.title}
        </h3>

        <p className="mt-1 text-xs text-text-muted">
          by <span className="font-medium text-text-secondary">{book.author || 'Unknown Author'}</span>
        </p>
      </div>

      <div className="mt-5 border-t border-border pt-3 text-xs text-text-muted">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-text-muted">ISBN:</span>
          <span className="font-mono text-text text-[11px] tabular-nums">{book.isbn}</span>
        </div>
        <div className="mt-1 flex justify-between items-center">
          <span className="text-[11px] text-text-muted">Copies:</span>
          <span className="font-medium text-text tabular-nums">
            <span className="text-success font-semibold">{book.availableQuantity}</span> / {book.quantity}
          </span>
        </div>

        {canManage && (
          <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-end gap-1.5">
            {onAddStock && (
              <button
                type="button"
                onClick={() => onAddStock(book)}
                className="inline-flex items-center space-x-1 rounded-control border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-success-soft hover:border-emerald-200 hover:text-success transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                title="Add stock copies (+)"
                aria-label={`Add stock copies for ${book.title}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Stock</span>
              </button>
            )}
            {onRemoveStock && (
              <button
                type="button"
                onClick={() => onRemoveStock(book)}
                className="inline-flex items-center space-x-1 rounded-control border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-warning-soft hover:border-amber-200 hover:text-warning transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                title="Remove stock copies (-)"
                aria-label={`Remove stock copies for ${book.title}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span>- Stock</span>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="inline-flex items-center space-x-1 rounded-control border border-border bg-surface px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-primary-soft hover:border-primary-border hover:text-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                title="Edit book metadata"
                aria-label={`Edit metadata for ${book.title}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="inline-flex items-center space-x-1 rounded-control border border-border bg-surface px-2 py-1 text-[11px] font-medium text-danger hover:bg-danger-soft hover:border-red-200 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                title="Delete book record"
                aria-label={`Delete record for ${book.title}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Delete</span>
              </button>
            )}
          </div>
        )}

        {isMember && (
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-end">
            {activeLoanBookIds?.has(book.id) ? (
              <StatusBadge
                variant="info"
                size="md"
                label="Currently on Loan"
                className="w-full justify-center"
                dot
                title="You currently hold an active loan for this book"
              />
            ) : pendingBookIds?.has(book.id) ? (
              <StatusBadge
                variant="warning"
                size="md"
                label="Request Pending"
                className="w-full justify-center"
                dot
                title="You already have a pending borrow request for this book"
              />
            ) : book.availableQuantity <= 0 ? (
              <StatusBadge
                variant="neutral"
                size="md"
                label="Currently Unavailable"
                className="w-full justify-center"
                title="No copies currently available in stock"
              />
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => onBorrow?.(book)}
                disabled={borrowingBookId === book.id}
                isLoading={borrowingBookId === book.id}
                leftIcon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Borrow Book
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookCard;

