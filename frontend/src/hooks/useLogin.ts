'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth-api';
import { tokenStorage } from '@/lib/token-storage';
import { apiClient } from '@/lib/api-client';

export interface UseLoginState {
  email: string;
  password: string;
  remember: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseLoginActions {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setRemember: (value: boolean) => void;
  setError: (value: string | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export type UseLoginReturn = UseLoginState & UseLoginActions;

const DEFAULT_REDIRECT = '/';

export function useLogin(redirectTo: string = DEFAULT_REDIRECT): UseLoginReturn {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        setError('Email and password are required');
        return;
      }

      setLoading(true);
      try {
        const response = await login({ email: trimmedEmail, password });
        const { user, tokens } = response.data;

        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, remember);
        apiClient.setAuthToken(tokens.accessToken);

        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember, redirectTo, router]
  );

  return {
    email,
    password,
    remember,
    loading,
    error,
    setEmail,
    setPassword,
    setRemember,
    setError,
    handleSubmit,
  };
}
