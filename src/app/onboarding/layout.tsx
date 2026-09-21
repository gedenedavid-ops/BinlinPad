import type { ReactNode } from 'react';

export const metadata = {
  title: 'Bienvenue — Binlin',
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Logo */}
      <header className="flex justify-center pt-8 pb-4">
        <span className="font-black text-xl text-[#1A1A1A] tracking-tight">
          Binlin<span className="text-[#F4A236]">.</span>
        </span>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
