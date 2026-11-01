import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBook, updateBook, deleteBook, addStock, removeStock, importBooks } from '../api/bookApi';
import type {
  BookRequest,
  BookResponse,
  BookUpdateRequest,
  AddStockRequest,
  RemoveStockRequest,
  BookImportResponse,
} from '../types';

/**
 * Mutation hook to create a new book.
 * Invalidates book catalogue queries and staff dashboard statistics on success.
 */
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponse, Error, BookRequest>({
    mutationFn: (request: BookRequest) => createBook(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'staff'] });
    },
  });
};

/**
 * Mutation hook to update an existing book's metadata.
 * Invalidates book catalogue queries and staff dashboard statistics on success.
 */
export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponse, Error, { id: number; request: BookUpdateRequest }>({
    mutationFn: ({ id, request }) => updateBook(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'staff'] });
    },
  });
};

/**
 * Mutation hook to delete a book by ID.
 * Subject to backend business rules (fails if book has borrowing history).
 * Invalidates book catalogue queries and staff dashboard statistics on success.
 */
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'staff'] });
    },
  });
};

/**
 * Mutation hook to increase book stock.
 * Backend endpoint: POST /api/books/{id}/stock
 * Invalidates book catalogue queries and staff dashboard statistics on success.
 */
export const useAddStock = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponse, Error, { id: number; request: AddStockRequest }>({
    mutationFn: ({ id, request }) => addStock(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'staff'] });
    },
  });
};

/**
 * Mutation hook to decrease book stock.
 * Backend endpoint: POST /api/books/{id}/stock/remove
 * Invalidates book catalogue queries and staff dashboard statistics on success.
 */
export const useRemoveStock = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponse, Error, { id: number; request: RemoveStockRequest }>({
    mutationFn: ({ id, request }) => removeStock(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'staff'] });
    },
  });
};

/**
 * Mutation hook to bulk import books from a CSV file.
 * Backend endpoint: POST /api/books/import
 * Invalidates book catalogue queries and staff dashboard statistics on success.
 */
export const useImportBooks = () => {
  const queryClient = useQueryClient();

  return useMutation<BookImportResponse, Error, File>({
    mutationFn: (file: File) => importBooks(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'staff'] });
    },
  });
};

/**
 * Consolidated hook providing all book mutations.
 */
export const useBookMutations = () => {
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();
  const addStockMutation = useAddStock();
  const removeStockMutation = useRemoveStock();
  const importMutation = useImportBooks();

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    addStockMutation,
    removeStockMutation,
    importMutation,
  };
};

export default useBookMutations;
