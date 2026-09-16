import { apiRequest } from '@/lib/api-client';
import type { Note, NoteFormData, SearchResult } from '@/types';

function toNote(raw: Record<string, unknown>): Note {
  return {
    ...(raw as Note),
    id: (raw._id ?? raw.id) as string,
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
  };
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function listNotes(): Promise<Note[]> {
  const data = await readJson<{ notes?: Record<string, unknown>[] }>(await apiRequest('/api/notes'));
  return (data.notes ?? []).map(toNote);
}

export async function createNote(data: NoteFormData): Promise<Note> {
  const response = await apiRequest('/api/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const result = await readJson<{ note: Record<string, unknown> }>(response);
  return toNote(result.note);
}

export async function updateNote(id: string, data: Partial<NoteFormData>): Promise<Note> {
  const response = await apiRequest(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const result = await readJson<{ note: Record<string, unknown> }>(response);
  return toNote(result.note);
}

export async function deleteNote(id: string): Promise<void> {
  await readJson(await apiRequest(`/api/notes/${id}`, { method: 'DELETE' }));
}

export async function searchNotes(query: string): Promise<SearchResult[]> {
  const response = await apiRequest('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query, topK: 5 }),
  });
  const data = await readJson<{ results?: SearchResult[] }>(response);
  return data.results ?? [];
}

export async function indexNote(note: Note): Promise<void> {
  await apiRequest('/api/search', {
    method: 'PUT',
    body: JSON.stringify({
      noteId: note.id,
      title: note.title,
      content: note.content,
      subject: note.subject,
    }),
  });
}

export async function removeNoteIndex(noteId: string): Promise<void> {
  await apiRequest('/api/search', {
    method: 'DELETE',
    body: JSON.stringify({ noteId }),
  });
}
