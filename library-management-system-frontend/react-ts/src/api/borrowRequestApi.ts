import apiClient from './axios';
import type {
  BorrowRequest,
  BorrowRequestResponse,
} from '../types';

/**
 * Submit a new borrow request for a book.
 * Role: MEMBER
 * Endpoint: POST /api/borrow-requests
 */
export const createBorrowRequest = async (
  request: BorrowRequest
): Promise<BorrowRequestResponse> => {
  const response = await apiClient.post<BorrowRequestResponse>(
    '/api/borrow-requests',
    request
  );
  return response.data;
};

/**
 * Fetch all borrow requests submitted by the currently authenticated member.
 * Role: MEMBER
 * Endpoint: GET /api/borrow-requests/my
 */
export const getMyBorrowRequests = async (): Promise<BorrowRequestResponse[]> => {
  const response = await apiClient.get<BorrowRequestResponse[]>(
    '/api/borrow-requests/my'
  );
  return response.data;
};

/**
 * Cancel a pending borrow request submitted by the authenticated member.
 * Role: MEMBER (Owner only)
 * Endpoint: DELETE /api/borrow-requests/{id}
 */
export const cancelBorrowRequest = async (
  id: number
): Promise<BorrowRequestResponse> => {
  const response = await apiClient.delete<BorrowRequestResponse>(
    `/api/borrow-requests/${id}`
  );
  return response.data;
};

/**
 * Fetch all borrow requests currently in PENDING status.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow-requests/pending
 */
export const getPendingBorrowRequests = async (): Promise<BorrowRequestResponse[]> => {
  const response = await apiClient.get<BorrowRequestResponse[]>(
    '/api/borrow-requests/pending'
  );
  return response.data;
};

/**
 * Fetch a single borrow request by ID.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow-requests/{id}
 */
export const getBorrowRequestById = async (
  id: number
): Promise<BorrowRequestResponse> => {
  const response = await apiClient.get<BorrowRequestResponse>(
    `/api/borrow-requests/${id}`
  );
  return response.data;
};

/**
 * Issue a book for a pending borrow request, creating an active loan.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: PUT /api/borrow-requests/{id}/issue
 */
export const issueBook = async (
  id: number
): Promise<BorrowRequestResponse> => {
  const response = await apiClient.put<BorrowRequestResponse>(
    `/api/borrow-requests/${id}/issue`
  );
  return response.data;
};

/**
 * Reject a pending borrow request.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: PUT /api/borrow-requests/{id}/reject
 */
export const rejectBorrowRequest = async (
  id: number
): Promise<BorrowRequestResponse> => {
  const response = await apiClient.put<BorrowRequestResponse>(
    `/api/borrow-requests/${id}/reject`
  );
  return response.data;
};
