import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useMyActiveBorrowRecords,
  useMyOverdueBorrowRecords,
  useMyBorrowRecords,
  useExtendBorrow,
} from '../../hooks/useBorrowRecords';
import { useCreateReturnRequest, useMyReturnRequests } from '../../hooks/useReturnRequests';
import { formatDate, formatCurrency, getDueStatus } from '../../utils/formatUtils';
import { ErrorState } from '../dashboard/ErrorState';
import { ExtendLoanModal } from './ExtendLoanModal';
import { ReturnConfirmModal } from './ReturnConfirmModal';
import { Button, Input, StatusBadge, Card, Alert } from '../common';
import type { BorrowResponse, BorrowStatus } from '../../types';

type LoanTab = 'active' | 'overdue' | 'all';

export const MemberLoans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LoanTab>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [loanToExtend, setLoanToExtend] = useState<BorrowResponse | null>(null);
  const [loanToReturn, setLoanToReturn] = useState<BorrowResponse | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Circulation query hooks
  const activeQuery = useMyActiveBorrowRecords();
  const overdueQuery = useMyOverdueBorrowRecords();
  const allQuery = useMyBorrowRecords();
  const returnRequestsQuery = useMyReturnRequests();

  // Mutations
  const extendMutation = useExtendBorrow();
  const returnMutation = useCreateReturnRequest();

  // Set of loan IDs with pending return requests
  const pendingReturnBorrowIds = useMemo(() => {
    const list = returnRequestsQuery.data || [];
    return new Set(
      list
        .filter((r) => r.status === 'PENDING')
        .map((r) => r.borrowId)
    );
  }, [returnRequestsQuery.data]);

  const isLoading =
    activeQuery.isLoading || overdueQuery.isLoading || allQuery.isLoading;
  const isFetching =
    activeQuery.isFetching || overdueQuery.isFetching || allQuery.isFetching || returnRequestsQuery.isFetching;

  // Active dataset based on selected tab
  const rawList = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return activeQuery.data || [];
      case 'overdue':
        return overdueQuery.data || [];
      case 'all':
        return allQuery.data || [];
      default:
        return [];
    }
  }, [activeTab, activeQuery.data, overdueQuery.data, allQuery.data]);

  // Derived metrics from all loans query
  const allRecords = allQuery.data || [];
  const activeCount = (activeQuery.data || []).length;
  const overdueCount = (overdueQuery.data || []).length;
  const returnedCount = allRecords.filter((r) => r.status === 'RETURNED').length;

  const totalOutstandingFine = useMemo(() => {
    const activeAndOverdue = activeQuery.data || [];
    return activeAndOverdue.reduce((sum, item) => {
      if (item.fine && item.fine > 0) {
        return sum + item.fine;
      }
      return sum;
    }, 0);
  }, [activeQuery.data]);

  // Search filter
  const displayedLoans = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const term = searchTerm.toLowerCase();
    return rawList.filter((loan) => {
      const matchTitle = loan.bookTitle?.toLowerCase().includes(term);
      const matchId = loan.id.toString().includes(term);
      return matchTitle || matchId;
    });
  }, [rawList, searchTerm]);

  const handleRefresh = () => {
    activeQuery.refetch();
    overdueQuery.refetch();
    allQuery.refetch();
    returnRequestsQuery.refetch();
  };

  const handleConfirmExtend = async (payload: { newDueDate: string; reason: string }) => {
    if (!loanToExtend) return;
    const title = loanToExtend.bookTitle;
    await extendMutation.mutateAsync({
      id: loanToExtend.id,
      request: payload,
    });
    setFeedback({
      type: 'success',
      message: `Loan for "${title}" has been successfully extended to ${formatDate(payload.newDueDate)}.`,
    });
  };

  const handleConfirmReturn = async (borrowId: number) => {
    if (!loanToReturn) return;
    const title = loanToReturn.bookTitle;
    await returnMutation.mutateAsync(borrowId);
    setFeedback({
      type: 'success',
      message: `Return request for "${title}" submitted. Please present the physical book at the library circulation desk.`,
    });
  };

  const currentError =
    activeQuery.error || overdueQuery.error || allQuery.error || returnRequestsQuery.error;
  const isError =
    activeQuery.isError || overdueQuery.isError || allQuery.isError || returnRequestsQuery.isError;

  const renderStatusBadge = (status: BorrowStatus, isOverdue: boolean) => {
    if (status === 'RETURNED') {
      return <StatusBadge variant="success" label="Returned" size="sm" />;
    }

    if (status === 'OVERDUE' || isOverdue) {
      return <StatusBadge variant="danger" dot={true} label="Overdue" size="sm" />;
    }

    return <StatusBadge variant="info" label="Active Loan" size="sm" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              My Borrowed Books
            </h1>
            <StatusBadge variant="info" label="Active Circulation" size="sm" />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Monitor current borrowings, track return deadlines, extend loans, and initiate returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
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

          <Link to="/member/returns">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={
                <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Return Requests
            </Button>
          </Link>

          <Link to="/member/catalogue">
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Browse Catalogue
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
        <Card className="p-4 border-primary/20 bg-primary-soft">
          <p className="text-xs font-semibold text-primary">Active Loans</p>
          <p className="mt-1 text-2xl font-bold text-primary tabular-nums">{activeCount}</p>
        </Card>

        <Card
          className={`p-4 ${
            overdueCount > 0
              ? 'border-red-300 bg-danger-soft'
              : 'border-border bg-surface'
          }`}
        >
          <p className={`text-xs font-semibold ${overdueCount > 0 ? 'text-danger' : 'text-text-muted'}`}>
            Overdue Loans
          </p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${overdueCount > 0 ? 'text-danger' : 'text-text'}`}>
            {overdueCount}
          </p>
        </Card>

        <Card className="p-4 border-emerald-200/80 bg-success-soft">
          <p className="text-xs font-semibold text-success">Returned History</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950 tabular-nums">{returnedCount}</p>
        </Card>

        <Card
          className={`p-4 ${
            totalOutstandingFine > 0
              ? 'border-red-300 bg-danger-soft'
              : 'border-border bg-surface'
          }`}
        >
          <p className={`text-xs font-semibold ${totalOutstandingFine > 0 ? 'text-danger' : 'text-text-muted'}`}>
            Outstanding Fines
          </p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${totalOutstandingFine > 0 ? 'text-danger' : 'text-text'}`}>
            {formatCurrency(totalOutstandingFine)}
          </p>
        </Card>
      </div>

      {/* Circulation Policy Banner */}
      <Alert
        variant="info"
        title="Library Loan Terms & Fine Accrual Policy"
        description={
          <span>
            Standard borrowing duration is 14 days from issue date. Overdue loans accrue a fine of{' '}
            <strong className="font-semibold text-sky-950">₹10.00 / day</strong> until physical collection and return processing by the library desk staff.
          </span>
        }
      />

      {/* View Tabs & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Controls */}
          <div className="flex items-center space-x-1 border border-border p-1 rounded-control bg-surface-subtle text-xs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Active Loans ({activeCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overdue'}
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'overdue'
                  ? 'bg-surface text-danger shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Overdue Loans ({overdueCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 font-medium rounded-button transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              All Loans ({allRecords.length})
            </button>
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search loans by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputSize="sm"
              aria-label="Search loans"
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
          title="Failed to retrieve loan records"
          error={currentError}
          onRetry={handleRefresh}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && displayedLoans.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-text">
            {activeTab === 'active' && 'No active borrowings'}
            {activeTab === 'overdue' && 'No overdue books — Great job!'}
            {activeTab === 'all' && 'No loan history found'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
            {activeTab === 'active' && 'You currently have no books checked out from the library.'}
            {activeTab === 'overdue' && 'All your active books are within their authorized borrowing deadlines.'}
            {activeTab === 'all' && 'You have not borrowed any books from the library collection yet.'}
          </p>
          <div className="mt-5">
            <Link to="/member/catalogue">
              <Button variant="primary" size="sm">
                Browse Catalogue
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Loans Table */}
      {!isLoading && !isError && displayedLoans.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div
            className="overflow-x-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
            tabIndex={0}
            role="region"
            aria-label="Member loans table"
          >
            <table className="min-w-full divide-y divide-border text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3">Loan Status</th>
                  <th className="px-4 py-3">Fine</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {displayedLoans.map((loan) => {
                  const dueInfo = getDueStatus(loan.dueDate, loan.status === 'RETURNED');
                  const hasFine = Boolean(loan.fine && loan.fine > 0);
                  const isReturnPending = pendingReturnBorrowIds.has(loan.id);

                  return (
                    <tr key={loan.id} className="hover:bg-surface-subtle/80 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-text max-w-xs">
                        <div className="line-clamp-2">{loan.bookTitle}</div>
                        <div className="text-[11px] text-text-muted mt-0.5 tabular-nums">Loan #{loan.id}</div>
                      </td>

                      <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap tabular-nums">
                        {formatDate(loan.issueDate)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-text tabular-nums">
                          {formatDate(loan.dueDate)}
                        </div>
                        {loan.status !== 'RETURNED' && (
                          <div className="mt-0.5">
                            {dueInfo.isOverdue ? (
                              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-danger-soft text-danger">
                                Overdue by {dueInfo.days} {dueInfo.days === 1 ? 'day' : 'days'}
                              </span>
                            ) : dueInfo.isDueSoon ? (
                              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-warning-soft text-warning">
                                {dueInfo.days === 0 ? 'Due today' : `Due in ${dueInfo.days} ${dueInfo.days === 1 ? 'day' : 'days'}`}
                              </span>
                            ) : (
                              <span className="text-[11px] text-text-muted">
                                Due in {dueInfo.days} {dueInfo.days === 1 ? 'day' : 'days'}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap tabular-nums">
                        {loan.returnDate ? (
                          formatDate(loan.returnDate)
                        ) : (
                          <span className="text-text-muted italic">On Loan</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(loan.status, dueInfo.isOverdue)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {hasFine ? (
                          <span className="font-semibold text-danger tabular-nums">
                            {formatCurrency(loan.fine)}
                          </span>
                        ) : (
                          <span className="text-text-muted tabular-nums">₹0.00</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {loan.status === 'RETURNED' ? (
                          <span className="text-text-muted italic text-xs">Returned</span>
                        ) : isReturnPending ? (
                          <StatusBadge
                            variant="warning"
                            dot={true}
                            label="Return Pending"
                            size="sm"
                            title="Return request submitted and pending staff check-in"
                          />
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setLoanToExtend(loan)}
                              disabled={dueInfo.isOverdue || extendMutation.isPending}
                              title={
                                dueInfo.isOverdue
                                  ? 'Overdue loans cannot be extended'
                                  : 'Extend loan due date (+ up to 7 days)'
                              }
                              leftIcon={
                                <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              }
                            >
                              Extend
                            </Button>

                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => setLoanToReturn(loan)}
                              disabled={returnMutation.isPending}
                              title="Submit return request for staff verification"
                              leftIcon={
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                              }
                            >
                              Return
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Extension Modal */}
      <ExtendLoanModal
        isOpen={Boolean(loanToExtend)}
        loan={loanToExtend}
        onClose={() => setLoanToExtend(null)}
        onConfirm={handleConfirmExtend}
        isPending={extendMutation.isPending}
      />

      {/* Return Request Confirmation Modal */}
      <ReturnConfirmModal
        isOpen={Boolean(loanToReturn)}
        loan={loanToReturn}
        onClose={() => setLoanToReturn(null)}
        onConfirm={handleConfirmReturn}
        isPending={returnMutation.isPending}
      />
    </div>
  );
};

export default MemberLoans;
