import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';
import { serverEnv } from '@/env/server';
import { upstashCache } from 'drizzle-orm/cache/upstash';
import postgres from 'postgres';

const sql = postgres(serverEnv.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  cache: upstashCache({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    global: true,
    config: { ex: 120 },
  }),
});
