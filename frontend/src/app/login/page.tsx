import { Header } from '@/components/layout/Header';
import { LoginCard } from '@/components/auth/LoginCard';

export const metadata = {
  title: 'Login | CodeReview AI',
  description: 'Sign in to your CodeReview AI dashboard',
};

export default function LoginPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background accents */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary blur-glow rounded-full pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-primary blur-glow rounded-full pointer-events-none" />

      <Header />

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#16222e] rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
          {/* Left: Visual / abstract */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0d141b] relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Accelerate your workflow with AI insights
              </h2>
              <p className="text-slate-400 text-lg">
                Join 50,000+ developers automating code reviews and catching
                bugs before they reach production.
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
              <div
                className="w-full h-full bg-center bg-no-repeat bg-cover"
                style={{
                  backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(29, 133, 237, 0.15) 0%, transparent 60%)`,
                }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d141b] via-transparent to-transparent" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#0d141b] bg-slate-700" />
                <div className="w-10 h-10 rounded-full border-2 border-[#0d141b] bg-slate-600" />
                <div className="w-10 h-10 rounded-full border-2 border-[#0d141b] bg-primary" />
              </div>
              <span className="text-sm text-slate-400">
                Trusted by world-class teams
              </span>
            </div>
          </div>

          {/* Right: Login form */}
          <LoginCard />
        </div>
      </main>

      <footer className="relative z-10 w-full px-12 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-500">
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Security
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            © 2024 CodeReview AI. All rights reserved.
          </a>
        </div>
      </footer>
    </div>
  );
}
