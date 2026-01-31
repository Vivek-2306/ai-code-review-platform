import { LoginForm } from './LoginForm';
import { OAuthButtons } from './OAuthButtons';
import Link from 'next/link';

export function LoginCard() {
  return (
    <div className="p-8 md:p-12 flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold dark:text-white mb-2">
          Welcome back
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your credentials to access your dashboard
        </p>
      </div>
      <LoginForm />
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-[#16222e] px-4 text-slate-500">
            Or continue with
          </span>
        </div>
      </div>
      <OAuthButtons />
      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link
            className="text-primary font-bold hover:underline ml-1"
            href="/register"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
