import { db } from './src/db/index.js';
import { globalSettings } from './src/db/schema.js';

async function seedDefaultSettings() {
  try {
    console.log('Inserting default WhatsApp number...');
    
    const result = await db.insert(globalSettings)
      .values({
        key: 'whatsapp_number',
        value: '+919876543210', // Default placeholder - can be changed from admin panel
      })
      .onConflictDoUpdate({
        target: globalSettings.key,
        set: {
          value: '+919876543210',
          updatedAt: new Date(),
        },
      })
      .returning();
    
    console.log('✅ Successfully inserted/updated WhatsApp number:', result);
    
    // Verify
    const allSettings = await db.select().from(globalSettings);
    console.log('\nAll settings in database:');
    console.log(JSON.stringify(allSettings, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    process.exit(1);
  }
}

seedDefaultSettings();
