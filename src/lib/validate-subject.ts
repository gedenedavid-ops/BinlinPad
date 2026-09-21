import { User } from '@/models/User';
import { ELEVE_SUBJECTS } from '@/lib/subjects';
import { TtlCache } from '@/lib/ttl-cache';
import type { UserType } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ValidateResult =
  | { valid: true }
  | { valid: false; error: string };

/** Projection Mongoose minimale pour la validation du subject */
type UserSubjectProjection = {
  userType: UserType;
  learningProfile: {
    customSubjects: Array<{ label: string }>;
  };
};

// Cache TTL 60s — les customSubjects changent rarement (settings uniquement)
const userProfileCache = new TtlCache<UserSubjectProjection>(60_000);


// ─── Helpers internes ─────────────────────────────────────────────────────────

function isValidEleveSubject(subject: string): boolean {
  return (ELEVE_SUBJECTS as readonly string[]).includes(subject);
}

function isValidEtudiantSubject(
  subject: string,
  customSubjects: Array<{ label: string }>,
): boolean {
  // Onboarding incomplet → pas de restriction
  if (customSubjects.length === 0) return true;
  const allowed = new Set<string>([...customSubjects.map((s) => s.label), 'Autre']);
  return allowed.has(subject);
}

// ─── Export principal ─────────────────────────────────────────────────────────

/**
 * Valide que `subject` est cohérent avec le profil de l'utilisateur en BDD.
 *
 * - Élève  → subject doit être dans `ELEVE_SUBJECTS`
 * - Étudiant → subject doit être dans `customSubjects` ou égal à "Autre"
 *             (si customSubjects vide = onboarding incomplet → pas de blocage)
 *
 * Fait un seul hit MongoDB avec une projection minimale.
 */
export async function validateSubject(
  subject: string,
  userId: string,
): Promise<ValidateResult> {
  let dbUser = userProfileCache.get(userId);

  if (!dbUser) {
    const fetched = await User.findById(userId)
      .select('userType learningProfile.customSubjects')
      .lean<UserSubjectProjection | null>();

    if (!fetched) {
      return { valid: false, error: 'Utilisateur introuvable' };
    }
    userProfileCache.set(userId, fetched);
    dbUser = fetched;
  }


  const userType: UserType = dbUser.userType ?? 'eleve';
  const customSubjects = dbUser.learningProfile?.customSubjects ?? [];

  if (userType === 'eleve') {
    if (!isValidEleveSubject(subject)) {
      return {
        valid: false,
        error: `Matière invalide pour un élève : "${subject}"`,
      };
    }
  } else {
    if (!isValidEtudiantSubject(subject, customSubjects)) {
      return {
        valid: false,
        error: `Matière invalide : "${subject}" n'est pas dans tes matières`,
      };
    }
  }

  return { valid: true };
}
