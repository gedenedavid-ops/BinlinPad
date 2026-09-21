import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Note } from '@/models/Note';
import { countWords, estimateReadTime } from '@/lib/utils';
import { validateSubject } from '@/lib/validate-subject';
import type { Subject, Mood, NoteTag } from '@/types';

type Params = { params: Promise<{ id: string }> };

// ─── Body types ───────────────────────────────────────────────────────────────

type NoteColor = 'ochre' | 'dark' | 'default';

type UpdateNoteBody = {
  title?:      string;
  content?:    string;
  subject?:    Subject;
  tags?:       NoteTag[];
  mood?:       Mood;
  attachments?: unknown[];
  isLocked?:   boolean;
  isPinned?:   boolean;
  isFavorite?: boolean;
  color?:      NoteColor;
};

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
    const body = await request.json() as UpdateNoteBody;
    const { content, subject, ...rest } = body;

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
