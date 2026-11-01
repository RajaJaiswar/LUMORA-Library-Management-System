import apiClient from './axios';
import type {
  BorrowResponse,
  BorrowStatus,
  BorrowExtensionRequest,
  BorrowExtensionResponse,
} from '../types';

/**
 * Fetch all borrow records (active, overdue, and returned) for the authenticated user.
 * Role: Authenticated (Member)
 * Endpoint: GET /api/borrow/my
 */
export const getMyBorrowRecords = async (): Promise<BorrowResponse[]> => {
  const response = await apiClient.get<BorrowResponse[]>('/api/borrow/my');
  return response.data;
};

/**
 * Fetch active non-returned borrow records for the authenticated user.
 * Evaluates dynamically to OVERDUE if LocalDate.now() > dueDate.
 * Role: Authenticated (Member)
 * Endpoint: GET /api/borrow/my/active
 */
export const getMyActiveBorrowRecords = async (): Promise<BorrowResponse[]> => {
  const response = await apiClient.get<BorrowResponse[]>('/api/borrow/my/active');
  return response.data;
};

/**
 * Fetch active borrow records that are past their due date for the authenticated user.
 * Role: Authenticated (Member)
 * Endpoint: GET /api/borrow/my/overdue
 */
export const getMyOverdueBorrowRecords = async (): Promise<BorrowResponse[]> => {
  const response = await apiClient.get<BorrowResponse[]>('/api/borrow/my/overdue');
  return response.data;
};

/**
 * Fetch all borrow records across all members.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow
 */
export const getAllBorrowRecords = async (): Promise<BorrowResponse[]> => {
  const response = await apiClient.get<BorrowResponse[]>('/api/borrow');
  return response.data;
};

/**
 * Filter borrow records system-wide by status ('BORROWED', 'OVERDUE', 'RETURNED').
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow/status/{status}
 */
export const getBorrowRecordsByStatus = async (
  status: BorrowStatus
): Promise<BorrowResponse[]> => {
  const response = await apiClient.get<BorrowResponse[]>(
    `/api/borrow/status/${status}`
  );
  return response.data;
};

/**
 * Fetch a single loan record by ID.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow/{id}
 */
export const getBorrowRecordById = async (
  id: number
): Promise<BorrowResponse> => {
  const response = await apiClient.get<BorrowResponse>(`/api/borrow/${id}`);
  return response.data;
};

/**
 * Extend an active loan's due date (max 2 extensions, max 7 days per extension, non-overdue).
 * Role: Authenticated (Owner Member or Staff)
 * Endpoint: PUT /api/borrow/{id}/extend
 */
export const extendBorrow = async (
  id: number,
  request: BorrowExtensionRequest
): Promise<BorrowResponse> => {
  const response = await apiClient.put<BorrowResponse>(
    `/api/borrow/${id}/extend`,
    request
  );
  return response.data;
};

/**
 * Retrieve the extension history audit log for a specific loan record.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow/{id}/extensions
 */
export const getExtensionHistory = async (
  id: number
): Promise<BorrowExtensionResponse[]> => {
  const response = await apiClient.get<BorrowExtensionResponse[]>(
    `/api/borrow/${id}/extensions`
  );
  return response.data;
};

/**
 * Retrieve the global extension history audit log across all library loans.
 * Role: ADMIN, LIBRARIAN
 * Endpoint: GET /api/borrow/extensions
 */
export const getAllExtensionHistory = async (): Promise<BorrowExtensionResponse[]> => {
  const response = await apiClient.get<BorrowExtensionResponse[]>(
    '/api/borrow/extensions'
  );
  return response.data;
};
