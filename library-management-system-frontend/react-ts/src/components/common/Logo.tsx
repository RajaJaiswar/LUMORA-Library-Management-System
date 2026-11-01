import React from 'react';

export type LogoSize = 'sm' | 'md' | 'lg' | 'header' | 'auth';

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: LogoSize;
}

const sizeStyles: Record<LogoSize, string> = {
  sm: 'h-10 w-auto',
  md: 'h-12 w-auto',
  lg: 'h-16 w-auto',
  header: 'h-12 sm:h-[52px] w-auto max-w-[104px]',
  auth: 'w-28 sm:w-[120px] h-auto',
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  alt = 'LUMORA logo',
  ...props
}) => {
  return (
    <img
      src="/lumora-logo.png"
      alt={alt}
      className={`object-contain ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
};

export default Logo;
