import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { posts } from './src/db/schema.js';

// Load environment variables
config({ path: '.env.local' });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const db = drizzle(pool);

async function testSeoKeywords() {
  try {
    console.log('🔍 Checking seo_keywords column...');
    
    // Fetch all posts to see the current data structure
    const allPosts = await db.select().from(posts).limit(5);
    
    console.log('📝 Sample posts:');
    for (const post of allPosts) {
      console.log(`\nPost: ${post.title}`);
      console.log(`SEO Keywords type: ${typeof post.seoKeywords}`);
      console.log(`SEO Keywords value:`, post.seoKeywords);
      console.log(`Is Array: ${Array.isArray(post.seoKeywords)}`);
    }
    
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testSeoKeywords();
