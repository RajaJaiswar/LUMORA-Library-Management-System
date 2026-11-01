import axios from 'axios';
import type { ApiErrorResponse } from '../types';

export function getErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiErrorResponse> | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.response?.status === 401) {
      return 'Invalid credentials or session expired.';
    }
    if (error.response?.status === 403) {
      return 'Access denied. You do not have permission to access this resource.';
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}
