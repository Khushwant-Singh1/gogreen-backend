import { Router, type Request, type Response, type IRouter } from 'express';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.middleware.js';
import { db } from '../db/index.js';
import { globalSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { AuditLogModel } from '../models/audit-log.model.js';
import { ActionType } from '../types/auth.js';
import axios from 'axios';

const router: IRouter = Router();

// Helper to revalidate frontend cache
async function revalidateFrontend(tag: string) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const secret = process.env.REVALIDATION_SECRET || 'gogreen_revalidation_secret';
    
    await axios.post(`${frontendUrl}/api/revalidate`, null, {
      params: { tag, secret }
    });
    console.log(`Revalidated tag: ${tag}`);
  } catch (error) {
    console.error('Revalidation failed:', error);
  }
}

// Get all settings (public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await db.select().from(globalSettings);
    
    // Convert array to object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upsert settings (Admin only)
const upsertSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1),
    value: z.string(),
  })),
});

router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const data = upsertSettingsSchema.parse(req.body);
    
    const results = [];
    
    for (const setting of data.settings) {
      const result = await db.insert(globalSettings)
        .values({
          key: setting.key,
          value: setting.value,
        })
        .onConflictDoUpdate({
          target: globalSettings.key,
          set: {
            value: setting.value,
            updatedAt: new Date(),
          },
        })
        .returning();
      
      results.push(result[0]);
    }
    
    // trigger revalidation
    await revalidateFrontend('global-settings');
    
    // Log audit
    await AuditLogModel.create({
      userId: req.user.userId,
      action: ActionType.UPDATE,
      resourceType: 'global_settings',
      resourceId: 'global',
      details: { updatedKeys: data.settings.map(s => s.key) },
    });
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
