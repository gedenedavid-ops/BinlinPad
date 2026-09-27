import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { UsageLog } from '@/models/UsageLog';

export type KrekreUsage = {
  day: number;
  month: number;
  remainingDay: number;
  remainingMonth: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyExceeded: boolean;
  monthlyExceeded: boolean;
  ocrTodayCount: number;
  ocrDailyLimit: number;
};

export const KREKRE_DAILY_LIMIT = 200_000;
export const KREKRE_MONTHLY_LIMIT = 200_000;
export const OCR_DAILY_LIMIT = 3;

export function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseTokenUsage(payload: unknown): {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
} | null {
  const response = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : {};
  const responseData = Array.isArray(response.data) && response.data[0] && typeof response.data[0] === 'object'
    ? response.data[0] as Record<string, unknown>
    : null;
  const usage = response.usage ?? response.usageMetadata ?? responseData?.usage ?? null;

  if (!usage || typeof usage !== 'object') return null;

  const promptTokens = Number(
    (usage as Record<string, unknown>).prompt_tokens ??
    (usage as Record<string, unknown>).promptTokens ??
    (usage as Record<string, unknown>).promptTokenCount ??
    (usage as Record<string, unknown>).inputTokenCount ??
    (usage as Record<string, unknown>).input_tokens ??
    0
  );

  const completionTokens = Number(
    (usage as Record<string, unknown>).completion_tokens ??
    (usage as Record<string, unknown>).completionTokens ??
    (usage as Record<string, unknown>).candidatesTokenCount ??
    (usage as Record<string, unknown>).completionTokenCount ??
    (usage as Record<string, unknown>).output_tokens ??
    0
  );

  const totalTokens = Number(
    (usage as Record<string, unknown>).total_tokens ??
    (usage as Record<string, unknown>).totalTokens ??
    (usage as Record<string, unknown>).totalTokenCount ??
    (usage as Record<string, unknown>).total ??
    promptTokens + completionTokens
  );

  return {
    totalTokens: Number.isFinite(totalTokens) ? totalTokens : 0,
    promptTokens: Number.isFinite(promptTokens) ? promptTokens : 0,
    completionTokens: Number.isFinite(completionTokens) ? completionTokens : 0,
  };
}

export async function getKrekreUsageForUser(userId: string): Promise<KrekreUsage> {
  await connectDB();

  const today = getDayKey();
  const month = getMonthKey();
  const objectId = new mongoose.Types.ObjectId(userId);

  const [dailyAgg, monthlyAgg, ocrCount] = await Promise.all([
    UsageLog.aggregate([
      { $match: { userId: objectId, dayKey: today } },
      { $group: { _id: null, total: { $sum: '$totalTokens' } } },
    ]),
    UsageLog.aggregate([
      { $match: { userId: objectId, monthKey: month } },
      { $group: { _id: null, total: { $sum: '$totalTokens' } } },
    ]),
    UsageLog.countDocuments({ userId: objectId, dayKey: today, action: 'ocr' }),
  ]);

  const dayTotal = dailyAgg[0]?.total ?? 0;
  const monthTotal = monthlyAgg[0]?.total ?? 0;

  return {
    day: dayTotal,
    month: monthTotal,
    remainingDay: Math.max(KREKRE_DAILY_LIMIT - dayTotal, 0),
    remainingMonth: Math.max(KREKRE_MONTHLY_LIMIT - monthTotal, 0),
    dailyLimit: KREKRE_DAILY_LIMIT,
    monthlyLimit: KREKRE_MONTHLY_LIMIT,
    dailyExceeded: dayTotal >= KREKRE_DAILY_LIMIT,
    monthlyExceeded: monthTotal >= KREKRE_MONTHLY_LIMIT,
    ocrTodayCount: ocrCount,
    ocrDailyLimit: OCR_DAILY_LIMIT,
  };
}

export async function recordKrekreUsage({
  userId,
  provider,
  action,
  model,
  totalTokens,
  promptTokens,
  completionTokens,
}: {
  userId: string;
  provider: 'deepseek' | 'gemini';
  action: 'chat' | 'analyze' | 'ocr';
  model: string;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
}) {
  await connectDB();

  const now = new Date();

  await UsageLog.create({
    userId,
    provider,
    action,
    model,
    totalTokens,
    promptTokens: promptTokens ?? 0,
    completionTokens: completionTokens ?? 0,
    dayKey: getDayKey(now),
    monthKey: getMonthKey(now),
  });
}

export async function isKrekreBlocked(
  userId: string,
  action: 'chat' | 'analyze' | 'ocr'
): Promise<{ blocked: boolean; reason?: string; usage?: KrekreUsage }> {
  const usage = await getKrekreUsageForUser(userId);

  if (usage.dailyExceeded) {
    return {
      blocked: true,
      reason: 'Krékré quotidien atteint — tu as consommé 200k tokens aujourd’hui. Le quota est désactivé jusqu’au prochain jour.',
      usage,
    };
  }

  if (usage.monthlyExceeded) {
    return {
      blocked: true,
      reason: 'Krékré mensuel atteint — tu as consommé 200k tokens ce mois. Reviens dans le prochain cycle.',
      usage,
    };
  }

  if (action === 'ocr' && usage.ocrTodayCount >= OCR_DAILY_LIMIT) {
    return {
      blocked: true,
      reason: 'Limite OCR du jour atteinte — tu peux faire au maximum 3 scans par jour.',
      usage,
    };
  }

  return { blocked: false, usage };
}
