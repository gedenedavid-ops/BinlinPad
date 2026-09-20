'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Network, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavRoute } from '@/types';

const NAV_ITEMS: { route: NavRoute; label: string; icon: React.ElementType; href: string }[] = [
  { route: 'journal',  label: 'Notes',    icon: BookOpen, href: '/journal'  },
  { route: 'graph',    label: 'Carte',    icon: Network,  href: '/graph'    },
  { route: 'tutor',    label: 'Tuteur',   icon: Sparkles, href: '/tutor'    },
  { route: 'settings', label: 'Réglages', icon: Settings, href: '/settings' },
];

export function AppNav() {
  const pathname = usePathname();
  const activeRoute = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.route ?? 'journal';

  return (
    <>
      {/* ── Mobile : pill flottante en bas ── */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between gap-1 rounded-[1.35rem] border border-[#E8E4DF] bg-white/95 p-2 shadow-[0_12px_35px_rgba(26,26,26,0.14)] backdrop-blur-xl dark:border-[#2E2C28] dark:bg-[#1C1B19]/95">
          {NAV_ITEMS.map(({ route, label, icon: Icon, href }) => {
            const isActive = activeRoute === route;
            return (
              <motion.a
                key={route}
                href={href}
                whileTap={{ scale: 0.95 }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A236] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1C1B19]',
                  isActive
                    ? 'bg-[#FDF0DC] text-[#E8941E] dark:bg-[#3A2B1B] dark:text-[#F4A236]'
                    : 'text-[#9B9590] hover:bg-[#F5F3EF] hover:text-[#1A1A1A] dark:hover:bg-[#242320] dark:hover:text-[#F0EDE8]'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.9} aria-hidden="true" />
                <motion.span
                  initial={false}
                  animate={{ width: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden whitespace-nowrap text-xs font-bold"
                >
                  {label}
                </motion.span>
                <span className="sr-only">{label}</span>
              </motion.a>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop : pill flottante en haut, centrée ── */}
      <nav
        aria-label="Navigation principale"
        className="hidden md:flex fixed inset-x-0 top-0 z-40 justify-center px-3 pt-3"
      >
        <div className="flex h-14 items-center gap-1 rounded-[1.35rem] border border-[#E8E4DF] bg-white/95 p-2 shadow-[0_12px_35px_rgba(26,26,26,0.10)] backdrop-blur-xl dark:border-[#2E2C28] dark:bg-[#1C1B19]/95">
          {NAV_ITEMS.map(({ route, label, icon: Icon, href }) => {
            const isActive = activeRoute === route;
            return (
              <motion.a
                key={route}
                href={href}
                whileTap={{ scale: 0.95 }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-10 items-center justify-center gap-2 rounded-xl px-4 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A236] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1C1B19]',
                  isActive
                    ? 'bg-[#FDF0DC] text-[#E8941E] dark:bg-[#3A2B1B] dark:text-[#F4A236]'
                    : 'text-[#9B9590] hover:bg-[#F5F3EF] hover:text-[#1A1A1A] dark:hover:bg-[#242320] dark:hover:text-[#F0EDE8]'
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.9} aria-hidden="true" />
                <motion.span
                  initial={false}
                  animate={{ width: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden whitespace-nowrap text-sm font-bold"
                >
                  {label}
                </motion.span>
                <span className="sr-only">{label}</span>
              </motion.a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
