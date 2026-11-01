import type { BorrowStatus } from '../types';

/**
 * Centralized TanStack Query key factory for circulation queries.
 * Provides consistent, hierarchical query keys for caching and targeted invalidation.
 */
export const circulationKeys = {
  borrowRequests: {
    all: ['borrow-requests'] as const,
    my: () => ['borrow-requests', 'my'] as const,
    pending: () => ['borrow-requests', 'pending'] as const,
    detail: (id: number) => ['borrow-requests', id] as const,
  },
  borrows: {
    all: ['borrow'] as const,
    my: () => ['borrow', 'my'] as const,
    myActive: () => ['borrow', 'my', 'active'] as const,
    myOverdue: () => ['borrow', 'my', 'overdue'] as const,
    register: () => ['borrow', 'all'] as const,
    byStatus: (status: BorrowStatus) => ['borrow', 'status', status] as const,
    detail: (id: number) => ['borrow', id] as const,
    extensions: (id: number) => ['borrow', id, 'extensions'] as const,
    allExtensions: () => ['borrow', 'extensions'] as const,
  },
  returnRequests: {
    all: ['return-requests'] as const,
    my: () => ['return-requests', 'my'] as const,
    pending: () => ['return-requests', 'pending'] as const,
    detail: (id: number) => ['return-requests', id] as const,
  },
  // Legacy / cross-domain keys that circulation mutations interact with:
  legacyMember: {
    borrowRecords: ['member', 'borrow-records'] as const,
    borrowRequests: ['member', 'borrow-requests'] as const,
    returnRequests: ['member', 'return-requests'] as const,
  },
  books: ['books'] as const,
  dashboardStaff: ['dashboard', 'staff'] as const,
};
