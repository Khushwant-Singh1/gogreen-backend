import { db } from './src/db/index.js';
import { globalSettings } from './src/db/schema.js';

async function checkSettings() {
  try {
    const settings = await db.select().from(globalSettings);
    console.log('All settings in database:');
    console.log(JSON.stringify(settings, null, 2));
    
    // Convert to object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    console.log('\nSettings map:');
    console.log(JSON.stringify(settingsMap, null, 2));
    
    console.log('\nWhatsApp Number:', settingsMap.whatsapp_number || 'NOT SET');
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking settings:', error);
    process.exit(1);
  }
}

checkSettings();
