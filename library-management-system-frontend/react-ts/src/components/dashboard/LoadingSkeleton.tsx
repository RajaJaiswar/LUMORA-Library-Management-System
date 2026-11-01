import React from 'react';
import { Card } from '../common/Card';

export const SkeletonCard: React.FC = () => (
  <Card className="animate-pulse p-5 shadow-xs">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 rounded-sm bg-surface-subtle" />
      <div className="h-9 w-9 rounded-control bg-surface-subtle" />
    </div>
    <div className="mt-4 h-7 w-20 rounded-md bg-surface-subtle" />
    <div className="mt-2 h-2.5 w-32 rounded-sm bg-surface-subtle/60" />
  </Card>
);

interface LoadingSkeletonProps {
  cardCount?: number;
  showTableSkeleton?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  cardCount = 4,
  showTableSkeleton = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Optional Table / List Skeleton */}
      {showTableSkeleton && (
        <Card className="animate-pulse p-6 shadow-xs">
          <div className="h-4 w-40 rounded-sm bg-surface-subtle mb-4" />
          <div className="space-y-3">
            <div className="h-8 w-full rounded-md bg-surface-subtle/80" />
            <div className="h-8 w-full rounded-md bg-surface-subtle/80" />
            <div className="h-8 w-full rounded-md bg-surface-subtle/80" />
          </div>
        </Card>
      )}
    </div>
  );
};

export default LoadingSkeleton;
