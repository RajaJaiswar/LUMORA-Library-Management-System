/**
 * In-memory token storage.
 * Keeps short-lived access JWT in memory, completely protected from localStorage XSS vulnerabilities.
 * The HttpOnly cookie preserves session persistence across browser reloads.
 */

let accessToken: string | null = null;
let onAuthFailureCallback: (() => void) | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};

export const setOnAuthFailure = (callback: (() => void) | null): void => {
  onAuthFailureCallback = callback;
};

export const triggerAuthFailure = (): void => {
  clearAccessToken();
  if (onAuthFailureCallback) {
    onAuthFailureCallback();
  }
};
