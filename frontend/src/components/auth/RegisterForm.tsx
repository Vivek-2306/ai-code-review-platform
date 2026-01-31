'use client';

import Link from 'next/link';
import { StepIndicator } from './StepIndicator';

export function RegisterForm() {
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
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#233648] hover:bg-[#2d455c] transition-colors py-2.5 px-4 text-sm font-bold border border-[#324d67]"
          >
            <svg
              className="size-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#233648] hover:bg-[#2d455c] transition-colors py-2.5 px-4 text-sm font-bold border border-[#324d67]"
          >
            <svg
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.747-.053-1.453-.16-2.133h-11.04z" />
            </svg>
            Google
          </button>
        </div>
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
      <form
        className="space-y-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-slate-300 mb-1.5"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              id="name"
              placeholder="Alex Rivera"
              type="text"
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
              className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              id="reg-email"
              placeholder="alex@company.com"
              type="email"
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
              <span className="text-xs text-primary font-medium">Strong</span>
            </div>
            <input
              className="w-full bg-[#111a22] border border-[#233648] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              id="reg-password"
              type="password"
              placeholder="••••••••••••"
            />
            <div className="mt-2 flex gap-1 h-1">
              <div className="flex-1 bg-primary rounded-full" />
              <div className="flex-1 bg-primary rounded-full" />
              <div className="flex-1 bg-primary rounded-full" />
              <div className="flex-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Your Role
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="cursor-pointer group">
              <input
                defaultChecked
                className="sr-only peer"
                name="role"
                type="radio"
                value="dev"
              />
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] peer-checked:border-primary peer-checked:bg-primary/10 transition-all ">
                <span className="material-symbols-outlined text-slate-400 group-has-[:checked]:text-primary mb-1">
                  code
                </span>
                <span className="text-xs font-bold text-slate-300 group-has-[:checked]:text-primary">
                  Developer
                </span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input
                className="sr-only peer"
                name="role"
                type="radio"
                value="lead"
              />
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] peer-checked:border-primary peer-checked:bg-primary/10 transition-all ">
                <span className="material-symbols-outlined text-slate-400 group-has-[:checked]:text-primary mb-1">
                  terminal
                </span>
                <span className="text-xs font-bold text-slate-300 group-has-[:checked]:text-primary">
                  Lead
                </span>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input
                className="sr-only peer"
                name="role"
                type="radio"
                value="admin"
              />
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#233648] bg-[#111a22] peer-checked:border-primary peer-checked:bg-primary/10 transition-all ">
                <span className="material-symbols-outlined text-slate-400 group-has-[:checked]:text-primary mb-1">
                  shield_person
                </span>
                <span className="text-xs font-bold text-slate-300 group-has-[:checked]:text-primary">
                  Admin
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <button
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            type="submit"
          >
            <span>Create Account</span>
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
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
