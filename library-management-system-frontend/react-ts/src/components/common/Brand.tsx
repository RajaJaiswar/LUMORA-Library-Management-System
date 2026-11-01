import React from 'react';
import { Logo } from './Logo';

export interface BrandProps {
  size?: 'header' | 'sidebar' | 'auth';
  showTagline?: boolean;
  className?: string;
  taglineClassName?: string;
}

export const Brand: React.FC<BrandProps> = ({
  size = 'header',
  showTagline = true,
  className = '',
  taglineClassName = '',
}) => {
  if (size === 'header') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <Logo size="header" className="shrink-0" />
        {showTagline && (
          <span
            className={`hidden sm:inline-block font-brand text-[16px] md:text-[19px] font-semibold text-[#0F2A56] tracking-[-0.01em] leading-none whitespace-nowrap select-none ${taglineClassName}`}
          >
            Your Digital Library
          </span>
        )}
      </div>
    );
  }

  if (size === 'sidebar') {
    return (
      <div
        className={`flex flex-col min-[340px]:flex-row min-[340px]:items-center gap-1.5 min-[340px]:gap-3 min-w-0 pr-2 ${className}`}
      >
        <Logo size="sm" className="shrink-0" />
        {showTagline && (
          <span
            className={`font-brand text-[13px] font-semibold text-[#0F2A56] tracking-[-0.01em] whitespace-nowrap select-none ${taglineClassName}`}
          >
            Your Digital Library
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <Logo size="auth" />
    </div>
  );
};

export default Brand;
