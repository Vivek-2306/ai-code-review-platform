'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/lib/auth-api';
import { tokenStorage } from '@/lib/token-storage';
import { apiClient } from '@/lib/api-client';

export type RegisterRole = 'dev' | 'lead' | 'admin';

export interface UseRegisterState {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
  loading: boolean;
  error: string | null;
}

export interface UseRegisterActions {
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setRole: (value: RegisterRole) => void;
  setError: (value: string | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export type UseRegisterReturn = UseRegisterState & UseRegisterActions;

const DEFAULT_REDIRECT = '/';

export function useRegister(redirectTo: string = DEFAULT_REDIRECT): UseRegisterReturn {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('dev');
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

      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      setLoading(true);
      try {
        const response = await registerApi({ email: trimmedEmail, password });
        const { user, tokens } = response.data;

        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken, true);
        apiClient.setAuthToken(tokens.accessToken);

        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, redirectTo, router]
  );

  return {
    name,
    email,
    password,
    role,
    loading,
    error,
    setName,
    setEmail,
    setPassword,
    setRole,
    setError,
    handleSubmit,
  };
}
