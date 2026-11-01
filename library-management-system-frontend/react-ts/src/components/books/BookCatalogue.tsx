import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';
import { useBookMutations } from '../../hooks/useBookMutations';
import { useMyBorrowRequests, useCreateBorrowRequest } from '../../hooks/useBorrowRequests';
import { useMyActiveBorrowRecords } from '../../hooks/useBorrowRecords';
import { BookSearchBar } from './BookSearchBar';
import { BookFilters } from './BookFilters';
import { BookTable } from './BookTable';
import { BookCard } from './BookCard';
import { BookPagination } from './BookPagination';
import { BookFormModal } from './BookFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { StockModal } from './StockModal';
import { BookImportModal } from './BookImportModal';
import { BorrowConfirmModal } from './BorrowConfirmModal';
import { ErrorState } from '../dashboard/ErrorState';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { StatusBadge, type BadgeVariant } from '../common/StatusBadge';
import { Alert } from '../common/Alert';
import type { BookResponse, BookRequest, BookUpdateRequest } from '../../types';

interface BookCatalogueProps {
  title?: string;
  subtitle?: string;
  roleBadge?: string;
  badgeTone?: 'blue' | 'purple' | 'indigo' | 'emerald';
}

export const BookCatalogue: React.FC<BookCatalogueProps> = ({
  title = 'Book Catalogue',
  subtitle = 'Browse and search through all books in the library repository.',
  roleBadge,
  badgeTone = 'blue',
}) => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isMember = user?.role === 'MEMBER';

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Mutation and modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<BookResponse | null>(null);
  const [bookToDelete, setBookToDelete] = useState<BookResponse | null>(null);
  const [stockModalConfig, setStockModalConfig] = useState<{ book: BookResponse; mode: 'add' | 'remove' } | null>(null);
  const [bookToBorrow, setBookToBorrow] = useState<BookResponse | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    addStockMutation,
    removeStockMutation,
  } = useBookMutations();

  // Circulation hooks for authenticated members
  const { data: myBorrowRequests } = useMyBorrowRequests({ enabled: isMember });
  const { data: myActiveLoans } = useMyActiveBorrowRecords({ enabled: isMember });
  const createBorrowMutation = useCreateBorrowRequest();

  // Sets of book IDs currently requested or on loan by the member
  const pendingBookIds = useMemo(() => {
    if (!myBorrowRequests) return new Set<number>();
    return new Set(
      myBorrowRequests
        .filter((r) => r.status === 'PENDING')
        .map((r) => r.bookId)
    );
  }, [myBorrowRequests]);

  const activeLoanBookIds = useMemo(() => {
    if (!myActiveLoans) return new Set<number>();
    return new Set(myActiveLoans.map((l) => l.bookId));
  }, [myActiveLoans]);

  const handleConfirmBorrow = async (bookId: number) => {
    await createBorrowMutation.mutateAsync({ bookId });
    setFeedback({
      type: 'success',
      message: `Borrow request submitted for "${bookToBorrow?.title || 'Book'}". Awaiting librarian approval.`,
    });
  };

  // Parse raw filter values from URL search params
  const rawSearch = searchParams.get('search') || '';
  const rawCategory = searchParams.get('category') || '';
  const rawAvailable = searchParams.get('available') === 'true';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = parseInt(searchParams.get('size') || '20', 10);

  // Enforce single active query mode matching backend endpoint capabilities:
  // 1. Title Search (GET /api/books/search?title=...)
  // 2. Category Filter (GET /api/books/category/{category})
  // 3. Availability Filter (GET /api/books/available)
  // 4. Default Paginated Catalogue (GET /api/books?page=...&size=...)
  let activeMode: 'search' | 'category' | 'available' | 'all' = 'all';
  if (rawSearch.trim()) {
    activeMode = 'search';
  } else if (rawCategory.trim()) {
    activeMode = 'category';
  } else if (rawAvailable) {
    activeMode = 'available';
  }

  // Active filter state passed to UI controls (mutually exclusive)
  const search = activeMode === 'search' ? rawSearch.trim() : '';
  const category = activeMode === 'category' ? rawCategory.trim() : '';
  const availableOnly = activeMode === 'available';

  // Sanitize URL if stale/conflicting filter parameters exist simultaneously
  React.useEffect(() => {
    const activeParamsCount = [
      Boolean(rawSearch.trim()),
      Boolean(rawCategory.trim()),
      rawAvailable,
    ].filter(Boolean).length;

    if (activeParamsCount > 1) {
      const sanitized = new URLSearchParams();
      if (activeMode === 'search') sanitized.set('search', search);
      else if (activeMode === 'category') sanitized.set('category', category);
      else if (activeMode === 'available') sanitized.set('available', 'true');
      if (size !== 20) sanitized.set('size', size.toString());
      setSearchParams(sanitized, { replace: true });
    }
  }, [rawSearch, rawCategory, rawAvailable, activeMode, search, category, size, setSearchParams]);

  // TanStack Query
  const { catalogue, isLoading, isError, error, refetch, isFetching } = useBooks({
    page,
    size,
    search,
    category,
    availableOnly,
  });

  // Mutually exclusive filter change handlers:
  // Selecting any filter resets other filter modes and returns page to 0.

  const handleSearchChange = (newSearch: string) => {
    const nextParams = new URLSearchParams();
    if (size !== 20) nextParams.set('size', size.toString());
    if (newSearch.trim()) {
      nextParams.set('search', newSearch.trim());
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryChange = (newCategory: string) => {
    const nextParams = new URLSearchParams();
    if (size !== 20) nextParams.set('size', size.toString());
    if (newCategory.trim()) {
      nextParams.set('category', newCategory.trim());
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleAvailableOnlyChange = (newAvail: boolean) => {
    const nextParams = new URLSearchParams();
    if (size !== 20) nextParams.set('size', size.toString());
    if (newAvail) {
      nextParams.set('available', 'true');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    if (size !== 20) nextParams.set('size', size.toString());
    setSearchParams(nextParams, { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage > 0) {
      nextParams.set('page', newPage.toString());
    } else {
      nextParams.delete('page');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSizeChange = (newSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newSize !== 20) {
      nextParams.set('size', newSize.toString());
    } else {
      nextParams.delete('size');
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  };

  const handleCreate = async (data: BookRequest) => {
    await createMutation.mutateAsync(data);
    setFeedback({ type: 'success', message: `Book "${data.title}" was successfully created.` });
    setIsCreateOpen(false);
  };

  const handleUpdate = async (id: number, data: BookUpdateRequest) => {
    await updateMutation.mutateAsync({ id, request: data });
    setFeedback({ type: 'success', message: `Book "${data.title}" was successfully updated.` });
    setBookToEdit(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setFeedback({ type: 'success', message: 'Book was successfully deleted from the catalogue.' });
    setBookToDelete(null);
  };

  const handleAddStock = async (id: number, quantity: number) => {
    await addStockMutation.mutateAsync({ id, request: { quantity } });
    setFeedback({ type: 'success', message: `Successfully added ${quantity} copies to book stock.` });
    setStockModalConfig(null);
  };

  const handleRemoveStock = async (id: number, quantity: number) => {
    await removeStockMutation.mutateAsync({ id, request: { quantity } });
    setFeedback({ type: 'success', message: `Successfully removed ${quantity} copies from book stock.` });
    setStockModalConfig(null);
  };

  React.useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const hasActiveFilters = activeMode !== 'all';

  const mapBadgeTone = (tone: string): BadgeVariant => {
    switch (tone) {
      case 'emerald':
        return 'success';
      case 'purple':
        return 'neutral';
      case 'blue':
      case 'indigo':
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h1>
            {roleBadge && (
              <StatusBadge
                variant={mapBadgeTone(badgeTone)}
                size="sm"
                label={roleBadge}
              />
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        </div>

        {/* View Toggle (Table / Grid), Import CSV, Add Book & Refresh */}
        <div className="flex items-center space-x-2">
          {canManage && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsImportOpen(true)}
                title="Bulk import books from CSV file"
                leftIcon={
                  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                }
              >
                Import CSV
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Book
              </Button>
            </>
          )}

          <div className="inline-flex rounded-control border border-border bg-surface p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-control p-1.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 ${
                viewMode === 'table'
                  ? 'bg-surface-subtle text-text shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-control p-1.5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 ${
                viewMode === 'grid'
                  ? 'bg-surface-subtle text-text shadow-2xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            isLoading={isFetching}
            leftIcon={
              <svg
                className="h-3.5 w-3.5 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            title="Refresh catalogue"
            aria-label="Refresh catalogue"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'danger'}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Search and Filters Bar */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4">
        <BookSearchBar
          value={search}
          onChange={handleSearchChange}
        />

        <BookFilters
          category={category}
          onCategoryChange={handleCategoryChange}
          availableOnly={availableOnly}
          onAvailableOnlyChange={handleAvailableOnlyChange}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          disabled={isLoading}
        />
      </Card>

      {/* Query Mode Status Notice (for non-paginated backend search results) */}
      {!isLoading && !isError && catalogue.queryMode !== 'all' && (
        <Alert variant="info" className="py-2.5">
          <div className="flex items-center justify-between w-full">
            <span>
              {catalogue.queryMode === 'search' && (
                <>Filtered by title containing: <strong className="font-semibold text-text">"{search}"</strong></>
              )}
              {catalogue.queryMode === 'category' && (
                <>Filtered by category: <strong className="font-semibold text-text">{category}</strong></>
              )}
              {catalogue.queryMode === 'available' && (
                <>Filtered by: <strong className="font-semibold text-text">Available Stock Only</strong></>
              )}
              {' '}(<span className="tabular-nums font-medium">{catalogue.books.length}</span> matches found)
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-semibold text-primary hover:text-primary-hover underline ml-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 rounded"
            >
              Show full catalogue
            </button>
          </div>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-36 rounded-control bg-surface-subtle mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded-control bg-surface-subtle" />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <ErrorState
          title="Failed to retrieve book catalogue"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && catalogue.books.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-text">
            {hasActiveFilters ? 'No books match your criteria' : 'Catalogue is currently empty'}
          </h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try modifying your search query or removing category/availability filters.'
              : 'There are currently no books registered in the system collection.'}
          </p>
          {hasActiveFilters && (
            <div className="mt-5">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Results View (Table or Grid) */}
      {!isLoading && !isError && catalogue.books.length > 0 && (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <div>
              <BookTable
                books={catalogue.books}
                canManage={canManage}
                onEdit={(book) => setBookToEdit(book)}
                onDelete={(book) => setBookToDelete(book)}
                onAddStock={(book) => setStockModalConfig({ book, mode: 'add' })}
                onRemoveStock={(book) => setStockModalConfig({ book, mode: 'remove' })}
                isMember={isMember}
                onBorrow={(book) => setBookToBorrow(book)}
                borrowingBookId={createBorrowMutation.isPending && bookToBorrow ? bookToBorrow.id : null}
                pendingBookIds={pendingBookIds}
                activeLoanBookIds={activeLoanBookIds}
              />
              {catalogue.isPaginated && (
                <BookPagination
                  page={catalogue.page}
                  size={catalogue.size}
                  totalElements={catalogue.totalElements}
                  totalPages={catalogue.totalPages}
                  first={catalogue.first}
                  last={catalogue.last}
                  onPageChange={handlePageChange}
                  onSizeChange={handleSizeChange}
                  disabled={isFetching}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogue.books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    canManage={canManage}
                    onEdit={(b) => setBookToEdit(b)}
                    onDelete={(b) => setBookToDelete(b)}
                    onAddStock={(b) => setStockModalConfig({ book: b, mode: 'add' })}
                    onRemoveStock={(b) => setStockModalConfig({ book: b, mode: 'remove' })}
                    isMember={isMember}
                    onBorrow={(b) => setBookToBorrow(b)}
                    borrowingBookId={createBorrowMutation.isPending && bookToBorrow ? bookToBorrow.id : null}
                    pendingBookIds={pendingBookIds}
                    activeLoanBookIds={activeLoanBookIds}
                  />
                ))}
              </div>
              {catalogue.isPaginated && (
                <Card className="overflow-hidden">
                  <BookPagination
                    page={catalogue.page}
                    size={catalogue.size}
                    totalElements={catalogue.totalElements}
                    totalPages={catalogue.totalPages}
                    first={catalogue.first}
                    last={catalogue.last}
                    onPageChange={handlePageChange}
                    onSizeChange={handleSizeChange}
                    disabled={isFetching}
                  />
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Member Borrow Confirmation Modal */}
      {isMember && (
        <BorrowConfirmModal
          isOpen={Boolean(bookToBorrow)}
          book={bookToBorrow}
          onClose={() => setBookToBorrow(null)}
          onConfirm={handleConfirmBorrow}
          isPending={createBorrowMutation.isPending}
        />
      )}

      {/* Management Modals */}
      {canManage && (
        <>
          <BookFormModal
            isOpen={isCreateOpen || Boolean(bookToEdit)}
            onClose={() => {
              setIsCreateOpen(false);
              setBookToEdit(null);
            }}
            bookToEdit={bookToEdit}
            onSubmitCreate={handleCreate}
            onSubmitUpdate={handleUpdate}
            isPending={createMutation.isPending || updateMutation.isPending}
          />

          <DeleteConfirmModal
            isOpen={Boolean(bookToDelete)}
            book={bookToDelete}
            onClose={() => setBookToDelete(null)}
            onConfirm={handleDelete}
            isPending={deleteMutation.isPending}
          />

          <StockModal
            isOpen={Boolean(stockModalConfig)}
            book={stockModalConfig?.book || null}
            mode={stockModalConfig?.mode || 'add'}
            onClose={() => setStockModalConfig(null)}
            onSubmitAdd={handleAddStock}
            onSubmitRemove={handleRemoveStock}
            isPending={addStockMutation.isPending || removeStockMutation.isPending}
          />

          <BookImportModal
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onImportSuccess={(result) => {
              setFeedback({
                type: 'success',
                message: `CSV import completed: ${result.created} created, ${result.updated} updated, ${result.failed} failed.`,
              });
            }}
          />
        </>
      )}
    </div>
  );
};

export default BookCatalogue;
