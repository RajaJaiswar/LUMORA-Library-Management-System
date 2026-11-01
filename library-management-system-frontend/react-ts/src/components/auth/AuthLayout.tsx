import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common';

export interface AuthLayoutProps {
  tagline?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  illustrationSrc: string;
  illustrationAlt: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  tagline,
  title,
  subtitle,
  children,
  illustrationSrc,
  illustrationAlt,
}) => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-start bg-[#dbebf6] overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Full-Bleed 2D Illustration Canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={illustrationSrc}
          alt={illustrationAlt}
          className="w-full h-full object-cover object-[85%_20%] sm:object-[80%_center] lg:object-right transition-opacity duration-500"
          loading="eager"
        />

        {/* Desktop: Soft ambient light wash on the left to preserve text legibility while letting clouds shine through */}
        <div className="hidden lg:block absolute inset-0 bg-linear-to-r from-sky-100/20 via-transparent to-transparent pointer-events-none" />

        {/* Mobile: Soft vertical wash that keeps the character visible at the top while grounding the form below */}
        <div className="lg:hidden absolute inset-0 bg-linear-to-b from-transparent via-[#dbebf6]/35 to-[#dbebf6]/75 pointer-events-none" />
      </div>

      {/* Floating Campus Digital Library Badge (Top-Right on Desktop) */}
      <div className="hidden lg:flex absolute top-6 right-8 z-20">
        <span className="inline-flex items-center space-x-2 rounded-full bg-white/35 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-blue-950 border border-white/25 shadow-2xs">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Campus Digital Library</span>
        </span>
      </div>

      {/* Main Content Area: Left-aligned in the open cloud negative space */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:pl-8 xl:pl-10 2xl:pl-14 lg:pr-8 py-8 sm:py-12 flex items-center justify-center lg:justify-start min-h-screen">
        {/* Subtle Frosted-Glass Form Surface blending naturally into the sky and clouds */}
        <div className="w-full max-w-md lg:max-w-122.5 xl:max-w-130 bg-white/35 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg border border-white/25 rounded-3xl shadow-sm shadow-blue-950/5 p-6 sm:p-8 lg:p-9 transition-all">
          {/* Top Brand Logo & Academic Portal Pill */}
          <div className="flex items-start justify-between mb-5">
            <Link
              to="/"
              className="inline-flex items-center group focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-lg p-0.5"
              title="Return to library home"
            >
              <Logo size="auth" />
            </Link>

            {/* Academic Portal Badge */}
            <span className="inline-flex items-center rounded-full bg-blue-500/10 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200/35 mt-1">
              Academic Portal
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-5">
            {tagline && (
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                {tagline}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Form Controls */}
          <div>{children}</div>

          {/* Institutional Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-300/35 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Role-Based Security</span>
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
