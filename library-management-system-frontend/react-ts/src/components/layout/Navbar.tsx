import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge, Brand } from '../common';

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMobileOpen }) => {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary lg:hidden"
            aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isMobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link to="/" className="flex items-center focus:outline-hidden focus:ring-2 focus:ring-primary rounded-lg py-1">
            <Brand size="header" />
          </Link>
        </div>

        {/* Right: Authenticated User Info & Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user && (
            <Link
              to="/profile"
              className="flex items-center space-x-3 group hover:opacity-90 transition-opacity p-1.5 -m-1.5 rounded-xl hover:bg-slate-100/70"
              title="View and edit your personal profile"
            >
              {/* User Avatar Circle */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-slate-200 group-hover:ring-primary-light transition-all"
                title={user.name}
              >
                {getInitials(user.name)}
              </div>

              {/* Name & Role (hidden on small screens) */}
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {user.email}
                </span>
              </div>

              {/* Role Badge */}
              <StatusBadge
                variant={
                  user.role === 'ADMIN'
                    ? 'info'
                    : user.role === 'LIBRARIAN'
                    ? 'neutral'
                    : 'success'
                }
                label={user.role}
                size="sm"
              />
            </Link>
          )}

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:border-red-200 hover:text-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 shadow-2xs"
            title="Sign out of your account"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
