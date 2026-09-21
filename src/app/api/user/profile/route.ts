import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { z } from 'zod';


// ─── Schéma de validation PATCH ──────────────────────────────────────────────────────
const ProfilePatchSchema = z.object({
  userType:       z.enum(['eleve', 'etudiant']).optional(),
  weakSubjects:   z.array(z.string().max(100)).max(50).optional(),
  onboardingDone: z.boolean().optional(),
  schoolLevel:    z.string().max(100).optional(),
  studentField:   z.string().max(200).optional(),
  customSubjects: z.array(z.string().max(100)).max(50).optional(),
  studiedTopics:  z.union([
    z.string().max(200),
    z.array(z.string().max(200)).max(100),
  ]).optional(),
}).strict();

// ─── GET /api/user/profile — lit le profil complet (userType + learningProfile)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(session.user.id)
    .select('_id userType learningProfile name email image')
    .lean();

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  return NextResponse.json({ user });
}

// ─── PATCH /api/user/profile — met à jour userType ou learningProfile (partiel)
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const rawBody = await request.json();
  const validation = ProfilePatchSchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: 'Données invalides', details: validation.error.flatten() }, { status: 400 });
  }
  const body = validation.data;
  const allowed: Record<string, unknown> = {};

  // Seuls ces champs sont patchables directement
  if (body.userType !== undefined) allowed.userType = body.userType;
  if (body.weakSubjects !== undefined) allowed['learningProfile.weakSubjects'] = body.weakSubjects;
  if (body.onboardingDone !== undefined) allowed['learningProfile.onboardingDone'] = body.onboardingDone;
  if (body.schoolLevel !== undefined) allowed['learningProfile.schoolLevel'] = body.schoolLevel;
  if (body.studentField !== undefined) allowed['learningProfile.studentField'] = body.studentField;
  if (body.customSubjects !== undefined) allowed['learningProfile.customSubjects'] = body.customSubjects;

  if (Object.keys(allowed).length === 0 && !body.studiedTopics) {
    return NextResponse.json({ error: 'Aucun champ valide fourni' }, { status: 400 });
  }

  // studiedTopics utilise $addToSet pour dédupliquer automatiquement
  const updateOp: Record<string, unknown> = {};
  if (Object.keys(allowed).length > 0) updateOp.$set = allowed;
  if (body.studiedTopics) {
    updateOp.$addToSet = {
      'learningProfile.studiedTopics': { $each: Array.isArray(body.studiedTopics) ? body.studiedTopics : [body.studiedTopics] },
    };
  }

  const updated = await User.findByIdAndUpdate(
    session.user.id,
    updateOp,
    { new: true, select: 'userType learningProfile', lean: true }
  );

  return NextResponse.json({ user: updated });
}
