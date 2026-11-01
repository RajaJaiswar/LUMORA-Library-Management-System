import React from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';

export type StatColorTone =
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'purple'
  | 'slate';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorTone?: StatColorTone;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'info';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colorTone = 'blue',
  badge,
}) => {
  const iconColorStyles: Record<StatColorTone, string> = {
    indigo: 'bg-primary-soft text-primary',
    blue: 'bg-primary-soft text-primary',
    emerald: 'bg-success-soft text-success',
    amber: 'bg-warning-soft text-warning',
    rose: 'bg-danger-soft text-danger',
    purple: 'bg-purple-50 text-purple-700',
    slate: 'bg-surface-subtle text-text-secondary',
  };

  return (
    <Card className="p-5 transition hover:border-border-strong hover:shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </span>
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-control ${iconColorStyles[colorTone]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-text tabular-nums">{value}</p>
        {badge && (
          <StatusBadge
            variant={badge.variant || 'info'}
            label={badge.text}
            size="sm"
          />
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-text-secondary">{subtitle}</p>}
    </Card>
  );
};

export default StatCard;
