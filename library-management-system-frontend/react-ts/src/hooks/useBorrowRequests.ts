import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBorrowRequest,
  getMyBorrowRequests,
  cancelBorrowRequest,
  getPendingBorrowRequests,
  getBorrowRequestById,
  issueBook,
  rejectBorrowRequest,
} from '../api/borrowRequestApi';
import { circulationKeys } from '../api/circulationKeys';
import type {
  BorrowRequest,
  BorrowRequestResponse,
} from '../types';

// ==================== QUERY HOOKS ====================

/**
 * Query hook for current member's submitted borrow requests.
 * Role: MEMBER
 */
export const useMyBorrowRequests = (options?: { enabled?: boolean }) => {
  return useQuery<BorrowRequestResponse[], Error>({
    queryKey: circulationKeys.borrowRequests.my(),
    queryFn: getMyBorrowRequests,
    staleTime: 1000 * 30,
    ...options,
  });
};

/**
 * Query hook for staff queue of pending borrow requests.
 * Role: ADMIN, LIBRARIAN
 */
export const usePendingBorrowRequests = () => {
  return useQuery<BorrowRequestResponse[], Error>({
    queryKey: circulationKeys.borrowRequests.pending(),
    queryFn: getPendingBorrowRequests,
    staleTime: 1000 * 30,
  });
};

/**
 * Query hook for a specific borrow request by ID.
 * Role: ADMIN, LIBRARIAN
 */
export const useBorrowRequest = (id: number) => {
  return useQuery<BorrowRequestResponse, Error>({
    queryKey: circulationKeys.borrowRequests.detail(id),
    queryFn: () => getBorrowRequestById(id),
    enabled: id > 0,
    staleTime: 1000 * 30,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Mutation hook to create a new borrow request.
 * Invalidates member request lists, staff pending queue, and staff dashboard stats.
 * Role: MEMBER
 */
export const useCreateBorrowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<BorrowRequestResponse, Error, BorrowRequest>({
    mutationFn: (request: BorrowRequest) => createBorrowRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook for a member to cancel their own pending borrow request.
 * Invalidates borrow request queues and dashboard metrics.
 * Role: MEMBER (Owner only)
 */
export const useCancelBorrowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<BorrowRequestResponse, Error, number>({
    mutationFn: (id: number) => cancelBorrowRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook for staff to issue a book for a pending borrow request.
 * Creates an active loan, decrements available stock, and advances request to ISSUED.
 * Invalidates borrow requests, borrow records (loans), book stock, and staff dashboard.
 * Role: ADMIN, LIBRARIAN
 */
export const useIssueBook = () => {
  const queryClient = useQueryClient();

  return useMutation<BorrowRequestResponse, Error, number>({
    mutationFn: (id: number) => issueBook(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRecords });
      queryClient.invalidateQueries({ queryKey: circulationKeys.books });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook for staff to reject a pending borrow request.
 * Invalidates borrow request queues and dashboard metrics without altering stock.
 * Role: ADMIN, LIBRARIAN
 */
export const useRejectBorrowRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<BorrowRequestResponse, Error, number>({
    mutationFn: (id: number) => rejectBorrowRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrowRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Consolidated hook providing all borrow request mutations.
 */
export const useBorrowRequestMutations = () => {
  const createMutation = useCreateBorrowRequest();
  const cancelMutation = useCancelBorrowRequest();
  const issueMutation = useIssueBook();
  const rejectMutation = useRejectBorrowRequest();

  return {
    createBorrowRequest: createMutation.mutateAsync,
    cancelBorrowRequest: cancelMutation.mutateAsync,
    issueBook: issueMutation.mutateAsync,
    rejectBorrowRequest: rejectMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isIssuing: issueMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isLoading:
      createMutation.isPending ||
      cancelMutation.isPending ||
      issueMutation.isPending ||
      rejectMutation.isPending,
    error:
      createMutation.error ||
      cancelMutation.error ||
      issueMutation.error ||
      rejectMutation.error,
  };
};
