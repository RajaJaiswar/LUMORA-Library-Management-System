import React, { forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: InputSize;
}

const inputSizeStyles: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-3.5 text-sm',
  lg: 'h-12 px-4 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      isError = false,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      disabled,
      className = '',
      id,
      ...rest
    },
    ref
  ) => {
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);

    const baseInputClasses = `block w-full rounded-control border bg-surface text-text placeholder:text-text-muted transition-all duration-150 focus:outline-hidden focus:ring-2 disabled:bg-surface-subtle disabled:text-text-muted disabled:cursor-not-allowed ${
      inputSizeStyles[inputSize]
    } ${
      isError
        ? 'border-danger focus:border-danger focus:ring-danger/20 text-text'
        : 'border-border focus:border-primary focus:ring-primary/20'
    } ${hasLeftIcon ? 'pl-10' : ''} ${hasRightIcon ? 'pr-10' : ''} ${className}`;

    if (!hasLeftIcon && !hasRightIcon) {
      return (
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={isError ? 'true' : undefined}
          className={baseInputClasses}
          {...rest}
        />
      );
    }

    return (
      <div className="relative w-full">
        {hasLeftIcon && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted"
            aria-hidden="true"
          >
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={isError ? 'true' : undefined}
          className={baseInputClasses}
          {...rest}
        />
        {hasRightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
