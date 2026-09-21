import { Logtail } from '@logtail/next';

// Crée l'instance Logtail uniquement si on a un token
export const logtail = process.env.LOGTAIL_SOURCE_TOKEN
  ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
  : null;

// Helper générique pour logger (console + Betterstack en prod)
export const logger = {
  info: (message: string, context?: any) => {
    console.log(`[INFO] ${message}`, context ? context : '');
    logtail?.info(message, context);
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, context ? context : '');
    logtail?.warn(message, context);
  },
  error: (message: string, error?: any, context?: any) => {
    console.error(`[ERROR] ${message}`, error, context ? context : '');
    logtail?.error(message, { error: error?.message || error, ...context });
  }
};
