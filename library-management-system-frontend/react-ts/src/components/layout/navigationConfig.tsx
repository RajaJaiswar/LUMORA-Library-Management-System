/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { Role } from '../../types';

export interface NavItem {
  label: string;
  path: string;
  icon: (props: { className?: string }) => React.ReactElement;
  description?: string;
}

// Inline SVG icons (heroicon-style 24x24 outline)
const DashboardIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const BooksIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const BorrowIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const LoansIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const ReturnsIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

const UsersIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const CirculationIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const ProfileIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const navigationConfig: Record<Role, NavItem[]> = {
  MEMBER: [
    {
      label: 'Dashboard',
      path: '/member/dashboard',
      icon: DashboardIcon,
      description: 'Member overview & active loans summary',
    },
    {
      label: 'Book Catalogue',
      path: '/member/catalogue',
      icon: BooksIcon,
      description: 'Search & browse available books',
    },
    {
      label: 'Borrow Requests',
      path: '/member/borrow',
      icon: BorrowIcon,
      description: 'Submit & view pending borrow requests',
    },
    {
      label: 'My Loans',
      path: '/member/loans',
      icon: LoansIcon,
      description: 'Active loans, due dates & extensions',
    },
    {
      label: 'Return Requests',
      path: '/member/returns',
      icon: ReturnsIcon,
      description: 'Initiate book returns & view status',
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: ProfileIcon,
      description: 'Account overview & profile settings',
    },
  ],
  LIBRARIAN: [
    {
      label: 'Dashboard',
      path: '/librarian/dashboard',
      icon: DashboardIcon,
      description: 'Circulation & inventory overview',
    },
    {
      label: 'Book Catalogue',
      path: '/librarian/catalogue',
      icon: BooksIcon,
      description: 'Manage book inventory & details',
    },
    {
      label: 'Borrow Requests',
      path: '/librarian/borrow-requests',
      icon: BorrowIcon,
      description: 'Review and approve pending borrow requests',
    },
    {
      label: 'Return Requests',
      path: '/librarian/return-requests',
      icon: ReturnsIcon,
      description: 'Confirm received book returns',
    },
    {
      label: 'Circulation',
      path: '/librarian/circulation',
      icon: CirculationIcon,
      description: 'Active and overdue borrowing records',
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: ProfileIcon,
      description: 'Account overview & profile settings',
    },
  ],
  ADMIN: [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: DashboardIcon,
      description: 'System administration and metrics',
    },
    {
      label: 'User Management',
      path: '/admin/users',
      icon: UsersIcon,
      description: 'Manage accounts, roles, and status',
    },
    {
      label: 'Book Management',
      path: '/admin/books',
      icon: BooksIcon,
      description: 'Full catalog control & stock management',
    },
    {
      label: 'Borrow Requests',
      path: '/admin/borrow-requests',
      icon: BorrowIcon,
      description: 'System-wide borrow request queue',
    },
    {
      label: 'Return Requests',
      path: '/admin/return-requests',
      icon: ReturnsIcon,
      description: 'System-wide book return queue',
    },
    {
      label: 'Circulation Records',
      path: '/admin/circulation',
      icon: CirculationIcon,
      description: 'Complete borrowing & return history',
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: ProfileIcon,
      description: 'Account overview & profile settings',
    },
  ],
};
