import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: path.resolve(__dirname, '.env.local') });

async function applyMigration() {
  try {
    console.log('🔄 Adding cover_image column to products table...');
    
    await db.execute(sql`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_image varchar(500);
    `);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
