import React from 'react';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode | boolean;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; text: string }> = {
  success: {
    container: 'bg-success-soft border-emerald-200 text-emerald-950',
    icon: 'text-success',
    text: 'text-emerald-900',
  },
  warning: {
    container: 'bg-warning-soft border-amber-200 text-amber-950',
    icon: 'text-warning',
    text: 'text-amber-900',
  },
  danger: {
    container: 'bg-danger-soft border-red-200 text-red-950',
    icon: 'text-danger',
    text: 'text-red-900',
  },
  info: {
    container: 'bg-info-soft border-sky-200 text-sky-950',
    icon: 'text-info',
    text: 'text-sky-900',
  },
};

const DefaultIcons: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  danger: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  description,
  children,
  icon = true,
  onClose,
  className = '',
}) => {
  const styles = variantStyles[variant];
  const isHighPriority = variant === 'danger' || variant === 'warning';

  return (
    <div
      role={isHighPriority ? 'alert' : 'status'}
      aria-live="polite"
      className={`rounded-control border p-4 transition-all duration-150 flex items-start justify-between gap-3 ${styles.container} ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon !== false && (
          <div className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden="true">
            {typeof icon === 'boolean' ? DefaultIcons[variant] : icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-sm font-semibold tracking-tight leading-snug">
              {title}
            </h4>
          )}
          {description && (
            <div className={`text-xs mt-0.5 leading-relaxed ${styles.text}`}>
              {description}
            </div>
          )}
          {children && (
            <div className={`text-xs mt-1 leading-relaxed ${styles.text}`}>
              {children}
            </div>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-control text-text-muted hover:text-text hover:bg-black/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
