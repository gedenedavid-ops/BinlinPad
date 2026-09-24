import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { TtlCache } from '@/lib/ttl-cache';

// Cache onboardingDone — 30s TTL, purgé à chaque miss
// Invalide automatiquement après completeOnboarding() grâce au TTL court
const onboardingCache = new TtlCache<boolean>(30_000);

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  // Requis en production sur Vercel — NextAuth v5 beta rejette les hosts
  // non explicitement approuvés (cause du AccessDenied sur callback Google)
  trustHost: true,

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/connexion',
    error:  '/connexion',
  },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Email + mot de passe ──────────────────────────────────────────────────
    Credentials({
      name: 'Identifiants',
      credentials: {
        email:    { label: 'Email',        type: 'email'    },
        password: { label: 'Mot de passe', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        }).lean();

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          image: user.image ?? null,
        };
      },
    }),
  ],

  callbacks: {
    // Crée ou retrouve le compte MongoDB lors d'une connexion Google
    async signIn({ user, account }) {
      // Credentials gère lui-même l'accès à MongoDB via authorize()
      if (account?.provider === 'credentials') return true;

      // Pour Google : upsert l'utilisateur dans MongoDB
      try {
        await connectDB();
        const existing = await User.findOne({ email: user.email! }).lean();

        if (!existing) {
          await User.create({
            name:         user.name ?? user.email!.split('@')[0],
            email:        user.email!.toLowerCase(),
            passwordHash: '',
            image:        user.image ?? undefined,
          });
        } else if (!existing.image && user.image) {
          await User.updateOne({ email: user.email! }, { image: user.image });
        }

        return true;
      } catch (err) {
        console.error('[signIn] ERROR:', err);
        return false;
      }
    },

    // Injecte l'id MongoDB dans le JWT
    async jwt({ token, user, account, trigger }) {
      // Connexion initiale — on stocke l'id
      if (user?.id) {
        token.id = user.id;
      }

      // Refresh immediately after onboarding instead of waiting for the TTL cache.
      if (trigger === 'update' && token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id)
            .select('learningProfile.onboardingDone')
            .lean();
          token.onboardingDone = dbUser?.learningProfile?.onboardingDone ?? false;
          onboardingCache.set(token.id as string, Boolean(token.onboardingDone));
        } catch { /* keep the current token value */ }
      }

      // Pour OAuth : l'id vient de MongoDB, pas du provider
      if (account?.provider && account.provider !== 'credentials' && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).lean();
          if (dbUser) token.id = dbUser._id.toString();
        } catch { /* silencieux */ }
      }

      // Re-fetch onboardingDone depuis MongoDB (avec cache TTL 30s)
      if (token.id) {
        const userId = token.id as string;
        const cached = onboardingCache.get(userId);
        if (cached !== undefined) {
          token.onboardingDone = cached;
        } else {
          try {
            await connectDB();
            const dbUser = await User.findById(userId)
              .select('learningProfile.onboardingDone')
              .lean();
            const value = (dbUser as { learningProfile?: { onboardingDone?: boolean } } | null)
              ?.learningProfile?.onboardingDone ?? false;
            onboardingCache.set(userId, value);
            token.onboardingDone = value;
          } catch {
            token.onboardingDone = token.onboardingDone ?? false;
          }
        }
      }

      return token;
    },

    // Expose user.id et onboardingDone dans la session côté client
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      session.user.onboardingDone = (token.onboardingDone as boolean) ?? false;
      return session;
    },
  },
});
