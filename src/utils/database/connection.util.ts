import { SnakeNamingStrategy } from './snake-naming.strategy';
import dotenv from 'dotenv';
import { LRUCache } from 'lru-cache';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { getConfig } from '../../config/database';
import { TenantEntity } from '../../tenant/tenant.entity-default';
import { EntitySubscriber } from '../../common/subscribers/entity.subscriber';

const cache = new LRUCache<string, DataSource>({ max: 100 });

export const closeConnections = async () => {
  console.log('closing cached connection...');
  try {
    for (const [name, connection] of cache.entries()) {
      connection.isInitialized && (await connection.destroy());
      cache.delete(name);
    }
  } catch (error) {
    console.error(error);
  }
  console.log('connections closed..');
};

export const getTenantConnection = async (tenantId: string) => {
  const name = `tenant_${tenantId}`;
  if (cache.has(name)) {
    return cache.get(name);
  }

  const dataSource = getTenantDataSource(tenantId);
  const connection = await dataSource.initialize();

  cache.set(name, connection);

  return connection;
};

export const getTenantDataSource = (tenantId: string, cliMode = false) => {
  const defaultConfig = getConfig();
  const source = new DataSource({
    ...defaultConfig,
    schema: `tenant_${tenantId}`,
    entities:
      cliMode || process.env.ENVIRONMENT === 'test'
        ? ['src/**/*.entity.ts']
        : ['dist/**/*.entity.js'],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    subscribers: [EntitySubscriber],
  } as PostgresConnectionOptions);

  return source;
};

export const getDefaultDataSource = (cliMode = false) => {
  const extension = cliMode ? 'js' : 'ts';
  dotenv.config();

  const databaseConfig = getConfig();
  return new DataSource({
    ...databaseConfig,
    entities: [`src/**/*.entity-default.${extension}`],
    migrations: [`src/migrations/tenants/*.${extension}`],
    namingStrategy: new SnakeNamingStrategy(),
  } as PostgresConnectionOptions);
};

export const getAppTenants = async () => {
  dotenv.config();
  const datasource = getDefaultDataSource();
  const connection = await datasource.initialize();
  return connection.manager.find(TenantEntity);
};

export const createSchema = async (name: string, cliMode = false) => {
  const datasource = getDefaultDataSource(cliMode);
  const connection = await datasource.initialize();
  await connection.createQueryRunner().createSchema(name, true);

  await connection.destroy();
};
