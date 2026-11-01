import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAllBorrowRecords } from '../../hooks/useBorrowRecords';
import { formatDate, formatCurrency, getDueStatus } from '../../utils/formatUtils';
import { ErrorState } from '../dashboard/ErrorState';
import { LoanExtensionHistoryModal } from './LoanExtensionHistoryModal';
import { Button, Input, StatusBadge, Card, Select } from '../common';
import type { BorrowResponse } from '../../types';

interface CirculationRegisterProps {
  role: 'ADMIN' | 'LIBRARIAN';
}

type StatusFilter = 'ALL' | 'BORROWED' | 'OVERDUE' | 'RETURNED';
type SortOption =
  | 'DUE_SOONEST'
  | 'DUE_LATEST'
  | 'ISSUE_NEWEST'
  | 'ISSUE_OLDEST'
  | 'MEMBER_AZ'
  | 'BOOK_AZ'
  | 'FINE_HIGHEST';

export const CirculationRegister: React.FC<CirculationRegisterProps> = ({ role }) => {
  const {
    data: records = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAllBorrowRecords();

  const [activeTab, setActiveTab] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('DUE_SOONEST');
  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState<BorrowResponse | null>(null);

  const borrowQueuePath = role === 'ADMIN' ? '/admin/borrow-requests' : '/librarian/borrow-requests';
  const returnQueuePath = role === 'ADMIN' ? '/admin/return-requests' : '/librarian/return-requests';

  // Derived high-level metrics
  const totalCount = records.length;
  const activeCount = records.filter((r) => r.status === 'BORROWED').length;
  const overdueCount = records.filter((r) => r.status === 'OVERDUE').length;
  const returnedCount = records.filter((r) => r.status === 'RETURNED').length;
  const totalFines = records.reduce((sum, r) => sum + (r.fine || 0), 0);

  // Filtered and sorted record list
  const filteredRecords = useMemo(() => {
    const list = records.filter((item) => {
      // 1. Status Tab filter
      if (activeTab !== 'ALL' && item.status !== activeTab) {
        return false;
      }

      // 2. Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchesTitle = item.bookTitle?.toLowerCase().includes(term);
      const matchesName = item.userName?.toLowerCase().includes(term);
      const matchesId = item.id.toString().includes(term);
      const matchesUserId = item.userId.toString().includes(term);
      const matchesBookId = item.bookId.toString().includes(term);

      return (
        matchesTitle ||
        matchesName ||
        matchesId ||
        matchesUserId ||
        matchesBookId
      );
    });

    return list.sort((a, b) => {
      switch (sortBy) {
        case 'DUE_SOONEST':
          return a.dueDate.localeCompare(b.dueDate);
        case 'DUE_LATEST':
          return b.dueDate.localeCompare(a.dueDate);
        case 'ISSUE_NEWEST':
          return b.issueDate.localeCompare(a.issueDate);
        case 'ISSUE_OLDEST':
          return a.issueDate.localeCompare(b.issueDate);
        case 'MEMBER_AZ':
          return a.userName.localeCompare(b.userName);
        case 'BOOK_AZ':
          return a.bookTitle.localeCompare(b.bookTitle);
        case 'FINE_HIGHEST':
          return (b.fine || 0) - (a.fine || 0);
        default:
          return 0;
      }
    });
  }, [records, activeTab, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Circulation Register & Audit
            </h1>
            <StatusBadge
              variant={role === 'ADMIN' ? 'neutral' : 'info'}
              label={role === 'ADMIN' ? 'System Circulation Audit' : 'Librarian Circulation Console'}
              size="sm"
            />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Comprehensive institutional ledger of all active, overdue, and returned book loans with extension audit trails.
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

          <Link to={returnQueuePath}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={
                <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              }
            >
              Return Queue
            </Button>
          </Link>

          <Link to={borrowQueuePath}>
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
              Borrow Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-text-muted">Total Loans Issued</p>
          <p className="mt-1 text-2xl font-bold text-text tabular-nums">{totalCount}</p>
          <p className="mt-1 text-[11px] text-text-muted">Institutional loan ledger volume</p>
        </Card>

        <Card className="p-4 border-primary/20 bg-primary-soft">
          <p className="text-xs font-semibold text-primary">Active Issued Loans</p>
          <p className="mt-1 text-2xl font-bold text-primary tabular-nums">{activeCount}</p>
          <p className="mt-1 text-[11px] text-primary/80">Currently in circulation with patrons</p>
        </Card>

        <Card className="p-4 border-red-200/80 bg-danger-soft">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-danger">Overdue Loans</p>
            {overdueCount > 0 && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">
                Action Required
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-danger tabular-nums">{overdueCount}</p>
          <p className="mt-1 text-[11px] text-danger/80 tabular-nums">
            Total Assessed Fines: {formatCurrency(totalFines)}
          </p>
        </Card>

        <Card className="p-4 border-emerald-200/80 bg-success-soft">
          <p className="text-xs font-semibold text-success">Returned Records</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950 tabular-nums">{returnedCount}</p>
          <p className="mt-1 text-[11px] text-emerald-800">Successfully restored to shelves</p>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-2 -mb-px" role="tablist">
          {[
            { id: 'ALL', label: 'All Records', count: totalCount },
            { id: 'BORROWED', label: 'Active Loans', count: activeCount },
            { id: 'OVERDUE', label: 'Overdue Loans', count: overdueCount },
            { id: 'RETURNED', label: 'Returned History', count: returnedCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id as StatusFilter)}
                className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-xs font-semibold transition cursor-pointer ${isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:border-border hover:text-text'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] tabular-nums ${isActive
                      ? 'bg-primary-soft text-primary font-bold'
                      : 'bg-surface-subtle text-text-muted'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Sort Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by book title, member name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputSize="sm"
              aria-label="Search circulation records"
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
            <label htmlFor="sort-register" className="text-xs font-medium text-text-secondary whitespace-nowrap">
              Sort by:
            </label>
            <Select<SortOption>
              id="sort-register"
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              selectSize="sm"
              aria-label="Sort register by"
              className="min-w-50"
            >
              <option value="DUE_SOONEST">Due Date (Soonest first)</option>
              <option value="DUE_LATEST">Due Date (Furthest first)</option>
              <option value="ISSUE_NEWEST">Issue Date (Newest first)</option>
              <option value="ISSUE_OLDEST">Issue Date (Oldest first)</option>
              <option value="MEMBER_AZ">Member Name (A-Z)</option>
              <option value="BOOK_AZ">Book Title (A-Z)</option>
              <option value="FINE_HIGHEST">Late Fine (Highest first)</option>
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
            <div className="h-10 w-full rounded bg-surface-subtle" />
          </div>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Unable to load circulation records"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Data Table */}
      {!isLoading && !isError && (
        <>
          {filteredRecords.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle text-text-muted mb-4">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text">
                {searchTerm
                  ? 'No matching circulation records'
                  : activeTab === 'ALL'
                    ? 'No circulation records in register'
                    : `No ${activeTab.toLowerCase()} loans found`}
              </h3>
              <p className="mt-1 text-xs text-text-secondary max-w-md mx-auto">
                {searchTerm
                  ? `No borrow records matched your search query "${searchTerm}". Try adjusting keywords or clear the filter.`
                  : activeTab === 'ALL'
                    ? 'No books have been checked out yet. Once member requests are approved, they will appear in this ledger.'
                    : `There are currently zero loans in ${activeTab} status.`}
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
                aria-label="Circulation ledger table"
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Loan ID</th>
                      <th className="py-3 px-4">Member Info</th>
                      <th className="py-3 px-4">Book Details</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Return Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Late Fine</th>
                      <th className="py-3 px-4 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {filteredRecords.map((item) => {
                      const isReturned = item.status === 'RETURNED';
                      const isOverdue = item.status === 'OVERDUE';
                      const dueInfo = getDueStatus(item.dueDate, isReturned);
                      const hasFine = Boolean(item.fine && item.fine > 0);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-surface-subtle/80 transition-colors"
                        >
                          {/* Loan ID */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-text tabular-nums">
                              #LOAN-{item.id}
                            </span>
                          </td>

                          {/* Member */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-text">
                              {item.userName}
                            </div>
                            <div className="font-mono text-[11px] text-text-muted">
                              #USER-{item.userId}
                            </div>
                          </td>

                          {/* Book */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-text truncate">
                              {item.bookTitle}
                            </div>
                            <div className="font-mono text-[11px] text-text-muted">
                              Book #{item.bookId}
                            </div>
                          </td>

                          {/* Issue Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-text-secondary tabular-nums">
                            {formatDate(item.issueDate)}
                          </td>

                          {/* Due Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-medium text-text tabular-nums">
                              {formatDate(item.dueDate)}
                            </div>
                            {!isReturned && (
                              <div className="mt-0.5">
                                <span
                                  className={`inline-block font-semibold rounded px-1.5 py-0.5 text-[10px] tabular-nums ${dueInfo.isOverdue
                                      ? 'bg-danger-soft text-danger'
                                      : dueInfo.isDueSoon
                                        ? 'bg-warning-soft text-warning'
                                        : 'bg-surface-subtle text-text-secondary'
                                    }`}
                                >
                                  {dueInfo.text}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Return Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                            {item.returnDate ? (
                              <span className="text-success font-medium">
                                {formatDate(item.returnDate)}
                              </span>
                            ) : (
                              <span className="text-text-muted font-mono">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isOverdue ? (
                              <StatusBadge variant="danger" dot={true} label={item.status} size="sm" />
                            ) : isReturned ? (
                              <StatusBadge variant="success" label={item.status} size="sm" />
                            ) : (
                              <StatusBadge variant="info" label={item.status} size="sm" />
                            )}
                          </td>

                          {/* Fine */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {hasFine ? (
                              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] tabular-nums">
                                {formatCurrency(item.fine)}
                              </span>
                            ) : (
                              <span className="text-text-muted font-mono text-[11px] tabular-nums">
                                ₹0.00
                              </span>
                            )}
                          </td>

                          {/* Audit Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedLoanForHistory(item)}
                              leftIcon={
                                <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              }
                            >
                              Extensions
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex items-center justify-between border-t border-border bg-surface-subtle/50 px-4 py-2.5 text-text-muted text-[11px]">
                <span className="tabular-nums">
                  Showing {filteredRecords.length} of {records.length} circulation record{records.length === 1 ? '' : 's'}
                </span>
                <span>Active Status Tab: {activeTab}</span>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Extension History Modal */}
      <LoanExtensionHistoryModal
        isOpen={Boolean(selectedLoanForHistory)}
        loan={selectedLoanForHistory}
        onClose={() => setSelectedLoanForHistory(null)}
      />
    </div>
  );
};

export default CirculationRegister;
