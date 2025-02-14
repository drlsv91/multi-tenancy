import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

const schema = Joi.object<RedisConfig>({
  host: Joi.string().required(),
  port: Joi.number().integer().min(0).required(),
  password: Joi.string().optional(),
});

export const getConfig = (): RedisConfig => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD!,
});

/* istanbul ignore next */
export default registerAs('redis', (): RedisConfig => {
  const config = getConfig();
  Joi.assert(config, schema, 'Redis config validation failed');
  return config;
});
