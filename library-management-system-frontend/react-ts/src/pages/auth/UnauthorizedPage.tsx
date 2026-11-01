import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, StatusBadge } from '../../components/common';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8 text-center shadow-card border border-border">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text">
          Access Denied
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your current role (
          <span className="inline-block align-middle ml-1">
            <StatusBadge variant="neutral" size="sm" label={user?.role || 'Guest'} />
          </span>
          ) does not have permission to view this section.
        </p>

        <div className="mt-6 flex justify-center">
          <Link to="/">
            <Button variant="primary" size="sm">
              Go to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
