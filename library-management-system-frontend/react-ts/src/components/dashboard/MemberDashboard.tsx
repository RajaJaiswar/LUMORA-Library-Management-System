import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMemberDashboard } from '../../hooks/useMemberDashboard';
import { StatCard } from './StatCard';
import { MetricGrid } from './MetricGrid';
import { DashboardSection } from './DashboardSection';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { StatusBadge, type BadgeVariant } from '../common/StatusBadge';
import { useToast } from '../common/Toast';
import type { BorrowResponse, BorrowRequestResponse, ReturnRequestResponse } from '../../types';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useMemberDashboard();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const mapStatusToVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'OVERDUE':
      case 'REJECTED':
      case 'EXPIRED':
        return 'danger';
      case 'BORROWED':
      case 'PENDING':
        return 'warning';
      case 'RETURNED':
      case 'COMPLETED':
      case 'ISSUED':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success('Your borrowing records and fine balance are up to date.', 'Dashboard Refreshed');
    } catch {
      toast.error('Unable to refresh dashboard metrics. Please try again.', 'Refresh Failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Welcome back, {user?.name || 'Member'}
            </h1>
            <StatusBadge variant="info" label="Member Portal" size="sm" />
          </div>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            Track your borrowed library books, due dates, and pending circulation requests.
          </p>
        </div>

        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={
              <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton cardCount={4} showTableSkeleton />}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Unable to load member dashboard"
          error={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Data Views */}
      {!isLoading && !isError && (
        <div className="space-y-8">
          {/* Section 1: KPI Stat Cards */}
          <MetricGrid columns={4}>
            <StatCard
              title="Active Loans"
              value={data.activeLoans.length}
              subtitle="Books currently in your possession"
              colorTone="blue"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />

            <StatCard
              title="Overdue Books"
              value={data.overdueLoans.length}
              subtitle={data.overdueLoans.length > 0 ? 'Requires immediate return' : 'No overdue loans'}
              colorTone="rose"
              badge={
                data.overdueLoans.length > 0
                  ? { text: 'Action Required', variant: 'danger' }
                  : { text: 'All Current', variant: 'success' }
              }
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              }
            />

            <StatCard
              title="Pending Requests"
              value={data.pendingBorrowRequests.length}
              subtitle="Awaiting staff issue approval"
              colorTone="amber"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatCard
              title="Outstanding Fine"
              value={formatCurrency(data.totalOutstandingFine)}
              subtitle={data.totalOutstandingFine > 0 ? 'Accumulated overdue fines' : 'Clean account balance'}
              colorTone="emerald"
              badge={
                data.totalOutstandingFine > 0
                  ? { text: 'Pending Due', variant: 'warning' }
                  : { text: 'Zero Balance', variant: 'success' }
              }
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              }
            />
          </MetricGrid>

          {/* Section 2: Active Borrowings Table */}
          <DashboardSection
            title="Active Borrowings"
            description="Books currently issued to your account."
            action={
              <Link
                to="/member/loans"
                className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                View all loan history →
              </Link>
            }
          >
            {data.activeLoans.length === 0 ? (
              <Card variant="subtle" className="p-8 text-center border-dashed">
                <svg className="mx-auto h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-text">No active book loans</h3>
                <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  You currently have no books borrowed. Browse our collection to request a loan.
                </p>
                <div className="mt-4">
                  <Link to="/member/catalogue">
                    <Button size="sm" variant="primary">
                      Browse Book Catalogue
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-left text-xs">
                    <thead className="bg-surface-subtle text-text-secondary font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Book Title</th>
                        <th className="px-4 py-3">Issue Date</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Fine (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.activeLoans.map((loan: BorrowResponse) => (
                        <tr key={loan.id} className="hover:bg-primary-soft/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-text">
                            {loan.bookTitle}
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {formatDate(loan.issueDate)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                loan.status === 'OVERDUE'
                                  ? 'font-bold text-danger'
                                  : 'text-text-secondary'
                              }
                            >
                              {formatDate(loan.dueDate)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              variant={mapStatusToVariant(loan.status)}
                              label={loan.status}
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-text font-mono tabular-nums">
                            {loan.fine ? formatCurrency(loan.fine) : '₹0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </DashboardSection>

          {/* Section 3: Dual Columns for Borrow & Return Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Borrow Requests */}
            <DashboardSection
              title="Recent Borrow Requests"
              description="Status of your requests submitted to the library."
              action={
                <Link
                  to="/member/borrow"
                  className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  View requests →
                </Link>
              }
            >
              {data.borrowRequests.length === 0 ? (
                <Card variant="subtle" className="p-6 text-center text-xs text-text-muted border-dashed">
                  No borrow requests submitted yet.
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden divide-y divide-border shadow-xs">
                  {data.borrowRequests.slice(0, 5).map((req: BorrowRequestResponse) => (
                    <div key={req.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-subtle/50 transition-colors">
                      <div>
                        <p className="font-semibold text-text">{req.bookTitle}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Requested: {formatDate(req.requestedAt)}
                        </p>
                      </div>
                      <StatusBadge
                        variant={mapStatusToVariant(req.status)}
                        label={req.status}
                        size="sm"
                      />
                    </div>
                  ))}
                </Card>
              )}
            </DashboardSection>

            {/* Recent Return Requests */}
            <DashboardSection
              title="Recent Return Requests"
              description="Track return confirmations processed by staff."
              action={
                <Link
                  to="/member/returns"
                  className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  View returns →
                </Link>
              }
            >
              {data.returnRequests.length === 0 ? (
                <Card variant="subtle" className="p-6 text-center text-xs text-text-muted border-dashed">
                  No return requests pending or recorded.
                </Card>
              ) : (
                <Card className="p-0 overflow-hidden divide-y divide-border shadow-xs">
                  {data.returnRequests.slice(0, 5).map((ret: ReturnRequestResponse) => (
                    <div key={ret.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-subtle/50 transition-colors">
                      <div>
                        <p className="font-semibold text-text">{ret.bookTitle}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Due Date: {formatDate(ret.dueDate)}
                        </p>
                      </div>
                      <StatusBadge
                        variant={mapStatusToVariant(ret.status)}
                        label={ret.status}
                        size="sm"
                      />
                    </div>
                  ))}
                </Card>
              )}
            </DashboardSection>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
