'use client';

import Link from 'next/link';
import { StepIndicator } from './StepIndicator';
import { OAuthButtons } from './OAuthButtons';
import { useRegister, type RegisterRole } from '@/hooks/useRegister';

export function RegisterForm() {
  const {
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
  } = useRegister('/register/onboarding');

  return (
    <div className="w-full max-w-md space-y-8">
      <StepIndicator
        step={1}
        totalSteps={2}
        title="Join the future of code review."
      />

      {/* OAuth */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400 text-center">
          Get started with your developer account
        </p>
        <OAuthButtons />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#233648]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background-light dark:bg-background-dark px-2 text-slate-500">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Main form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div
            className="flex items-center gap-2 rounded-lg bg-error-red/10 border border-error-red/30 px-4 py-3 text-sm text-error-red dark:bg-error-red/10 dark:border-error-red/30"
            role="alert"
          >
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
            <button
              type="button"
              className="ml-auto p-1 rounded hover:bg-error-red/20 focus:outline-none focus:ring-2 focus:ring-error-red/50"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-slate-300 mb-1.5"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-70"
              id="name"
              placeholder="Alex Rivera"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-300 mb-1.5"
              htmlFor="reg-email"
            >
              Work Email
            </label>
            <input
              className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-70"
              id="reg-email"
              placeholder="alex@company.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label
                className="block text-sm font-medium text-slate-300"
                htmlFor="reg-password"
              >
                Password
              </label>
              <span className="text-xs text-primary font-medium">
                {password.length >= 8 ? 'Strong' : password.length > 0 ? 'Weak' : ''}
              </span>
            </div>
            <input
              className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-70"
              id="reg-password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <div className="mt-2 flex gap-1 h-1">
              <div
                className={`flex-1 rounded-full ${password.length >= 4 ? 'bg-primary' : 'bg-slate-700'}`}
              />
              <div
                className={`flex-1 rounded-full ${password.length >= 6 ? 'bg-primary' : 'bg-slate-700'}`}
              />
              <div
                className={`flex-1 rounded-full ${password.length >= 8 ? 'bg-primary' : 'bg-slate-700'}`}
              />
              <div
                className={`flex-1 rounded-full ${password.length >= 10 ? 'bg-primary' : 'bg-slate-700'}`}
              />
            </div>
          </div>
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Your Role
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: 'dev' as RegisterRole, icon: 'code', label: 'Developer' },
                { value: 'lead' as RegisterRole, icon: 'terminal', label: 'Lead' },
                { value: 'admin' as RegisterRole, icon: 'shield_person', label: 'Admin' },
              ] as const
            ).map(({ value, icon, label }) => (
              <label key={value} className="cursor-pointer group">
                <input
                  className="sr-only peer"
                  name="role"
                  type="radio"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  disabled={loading}
                />
                <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] peer-checked:border-primary peer-checked:bg-primary/10 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <span className="material-symbols-outlined text-slate-400 group-has-[:checked]:text-primary mb-1">
                    {icon}
                  </span>
                  <span className="text-xs font-bold text-slate-300 group-has-[:checked]:text-primary">
                    {label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <button
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="material-symbols-outlined text-sm animate-spin"
                  aria-hidden
                >
                  progress_activity
                </span>
                Creating account…
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </>
            )}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              className="text-primary font-semibold hover:underline"
              href="/login"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="text-[11px] text-center text-slate-500 px-8">
          By clicking &quot;Create Account&quot;, you agree to our{' '}
          <Link className="underline" href="#">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link className="underline" href="#">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
