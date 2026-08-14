import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from root of execution
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL environment variable is required'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookie Configuration
  COOKIE_NAME: z.string().default('omshilpi_access_token'),
  REFRESH_COOKIE_NAME: z.string().default('omshilpi_refresh_token'),
  COOKIE_SECRET: z.string().default('omshilpi_cookie_secret_default'),
  COOKIE_SECURE: z.string().transform((val) => val === 'true').default('false'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
export type EnvConfig = typeof env;
