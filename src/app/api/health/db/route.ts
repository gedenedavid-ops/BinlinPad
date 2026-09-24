import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      ok: mongoose.connection.readyState === 1,
    });
  } catch (error) {
    console.error('[health/db] MongoDB indisponible:', error);

    return NextResponse.json(
      { ok: false, message: 'MongoDB est indisponible' },
      { status: 503 }
    );
  }
}