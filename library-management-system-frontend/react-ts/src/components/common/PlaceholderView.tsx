import React from 'react';

interface PlaceholderViewProps {
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  badgeColor?: 'blue' | 'purple' | 'red' | 'emerald';
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  subtitle,
  description,
  badge,
  badgeColor = 'blue',
}) => {
  const badgeClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[badgeColor];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {badge && (
          <span
            className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold sm:mt-0 ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
        <div className="mt-6">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Phase 4 Placeholder — Feature implementation scheduled in upcoming phase
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderView;
