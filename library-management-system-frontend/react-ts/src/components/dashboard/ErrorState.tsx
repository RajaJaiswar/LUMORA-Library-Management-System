import React from 'react';
import { getErrorMessage } from '../../utils/errorUtils';
import { Alert } from '../common/Alert';
import { Button } from '../common/Button';

interface ErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load dashboard data',
  error,
  onRetry,
  className = '',
}) => {
  const errorMessage = error
    ? getErrorMessage(error, 'An unexpected server error occurred while retrieving data.')
    : 'An unexpected server error occurred while retrieving data.';

  return (
    <Alert variant="danger" title={title} description={errorMessage} className={className}>
      {onRetry && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-danger hover:bg-red-100/60"
            leftIcon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Retry Request
          </Button>
        </div>
      )}
    </Alert>
  );
};

export default ErrorState;
