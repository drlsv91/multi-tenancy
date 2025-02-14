import { Inject } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import { MODULE_OPTIONS_TOKEN } from './redis-cache.module-definition';

export class RedisCacheService extends Redis {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: RedisOptions) {
    super(options);
  }
  async deleteAll(pattern: string): Promise<void> {
    const keys = await this.keys(`${pattern}*`);
    if (keys.length) {
      await Promise.all(keys.map((key) => this.del(key)));
    }
  }
}
