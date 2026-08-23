interface CacheEntry<V> {
    value: V;
    expiresAt: number;
}

export class TtlCache<K = string, V = unknown> {
    private cache = new Map<K, CacheEntry<V>>();
    private defaultTtlMs: number;

    constructor(defaultTtlMs: number = 15_000) {
        this.defaultTtlMs = defaultTtlMs;
    }

    async getOrFetch(
        key: K,
        fetcher: () => Promise<V>,
        ttlMs?: number
    ): Promise<V> {
        const now = Date.now();
        const entry = this.cache.get(key);

        if (entry && now < entry.expiresAt) {
            return entry.value;
        }

        const value = await fetcher();
        const effectiveTtl = ttlMs ?? this.defaultTtlMs;
        this.cache.set(key, { value, expiresAt: now + effectiveTtl });
        return value;
    }

    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;
        if (Date.now() >= entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }

    set(key: K, value: V, ttlMs?: number): void {
        const effectiveTtl = ttlMs ?? this.defaultTtlMs;
        this.cache.set(key, { value, expiresAt: Date.now() + effectiveTtl });
    }

    invalidate(key: K): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

export const appMemo = new TtlCache<string, string>(15_000);
