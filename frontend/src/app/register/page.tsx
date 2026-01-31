import { RegisterHero } from '@/components/auth/RegisterHero';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'ReviewAI - Create Your Account',
  description: 'Create your account to join the future of code review.',
};

export default function RegisterPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen flex">
      <RegisterHero />

      {/* Right: Registration form */}
      <div className="w-full lg:w-1/2 bg-background-light dark:bg-background-dark flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <RegisterForm />
      </div>
    </div>
  );
}
