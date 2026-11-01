import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  usePendingBorrowRequests,
  useIssueBook,
  useRejectBorrowRequest,
} from '../../hooks/useBorrowRequests';
import { formatDateTime } from '../../utils/formatUtils';
import { ErrorState } from '../dashboard/ErrorState';
import { IssueBorrowModal } from './IssueBorrowModal';
import { RejectBorrowModal } from './RejectBorrowModal';
import { Button, Input, StatusBadge, Card, Alert, Select } from '../common';
import type { BorrowRequestResponse } from '../../types';

interface BorrowRequestsQueueProps {
  role: 'ADMIN' | 'LIBRARIAN';
}

type SortOption = 'OLDEST' | 'NEWEST' | 'MEMBER' | 'BOOK';

export const BorrowRequestsQueue: React.FC<BorrowRequestsQueueProps> = ({ role }) => {
  const {
    data: requests = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePendingBorrowRequests();

  const issueMutation = useIssueBook();
  const rejectMutation = useRejectBorrowRequest();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('OLDEST');
  const [requestToIssue, setRequestToIssue] = useState<BorrowRequestResponse | null>(null);
  const [requestToReject, setRequestToReject] = useState<BorrowRequestResponse | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cataloguePath = role === 'ADMIN' ? '/admin/books' : '/librarian/catalogue';

  // Derived metrics
  const totalCount = requests.length;
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
      const matchesUserId = item.userId.toString().includes(term);
      return (
        matchesTitle ||
        matchesIsbn ||
        matchesName ||
        matchesMemberId ||
        matchesId ||
        matchesUserId
      );
    });

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'OLDEST':
          return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
        case 'NEWEST':
          return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        case 'MEMBER':
          return a.userName.localeCompare(b.userName);
        case 'BOOK':
          return a.bookTitle.localeCompare(b.bookTitle);
        default:
          return 0;
      }
    });
  }, [requests, searchTerm, sortBy]);

  const handleConfirmIssue = async (id: number) => {
    const req = requestToIssue;
    await issueMutation.mutateAsync(id);
    setFeedback({
      type: 'success',
      message: `Borrow request #${id} for "${req?.bookTitle || 'Book'}" has been approved. Loan successfully issued to ${req?.userName || 'member'} (14-day duration, stock decremented).`,
    });
  };

  const handleConfirmReject = async (id: number) => {
    const req = requestToReject;
    await rejectMutation.mutateAsync(id);
    setFeedback({
      type: 'success',
      message: `Borrow request #${id} for "${req?.bookTitle || 'Book'}" has been rejected. The request has been removed from the queue.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Borrow Request Queue
            </h1>
            <StatusBadge
              variant={role === 'ADMIN' ? 'neutral' : 'info'}
              label={role === 'ADMIN' ? 'Admin Circulation' : 'Librarian Console'}
              size="sm"
            />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Review pending member requests, verify physical book readiness, and approve loans or decline requests.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-amber-200/80 bg-warning-soft">
          <p className="text-xs font-semibold text-warning">Pending Borrow Requests</p>
          <p className="mt-1 text-2xl font-bold text-amber-950 tabular-nums">{totalCount}</p>
          <p className="mt-1 text-[11px] text-amber-800">Awaiting staff issuance or rejection</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-text-muted">Unique Members</p>
          <p className="mt-1 text-2xl font-bold text-text tabular-nums">{uniqueMembers}</p>
          <p className="mt-1 text-[11px] text-text-muted">Distinct members with queued requests</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-text-muted">Processing Priority</p>
          <p className="mt-1 text-sm font-semibold text-text">
            {totalCount > 0 ? 'First-In, First-Out (FIFO)' : 'All Caught Up'}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            {totalCount > 0 ? 'Process oldest requests first' : 'Zero backlog'}
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
              aria-label="Search pending requests"
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
              aria-label="Sort queue by"
              className="min-w-42.5"
            >
              <option value="OLDEST">Oldest First (FIFO)</option>
              <option value="NEWEST">Newest First</option>
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full rounded bg-surface-subtle" />
            ))}
          </div>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Failed to load pending borrow requests"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredRequests.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-text">
            {requests.length === 0 ? 'Queue is clear!' : 'No matching requests found'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
            {requests.length === 0
              ? 'There are currently no pending borrow requests requiring staff action.'
              : 'Try adjusting your search terms or clearing the filter.'}
          </p>
          {searchTerm && (
            <div className="mt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search Filter
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Pending Requests Table */}
      {!isLoading && !isError && filteredRequests.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div
            className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
            tabIndex={0}
            role="region"
            aria-label="Pending borrow requests table"
          >
            <table className="min-w-full divide-y divide-border text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Member Details</th>
                  <th className="px-4 py-3">Requested Book</th>
                  <th className="px-4 py-3">Requested At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-subtle/80 transition-colors">
                    {/* Request ID */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-medium text-text tabular-nums">
                      #{req.id}
                    </td>

                    {/* Member Details */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-text">{req.userName}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Card:{' '}
                        <span className="font-mono text-text-secondary">
                          {req.libraryMemberId || `#USER-${req.userId}`}
                        </span>
                      </div>
                    </td>

                    {/* Book Details */}
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-semibold text-text line-clamp-1">
                        {req.bookTitle}
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5 font-mono">
                        ISBN: {req.isbn} • ID #{req.bookId}
                      </div>
                    </td>

                    {/* Requested At */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary tabular-nums">
                      <div>{formatDateTime(req.requestedAt)}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge variant="warning" dot={true} label="Pending Review" size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setRequestToIssue(req)}
                          disabled={issueMutation.isPending || rejectMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          title="Issue this book loan to member"
                          leftIcon={
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        >
                          Issue Book
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRequestToReject(req)}
                          disabled={issueMutation.isPending || rejectMutation.isPending}
                          className="text-danger hover:bg-danger-soft hover:border-red-300"
                          title="Reject this borrow request"
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Issue Confirmation Modal */}
      <IssueBorrowModal
        isOpen={Boolean(requestToIssue)}
        request={requestToIssue}
        onClose={() => setRequestToIssue(null)}
        onConfirm={handleConfirmIssue}
        isPending={issueMutation.isPending}
      />

      {/* Reject Confirmation Modal */}
      <RejectBorrowModal
        isOpen={Boolean(requestToReject)}
        request={requestToReject}
        onClose={() => setRequestToReject(null)}
        onConfirm={handleConfirmReject}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
};

export default BorrowRequestsQueue;
