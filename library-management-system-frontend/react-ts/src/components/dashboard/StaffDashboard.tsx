import React from 'react';
import { Link } from 'react-router-dom';
import { useStaffDashboard } from '../../hooks/useDashboard';
import { StatCard } from './StatCard';
import { MetricGrid } from './MetricGrid';
import { DashboardSection } from './DashboardSection';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { Button, StatusBadge } from '../common';

interface StaffDashboardProps {
  role: 'ADMIN' | 'LIBRARIAN';
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ role }) => {
  const { data, isLoading, isError, error, refetch, isFetching } = useStaffDashboard();

  const basePath = role === 'ADMIN' ? '/admin' : '/librarian';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {role === 'ADMIN' ? 'System Administration' : 'Librarian Console'} Dashboard
            </h1>
            <StatusBadge
              variant={role === 'ADMIN' ? 'info' : 'neutral'}
              label={role}
              size="sm"
            />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time system telemetry and circulation metrics from GET /api/dashboard.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={
              !isFetching ? (
                <svg
                  className="h-4 w-4 text-slate-500"
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
              ) : undefined
            }
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton cardCount={4} showTableSkeleton />}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Unable to retrieve dashboard metrics"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Data Metrics Views */}
      {!isLoading && !isError && data && (
        <div className="space-y-8">
          {/* Section 1: Executive KPI Overview */}
          <MetricGrid columns={4}>
            <StatCard
              title="Total Users"
              value={data.totalUsers}
              subtitle={`${data.activeUsers} active, ${data.inactiveUsers} inactive`}
              colorTone="indigo"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            />

            <StatCard
              title="Catalogue Titles"
              value={data.totalBooks}
              subtitle={`${data.totalBookCopies} total physical copies`}
              colorTone="blue"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />

            <StatCard
              title="Active Loans"
              value={data.activeBorrowRecords}
              subtitle={`${data.overdueBorrowRecords} currently overdue`}
              colorTone="emerald"
              badge={
                data.overdueBorrowRecords > 0
                  ? { text: `${data.overdueBorrowRecords} Overdue`, variant: 'danger' }
                  : { text: 'Healthy', variant: 'success' }
              }
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              }
            />

            <StatCard
              title="Outstanding Fines"
              value={formatCurrency(data.totalOutstandingFine)}
              subtitle="Uncollected overdue penalty balance"
              colorTone="amber"
              badge={
                data.totalOutstandingFine > 0
                  ? { text: 'Pending Dues', variant: 'warning' }
                  : { text: 'Settled', variant: 'success' }
              }
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </MetricGrid>

          {/* Section 2: Action Queues (Pending Requests) */}
          <DashboardSection
            title="Operational Queues"
            description="Active queues requiring staff verification and physical processing."
          >
            <MetricGrid columns={2}>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pending Borrow Requests
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      data.pendingBorrowRequests > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {data.pendingBorrowRequests} Pending
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  {data.pendingBorrowRequests}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Members awaiting book issue approval and pickup.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    to={`${basePath}/borrow-requests`}
                    className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    <span>Inspect borrow request queue</span>
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pending Return Requests
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      data.pendingReturnRequests > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {data.pendingReturnRequests} Pending
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  {data.pendingReturnRequests}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Physical book returns awaiting staff verification into stock.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    to={`${basePath}/return-requests`}
                    className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    <span>Inspect return confirmation queue</span>
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </MetricGrid>
          </DashboardSection>

          {/* Section 3: Inventory & Circulation Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardSection
              title="Book Inventory Breakdown"
              description="Real-time copy distribution across titles and stock."
            >
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-600">Total Unique Titles</span>
                  <span className="font-semibold text-slate-900">{data.totalBooks}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-600">Total Physical Copies</span>
                  <span className="font-semibold text-slate-900">{data.totalBookCopies}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-600">Available on Shelf</span>
                  <span className="font-semibold text-emerald-600">{data.availableBookCopies}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-600">Currently Borrowed</span>
                  <span className="font-semibold text-blue-600">{data.borrowedBookCopies}</span>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection
              title="Circulation Lifecycle"
              description="Historical and active loan records across the institution."
            >
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-600">Active Issued Loans</span>
                  <span className="font-semibold text-primary">{data.activeBorrowRecords}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-600">Overdue Loans</span>
                  <span className={`font-semibold ${data.overdueBorrowRecords > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {data.overdueBorrowRecords}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-600">Successfully Returned Records</span>
                  <span className="font-semibold text-emerald-600">{data.returnedBorrowRecords}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-600">Total Lifetime Loan Volume</span>
                  <span className="font-semibold text-slate-900">
                    {data.activeBorrowRecords + data.returnedBorrowRecords}
                  </span>
                </div>
              </div>
            </DashboardSection>
          </div>

          {/* Section 4: User Demographics */}
          <DashboardSection
            title="User Community Demographics"
            description="Account statuses and institutional role distribution."
          >
            <MetricGrid columns={4}>
              <StatCard
                title="Active Members"
                value={data.totalMembers}
                subtitle="Registered library patrons"
                colorTone="blue"
              />
              <StatCard
                title="Staff Librarians"
                value={data.totalLibrarians}
                subtitle="Desk & circulation operators"
                colorTone="purple"
              />
              <StatCard
                title="System Administrators"
                value={data.totalAdmins}
                subtitle="Privileged administrators"
                colorTone="indigo"
              />
              <StatCard
                title="Account Status"
                value={`${data.activeUsers} / ${data.totalUsers}`}
                subtitle={`${data.inactiveUsers} suspended accounts`}
                colorTone="slate"
              />
            </MetricGrid>
          </DashboardSection>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
