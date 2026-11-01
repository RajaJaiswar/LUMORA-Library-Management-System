import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboardApi';
import type { DashboardResponse } from '../types';

/**
 * Custom hook to retrieve staff dashboard metrics for ADMIN and LIBRARIAN roles.
 */
export const useStaffDashboard = () => {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard', 'staff'],
    queryFn: getDashboard,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time for dashboard metrics
  });
};
