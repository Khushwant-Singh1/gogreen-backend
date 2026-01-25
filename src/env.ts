import dotenv from 'dotenv';

// Load environment variables from .env.local first
dotenv.config({ path: '.env.local' });
// Also try loading .env if .env.local didn't provide everything or as fallback
dotenv.config();
