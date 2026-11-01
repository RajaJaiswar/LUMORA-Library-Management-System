import apiClient from './axios';
import type { ReturnRequestResponse } from '../types';

/**
 * Submit a return request for an active loan.
 * Role: MEMBER
 * Endpoint: POST /api/return-requests/{borrowId}
 */
export const createReturnRequest = async (
  borrowId: number
): Promise<ReturnRequestResponse> => {
  const response = await apiClient.post<ReturnRequestResponse>(
    `/api/return-requests/${borrowId}`
  );
  return response.data;
};

/**
 * Fetch all return requests submitted by the currently authenticated member.
 * Role: MEMBER
 * Endpoint: GET /api/return-requests/my
 */
export const getMyReturnRequests = async (): Promise<ReturnRequestResponse[]> => {
  const response = await apiClient.get<ReturnRequestResponse[]>(
    '/api/return-requests/my'
  );
  return response.data;
};

/**
 * Cancel a pending return request submitted by the authenticated member.
 * Role: MEMBER (Owner only)
 * Endpoint: DELETE /api/return-requests/{id}
 */
export const cancelReturnRequest = async (
  id: number
): Promise<ReturnRequestResponse> => {
  const response = await apiClient.delete<ReturnRequestResponse>(
    `/api/return-requests/${id}`
  );
  return response.data;
};

/**
 * Fetch all return requests currently in PENDING status.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/return-requests/pending
 */
export const getPendingReturnRequests = async (): Promise<ReturnRequestResponse[]> => {
  const response = await apiClient.get<ReturnRequestResponse[]>(
    '/api/return-requests/pending'
  );
  return response.data;
};

/**
 * Fetch a single return request by ID.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/return-requests/{id}
 */
export const getReturnRequestById = async (
  id: number
): Promise<ReturnRequestResponse> => {
  const response = await apiClient.get<ReturnRequestResponse>(
    `/api/return-requests/${id}`
  );
  return response.data;
};

/**
 * Confirm physical return of a book: finalizes return date, calculates fine,
 * restores shelf stock (+1), marks loan RETURNED, and marks request COMPLETED.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: PUT /api/return-requests/{id}/confirm
 */
export const confirmReturn = async (
  id: number
): Promise<ReturnRequestResponse> => {
  const response = await apiClient.put<ReturnRequestResponse>(
    `/api/return-requests/${id}/confirm`
  );
  return response.data;
};

/**
 * Reject a pending return request.
 * Loan remains active (BORROWED/OVERDUE) and book stock is untouched.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: PUT /api/return-requests/{id}/reject
 */
export const rejectReturn = async (
  id: number
): Promise<ReturnRequestResponse> => {
  const response = await apiClient.put<ReturnRequestResponse>(
    `/api/return-requests/${id}/reject`
  );
  return response.data;
};
