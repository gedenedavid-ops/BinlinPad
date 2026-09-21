import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Note } from '@/models/Note';
import { countWords, estimateReadTime } from '@/lib/utils';
import { validateSubject } from '@/lib/validate-subject';
import { z } from 'zod';

// ─── Body types ───────────────────────────────────────────────────────────────

const CreateNoteSchema = z.object({
  title: z.string().trim().min(1, 'Titre requis'),
  content: z.string().optional().default(''),
  subject: z.string().min(1, 'Matière requise'),
  tags: z.array(z.string()).optional().default([]),
  mood: z.enum(['content', 'neutre', 'triste', 'stresse', 'motive', 'fatigue', 'confus']).optional(),
  attachments: z.array(z.any()).optional().default([]),
  isLocked: z.boolean().optional().default(false),
  isPinned: z.boolean().optional().default(false),
  isFavorite: z.boolean().optional().default(false),
  color: z.enum(['ochre', 'dark', 'default']).optional().default('default')
});

// ─── GET /api/notes — liste toutes les notes de l'utilisateur connecté ────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const notes = await Note.find({ userId: session.user.id })
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  return NextResponse.json({ notes });
}

// ─── POST /api/notes — créer une nouvelle note ────────────────────────────────
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const {
      title,
      content,
      subject,
      tags,
      mood,
      attachments,
      isLocked,
      isPinned,
      isFavorite,
      color,
    } = parsed.data;

    await connectDB();

    // Validation du subject selon le profil
    const subjectCheck = await validateSubject(subject, session.user.id);
    if (!subjectCheck.valid) {
      return NextResponse.json({ error: subjectCheck.error }, { status: 400 });
    }

    const note = await Note.create({
      userId:    session.user.id,
      title:     title.trim(),
      content,
      subject,
      tags,
      mood,
      attachments,
      isLocked,
      isPinned,
      isFavorite,
      color,
      wordCount: countWords(content),
      readTime:  estimateReadTime(content),
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
