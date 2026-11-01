import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMyReturnRequests, useCancelReturnRequest } from '../../hooks/useReturnRequests';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatUtils';
import { ErrorState } from '../dashboard/ErrorState';
import { CancelReturnModal } from './CancelReturnModal';
import { Button, Input, StatusBadge, Card, Alert } from '../common';
import type { ReturnRequestResponse, ReturnRequestStatus } from '../../types';

type FilterTab = 'ALL' | 'PENDING' | 'COMPLETED' | 'RESOLVED';

export const MemberReturnRequests: React.FC = () => {
  const { data: requests = [], isLoading, isError, error, refetch, isFetching } = useMyReturnRequests();
  const cancelMutation = useCancelReturnRequest();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestToCancel, setRequestToCancel] = useState<ReturnRequestResponse | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Derived metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
  const resolvedCount = requests.filter((r) => ['REJECTED', 'CANCELLED'].includes(r.status)).length;

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      // Tab filter
      if (activeTab === 'PENDING' && item.status !== 'PENDING') return false;
      if (activeTab === 'COMPLETED' && item.status !== 'COMPLETED') return false;
      if (activeTab === 'RESOLVED' && !['REJECTED', 'CANCELLED'].includes(item.status)) return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = item.bookTitle?.toLowerCase().includes(term);
        const matchesIsbn = item.isbn?.toLowerCase().includes(term);
        const matchesId = item.id.toString().includes(term);
        const matchesBorrowId = item.borrowId.toString().includes(term);
        if (!matchesTitle && !matchesIsbn && !matchesId && !matchesBorrowId) return false;
      }

      return true;
    });
  }, [requests, activeTab, searchTerm]);

  const handleConfirmCancel = async (id: number) => {
    const bookTitle = requestToCancel?.bookTitle || 'Book';
    await cancelMutation.mutateAsync(id);
    setFeedback({
      type: 'success',
      message: `Return request #${id} for "${bookTitle}" has been cancelled. Your loan remains active.`,
    });
  };

  const renderStatusBadge = (status: ReturnRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <StatusBadge variant="warning" dot={true} label="Pending Desk Verification" size="sm" />;
      case 'COMPLETED':
        return <StatusBadge variant="success" label="Returned & Verified" size="sm" />;
      case 'REJECTED':
        return <StatusBadge variant="danger" label="Rejected by Staff" size="sm" />;
      case 'CANCELLED':
        return <StatusBadge variant="neutral" label="Cancelled by Member" size="sm" />;
      default:
        return <StatusBadge variant="neutral" label={status} size="sm" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Return Requests
            </h1>
            <StatusBadge variant="info" label="Member Circulation" size="sm" />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Track book returns submitted for library front-desk physical verification and check-in.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={
              <svg
                className={`h-4 w-4 text-text-secondary ${isFetching ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Refresh
          </Button>

          <Link to="/member/loans">
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            >
              View Active Loans
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'danger'}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-text-muted">Total Return Requests</p>
          <p className="mt-1 text-2xl font-bold text-text tabular-nums">{totalCount}</p>
        </Card>
        <Card className="p-4 border-amber-200/80 bg-warning-soft">
          <p className="text-xs font-semibold text-warning">Pending Desk Check-in</p>
          <p className="mt-1 text-2xl font-bold text-amber-950 tabular-nums">{pendingCount}</p>
        </Card>
        <Card className="p-4 border-emerald-200/80 bg-success-soft">
          <p className="text-xs font-semibold text-success">Returned & Verified</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950 tabular-nums">{completedCount}</p>
        </Card>
        <Card className="p-4 bg-surface-subtle">
          <p className="text-xs font-medium text-text-muted">Cancelled / Rejected</p>
          <p className="mt-1 text-2xl font-bold text-text-secondary tabular-nums">{resolvedCount}</p>
        </Card>
      </div>

      {/* Filter Tabs and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center space-x-1 border border-border p-1 rounded-control bg-surface-subtle text-xs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ALL'}
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'PENDING'}
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'COMPLETED'}
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'COMPLETED'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'RESOLVED'}
              onClick={() => setActiveTab('RESOLVED')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'RESOLVED'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Cancelled / Rejected ({resolvedCount})
            </button>
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search by title, ISBN, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputSize="sm"
              aria-label="Search return requests"
              leftIcon={
                <svg
                  className="h-3.5 w-3.5 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="p-6 animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-border mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded bg-surface-subtle" />
            ))}
          </div>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Failed to load return requests"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredRequests.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-text">
            {requests.length === 0 ? 'No return requests submitted yet' : 'No matching return requests found'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
            {requests.length === 0
              ? 'When you are ready to return borrowed books, initiate a return request from your Active Loans tab.'
              : 'Try adjusting your search terms or selecting a different status filter tab.'}
          </p>
          {requests.length === 0 ? (
            <div className="mt-5">
              <Link to="/member/loans">
                <Button variant="primary" size="sm">
                  Go to Active Loans
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveTab('ALL');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Return Requests Table */}
      {!isLoading && !isError && filteredRequests.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div
            className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
            tabIndex={0}
            role="region"
            aria-label="Return requests table"
          >
            <table className="min-w-full divide-y divide-border text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Loan Info</th>
                  <th className="px-4 py-3">Requested At</th>
                  <th className="px-4 py-3">Processed At</th>
                  <th className="px-4 py-3">Fine / Overdue</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-subtle/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-text max-w-xs">
                      <div className="line-clamp-2 font-semibold">{req.bookTitle}</div>
                      <div className="text-[11px] text-text-muted mt-0.5 tabular-nums">
                        Request #{req.id} • ISBN: <span className="font-mono">{req.isbn}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                      <div className="tabular-nums">Loan #{req.borrowId}</div>
                      <div className="text-[11px] text-text-muted tabular-nums">
                        Due: {formatDate(req.dueDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap tabular-nums">
                      {formatDateTime(req.requestedAt || req.returnRequestedDate)}
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap tabular-nums">
                      {req.processedAt ? (
                        formatDateTime(req.processedAt)
                      ) : (
                        <span className="text-text-muted italic">Pending desk check-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {req.fine && req.fine > 0 ? (
                        <span className="font-semibold text-danger tabular-nums">
                          {formatCurrency(req.fine)}
                          {req.daysOverdue > 0 && (
                            <span className="text-[10px] text-danger/80 font-normal block">
                              ({req.daysOverdue}d overdue)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-text-muted">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(req.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {req.status === 'PENDING' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRequestToCancel(req)}
                          disabled={cancelMutation.isPending}
                          className="text-danger hover:bg-danger-soft hover:border-red-300"
                          title="Withdraw pending return request"
                          leftIcon={
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          }
                        >
                          Cancel Request
                        </Button>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cancel Confirmation Modal */}
      <CancelReturnModal
        isOpen={Boolean(requestToCancel)}
        request={requestToCancel}
        onClose={() => setRequestToCancel(null)}
        onConfirm={handleConfirmCancel}
        isPending={cancelMutation.isPending}
      />
    </div>
  );
};

export default MemberReturnRequests;
