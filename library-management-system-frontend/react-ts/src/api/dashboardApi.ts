import apiClient from './axios';
import type { DashboardResponse } from '../types';

/**
 * Fetch system-wide dashboard metrics (Admin and Librarian only).
 * Backend endpoint: GET /api/dashboard
 */
export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>('/api/dashboard');
  return response.data;
};
