import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyBorrowRecords,
  getMyActiveBorrowRecords,
  getMyOverdueBorrowRecords,
  getAllBorrowRecords,
  getBorrowRecordsByStatus,
  getBorrowRecordById,
  extendBorrow,
  getExtensionHistory,
  getAllExtensionHistory,
} from '../api/borrowApi';
import { circulationKeys } from '../api/circulationKeys';
import type {
  BorrowResponse,
  BorrowStatus,
  BorrowExtensionRequest,
  BorrowExtensionResponse,
} from '../types';

// ==================== QUERY HOOKS ====================

/**
 * Query hook for all borrow records (active, overdue, and returned) for the authenticated user.
 * Role: Authenticated (Member)
 */
export const useMyBorrowRecords = (options?: { enabled?: boolean }) => {
  return useQuery<BorrowResponse[], Error>({
    queryKey: circulationKeys.borrows.my(),
    queryFn: getMyBorrowRecords,
    staleTime: 1000 * 30,
    ...options,
  });
};

/**
 * Query hook for active (non-returned) borrow records for the authenticated user.
 * Role: Authenticated (Member)
 */
export const useMyActiveBorrowRecords = (options?: { enabled?: boolean }) => {
  return useQuery<BorrowResponse[], Error>({
    queryKey: circulationKeys.borrows.myActive(),
    queryFn: getMyActiveBorrowRecords,
    staleTime: 1000 * 30,
    ...options,
  });
};

/**
 * Query hook for overdue borrow records for the authenticated user.
 * Role: Authenticated (Member)
 */
export const useMyOverdueBorrowRecords = (options?: { enabled?: boolean }) => {
  return useQuery<BorrowResponse[], Error>({
    queryKey: circulationKeys.borrows.myOverdue(),
    queryFn: getMyOverdueBorrowRecords,
    staleTime: 1000 * 30,
    ...options,
  });
};

/**
 * Query hook for all borrow records system-wide.
 * Role: ADMIN, LIBRARIAN
 */
export const useAllBorrowRecords = () => {
  return useQuery<BorrowResponse[], Error>({
    queryKey: circulationKeys.borrows.register(),
    queryFn: getAllBorrowRecords,
    staleTime: 1000 * 30,
  });
};

/**
 * Query hook for borrow records filtered by status.
 * Role: ADMIN, LIBRARIAN
 */
export const useBorrowRecordsByStatus = (status: BorrowStatus) => {
  return useQuery<BorrowResponse[], Error>({
    queryKey: circulationKeys.borrows.byStatus(status),
    queryFn: () => getBorrowRecordsByStatus(status),
    staleTime: 1000 * 30,
  });
};

/**
 * Query hook for a single loan record by ID.
 * Role: ADMIN, LIBRARIAN
 */
export const useBorrowRecord = (id: number) => {
  return useQuery<BorrowResponse, Error>({
    queryKey: circulationKeys.borrows.detail(id),
    queryFn: () => getBorrowRecordById(id),
    enabled: id > 0,
    staleTime: 1000 * 30,
  });
};

/**
 * Query hook for extension audit events of a specific loan record.
 * Role: ADMIN, LIBRARIAN
 */
export const useExtensionHistory = (id: number) => {
  return useQuery<BorrowExtensionResponse[], Error>({
    queryKey: circulationKeys.borrows.extensions(id),
    queryFn: () => getExtensionHistory(id),
    enabled: id > 0,
    staleTime: 1000 * 30,
  });
};

/**
 * Query hook for the global loan extension audit trail.
 * Role: ADMIN, LIBRARIAN
 */
export const useAllExtensionHistory = () => {
  return useQuery<BorrowExtensionResponse[], Error>({
    queryKey: circulationKeys.borrows.allExtensions(),
    queryFn: getAllExtensionHistory,
    staleTime: 1000 * 30,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Mutation hook to extend an active loan's due date.
 * Validates extension limit (max 2 extensions, max 7 days, non-overdue).
 * Role: Authenticated (Owner Member or Staff)
 */
export const useExtendBorrow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BorrowResponse,
    Error,
    { id: number; request: BorrowExtensionRequest }
  >({
    mutationFn: ({ id, request }) => extendBorrow(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.extensions(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.allExtensions() });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRecords });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Consolidated hook providing all borrow record / loan mutations.
 */
export const useBorrowMutations = () => {
  const extendMutation = useExtendBorrow();

  return {
    extendBorrow: extendMutation.mutateAsync,
    isExtending: extendMutation.isPending,
    isLoading: extendMutation.isPending,
    error: extendMutation.error,
  };
};
