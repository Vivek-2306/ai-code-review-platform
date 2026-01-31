'use client';

export function LoginForm() {
  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label
          className="block text-sm font-medium mb-2 dark:text-slate-300"
          htmlFor="email"
        >
          Email Address
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            mail
          </span>
          <input
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1c2a38] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400"
            id="email"
            placeholder="dev@example.com"
            type="email"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label
            className="block text-sm font-medium dark:text-slate-300"
            htmlFor="password"
          >
            Password
          </label>
          <a
            className="text-xs font-semibold text-primary hover:underline"
            href="#"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            lock
          </span>
          <input
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#1c2a38] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white placeholder:text-slate-400"
            id="password"
            placeholder="••••••••"
            type="password"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
          id="remember"
          type="checkbox"
        />
        <label
          className="ml-2 text-sm text-slate-600 dark:text-slate-400"
          htmlFor="remember"
        >
          Remember me for 30 days
        </label>
      </div>
      <button
        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20"
        type="submit"
      >
        Sign In
      </button>
    </form>
  );
}
