import { getApiUrl } from '@/config/env';
import type { AuthResponse, ApiResponse } from '@/types';

const AUTH_BASE = 'auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

type AuthFetchOptions = Omit<RequestInit, 'body'> & { body?: object };

async function authFetch<T>(
  path: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  const { body, ...rest } = options;
  const url = getApiUrl(`${AUTH_BASE}${path.startsWith('/') ? path : `/${path}`}`);
  const response = await fetch(url, {
    ...rest,
    method: rest.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers as HeadersInit),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.error === 'string' ? data.error : 'An error occurred';
    throw new Error(message);
  }

  return data as T;
}

/**
 * Login with email and password.
 * Returns { message, data: { user, tokens } }.
 */
export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponse>> {
  return authFetch<ApiResponse<AuthResponse>>('/login', {
    method: 'POST',
    body: credentials,
  });
}

/**
 * Register a new user.
 */
export async function register(
  data: RegisterData
): Promise<ApiResponse<AuthResponse>> {
  return authFetch<ApiResponse<AuthResponse>>('/register', {
    method: 'POST',
    body: data,
  });
}

/**
 * Refresh access token.
 */
export async function refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
  return authFetch<ApiResponse<AuthResponse>>('/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

/**
 * Logout (invalidates tokens on server).
 * Requires access and refresh tokens; sends Bearer token for auth.
 */
export async function logout(accessToken: string, refreshToken: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/logout', {
    method: 'POST',
    body: { accessToken, refreshToken },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type OAuthProvider = 'github' | 'gitlab' | 'bitbucket' | 'google';

export interface OAuthAuthorizeResponse {
  authUrl: string;
  state: string;
}

/**
 * Get OAuth authorization URL for login. Frontend should store state and redirect to authUrl.
 */
export async function getOAuthAuthorizeUrl(provider: OAuthProvider): Promise<OAuthAuthorizeResponse> {
  const url = getApiUrl(`${AUTH_BASE}/oauth/${provider}/authorize`);
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Failed to get OAuth URL';
    throw new Error(message);
  }
  return data as OAuthAuthorizeResponse;
}
