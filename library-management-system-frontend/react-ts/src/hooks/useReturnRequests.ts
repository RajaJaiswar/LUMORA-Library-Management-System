import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReturnRequest,
  getMyReturnRequests,
  cancelReturnRequest,
  getPendingReturnRequests,
  getReturnRequestById,
  confirmReturn,
  rejectReturn,
} from '../api/returnRequestApi';
import { circulationKeys } from '../api/circulationKeys';
import type { ReturnRequestResponse } from '../types';

// ==================== QUERY HOOKS ====================

/**
 * Query hook for return requests submitted by the current member.
 * Role: MEMBER
 */
export const useMyReturnRequests = (options?: { enabled?: boolean }) => {
  return useQuery<ReturnRequestResponse[], Error>({
    queryKey: circulationKeys.returnRequests.my(),
    queryFn: getMyReturnRequests,
    staleTime: 1000 * 30,
    ...options,
  });
};

/**
 * Query hook for staff queue of pending return requests.
 * Role: ADMIN, LIBRARIAN
 */
export const usePendingReturnRequests = () => {
  return useQuery<ReturnRequestResponse[], Error>({
    queryKey: circulationKeys.returnRequests.pending(),
    queryFn: getPendingReturnRequests,
    staleTime: 1000 * 30,
  });
};

/**
 * Query hook for a specific return request by ID.
 * Role: ADMIN, LIBRARIAN
 */
export const useReturnRequest = (id: number) => {
  return useQuery<ReturnRequestResponse, Error>({
    queryKey: circulationKeys.returnRequests.detail(id),
    queryFn: () => getReturnRequestById(id),
    enabled: id > 0,
    staleTime: 1000 * 30,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Mutation hook for a member to submit a return request for an active loan.
 * Role: MEMBER
 */
export const useCreateReturnRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ReturnRequestResponse, Error, number>({
    mutationFn: (borrowId: number) => createReturnRequest(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.returnRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook for a member to cancel their own pending return request.
 * Loan remains active (BORROWED/OVERDUE).
 * Role: MEMBER (Owner only)
 */
export const useCancelReturnRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<ReturnRequestResponse, Error, number>({
    mutationFn: (id: number) => cancelReturnRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.returnRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook for staff to confirm physical book return.
 * Finalizes loan to RETURNED, calculates fine, restores book stock (+1), and marks request COMPLETED.
 * Role: ADMIN, LIBRARIAN
 */
export const useConfirmReturn = () => {
  const queryClient = useQueryClient();

  return useMutation<ReturnRequestResponse, Error, number>({
    mutationFn: (id: number) => confirmReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.returnRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.borrowRecords });
      queryClient.invalidateQueries({ queryKey: circulationKeys.books });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook for staff to reject a pending return request.
 * Loan remains active (BORROWED/OVERDUE) and book stock remains unchanged.
 * Role: ADMIN, LIBRARIAN
 */
export const useRejectReturn = () => {
  const queryClient = useQueryClient();

  return useMutation<ReturnRequestResponse, Error, number>({
    mutationFn: (id: number) => rejectReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.returnRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: circulationKeys.legacyMember.returnRequests });
      queryClient.invalidateQueries({ queryKey: circulationKeys.borrows.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.dashboardStaff });
    },
  });
};

/**
 * Consolidated hook providing all return request mutations.
 */
export const useReturnRequestMutations = () => {
  const createMutation = useCreateReturnRequest();
  const cancelMutation = useCancelReturnRequest();
  const confirmMutation = useConfirmReturn();
  const rejectMutation = useRejectReturn();

  return {
    createReturnRequest: createMutation.mutateAsync,
    cancelReturnRequest: cancelMutation.mutateAsync,
    confirmReturn: confirmMutation.mutateAsync,
    rejectReturn: rejectMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isLoading:
      createMutation.isPending ||
      cancelMutation.isPending ||
      confirmMutation.isPending ||
      rejectMutation.isPending,
    error:
      createMutation.error ||
      cancelMutation.error ||
      confirmMutation.error ||
      rejectMutation.error,
  };
};
