// proxy.ts — Next.js 16+ (remplace middleware.ts)
// Protège toutes les routes sauf les pages publiques et les assets statiques
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith('/auth') ||
    pathname.startsWith('/connexion') ||
    pathname.startsWith('/inscription') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/legal') ||
    pathname === '/';

  const isAuthenticated = !!req.auth;

  // Route protégée + non authentifié → redirection vers /connexion
  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL('/connexion', req.url);
    // Ne jamais mettre /connexion comme callbackUrl (causerait une boucle infinie)
    const safe = pathname.startsWith('/connexion') ? '/journal' : pathname;
    loginUrl.searchParams.set('callbackUrl', safe);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà authentifié → ne pas laisser accéder à /connexion
  if (isAuthenticated && pathname.startsWith('/connexion')) {
    return NextResponse.redirect(new URL('/journal', req.url));
  }

  // Routes exemptes du redirect onboarding
  const isOnboardingExempt =
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/connexion') ||
    pathname.startsWith('/legal') ||
    pathname === '/';

  // Utilisateur authentifié mais onboarding pas encore fait
  if (isAuthenticated && !req.auth?.user?.onboardingDone && !isOnboardingExempt) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|icons|manifest\\.json|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.mp4$|.*\\.webm$|.*\\.gif$|.*\\.jpg$|.*\\.jpeg$).*)',
  ],
};
