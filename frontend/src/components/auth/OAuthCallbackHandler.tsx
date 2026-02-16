'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';

/**
 * Handles post-OAuth redirect: ?login=success -> redirect to /repos, ?error= -> show toast.
 */
export function OAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const success = searchParams.get('login');
    const error = searchParams.get('error');
    if (success === 'success') {
      router.replace('/repos');
      return;
    }
    if (error) {
      const message =
        error === 'oauth_failed'
          ? 'Sign-in failed. Please try again.'
          : error === 'missing_code'
            ? 'Invalid sign-in response.'
            : 'Something went wrong.';
      showToast(message);
      router.replace('/login');
    }
  }, [searchParams, router, showToast]);

  return null;
}
