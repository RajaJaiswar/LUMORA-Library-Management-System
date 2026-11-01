import React from 'react';
import { Button, Select } from '../common';

interface BookFiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (available: boolean) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  disabled?: boolean;
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

export const BookFilters: React.FC<BookFiltersProps> = ({
  category,
  onCategoryChange,
  availableOnly,
  onAvailableOnlyChange,
  onReset,
  hasActiveFilters,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Dropdown */}
      <div className="min-w-40">
        <label htmlFor="category-filter-select" className="sr-only">
          Filter books by category
        </label>
        <Select
          id="category-filter-select"
          value={category}
          onChange={(val) => onCategoryChange(String(val))}
          disabled={disabled}
          selectSize="sm"
          fullWidth
          aria-label="Filter books by category"
        >
          <option value="">All Categories</option>
          {COMMON_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          {category && !COMMON_CATEGORIES.includes(category) && (
            <option value={category}>{category}</option>
          )}
        </Select>
      </div>

      {/* Available Only Toggle / Checkbox */}
      <label
        htmlFor="available-only-toggle"
        className="inline-flex cursor-pointer items-center space-x-2 text-xs font-medium text-text select-none"
      >
        <input
          id="available-only-toggle"
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => onAvailableOnlyChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 accent-primary disabled:opacity-50"
        />
        <span>Available copies only</span>
      </label>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={disabled}
          leftIcon={
            <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};

export default BookFilters;

