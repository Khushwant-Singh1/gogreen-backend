import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: '.env.local' });
config(); // Load .env as fallback

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create database connection
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for RDS
  },
});

const db = drizzle(pool);

async function applyMigration() {
  try {
    console.log('🔄 Converting seo_keywords from text to jsonb...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'drizzle', '0011_change_seo_keywords_to_json.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the migration
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Migration completed successfully!');
    console.log('   seo_keywords is now jsonb and can store arrays of keywords');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration();
