import React from 'react';
import type { BookResponse } from '../../types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

interface BookTableProps {
  books: BookResponse[];
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

export const BookTable: React.FC<BookTableProps> = ({
  books,
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
  const showActions = canManage || isMember;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-xs">
      <div
        className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
        tabIndex={0}
        role="region"
        aria-label="Books catalogue table"
      >
        <table className="min-w-full divide-y divide-border text-left text-xs">
          <thead className="bg-surface-subtle text-text-secondary font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Book Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3 text-center">Copies (Avail / Total)</th>
              <th className="px-4 py-3">Availability</th>
              {showActions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-primary-soft/40 transition-colors">
                <td className="px-4 py-3.5 font-medium text-text max-w-xs">
                  <div className="line-clamp-2">{book.title}</div>
                </td>
                <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                  {book.author || <span className="text-text-muted italic">Unknown</span>}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge variant="neutral" size="sm" label={book.category} />
                </td>
                <td className="px-4 py-3.5 font-mono text-text-muted tabular-nums whitespace-nowrap">
                  {book.isbn}
                </td>
                <td className="px-4 py-3.5 text-center font-medium text-text whitespace-nowrap">
                  <span className="text-success font-semibold tabular-nums">{book.availableQuantity}</span>
                  <span className="text-text-muted"> / </span>
                  <span className="tabular-nums">{book.quantity}</span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <AvailabilityBadge
                    availableQuantity={book.availableQuantity}
                    quantity={book.quantity}
                  />
                </td>
                {showActions && (
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {canManage && (
                      <div className="flex items-center justify-end space-x-1.5">
                        {onAddStock && (
                          <button
                            type="button"
                            onClick={() => onAddStock(book)}
                            className="rounded-control border border-border bg-surface p-1.5 text-text-secondary hover:bg-success-soft hover:border-emerald-200 hover:text-success transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                            title="Add stock copies (+)"
                            aria-label={`Add stock copies for ${book.title}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        )}
                        {onRemoveStock && (
                          <button
                            type="button"
                            onClick={() => onRemoveStock(book)}
                            className="rounded-control border border-border bg-surface p-1.5 text-text-secondary hover:bg-warning-soft hover:border-amber-200 hover:text-warning transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                            title="Remove stock copies (-)"
                            aria-label={`Remove stock copies for ${book.title}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(book)}
                            className="rounded-control border border-border bg-surface p-1.5 text-text-secondary hover:bg-primary-soft hover:border-primary-border hover:text-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                            title="Edit book metadata"
                            aria-label={`Edit metadata for ${book.title}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(book)}
                            className="rounded-control border border-border bg-surface p-1.5 text-text-secondary hover:bg-danger-soft hover:border-red-200 hover:text-danger transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                            title="Delete book record"
                            aria-label={`Delete record for ${book.title}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    {isMember && (
                      <div className="flex items-center justify-end">
                        {activeLoanBookIds?.has(book.id) ? (
                          <StatusBadge
                            variant="info"
                            size="sm"
                            label="On Loan"
                            dot
                            title="You currently hold an active loan for this book"
                          />
                        ) : pendingBookIds?.has(book.id) ? (
                          <StatusBadge
                            variant="warning"
                            size="sm"
                            label="Requested"
                            dot
                            title="You already have a pending borrow request for this book"
                          />
                        ) : book.availableQuantity <= 0 ? (
                          <StatusBadge
                            variant="neutral"
                            size="sm"
                            label="Unavailable"
                            title="No copies currently available in stock"
                          />
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onBorrow?.(book)}
                            disabled={borrowingBookId === book.id}
                            isLoading={borrowingBookId === book.id}
                            leftIcon={
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            }
                          >
                            Borrow
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookTable;

