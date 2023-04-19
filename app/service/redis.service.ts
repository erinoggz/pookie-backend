/** @format */

import { injectable } from "tsyringe";
import config from '../config/config';
import redisClient from 'ioredis';

@injectable()
export class RedisInit {
  private static readConnection: redisClient.Redis;
  private static writeConnection: redisClient.Redis;

  read() {
    if (!RedisInit.readConnection) {
      const readOptions: object = {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
      };
      RedisInit.readConnection = new redisClient(readOptions);
    }
    return RedisInit.readConnection;
  }

  write() {
    if (!RedisInit.writeConnection) {
      const writeOptions: object = {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
      };
      RedisInit.writeConnection = new redisClient(writeOptions);
    }
    return RedisInit.writeConnection;
  }
}
