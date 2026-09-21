import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ChatSessionModel } from '@/models/ChatSession';
import { User } from '@/models/User';
import { z } from 'zod';

// ─── Schémas Zod ────────────────────────────────────────────────────────────────────
const SessionPostSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-f]{24}$/i).optional(),
  title:     z.string().max(200).optional(),
  messages:  z.array(z.record(z.string(), z.unknown())).max(500).optional(),
  summary:   z.string().max(2000).optional(),
});

const SessionDeleteSchema = z.object({
  sessionId: z.string().min(1).max(100),
});

// ─── GET /api/chat/sessions — liste toutes les sessions de l'utilisateur ───────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const sessions = await ChatSessionModel.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .limit(20)   // on ne charge que les 20 dernières sessions
    .lean();

  return NextResponse.json({ sessions });
}

// ─── POST /api/chat/sessions — créer ou mettre à jour une session ──────────────
// Corps : { sessionId?, title?, messages[], summary? }
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const raw = await request.json();
  const parsedBody = SessionPostSchema.safeParse(raw);
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsedBody.error.flatten() }, { status: 400 });
  }
  const { sessionId, title, messages, summary } = parsedBody.data;

  // Un vrai id MongoDB est une chaîne hex de 24 caractères
  const isMongoId = typeof sessionId === 'string' && /^[0-9a-f]{24}$/i.test(sessionId);

  if (isMongoId) {
    // Mise à jour d'une session existante
    const updated = await ChatSessionModel.findOneAndUpdate(
      { _id: sessionId, userId: session.user.id },
      { $set: { title, messages, ...(summary ? { summary } : {}) } },
      { new: true, lean: true }
    );
    // Si introuvable (ex: supprimée entre-temps), on recrée silencieusement
    if (updated) return NextResponse.json({ session: updated });
  }

  // Création d'une nouvelle session (id temporaire ou session inconnue)
  const created = await ChatSessionModel.create({
    userId:   session.user.id,
    title:    title ?? 'Nouvelle conversation',
    messages: messages ?? [],
  });

  // Incrémenter le compteur de sessions dans le profil d'apprentissage
  await User.updateOne(
    { _id: session.user.id },
    {
      $inc: { 'learningProfile.totalSessions': 1 },
      $set: { 'learningProfile.lastActiveAt': new Date() },
    }
  );

  return NextResponse.json({ session: created }, { status: 201 });
}

// ─── DELETE /api/chat/sessions — supprimer une session ───────────────────────
// Corps : { sessionId }
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const raw = await request.json();
  const parsedDel = SessionDeleteSchema.safeParse(raw);
  if (!parsedDel.success) {
    return NextResponse.json({ error: 'sessionId invalide' }, { status: 400 });
  }
  const { sessionId } = parsedDel.data;
  // Ignorer silencieusement les ids non-MongoDB (temporaires)
  const isMongoId = typeof sessionId === 'string' && /^[0-9a-f]{24}$/i.test(sessionId);
  if (isMongoId) {
    await ChatSessionModel.deleteOne({ _id: sessionId, userId: session.user.id });
  }
  return NextResponse.json({ success: true });
}
