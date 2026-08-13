import type { DnsCacheEntry, DnsRecordType } from "./dns.types";

export class DnsResolverCache {
  private cache: Map<string, DnsCacheEntry> = new Map();

  constructor(initialEntries?: DnsCacheEntry[]) {
    if (initialEntries) {
      initialEntries.forEach((e) => this.cache.set(`${e.hostname.toLowerCase()}:${e.type}`, e));
    }
  }

  public get(hostname: string, type: DnsRecordType): DnsCacheEntry | null {
    const key = `${hostname.toLowerCase()}:${type}`;
    const entry = this.cache.get(key);
    if (!entry) return null;

    const elapsed = Math.floor((Date.now() - entry.cachedAt) / 1000);
    const ttlRemaining = Math.max(0, entry.initialTtl - elapsed);

    if (ttlRemaining === 0) {
      this.cache.delete(key);
      return null;
    }

    entry.hits += 1;
    entry.ttlRemaining = ttlRemaining;
    return entry;
  }

  public set(hostname: string, type: DnsRecordType, value: string, ttl: number): void {
    const key = `${hostname.toLowerCase()}:${type}`;
    this.cache.set(key, {
      hostname,
      type,
      value,
      initialTtl: ttl,
      ttlRemaining: ttl,
      cachedAt: Date.now(),
      hits: 0,
    });
  }

  public getAll(): DnsCacheEntry[] {
    return Array.from(this.cache.values());
  }

  public clear(): void {
    this.cache.clear();
  }
}

export function createDefaultDnsCache(): DnsCacheEntry[] {
  return [
    {
      hostname: "api.github.com",
      type: "A",
      value: "140.82.121.6",
      initialTtl: 300,
      ttlRemaining: 245,
      cachedAt: Date.now() - 55000,
      hits: 14,
    },
    {
      hostname: "dns.google",
      type: "A",
      value: "8.8.8.8",
      initialTtl: 86400,
      ttlRemaining: 74200,
      cachedAt: Date.now() - 12200000,
      hits: 42,
    },
  ];
}
