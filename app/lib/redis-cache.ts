import { RedisInit } from '../service/redis.service';
import { injectable } from 'tsyringe';
import { LoggerService } from '../service/logger.service';

@injectable()
export class RedisCache {
    constructor(private readonly redisClient: RedisInit, private loggerService: LoggerService) {
    }

    /**
     * Retrieves the cached value for a given key.
     * @param  {string} key The cache key.
     * @return {object} The cached value, else false.
     */
    async get(key) {
        try {
          const data = await this.redisClient.read().get(key);
          return data ? JSON.parse(data) : "";
        } catch (error) {
          this.loggerService.log(error);
        }
    }

    /**
     * Caches a value under the specified key for the given ttl
     * @param {string} key   The key under which to cache the value
     * @param {object} value The value that needs to be cached
     * @param {integer} ttl  The ttl for the cached value
     */
    set(key, value, ttl) {
        if (ttl) {
            ttl = parseInt(ttl);
            this.redisClient.write().set(key, JSON.stringify(value), 'ex', ttl);
        } else {
            this.redisClient.write().set(key, JSON.stringify(value));
        }
    }

    delete(key) {
        this.redisClient.write().del(key)
    }
}