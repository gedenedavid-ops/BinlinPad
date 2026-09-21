/**
 * Cache TTL en mémoire — safe en single-instance (Render free plan).
 * Aucune dépendance externe (pas de Redis nécessaire à ce stade).
 *
 * Usage :
 *   const cache = new TtlCache<string>(30_000); // TTL 30s
 *   cache.set('key', 'value');
 *   cache.get('key'); // 'value' ou undefined si expiré
 */
export class TtlCache<V> {
  private readonly store = new Map<string, { value: V; expiry: number }>();
  private readonly ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    this.store.set(key, { value, expiry: Date.now() + this.ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /** Purge manuelle des entrées expirées — à appeler si le cache grossit. */
  purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiry) this.store.delete(key);
    }
  }
}
