import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  usePendingReturnRequests,
  useConfirmReturn,
  useRejectReturn,
} from '../../hooks/useReturnRequests';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatUtils';
import { ErrorState } from '../dashboard/ErrorState';
import { ConfirmReturnModal } from './ConfirmReturnModal';
import { RejectReturnModal } from './RejectReturnModal';
import { Button, Input, StatusBadge, Card, Alert, Select } from '../common';
import type { ReturnRequestResponse } from '../../types';

interface ReturnRequestsQueueProps {
  role: 'ADMIN' | 'LIBRARIAN';
}

type SortOption = 'OLDEST' | 'NEWEST' | 'OVERDUE' | 'MEMBER' | 'BOOK';

export const ReturnRequestsQueue: React.FC<ReturnRequestsQueueProps> = ({ role }) => {
  const {
    data: requests = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePendingReturnRequests();

  const confirmMutation = useConfirmReturn();
  const rejectMutation = useRejectReturn();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('OLDEST');
  const [requestToConfirm, setRequestToConfirm] = useState<ReturnRequestResponse | null>(null);
  const [requestToReject, setRequestToReject] = useState<ReturnRequestResponse | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cataloguePath = role === 'ADMIN' ? '/admin/books' : '/librarian/catalogue';

  // Derived metrics
  const totalCount = requests.length;
  const overdueCount = requests.filter((r) => r.daysOverdue > 0 || (r.fine && r.fine > 0)).length;
  const uniqueMembers = new Set(requests.map((r) => r.userId)).size;

  // Filtered & sorted requests
  const filteredRequests = useMemo(() => {
    const list = requests.filter((item) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchesTitle = item.bookTitle?.toLowerCase().includes(term);
      const matchesIsbn = item.isbn?.toLowerCase().includes(term);
      const matchesName = item.userName?.toLowerCase().includes(term);
      const matchesMemberId = item.libraryMemberId?.toLowerCase().includes(term);
      const matchesId = item.id.toString().includes(term);
      const matchesBorrowId = item.borrowId.toString().includes(term);
      const matchesUserId = item.userId.toString().includes(term);
      return (
        matchesTitle ||
        matchesIsbn ||
        matchesName ||
        matchesMemberId ||
        matchesId ||
        matchesBorrowId ||
        matchesUserId
      );
    });

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'OLDEST':
          return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
        case 'NEWEST':
          return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        case 'OVERDUE':
          return (b.daysOverdue || 0) - (a.daysOverdue || 0);
        case 'MEMBER':
          return a.userName.localeCompare(b.userName);
        case 'BOOK':
          return a.bookTitle.localeCompare(b.bookTitle);
        default:
          return 0;
      }
    });
  }, [requests, searchTerm, sortBy]);

  const handleConfirmReturn = async (id: number) => {
    const req = requestToConfirm;
    await confirmMutation.mutateAsync(id);
    setFeedback({
      type: 'success',
      message: `Return request #${id} for "${req?.bookTitle || 'Book'}" has been confirmed. Loan marked RETURNED, available stock restored (+1), and check-in finalized.`,
    });
  };

  const handleConfirmReject = async (id: number) => {
    const req = requestToReject;
    await rejectMutation.mutateAsync(id);
    setFeedback({
      type: 'success',
      message: `Return request #${id} for "${req?.bookTitle || 'Book'}" has been rejected. Loan remains active and stock is unchanged.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Return Requests Queue
            </h1>
            <StatusBadge
              variant={role === 'ADMIN' ? 'neutral' : 'info'}
              label={role === 'ADMIN' ? 'Admin Circulation' : 'Librarian Console'}
              size="sm"
            />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Verify returned physical copies at the desk, inspect late fines, and confirm check-ins or decline requests.
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

          <Link to={cataloguePath}>
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
              View Catalogue
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-sky-200/80 bg-info-soft">
          <p className="text-xs font-semibold text-info">Pending Return Requests</p>
          <p className="mt-1 text-2xl font-bold text-sky-950 tabular-nums">{totalCount}</p>
          <p className="mt-1 text-[11px] text-sky-800">Awaiting desk receipt & check-in</p>
        </Card>

        <Card className="p-4 border-amber-200/80 bg-warning-soft">
          <p className="text-xs font-semibold text-warning">Overdue Returns</p>
          <p className="mt-1 text-2xl font-bold text-amber-950 tabular-nums">{overdueCount}</p>
          <p className="mt-1 text-[11px] text-amber-800">Subject to overdue fine assessment</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-text-muted">Unique Members</p>
          <p className="mt-1 text-2xl font-bold text-text tabular-nums">{uniqueMembers}</p>
          <p className="mt-1 text-[11px] text-text-muted">Distinct patrons returning books</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-text-muted">Processing Priority</p>
          <p className="mt-1 text-sm font-semibold text-text">
            {totalCount > 0 ? 'First-In, First-Out (FIFO)' : 'All Caught Up'}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            {totalCount > 0 ? 'Process oldest returns first' : 'Zero backlog'}
          </p>
        </Card>
      </div>

      {/* Search and Sort Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by member, book title, ISBN, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputSize="sm"
              aria-label="Search pending return requests"
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

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-queue" className="text-xs font-medium text-text-secondary whitespace-nowrap">
              Sort by:
            </label>
            <Select<SortOption>
              id="sort-queue"
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              selectSize="sm"
              aria-label="Sort return queue by"
              className="min-w-42.5"
            >
              <option value="OLDEST">Oldest First (FIFO)</option>
              <option value="NEWEST">Newest First</option>
              <option value="OVERDUE">Overdue First</option>
              <option value="MEMBER">Member Name (A-Z)</option>
              <option value="BOOK">Book Title (A-Z)</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="p-6 animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-border mb-4" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded bg-surface-subtle" />
            <div className="h-10 w-full rounded bg-surface-subtle" />
            <div className="h-10 w-full rounded bg-surface-subtle" />
          </div>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Unable to load return requests queue"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Data Table */}
      {!isLoading && !isError && (
        <>
          {filteredRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success mb-4">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text">
                {searchTerm ? 'No matching return requests' : 'Queue is clear!'}
              </h3>
              <p className="mt-1 text-xs text-text-secondary max-w-md mx-auto">
                {searchTerm
                  ? `No pending return requests matched your search "${searchTerm}". Try a different keyword.`
                  : 'There are currently no pending return requests awaiting physical check-in. All book returns are up to date.'}
              </p>
              {searchTerm && (
                <div className="mt-5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <div
                className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
                tabIndex={0}
                role="region"
                aria-label="Pending return requests table"
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Request / Loan ID</th>
                      <th className="py-3 px-4">Member Info</th>
                      <th className="py-3 px-4">Book Details</th>
                      <th className="py-3 px-4">Due Date & Status</th>
                      <th className="py-3 px-4">Fine Assessment</th>
                      <th className="py-3 px-4">Requested At</th>
                      <th className="py-3 px-4 text-right">Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {filteredRequests.map((item) => {
                      const isOverdue = item.daysOverdue > 0;
                      const hasFine = Boolean(item.fine && item.fine > 0);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-surface-subtle/80 transition-colors"
                        >
                          {/* Request / Loan ID */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono font-semibold text-text tabular-nums">
                              #REQ-{item.id}
                            </div>
                            <div className="font-mono text-[11px] text-text-muted tabular-nums">
                              Loan: #{item.borrowId}
                            </div>
                          </td>

                          {/* Member */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-text">
                              {item.userName}
                            </div>
                            <div className="font-mono text-[11px] text-text-muted">
                              {item.libraryMemberId || `#USER-${item.userId}`}
                            </div>
                          </td>

                          {/* Book */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-text truncate">
                              {item.bookTitle}
                            </div>
                            <div className="font-mono text-[11px] text-text-muted">
                              ISBN: {item.isbn}
                            </div>
                          </td>

                          {/* Due Date & Loan Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-text font-medium tabular-nums">
                              {formatDate(item.dueDate)}
                            </div>
                            <div className="mt-0.5">
                              <span
                                className={`inline-block font-semibold rounded px-1.5 py-0.5 text-[10px] tabular-nums ${isOverdue
                                  ? 'bg-danger-soft text-danger'
                                  : 'bg-success-soft text-success'
                                  }`}
                              >
                                {isOverdue
                                  ? `${item.daysOverdue}d overdue`
                                  : item.borrowStatus || 'BORROWED'}
                              </span>
                            </div>
                          </td>

                          {/* Fine Assessment */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {hasFine ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] tabular-nums">
                                  {formatCurrency(item.fine)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-text-muted font-mono text-[11px] tabular-nums">
                                ₹0.00
                              </span>
                            )}
                          </td>

                          {/* Requested At */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-text-secondary">
                            <div className="tabular-nums">{formatDateTime(item.requestedAt)}</div>
                            <div className="mt-0.5">
                              <StatusBadge variant="info" label="Desk Pending" size="sm" />
                            </div>
                          </td>

                          {/* Desk Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setRequestToConfirm(item)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                leftIcon={
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                }
                              >
                                Confirm Return
                              </Button>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setRequestToReject(item)}
                                className="text-danger hover:bg-danger-soft hover:border-red-300"
                                leftIcon={
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer with count info */}
              <div className="flex items-center justify-between border-t border-border bg-surface-subtle/50 px-4 py-2.5 text-text-muted text-[11px]">
                <span className="tabular-nums">
                  Showing {filteredRequests.length} of {requests.length} pending return{requests.length === 1 ? '' : 's'}
                </span>
                <span>Sorted by: {sortBy.replace('_', ' ')}</span>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmReturnModal
        isOpen={Boolean(requestToConfirm)}
        request={requestToConfirm}
        onClose={() => setRequestToConfirm(null)}
        onConfirm={handleConfirmReturn}
        isPending={confirmMutation.isPending}
      />

      {/* Rejection Modal */}
      <RejectReturnModal
        isOpen={Boolean(requestToReject)}
        request={requestToReject}
        onClose={() => setRequestToReject(null)}
        onConfirm={handleConfirmReject}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
};

export default ReturnRequestsQueue;
