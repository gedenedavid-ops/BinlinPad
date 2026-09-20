/**
 * Middleware NextAuth v5
 *
 * Protège toutes les routes authentifiées.
 * Routes publiques : /connexion, /inscription, /auth/*, /legal, /
 * Assets statiques exclus via le matcher.
 *
 * Sans ce fichier (ou avec export default auth sans callback),
 * NextAuth v5 beta redirige /connexion → /connexion en boucle
 * (ERR_TOO_MANY_REDIRECTS).
 */
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
    // Ne jamais mettre /connexion comme callbackUrl (causerait une boucle)
    const safe = pathname.startsWith('/connexion') ? '/journal' : pathname;
    loginUrl.searchParams.set('callbackUrl', safe);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà authentifié et tente d'accéder à /connexion → rediriger vers /journal
  if (isAuthenticated && pathname.startsWith('/connexion')) {
    return NextResponse.redirect(new URL('/journal', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Exclure tous les assets statiques :
     * _next/static, _next/image, icônes, images, vidéos, manifeste…
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|icons|manifest\\.json|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.mp4$|.*\\.webm$|.*\\.gif$|.*\\.jpg$|.*\\.jpeg$).*)',
  ],
};
