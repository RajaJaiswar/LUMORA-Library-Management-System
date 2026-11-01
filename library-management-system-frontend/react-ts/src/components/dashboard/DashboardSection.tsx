import React from 'react';

interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={`space-y-3.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-border pb-2.5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-text">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
};

export default DashboardSection;
