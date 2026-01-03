import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'khush'}:${process.env.DB_PASSWORD || 'khush123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'gogreen'}`,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Export pool for raw queries if needed
export { pool };
