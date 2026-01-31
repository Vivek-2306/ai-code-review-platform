'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type ToastContextValue = {
  message: string | null;
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [message]);

  return (
    <ToastContext.Provider value={{ message, showToast }}>
      {children}
      {message && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-800 dark:bg-slate-900 text-white px-4 py-3 shadow-lg border border-slate-700 flex items-center gap-2 max-w-[90vw]"
          role="status"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-primary text-lg shrink-0">
            info
          </span>
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
