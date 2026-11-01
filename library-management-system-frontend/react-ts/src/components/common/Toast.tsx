/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number | null; // in ms; 0 or null = persistent until dismissed
}

export interface ToastOptions {
  variant?: ToastVariant;
  title?: string;
  message: string;
  duration?: number | null;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  toast: {
    (options: ToastOptions): string;
    success: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
    error: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
    warning: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
    info: (message: string, title?: string, options?: Partial<ToastOptions>) => string;
  };
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastVariantStyles: Record<ToastVariant, { border: string; icon: string }> = {
  success: {
    border: 'border-emerald-200',
    icon: 'text-success',
  },
  warning: {
    border: 'border-amber-200',
    icon: 'text-warning',
  },
  error: {
    border: 'border-red-200',
    icon: 'text-danger',
  },
  info: {
    border: 'border-sky-200',
    icon: 'text-info',
  },
};

const ToastIcons: Record<ToastVariant, React.ReactNode> = {
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
  error: (
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

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const { id, variant, title, message, duration } = toast;
  const styles = toastVariantStyles[variant];

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-sm rounded-control bg-surface border ${styles.border} shadow-popover p-3.5 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in`}
    >
      <div className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden="true">
        {ToastIcons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="text-sm font-semibold tracking-tight text-text leading-tight mb-0.5">
            {title}
          </h5>
        )}
        <p className="text-xs text-text-secondary leading-relaxed wrap-break-word">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 -mr-1 -mt-1 p-1 rounded-control text-text-muted hover:text-text hover:bg-surface-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors cursor-pointer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      variant: options.variant || 'info',
      title: options.title,
      message: options.message,
      // Default auto-dismiss is 4500ms; error defaults to null (persistent) unless duration specified
      duration:
        options.duration !== undefined
          ? options.duration
          : options.variant === 'error'
            ? null
            : 4500,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const toastObj = Object.assign(
    (options: ToastOptions) => addToast(options),
    {
      success: (message: string, title?: string, options?: Partial<ToastOptions>) =>
        addToast({ message, title, variant: 'success', ...options }),
      error: (message: string, title?: string, options?: Partial<ToastOptions>) =>
        addToast({ message, title, variant: 'error', ...options }),
      warning: (message: string, title?: string, options?: Partial<ToastOptions>) =>
        addToast({ message, title, variant: 'warning', ...options }),
      info: (message: string, title?: string, options?: Partial<ToastOptions>) =>
        addToast({ message, title, variant: 'info', ...options }),
    }
  );

  return (
    <ToastContext.Provider value={{ toasts, toast: toastObj, dismiss, dismissAll }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
            aria-live="polite"
            aria-atomic="true"
          >
            {toasts.map((item) => (
              <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
