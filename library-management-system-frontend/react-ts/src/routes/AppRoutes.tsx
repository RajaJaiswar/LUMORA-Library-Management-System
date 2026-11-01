import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Public pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

// Member placeholder pages
import { MemberDashboardPage } from '../pages/member/MemberDashboardPage';
import { MemberBooksPage } from '../pages/member/MemberBooksPage';
import { MemberBorrowPage } from '../pages/member/MemberBorrowPage';
import { MemberLoansPage } from '../pages/member/MemberLoansPage';
import { MemberReturnsPage } from '../pages/member/MemberReturnsPage';

// Librarian placeholder pages
import { LibrarianDashboardPage } from '../pages/librarian/LibrarianDashboardPage';
import { LibrarianCataloguePage } from '../pages/librarian/LibrarianCataloguePage';
import { LibrarianBorrowRequestsPage } from '../pages/librarian/LibrarianBorrowRequestsPage';
import { LibrarianReturnRequestsPage } from '../pages/librarian/LibrarianReturnRequestsPage';
import { LibrarianCirculationPage } from '../pages/librarian/LibrarianCirculationPage';

// Admin placeholder pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminBooksPage } from '../pages/admin/AdminBooksPage';
import { AdminBorrowRequestsPage } from '../pages/admin/AdminBorrowRequestsPage';
import { AdminReturnRequestsPage } from '../pages/admin/AdminReturnRequestsPage';
import { AdminCirculationPage } from '../pages/admin/AdminCirculationPage';

// Profile page (shared authenticated)
import { ProfilePage } from '../pages/profile/ProfilePage';

/**
 * RootRedirect determines the starting page based on auth state and role.
 */
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'LIBRARIAN':
      return <Navigate to="/librarian/dashboard" replace />;
    case 'MEMBER':
    default:
      return <Navigate to="/member/dashboard" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Member Routes — accessible by MEMBER */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['MEMBER']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MemberDashboardPage />} />
        <Route path="catalogue" element={<MemberBooksPage />} />
        <Route path="borrow" element={<MemberBorrowPage />} />
        <Route path="loans" element={<MemberLoansPage />} />
        <Route path="returns" element={<MemberReturnsPage />} />
      </Route>

      {/* Librarian Routes — accessible by LIBRARIAN and ADMIN */}
      <Route
        path="/librarian"
        element={
          <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LibrarianDashboardPage />} />
        <Route path="catalogue" element={<LibrarianCataloguePage />} />
        <Route path="borrow-requests" element={<LibrarianBorrowRequestsPage />} />
        <Route path="return-requests" element={<LibrarianReturnRequestsPage />} />
        <Route path="circulation" element={<LibrarianCirculationPage />} />
      </Route>

      {/* Admin Routes — accessible exclusively by ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="borrow-requests" element={<AdminBorrowRequestsPage />} />
        <Route path="return-requests" element={<AdminReturnRequestsPage />} />
        <Route path="circulation" element={<AdminCirculationPage />} />
      </Route>

      {/* Shared Authenticated Routes — accessible by ADMIN, LIBRARIAN, MEMBER */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN', 'MEMBER']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
