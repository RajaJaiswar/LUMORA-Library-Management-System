import apiClient from './axios';
import type {
  RoleUpdateRequest,
  StatusUpdateRequest,
  UserProfileUpdateRequest,
  UserResponse,
} from '../types';

/**
 * Fetch all users in the system.
 * Role: ADMIN only.
 * Backend endpoint: GET /api/users
 */
export const getAllUsers = async (): Promise<UserResponse[]> => {
  const response = await apiClient.get<UserResponse[]>('/api/users');
  return response.data;
};

/**
 * Fetch a specific user by their numerical ID.
 * Role: ADMIN only.
 * Backend endpoint: GET /api/users/{id}
 */
export const getUserById = async (id: number): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>(`/api/users/${id}`);
  return response.data;
};

/**
 * Update a user's role (ADMIN, LIBRARIAN, MEMBER).
 * Role: ADMIN only.
 * Safeguard: Cannot demote the last active ADMIN.
 * Backend endpoint: PUT /api/users/{id}/role
 */
export const updateUserRole = async (
  id: number,
  request: RoleUpdateRequest
): Promise<UserResponse> => {
  const response = await apiClient.put<UserResponse>(`/api/users/${id}/role`, request);
  return response.data;
};

/**
 * Update a user's account status (ACTIVE, INACTIVE).
 * Role: ADMIN only.
 * Safeguard: Cannot deactivate self or the last active ADMIN.
 * Backend endpoint: PUT /api/users/{id}/status
 */
export const updateUserStatus = async (
  id: number,
  request: StatusUpdateRequest
): Promise<UserResponse> => {
  const response = await apiClient.put<UserResponse>(`/api/users/${id}/status`, request);
  return response.data;
};

/**
 * Fetch current authenticated user's profile.
 * Authenticated users.
 * Backend endpoint: GET /api/users/me
 */
export const getMyProfile = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>('/api/users/me');
  return response.data;
};

/**
 * Update current authenticated user's profile (name and email).
 * Authenticated users.
 * Backend endpoint: PUT /api/users/profile
 */
export const updateProfile = async (
  request: UserProfileUpdateRequest
): Promise<UserResponse> => {
  const response = await apiClient.put<UserResponse>('/api/users/profile', request);
  return response.data;
};
