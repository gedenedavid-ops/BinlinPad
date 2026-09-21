import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Note } from '@/models/Note';
import { countWords, estimateReadTime } from '@/lib/utils';
import { validateSubject } from '@/lib/validate-subject';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

// ─── Body types ───────────────────────────────────────────────────────────────

const UpdateNoteSchema = z.object({
  title: z.string().trim().min(1, 'Titre requis').optional(),
  content: z.string().optional(),
  subject: z.string().min(1, 'Matière requise').optional(),
  tags: z.array(z.string()).optional(),
  mood: z.enum(['content', 'neutre', 'triste', 'stresse', 'motive', 'fatigue', 'confus']).optional(),
  attachments: z.array(z.any()).optional(),
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  color: z.enum(['ochre', 'dark', 'default']).optional()
});

type UpdateNoteBody = z.infer<typeof UpdateNoteSchema>;

// ─── GET /api/notes/[id] ──────────────────────────────────────────────────────
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();
  const note = await Note.findOne({ _id: id, userId: session.user.id }).lean();
  if (!note) return NextResponse.json({ error: 'Note introuvable' }, { status: 404 });

  return NextResponse.json({ note });
}

// ─── PUT /api/notes/[id] — mettre à jour une note ─────────────────────────────
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = UpdateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { content, subject, ...rest } = parsed.data;

    await connectDB();

    // Validation du subject si modifié
    if (subject !== undefined) {
      const subjectCheck = await validateSubject(subject, session.user.id);
      if (!subjectCheck.valid) {
        return NextResponse.json({ error: subjectCheck.error }, { status: 400 });
      }
    }

    const update: Partial<UpdateNoteBody & { wordCount: number; readTime: number }> = { ...rest };
    if (subject !== undefined) update.subject = subject;
    if (content !== undefined) {
      update.content   = content;
      update.wordCount = countWords(content);
      update.readTime  = estimateReadTime(content);
    }

    const updated = await Note.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Note introuvable' }, { status: 404 });

    return NextResponse.json({ note: updated });
  } catch (error) {
    console.error('PUT /api/notes error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── DELETE /api/notes/[id] ────────────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  await connectDB();

  const deleted = await Note.findOneAndDelete({
    _id: id,
    userId: session.user.id,
  }).lean();

  if (!deleted) return NextResponse.json({ error: 'Note introuvable' }, { status: 404 });

  return NextResponse.json({ success: true });
}
