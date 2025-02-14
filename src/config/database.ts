import { registerAs } from '@nestjs/config';
import { DatabaseType } from 'typeorm';
import Joi from 'joi';

export interface DatabaseConfig {
  type: DatabaseType;
  database: string;
  host: string;
  port: number;
  username: string;
  password: string;
  synchronize: boolean;
  logging: boolean;
  autoLoadEntities: boolean;
  seedBatchSize: number;
}

export const schema = Joi.object<DatabaseConfig>({
  type: Joi.string().required(),
  database: Joi.string().min(2).required(),
  username: Joi.string().min(5).required(),
  password: Joi.string().min(5).required(),
  port: Joi.number().integer().min(0).required(),
  host: Joi.string().min(5).required(),
  autoLoadEntities: Joi.boolean().required(),
  logging: Joi.boolean().required(),
  synchronize: Joi.boolean().required(),
  seedBatchSize: Joi.number().required(),
});

export const getConfig = (): DatabaseConfig => ({
  type: (process.env.DATABASE_TYPE ?? 'postgres') as DatabaseType,
  database: process.env.DATABASE_NAME ?? 'vms-db',
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'password',
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || true,
  logging: process.env.DATABASE_LOGGING === 'true',
  autoLoadEntities: false,
  seedBatchSize: parseInt(process.env.SEED_BATCH_SIZE ?? '50', 10),
});
/* istanbul ignore next */
export default registerAs('database', (): DatabaseConfig => {
  const config = getConfig();
  Joi.assert(config, schema, 'Database config validation failed');
  return config;
});
