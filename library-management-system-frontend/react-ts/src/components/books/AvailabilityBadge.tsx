import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

export interface AvailabilityBadgeProps {
  availableQuantity: number;
  quantity?: number;
  showCounts?: boolean;
  size?: 'sm' | 'md';
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availableQuantity,
  quantity,
  showCounts = false,
  size = 'sm',
}) => {
  const isAvailable = availableQuantity > 0;
  const label = isAvailable
    ? showCounts && quantity !== undefined
      ? `${availableQuantity} of ${quantity} available`
      : `${availableQuantity} Available`
    : showCounts && quantity !== undefined
    ? `0 of ${quantity} available`
    : 'Out of Stock';

  return (
    <StatusBadge
      variant={isAvailable ? 'success' : 'danger'}
      dot
      size={size}
      label={label}
    />
  );
};

export default AvailabilityBadge;

