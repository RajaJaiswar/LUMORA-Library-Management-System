import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile, useUpdateProfile } from '../../hooks/useUsers';
import { formatDate, formatDateTime } from '../../utils/formatUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import { Button, Input, FormField, StatusBadge, Card, Alert } from '../../components/common';
import { useToast } from '../../components/common/Toast';
import type { Role, UserStatus } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user: authUser, updateCurrentUser, refreshSession } = useAuth();
  const { data: profileData, isLoading, isError, error, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();

  // Active user data: prioritize fresh server profile query, fallback to auth context
  const user = profileData || authUser;

  // Local form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize form when editing starts
  const startEditing = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setServerError(null);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setServerError(null);
    setIsEditing(false);
  };

  const getInitials = (userName?: string) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleBadge = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return <StatusBadge variant="info" label="ADMINISTRATOR" size="sm" />;
      case 'LIBRARIAN':
        return <StatusBadge variant="neutral" label="LIBRARIAN" size="sm" />;
      case 'MEMBER':
      default:
        return <StatusBadge variant="success" label="MEMBER" size="sm" />;
    }
  };

  const getStatusBadge = (status?: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <StatusBadge variant="success" dot={true} label="Active Account" size="sm" />;
      case 'INACTIVE':
      default:
        return <StatusBadge variant="neutral" dot={true} label="Suspended" size="sm" />;
    }
  };

  const getRoleDescription = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'System Administrator with unrestricted access to user access control, catalogue inventory, circulation registers, and institutional metrics.';
      case 'LIBRARIAN':
        return 'Librarian Staff member authorized to manage catalogue inventory, execute stock changes, review borrow & return queues, and oversee circulation history.';
      case 'MEMBER':
      default:
        return 'Standard Library Member authorized to browse catalogued titles, submit book borrowing requests, extend active loans, and initiate return requests.';
    }
  };

  // Validation
  const isValidEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  const isFormValid = name.trim().length > 0 && isValidEmail(email);
  const hasChanges = user
    ? name.trim() !== user.name || email.trim().toLowerCase() !== user.email.toLowerCase()
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isFormValid || !hasChanges) return;

    setServerError(null);

    const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();

    try {
      const updated = await updateProfileMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
      });

      // Synchronize updated user in AuthContext
      updateCurrentUser(updated);

      if (emailChanged) {
        // Rotate session token to synchronize JWT subject with new email
        try {
          await refreshSession();
          toast.success(
            'Profile and email address updated successfully! Your active session has been synchronized.'
          );
        } catch {
          toast.success('Profile updated successfully! Note: Your login email has changed.');
        }
      } else {
        toast.success('Profile details updated successfully!');
      }

      setIsEditing(false);
    } catch (err: unknown) {
      setServerError(
        getErrorMessage(err, 'Failed to update profile. Please verify your inputs.')
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <StatusBadge variant="info" label="Account Management" size="sm" />
            <span className="text-text-muted">|</span>
            <span className="text-xs text-text-secondary font-medium">User Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl mt-1">
            My Profile & Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            View your library account credentials, role authorization tier, and account settings.
          </p>
        </div>

        {/* Refresh button */}
        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading && !!user}
            title="Reload profile details"
            leftIcon={
              <svg
                className={`h-4 w-4 text-text-secondary ${isLoading && !!user ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && !user && (
        <Card className="p-12 text-center text-text-muted">
          <div className="inline-flex items-center space-x-2 text-xs">
            <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading user profile...</span>
          </div>
        </Card>
      )}

      {isError && !user && (
        <Alert
          variant="danger"
          title="Failed to load profile"
          description={error?.message || 'Could not retrieve your user information.'}
        />
      )}

      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Identity & Authorization Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Identity Card */}
            <Card className="p-6 text-center">
              {/* Avatar circle */}
              <div className="mx-auto h-20 w-20 rounded-full bg-primary-soft border-2 border-primary-border text-primary font-bold text-2xl flex items-center justify-center shadow-xs">
                {getInitials(user.name)}
              </div>

              {/* Name & Email */}
              <h2 className="mt-4 text-lg font-bold text-text tracking-tight">{user.name}</h2>
              <p className="text-xs text-text-secondary font-mono mt-0.5">{user.email}</p>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>

              <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 gap-3 text-left text-xs">
                <div className="bg-surface-subtle rounded-control p-3 border border-border">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">User ID</div>
                  <div className="font-mono font-bold text-text mt-0.5 tabular-nums">#{user.id}</div>
                </div>
                <div className="bg-surface-subtle rounded-control p-3 border border-border">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Joined</div>
                  <div className="font-semibold text-text mt-0.5 tabular-nums">{formatDate(user.createdAt)}</div>
                </div>
              </div>
            </Card>

            {/* Role Privileges Card */}
            <Card className="p-5 text-xs space-y-3">
              <div className="font-bold text-text flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-control bg-info-soft text-info">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span>Authorization Privileges</span>
              </div>
              <p className="text-text-secondary leading-relaxed text-xs">
                {getRoleDescription(user.role)}
              </p>
              <div className="pt-2 border-t border-border text-[11px] text-text-muted">
                Last updated:{' '}
                <span className="font-medium text-text tabular-nums">
                  {formatDateTime(user.updatedAt)}
                </span>
              </div>
            </Card>
          </div>

          {/* Column 2: Account Details & Editing Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-text">Personal Information</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Manage your public profile name and primary communication email.
                  </p>
                </div>
                {!isEditing && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={startEditing}
                    leftIcon={
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    }
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div className="mt-5">
                  <Alert variant="danger" title="Update Failed" description={serverError} />
                </div>
              )}

              {/* View Mode */}
              {!isEditing ? (
                <div className="mt-6 space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface-subtle rounded-control p-4 border border-border">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                        Display Name
                      </div>
                      <div className="text-sm font-bold text-text mt-1">{user.name}</div>
                    </div>
                    <div className="bg-surface-subtle rounded-control p-4 border border-border">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                        Email Address
                      </div>
                      <div className="text-sm font-mono font-medium text-text mt-1">{user.email}</div>
                    </div>
                  </div>

                  <Alert
                    variant="info"
                    title="Security Notice"
                    description="Your email address functions as your username for authentication and session refresh tokens. To change your password, please contact the institutional systems administrator."
                  />
                </div>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-xs">
                  <FormField
                    label="Full Name"
                    required
                    error={name.trim().length === 0 ? 'Name cannot be blank.' : undefined}
                  >
                    <Input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={updateProfileMutation.isPending}
                      placeholder="e.g. Dilip Kumar"
                      inputSize="sm"
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    required
                    error={
                      !isValidEmail(email) && email.length > 0
                        ? 'Please enter a valid email format.'
                        : undefined
                    }
                    helperText="Note: Changing your email will automatically synchronize your active sign-in token."
                  >
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={updateProfileMutation.isPending}
                      placeholder="e.g. member@college.test"
                      inputSize="sm"
                      className="font-mono"
                    />
                  </FormField>

                  <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={updateProfileMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={updateProfileMutation.isPending}
                      disabled={!isFormValid || !hasChanges || updateProfileMutation.isPending}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
