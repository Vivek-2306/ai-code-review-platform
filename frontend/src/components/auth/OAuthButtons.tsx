'use client';

import { useState } from 'react';
import { getOAuthAuthorizeUrl, type OAuthProvider } from '@/lib/auth-api';
import { useToast } from '@/components/providers/ToastProvider';

const OAUTH_STATE_KEY = 'oauth_state';

const PROVIDERS: { provider: OAuthProvider; label: string; icon: React.ReactNode }[] = [
  {
    provider: 'github',
    label: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    provider: 'gitlab',
    label: 'GitLab',
    icon: (
      <svg className="w-5 h-5 text-[#e24329]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.417-.724-.417-.859 0L16.425 9.452H7.575L4.91 1.263c-.135-.417-.724-.417-.859 0L1.387 9.452.045 13.587c-.114.352.016.74.323.963l11.632 8.455 11.633-8.455c.307-.223.437-.611.322-.963z" />
      </svg>
    ),
  },
  {
    provider: 'bitbucket',
    label: 'Bitbucket',
    icon: (
      <svg className="w-5 h-5 text-[#0052cc]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1.45 2.102a1.442 1.442 0 0 0-1.42 1.666l3 17.051a1.443 1.443 0 0 0 1.42 1.181h15.1a1.443 1.443 0 0 0 1.42-1.181l3-17.051a1.442 1.442 0 0 0-1.42-1.666H1.45zM15.46 15.36H8.54L6.96 6.84h10.08l-1.58 8.52z" />
      </svg>
    ),
  },
  {
    provider: 'google',
    label: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
        <path d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.288 0-13.684 3.903-17.694 9.691z" fill="#FF3D00" />
        <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C10.125 39.012 16.524 44 24 44z" fill="#4CAF50" />
        <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
      </svg>
    ),
  },
];

export function OAuthButtons() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const handleOAuthClick = async (provider: OAuthProvider) => {
    setLoading(provider);
    try {
      const { authUrl, state } = await getOAuthAuthorizeUrl(provider);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(OAUTH_STATE_KEY, state);
      }
      window.location.href = authUrl;
    } catch (err) {
      setLoading(null);
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      showToast(message);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {PROVIDERS.map(({ provider, label, icon }) => (
        <button
          key={provider}
          type="button"
          onClick={() => handleOAuthClick(provider)}
          disabled={!!loading}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-[#1c2a38] border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-[#253545] transition-colors disabled:opacity-70"
        >
          {icon}
          <span className="text-sm font-semibold">
            {loading === provider ? 'Redirecting…' : label}
          </span>
        </button>
      ))}
    </div>
  );
}
