import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Configuración del cliente Postgres.js con 'prepare: false' para compatibilidad con Neon/Supabase Pooler
const client = postgres(connectionString, { prepare: false });

declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

let db: ReturnType<typeof drizzle<typeof schema>>;

if (process.env.NODE_ENV === 'production') {
  db = drizzle(client, { schema });
} else {
  if (!globalThis.db) {
    globalThis.db = drizzle(client, { schema });
  }
  db = globalThis.db;
}

export { db };
