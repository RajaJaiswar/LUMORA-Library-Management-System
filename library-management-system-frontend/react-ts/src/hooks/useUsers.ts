import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  getMyProfile,
  updateProfile,
} from '../api/userApi';
import type {
  RoleUpdateRequest,
  StatusUpdateRequest,
  UserProfileUpdateRequest,
  UserResponse,
} from '../types';

/**
 * Centralized query keys for user management and related cache invalidations.
 */
export const userKeys = {
  all: ['users'] as const,
  list: () => ['users', 'list'] as const,
  detail: (id: number) => ['users', id] as const,
  profile: () => ['users', 'profile'] as const,
  dashboardStaff: ['dashboard', 'staff'] as const,
};

/**
 * Query hook to fetch all users.
 * Role: ADMIN only.
 */
export const useAllUsers = (options?: { enabled?: boolean }) => {
  return useQuery<UserResponse[], Error>({
    queryKey: userKeys.list(),
    queryFn: getAllUsers,
    staleTime: 1000 * 30, // 30 seconds fresh
    ...options,
  });
};

/**
 * Query hook to fetch a single user by ID.
 * Role: ADMIN only.
 */
export const useUser = (id: number, options?: { enabled?: boolean }) => {
  return useQuery<UserResponse, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: id > 0 && (options?.enabled ?? true),
    staleTime: 1000 * 30,
  });
};

/**
 * Mutation hook to update a user's role.
 * Invalidates user queries and staff dashboard metrics.
 * Role: ADMIN only.
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, { id: number; request: RoleUpdateRequest }>({
    mutationFn: ({ id, request }) => updateUserRole(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboardStaff });
    },
  });
};

/**
 * Mutation hook to update a user's status (ACTIVE / INACTIVE).
 * Invalidates user queries and staff dashboard metrics.
 * Role: ADMIN only.
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, { id: number; request: StatusUpdateRequest }>({
    mutationFn: ({ id, request }) => updateUserStatus(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboardStaff });
    },
  });
};

/**
 * Query hook to fetch the authenticated user's profile.
 * Authenticated users: ADMIN, LIBRARIAN, MEMBER.
 */
export const useProfile = (options?: { enabled?: boolean }) => {
  return useQuery<UserResponse, Error>({
    queryKey: userKeys.profile(),
    queryFn: getMyProfile,
    staleTime: 1000 * 60, // 1 minute fresh
    ...options,
  });
};

/**
 * Mutation hook to update the authenticated user's profile (name and email).
 * Authenticated users: ADMIN, LIBRARIAN, MEMBER.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UserProfileUpdateRequest>({
    mutationFn: (request: UserProfileUpdateRequest) => updateProfile(request),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.detail(updatedUser.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.dashboardStaff });
    },
  });
};
