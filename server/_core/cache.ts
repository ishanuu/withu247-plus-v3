/**
 * Redis Caching Utility
 * Provides caching layer for frequently accessed data
 */

import Redis from 'ioredis';

// Initialize Redis client
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export const initializeCache = async (): Promise<void> => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis cache connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis cache error:', err.message);
    });

    // Test connection
    await redisClient.ping();
  } catch (error) {
    console.warn('⚠️  Redis cache initialization failed, continuing without cache:', error);
    redisClient = null;
  }
};

/**
 * Get value from cache
 * @param key - Cache key
 * @returns Cached value or null
 */
export const cacheGet = async (key: string): Promise<any> => {
  if (!redisClient) return null;

  try {
    const value = await redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set value in cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in seconds (default: 3600 = 1 hour)
 */
export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = 3600
): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setex(key, ttl, stringValue);
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete cache key
 * @param key - Cache key to delete
 */
export const cacheDel = async (key: string): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

/**
 * Delete multiple cache keys
 * @param keys - Array of cache keys
 */
export const cacheDelMultiple = async (keys: string[]): Promise<boolean> => {
  if (!redisClient || keys.length === 0) return false;

  try {
    await redisClient.del(...keys);
    return true;
  } catch (error) {
    console.error('Cache delete multiple error:', error);
    return false;
  }
};

/**
 * Clear all cache
 */
export const cacheClear = async (): Promise<boolean> => {
  if (!redisClient) return false;

  try {
    await redisClient.flushdb();
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Check if cache is available
 */
export const isCacheAvailable = (): boolean => {
  return redisClient !== null;
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<any> => {
  if (!redisClient) return null;

  try {
    const info = await redisClient.info('stats');
    return info;
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
};

/**
 * Cache decorator for functions
 * @param ttl - Time to live in seconds
 * @param keyPrefix - Prefix for cache key
 */
export const withCache = (ttl: number = 3600, keyPrefix: string = 'cache') => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cacheSet(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
};

/**
 * Graceful shutdown
 */
export const closeCache = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis cache connection closed');
  }
};

export default {
  initializeCache,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelMultiple,
  cacheClear,
  isCacheAvailable,
  getCacheStats,
  withCache,
  closeCache,
};
