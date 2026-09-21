import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const EmbedSchema = z.object({
  text: z.string().min(1, 'Texte requis').max(50_000, 'Texte trop long (max 50 000 caractères)'),
});

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const parsed = EmbedSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors.text?.[0] ?? 'Texte invalide' }, { status: 400 });
    }
    const { text } = parsed.data;

    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'VOYAGE_API_KEY not configured', embedding: null },
        { status: 503 }
      );
    }

    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: [text],
        model: 'voyage-3',
        input_type: 'document',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Voyage AI error:', err);
      return NextResponse.json({ error: 'Embedding service error' }, { status: 502 });
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    return NextResponse.json({
      embedding,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Embed API error:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
