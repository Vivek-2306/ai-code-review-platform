import Link from 'next/link';

export function Header() {
  return (
    <header className="relative z-10 w-full px-6 lg:px-12 py-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary rounded-lg text-white">
          <span className="material-symbols-outlined text-2xl leading-none">
            terminal
          </span>
        </div>
        <Link href="/" className="text-xl font-bold tracking-tight">
          CodeReview <span className="text-primary">AI</span>
        </Link>
      </div>
      <div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Need help?
        </span>
        <Link
          href="#"
          className="text-sm font-semibold ml-2 hover:text-primary transition-colors"
        >
          Documentation
        </Link>
      </div>
    </header>
  );
}
