import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getKrekreUsageForUser } from '@/lib/krekre';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const usage = await getKrekreUsageForUser(session.user.id);

  return NextResponse.json({
    usage,
    remainingDay: usage.remainingDay,
    remainingMonth: usage.remainingMonth,
    ocrTodayCount: usage.ocrTodayCount,
    ocrDailyLimit: usage.ocrDailyLimit,
  });
}