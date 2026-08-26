import { registerAs } from '@nestjs/config';

export const APP_CONFIG_KEY = 'app';

export type AppConfig = {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  apiPrefix: string;
};

export const appConfig = registerAs(
  APP_CONFIG_KEY,
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.API_PORT ?? '3001', 10),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
    apiPrefix: 'api/v1',
  }),
);

export const DATABASE_CONFIG_KEY = 'database';

export type DatabaseConfig = {
  url: string;
};

export const databaseConfig = registerAs(
  DATABASE_CONFIG_KEY,
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL ?? '',
  }),
);

export const REDIS_CONFIG_KEY = 'redis';

export type RedisConfig = {
  url: string;
};

export const redisConfig = registerAs(
  REDIS_CONFIG_KEY,
  (): RedisConfig => ({
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  }),
);

export const JWT_CONFIG_KEY = 'jwt';

export type JwtConfig = {
  secret: string;
  accessTtl: number;
  refreshTtl: number;
};

export const jwtConfig = registerAs(
  JWT_CONFIG_KEY,
  (): JwtConfig => ({
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
    refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10),
  }),
);

export const AUTH_CONFIG_KEY = 'auth';

export type AuthConfig = {
  maxSessionsPerUser: number;
  maxFailedAttempts: number;
  lockoutDurationMs: number;
  refreshCookieName: string;
};

export const authConfig = registerAs(
  AUTH_CONFIG_KEY,
  (): AuthConfig => ({
    maxSessionsPerUser: 5,
    maxFailedAttempts: 5,
    lockoutDurationMs: 15 * 60 * 1000,
    refreshCookieName: 'refresh_token',
  }),
);
