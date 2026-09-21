// Extension du type Session de NextAuth v5
// pour inclure l'id MongoDB et le statut d'onboarding.

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      onboardingDone: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    onboardingDone?: boolean;
  }
}
