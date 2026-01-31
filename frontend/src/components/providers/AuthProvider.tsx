'use client';

import { useEffect } from 'react';
import { tokenStorage } from '@/lib/token-storage';
import { apiClient } from '@/lib/api-client';

/**
 * Restores stored auth token into the API client on mount so authenticated
 * requests work after page refresh.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      apiClient.setAuthToken(accessToken);
    }
  }, []);

  return <>{children}</>;
}
