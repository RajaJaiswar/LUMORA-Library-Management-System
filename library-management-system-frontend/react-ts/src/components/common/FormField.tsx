import React from 'react';

export interface FormFieldProps {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  helperText,
  error,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text leading-tight"
        >
          {label}
          {required && (
            <span className="text-danger ml-0.5" title="Required field" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="text-xs font-medium text-danger animate-in fade-in duration-150"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={id ? `${id}-helper` : undefined}
          className="text-xs text-text-muted leading-normal"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
