/**
 * Shared foundational types for the Library Management System.
 * Exact mirror of backend models and DTOs.
 */

export type Role = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string | null;
  tokenType: string | null;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SetupStatusResponse {
  setupRequired: boolean;
  setupCompleted: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

// ==================== DASHBOARD ====================

export interface DashboardResponse {
  // Users
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalAdmins: number;
  totalLibrarians: number;
  totalMembers: number;

  // Books
  totalBooks: number;
  totalBookCopies: number;
  availableBookCopies: number;
  borrowedBookCopies: number;

  // Borrowing
  activeBorrowRecords: number;
  overdueBorrowRecords: number;
  returnedBorrowRecords: number;

  // Requests
  pendingBorrowRequests: number;
  pendingReturnRequests: number;

  // Fines
  totalOutstandingFine: number;
}

// ==================== BORROW & CIRCULATION ====================

export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface BorrowResponse {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  fine: number | null;
}

export interface BorrowExtensionRequest {
  newDueDate: string;
  reason: string;
}

export interface BorrowExtensionResponse {
  id: number;
  borrowId: number;
  userId: number;
  userName: string;
  bookId: number;
  bookTitle: string;
  oldDueDate: string;
  newDueDate: string;
  reason: string;
  extendedByUserId: number;
  extendedByUserName: string;
  createdAt: string;
}

// ==================== BORROW REQUESTS ====================

export type BorrowRequestStatus =
  | 'PENDING'
  | 'ISSUED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface BorrowRequest {
  bookId: number;
}

export interface BorrowRequestResponse {
  id: number;
  userId: number;
  libraryMemberId: string | null;
  userName: string;
  bookId: number;
  bookTitle: string;
  isbn: string;
  status: BorrowRequestStatus;
  requestedAt: string;
  processedAt: string | null;
}

// ==================== RETURN REQUESTS ====================

export type ReturnRequestStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ReturnRequestResponse {
  id: number;
  borrowId: number;
  userId: number;
  libraryMemberId: string | null;
  userName: string;
  bookId: number;
  bookTitle: string;
  isbn: string;
  issueDate: string;
  dueDate: string;
  returnRequestedDate: string;
  daysOverdue: number;
  fine: number | null;
  borrowStatus: string;
  status: ReturnRequestStatus;
  requestedAt: string;
  processedAt: string | null;
}

// ==================== BOOKS ====================

export interface BookResponse {
  id: number;
  title: string;
  author: string | null;
  isbn: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  category?: string;
  availableOnly?: boolean;
}

export interface BookRequest {
  title: string;
  author?: string;
  isbn: string;
  category: string;
  quantity: number;
}

export interface BookUpdateRequest {
  title: string;
  author?: string;
  isbn: string;
  category: string;
}

export interface AddStockRequest {
  quantity: number;
}

export interface RemoveStockRequest {
  quantity: number;
}

export interface BookImportError {
  row: number;
  message: string;
  rowNumber?: number;
  errorMessage?: string;
}

export interface BookImportResponse {
  totalRows: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: BookImportError[];
}

// ==================== USER MANAGEMENT ====================

export interface RoleUpdateRequest {
  role: Role;
}

export interface StatusUpdateRequest {
  status: UserStatus;
}

export interface UserProfileUpdateRequest {
  name: string;
  email: string;
}

