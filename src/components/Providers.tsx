'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { useStore } from '@/store';

function ThemeManager() {
  const theme = useStore((s) => s.prefs.theme);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeManager />
      {children}
    </SessionProvider>
  );
}
