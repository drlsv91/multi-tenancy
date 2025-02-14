import { registerAs } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';
import * as Joi from 'joi';
import { readFileSync } from 'fs';
import path from 'path';

const environments = ['production', 'development', 'staging', 'test'] as const;
const logLevels: readonly LogLevel[] = [
  'debug',
  'error',
  'log',
  'verbose',
  'warn',
];

type Environment = (typeof environments)[number];

export type AppConfig = {
  name: string;
  version: string;
  environment: Environment;
  server: {
    host: string;
    port: number;
  };
  swagger: {
    enabled: boolean;
  };
  log: {
    name: string;
    version: string;
    level: LogLevel;
  };
  auth: {
    frontendUrl?: string;
  };
};

const schema: Joi.ObjectSchema<AppConfig> = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().min(5).required(),
  environment: Joi.string()
    .valid(...environments)
    .required(),
  server: Joi.object({
    port: Joi.number().integer().min(0).required(),
    host: Joi.string().min(5).required(),
  }),
  swagger: Joi.object({
    enabled: Joi.boolean().required(),
  }),
  log: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().min(5).required(),
    level: Joi.string()
      .valid(...logLevels)
      .required(),
  }),
  auth: Joi.object({
    frontendUrl: Joi.string().optional(),
  }),
});

const getPackageInfo = () => {
  const content = readFileSync(
    path.join(__dirname, '../../package.json'),
    'utf-8',
  );
  return JSON.parse(content) as { name: string; version: string };
};

export const getConfig = (): AppConfig => {
  const pkg = getPackageInfo();
  const name = process.env.APP_NAME || pkg.name;
  process.env.APP_NAME = name;
  const version = process.env.VERSION || pkg.version;
  const environment = (process.env.ENVIRONMENT ||
    process.env.NODE_ENV ||
    'development') as Environment;
  return {
    name,
    version,
    environment,
    server: {
      host: process.env.SERVER_HOST || process.env.HOST || '0.0.0.0',
      port: Number(process.env.SERVER_PORT || process.env.PORT || 9000),
    },
    swagger: {
      enabled:
        (process.env.SWAGGER_ENABLED || 'false').trim().toLowerCase() ===
        'true',
    },
    log: {
      name,
      version,
      level: (process.env.LOG_LEVEL || 'log') as LogLevel,
    },
    auth: {
      frontendUrl: process.env.AUTH_FRONTEND_BASE_URL,
    },
  };
};

/* istanbul ignore next */
export default registerAs('app', (): AppConfig => {
  const config = getConfig();
  Joi.assert(config, schema, 'App config validation failed');
  return config;
});
