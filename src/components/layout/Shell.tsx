'use client';

import { useEffect } from 'react';
import { AppNav } from './AppNav';
import { ToastContainer } from '@/components/ui/feedback/Toast';
import { useStore } from '@/store';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const theme       = useStore((s) => s.prefs.theme);
  const accentColor = useStore((s) => s.prefs.accentColor);

  useEffect(() => {
    document.documentElement.style.setProperty('--binlinpad-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#111110]">
      <AppNav />
      {/* padding-top sur desktop (navbar en haut ~68px), padding-bottom sur mobile (navbar en bas ~90px) */}
      <main className="pt-0 pb-24 md:pt-20 md:pb-0 min-w-0">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
