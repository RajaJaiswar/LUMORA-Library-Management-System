import React from 'react';
import { Button, Select } from '../common';

interface BookPaginationProps {
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (newPage: number) => void;
  onSizeChange?: (newSize: number) => void;
  disabled?: boolean;
}

export const BookPagination: React.FC<BookPaginationProps> = ({
  page,
  size,
  totalElements,
  totalPages,
  first,
  last,
  onPageChange,
  onSizeChange,
  disabled = false,
}) => {
  if (totalElements === 0) return null;

  const startRecord = page * size + 1;
  const endRecord = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border bg-surface px-4 py-3 sm:px-6 rounded-b-card">
      {/* Record info & Page size */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
        <p>
          Showing <span className="font-semibold text-text tabular-nums">{startRecord}</span> to{' '}
          <span className="font-semibold text-text tabular-nums">{endRecord}</span> of{' '}
          <span className="font-semibold text-text tabular-nums">{totalElements}</span> books
        </p>

        {onSizeChange && (
          <div className="flex items-center space-x-1.5 pl-2 border-l border-border">
            <label htmlFor="rows-per-page-select" className="text-text-muted">
              Rows:
            </label>
            <Select<number>
              id="rows-per-page-select"
              value={size}
              onChange={(val) => onSizeChange(Number(val))}
              disabled={disabled}
              selectSize="sm"
              className="w-16"
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1.5 self-end sm:self-auto">
        {/* First Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={first || disabled}
          aria-label="Go to first page"
        >
          « First
        </Button>

        {/* Previous Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={first || disabled}
          aria-label="Go to previous page"
        >
          ‹ Prev
        </Button>

        {/* Page status */}
        <span className="px-2 text-xs font-medium text-text tabular-nums">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>

        {/* Next Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={last || disabled}
          aria-label="Go to next page"
        >
          Next ›
        </Button>

        {/* Last Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(totalPages - 1, 0))}
          disabled={last || disabled}
          aria-label="Go to last page"
        >
          Last »
        </Button>
      </div>
    </div>
  );
};

export default BookPagination;

