/**
 * Middleware NextAuth v5
 *
 * Protège toutes les routes sauf :
 *  - /connexion et /inscription (pages d'auth)
 *  - /legal (page publique)
 *  - /api/auth/* (callbacks NextAuth)
 *  - assets statiques (_next/*, favicon, images, etc.)
 *
 * Sans ce fichier, NextAuth v5 beta applique une protection globale
 * et redirige /connexion → /connexion en boucle (ERR_TOO_MANY_REDIRECTS).
 */
import { auth } from '@/lib/auth';

export default auth;

export const config = {
  matcher: [
    /*
     * Exclure :
     *  1. /connexion, /inscription, /legal   — routes publiques
     *  2. /api/auth/*                         — handlers NextAuth
     *  3. /_next/static, /_next/image         — assets Next.js
     *  4. Tout fichier avec extension (.ico, .png, .svg, .js, .css…)
     */
    '/((?!connexion|inscription|legal|api/auth|_next/static|_next/image|favicon|assets|manifest|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
};
