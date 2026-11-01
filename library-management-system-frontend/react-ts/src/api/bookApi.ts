import apiClient from './axios';
import type {
  BookRequest,
  BookResponse,
  BookUpdateRequest,
  AddStockRequest,
  RemoveStockRequest,
  PageResponse,
  BookImportResponse,
} from '../types';

export interface GetBooksParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Fetch paginated books catalogue.
 * Backend endpoint: GET /api/books
 */
export const getBooks = async (
  params?: GetBooksParams
): Promise<PageResponse<BookResponse>> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sort !== undefined) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/books?${queryString}` : '/api/books';

  const response = await apiClient.get<PageResponse<BookResponse>>(url);
  return response.data;
};

/**
 * Search books by title (case-insensitive substring match).
 * Backend endpoint: GET /api/books/search?title={title}
 */
export const searchBooksByTitle = async (
  title: string
): Promise<BookResponse[]> => {
  const response = await apiClient.get<BookResponse[]>('/api/books/search', {
    params: { title },
  });
  return response.data;
};

/**
 * Filter books by category (case-insensitive match).
 * Backend endpoint: GET /api/books/category/{category}
 */
export const getBooksByCategory = async (
  category: string
): Promise<BookResponse[]> => {
  const response = await apiClient.get<BookResponse[]>(
    `/api/books/category/${encodeURIComponent(category)}`
  );
  return response.data;
};

/**
 * Filter books with availableQuantity > 0.
 * Backend endpoint: GET /api/books/available
 */
export const getAvailableBooks = async (): Promise<BookResponse[]> => {
  const response = await apiClient.get<BookResponse[]>('/api/books/available');
  return response.data;
};

/**
 * Fetch a single book record by ID.
 * Backend endpoint: GET /api/books/{id}
 */
export const getBookById = async (id: number): Promise<BookResponse> => {
  const response = await apiClient.get<BookResponse>(`/api/books/${id}`);
  return response.data;
};

/**
 * Create a new book record (Admin / Librarian only).
 * Backend endpoint: POST /api/books
 */
export const createBook = async (
  request: BookRequest
): Promise<BookResponse> => {
  const response = await apiClient.post<BookResponse>('/api/books', request);
  return response.data;
};

/**
 * Update an existing book's metadata (Admin / Librarian only).
 * Backend endpoint: PUT /api/books/{id}
 */
export const updateBook = async (
  id: number,
  request: BookUpdateRequest
): Promise<BookResponse> => {
  const response = await apiClient.put<BookResponse>(`/api/books/${id}`, request);
  return response.data;
};

/**
 * Delete a book record by ID (Admin / Librarian only).
 * Backend endpoint: DELETE /api/books/{id}
 */
export const deleteBook = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/books/${id}`);
};

/**
 * Increase physical book stock copies (Admin / Librarian only).
 * Backend endpoint: POST /api/books/{id}/stock
 */
export const addStock = async (
  id: number,
  request: AddStockRequest
): Promise<BookResponse> => {
  const response = await apiClient.post<BookResponse>(`/api/books/${id}/stock`, request);
  return response.data;
};

/**
 * Decrease physical book stock copies (Admin / Librarian only).
 * Cannot exceed availableQuantity.
 * Backend endpoint: POST /api/books/{id}/stock/remove
 */
export const removeStock = async (
  id: number,
  request: RemoveStockRequest
): Promise<BookResponse> => {
  const response = await apiClient.post<BookResponse>(`/api/books/${id}/stock/remove`, request);
  return response.data;
};

/**
 * Bulk import books from a CSV file (Admin / Librarian only).
 * Backend endpoint: POST /api/books/import
 */
export const importBooks = async (
  file: File
): Promise<BookImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<BookImportResponse>(
    '/api/books/import',
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    }
  );
  return response.data;
};

