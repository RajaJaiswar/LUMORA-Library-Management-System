import React, { useState, useEffect } from 'react';
import { Input } from '../common/Input';

interface BookSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const BookSearchBar: React.FC<BookSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by book title...',
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [prevPropValue, setPrevPropValue] = useState(value);

  // Sync internal value when prop changes externally (e.g., URL reset or navigation)
  if (value !== prevPropValue) {
    setPrevPropValue(value);
    setInternalValue(value);
  }

  // Debounce input change to avoid issuing request on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [internalValue, value, onChange]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className="relative flex-1">
      <Input
        type="search"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="Search books by title"
        inputSize="sm"
        leftIcon={
          <svg
            className="h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        rightIcon={
          internalValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 text-text-muted hover:text-text transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
              title="Clear search query"
              aria-label="Clear search query"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : undefined
        }
      />
    </div>
  );
};

export default BookSearchBar;

