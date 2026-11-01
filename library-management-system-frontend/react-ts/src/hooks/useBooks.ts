import { useQuery } from '@tanstack/react-query';
import {
  getBooks,
  searchBooksByTitle,
  getBooksByCategory,
  getAvailableBooks,
} from '../api/bookApi';
import type { BookResponse, PageResponse } from '../types';

export interface UseBooksOptions {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  category?: string;
  availableOnly?: boolean;
}

export interface CatalogueState {
  books: BookResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  isPaginated: boolean;
  queryMode: 'all' | 'search' | 'category' | 'available';
}

/**
 * Custom hook to query books from the backend based on current filter/search/pagination state.
 * Correctly selects the appropriate backend endpoint and cache key.
 */
export const useBooks = (options: UseBooksOptions = {}) => {
  const {
    page = 0,
    size = 20,
    sort = 'id,asc',
    search = '',
    category = '',
    availableOnly = false,
  } = options;

  const trimmedSearch = search.trim();
  const trimmedCategory = category.trim();

  // Determine query mode
  let mode: 'search' | 'category' | 'available' | 'all' = 'all';
  if (trimmedSearch) {
    mode = 'search';
  } else if (trimmedCategory) {
    mode = 'category';
  } else if (availableOnly) {
    mode = 'available';
  }

  // Construct queryKey strictly matching active parameters
  const queryKey = [
    'books',
    mode,
    mode === 'search'
      ? { title: trimmedSearch }
      : mode === 'category'
      ? { category: trimmedCategory }
      : mode === 'available'
      ? {}
      : { page, size, sort },
  ];

  const query = useQuery<PageResponse<BookResponse> | BookResponse[], Error>({
    queryKey,
    queryFn: async () => {
      if (mode === 'search') {
        return searchBooksByTitle(trimmedSearch);
      }
      if (mode === 'category') {
        return getBooksByCategory(trimmedCategory);
      }
      if (mode === 'available') {
        return getAvailableBooks();
      }
      return getBooks({ page, size, sort });
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Normalize data representation
  let catalogue: CatalogueState = {
    books: [],
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    isPaginated: mode === 'all',
    queryMode: mode,
  };

  if (query.data) {
    if (mode === 'all') {
      const pageData = query.data as PageResponse<BookResponse>;
      catalogue = {
        books: pageData.content || [],
        page: pageData.page,
        size: pageData.size,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
        first: pageData.first,
        last: pageData.last,
        isPaginated: true,
        queryMode: mode,
      };
    } else {
      const listData = query.data as BookResponse[];
      catalogue = {
        books: listData || [],
        page: 0,
        size: listData?.length || 0,
        totalElements: listData?.length || 0,
        totalPages: listData && listData.length > 0 ? 1 : 0,
        first: true,
        last: true,
        isPaginated: false,
        queryMode: mode,
      };
    }
  }

  return {
    ...query,
    catalogue,
  };
};
