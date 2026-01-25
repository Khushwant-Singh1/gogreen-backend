import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function applyAnalyticsMigration() {
  console.log('Starting analytics migration...');
  
  try {
    console.log('Creating analytics table...');
    
    // Create analytics table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analytics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        page varchar(500) NOT NULL,
        ip_address varchar(45),
        user_agent text,
        referer varchar(500),
        country varchar(100),
        device varchar(50),
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✓ Analytics table created');

    // Create indexes
    console.log('Creating indexes...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS analytics_page_idx ON analytics (page)`);
    console.log('✓ Page index created');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS analytics_date_idx ON analytics (created_at)`);
    console.log('✓ Date index created');

    console.log('\n✅ Analytics migration completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

applyAnalyticsMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
