import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// The connection string will be provided by your host (Supabase, Neon, etc.)
const connectionString = process.env.DATABASE_URL || '';

// We export the db instance. 
// If there is no connection string yet, we leave it null to prevent dev server crashes.
let db: ReturnType<typeof drizzle> | null = null;

if (connectionString) {
  const client = postgres(connectionString);
  db = drizzle(client, { schema });
}

export { db };
