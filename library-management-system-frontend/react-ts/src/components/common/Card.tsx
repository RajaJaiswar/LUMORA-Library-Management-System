import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'flat';
}

const cardVariants = {
  default: 'bg-surface border-border shadow-card',
  subtle: 'bg-surface-subtle border-border shadow-2xs',
  flat: 'bg-surface border-border shadow-none',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`rounded-card border text-text transition-all ${cardVariants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  bordered = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`p-6 flex flex-col space-y-1.5 ${
        bordered ? 'border-b border-border' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  as: Component = 'h3',
  className = '',
  children,
  ...rest
}) => {
  return (
    <Component
      className={`text-lg font-bold tracking-tight text-text leading-snug ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <p
      className={`text-sm text-text-secondary leading-relaxed ${className}`}
      {...rest}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  bordered = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`p-6 pt-4 flex items-center justify-end gap-3 ${
        bordered ? 'border-t border-border' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
