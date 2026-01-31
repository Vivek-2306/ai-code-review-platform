'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

export type FocusArea = 'security' | 'performance' | 'best_practices' | 'documentation';

const FOCUS_OPTIONS: { value: FocusArea; label: string; icon: string }[] = [
  { value: 'security', label: 'Security', icon: 'security' },
  { value: 'performance', label: 'Performance', icon: 'speed' },
  { value: 'best_practices', label: 'Best Practices', icon: 'verified' },
  { value: 'documentation', label: 'Documentation', icon: 'description' },
];

export function RegisterOnboardingForm() {
  const router = useRouter();
  const [gitProvider, setGitProvider] = useState<GitProvider>('github');
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(['performance', 'best_practices']);
  const [workspaceName, setWorkspaceName] = useState('');

  const toggleFocusArea = (value: FocusArea) => {
    setFocusAreas((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: persist gitProvider, focusAreas, workspaceName when backend supports
    router.push('/');
    router.refresh();
  };

  return (
    <div className="bg-[#111a22] border border-[#233648] rounded-xl p-8 shadow-2xl">
      <div className="space-y-3 mb-10">
        <div className="flex justify-between items-end">
          <h1 className="text-2xl font-bold text-white">
            Personalize your experience
          </h1>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step 2 of 2
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#324d67] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <form className="space-y-10" onSubmit={handleSubmit}>
        {/* Git Provider */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            Connect your Git Provider
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                {
                  value: 'github' as GitProvider,
                  label: 'GitHub',
                  icon: (
                    <svg
                      className="size-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  ),
                },
                {
                  value: 'gitlab' as GitProvider,
                  label: 'GitLab',
                  icon: (
                    <svg
                      className="size-8 text-[#e24329]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.417-.724-.417-.859 0L16.425 9.452H7.575L4.91 1.263c-.135-.417-.724-.417-.859 0L1.387 9.452.045 13.587c-.114.352.016.74.323.963l11.632 8.455 11.633-8.455c.307-.223.437-.611.322-.963z" />
                    </svg>
                  ),
                },
                {
                  value: 'bitbucket' as GitProvider,
                  label: 'Bitbucket',
                  icon: (
                    <svg
                      className="size-8 text-[#0052cc]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M1.45 2.102a1.442 1.442 0 0 0-1.42 1.666l3 17.051a1.443 1.443 0 0 0 1.42 1.181h15.1a1.443 1.443 0 0 0 1.42-1.181l3-17.051a1.442 1.442 0 0 0-1.42-1.666H1.45zM15.46 15.36H8.54L6.96 6.84h10.08l-1.58 8.52z" />
                    </svg>
                  ),
                },
              ] as const
            ).map(({ value, label, icon }) => (
              <label key={value} className="cursor-pointer group">
                <input
                  className="sr-only peer"
                  name="git_provider"
                  type="radio"
                  value={value}
                  checked={gitProvider === value}
                  onChange={() => setGitProvider(value)}
                />
                <div className="h-full flex flex-col items-center justify-center gap-3 p-5 rounded-lg border border-[#233648] bg-[#1a2632] hover:bg-[#233648] peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                  {icon}
                  <span className="text-sm font-bold text-slate-200">
                    {label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* AI Focus Areas */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300">
            Select AI Focus Areas
          </label>
          <div className="flex flex-wrap gap-3">
            {FOCUS_OPTIONS.map(({ value, label, icon }) => (
              <label key={value} className="cursor-pointer group">
                <input
                  className="sr-only peer"
                  name="focus_area"
                  type="checkbox"
                  value={value}
                  checked={focusAreas.includes(value)}
                  onChange={() => toggleFocusArea(value)}
                />
                <div className="px-4 py-2 rounded-full border border-[#233648] bg-[#1a2632] text-sm font-medium text-slate-400 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all flex items-center gap-2 group-has-[:checked]:bg-primary group-has-[:checked]:text-white group-has-[:checked]:border-primary">
                  <span className="material-symbols-outlined text-[18px]">
                    {icon}
                  </span>
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Workspace Name */}
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold text-slate-300 mb-1.5"
              htmlFor="workspace"
            >
              Workspace Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500">
                workspaces
              </span>
              <input
                className="w-full bg-[#1a2632] border border-[#233648] rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                id="workspace"
                placeholder="e.g. Acme Engineering"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              This will be the shared space for your team projects.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <button
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            type="submit"
          >
            <span>Complete Setup</span>
            <span className="material-symbols-outlined text-sm">
              rocket_launch
            </span>
          </button>
          <Link
            href="/register"
            className="w-full text-center text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            Go back to account info
          </Link>
        </div>
      </form>
    </div>
  );
}
