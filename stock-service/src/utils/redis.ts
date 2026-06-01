import Redis from "ioredis";

class CacheService {
  private redis: Redis | null = null;
  private memoryStore: Map<string, { value: string; expiresAt: number | null }> = new Map();
  private isRedisConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 1) {
            if (this.isRedisConnected || times === 2) {
              console.warn("⚠️ [CACHE] Redis connection lost. Falling back to In-Memory Cache.");
            }
            this.isRedisConnected = false;
            return null; // Stop retrying
          }
          return 1000;
        }
      });

      this.redis.on("connect", () => {
        this.isRedisConnected = true;
        console.log("🚀 [CACHE] Connected to Redis server successfully!");
      });

      this.redis.on("error", (err) => {
        if (this.isRedisConnected) {
          console.warn("⚠️ [CACHE] Redis error occurred. Directing traffic to In-Memory Cache.", err.message);
        }
        this.isRedisConnected = false;
      });

      // Try lazy connect
      this.redis.connect().catch(() => {
        console.warn("⚠️ [CACHE] Redis connection failed on startup. Gracefully falling back to High-Speed In-Memory Cache.");
        this.isRedisConnected = false;
      });

    } catch (err) {
      console.warn("⚠️ [CACHE] Failed to initialize Redis client. Falling back to In-Memory Cache.");
      this.isRedisConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        const val = await this.redis.get(key);
        if (val) {
          console.log(`⚡ [CACHE HIT] Redis retrieved key: "${key}"`);
          return JSON.parse(val) as T;
        }
      } catch (err) {
        console.warn(`[CACHE] Failed to GET "${key}" from Redis. Reading from memory fallback.`, err);
      }
    }

    // In-memory fallback
    const item = this.memoryStore.get(key);
    if (!item) {
      console.log(`🔍 [CACHE MISS] Key "${key}" not found in cache`);
      return null;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      console.log(`⏱️ [CACHE EXPIRED] Key "${key}" has expired`);
      this.memoryStore.delete(key);
      return null;
    }

    console.log(`⚡ [CACHE HIT] In-Memory retrieved key: "${key}"`);
    return JSON.parse(item.value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isRedisConnected && this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.set(key, serialized, "EX", ttlSeconds);
        } else {
          await this.redis.set(key, serialized);
        }
        console.log(`✍️ [CACHE SET] Redis saved key: "${key}" with TTL: ${ttlSeconds || "infinite"}s`);
        return;
      } catch (err) {
        console.warn(`[CACHE] Failed to SET "${key}" in Redis. Writing to memory fallback.`, err);
      }
    }

    // In-memory fallback
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value: serialized, expiresAt });
    console.log(`✍️ [CACHE SET] In-Memory saved key: "${key}" with TTL: ${ttlSeconds || "infinite"}s`);
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
        console.log(`🔥 [CACHE EVICTED] Redis deleted key: "${key}"`);
        return;
      } catch (err) {
        console.warn(`[CACHE] Failed to DELETE "${key}" from Redis. Evicting memory.`, err);
      }
    }

    // In-memory fallback
    const deleted = this.memoryStore.delete(key);
    if (deleted) {
      console.log(`🔥 [CACHE EVICTED] In-Memory deleted key: "${key}"`);
    }
  }
}

export const cache = new CacheService();
