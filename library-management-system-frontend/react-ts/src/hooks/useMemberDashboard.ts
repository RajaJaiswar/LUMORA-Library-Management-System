import { useQuery } from '@tanstack/react-query';
import {
  getMyBorrowRecords,
  getMyBorrowRequests,
  getMyReturnRequests,
} from '../api/memberApi';
import type {
  BorrowResponse,
  BorrowRequestResponse,
  ReturnRequestResponse,
} from '../types';

export const useMemberBorrowRecords = () => {
  return useQuery<BorrowResponse[], Error>({
    queryKey: ['member', 'borrow-records'],
    queryFn: getMyBorrowRecords,
    staleTime: 1000 * 60 * 2,
  });
};

export const useMemberBorrowRequests = () => {
  return useQuery<BorrowRequestResponse[], Error>({
    queryKey: ['member', 'borrow-requests'],
    queryFn: getMyBorrowRequests,
    staleTime: 1000 * 60 * 2,
  });
};

export const useMemberReturnRequests = () => {
  return useQuery<ReturnRequestResponse[], Error>({
    queryKey: ['member', 'return-requests'],
    queryFn: getMyReturnRequests,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Consolidated hook for the member dashboard aggregating legitimate member read endpoints.
 */
export const useMemberDashboard = () => {
  const recordsQuery = useMemberBorrowRecords();
  const borrowRequestsQuery = useMemberBorrowRequests();
  const returnRequestsQuery = useMemberReturnRequests();

  const isLoading =
    recordsQuery.isLoading ||
    borrowRequestsQuery.isLoading ||
    returnRequestsQuery.isLoading;

  const isError =
    recordsQuery.isError ||
    borrowRequestsQuery.isError ||
    returnRequestsQuery.isError;

  const error =
    recordsQuery.error ||
    borrowRequestsQuery.error ||
    returnRequestsQuery.error;

  const records = recordsQuery.data || [];
  const borrowRequests = borrowRequestsQuery.data || [];
  const returnRequests = returnRequestsQuery.data || [];

  // Derived metrics
  const activeLoans = records.filter((r) => r.status !== 'RETURNED');
  const overdueLoans = records.filter((r) => r.status === 'OVERDUE');
  const returnedLoans = records.filter((r) => r.status === 'RETURNED');
  const pendingBorrowRequests = borrowRequests.filter((r) => r.status === 'PENDING');
  const pendingReturnRequests = returnRequests.filter((r) => r.status === 'PENDING');

  const totalOutstandingFine = records.reduce((sum, r) => {
    if (r.status === 'OVERDUE' && r.fine) {
      return sum + r.fine;
    }
    return sum;
  }, 0);

  const refetch = () => {
    recordsQuery.refetch();
    borrowRequestsQuery.refetch();
    returnRequestsQuery.refetch();
  };

  return {
    isLoading,
    isError,
    error,
    refetch,
    data: {
      records,
      activeLoans,
      overdueLoans,
      returnedLoans,
      borrowRequests,
      pendingBorrowRequests,
      returnRequests,
      pendingReturnRequests,
      totalOutstandingFine,
    },
  };
};
