import { Router, type Request, type Response, type IRouter } from 'express';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.middleware.js';
import { AnalyticsModel } from '../models/analytics.model.js';
import { z } from 'zod';

const router: IRouter = Router();

// Track page view (public endpoint)
const trackSchema = z.object({
  page: z.string(),
  referer: z.string().optional(),
});

router.post('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = trackSchema.parse(req.body);
    
    // Get IP address
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) ||
                     req.socket.remoteAddress;
    
    // Get user agent
    const userAgent = req.headers['user-agent'] || '';
    
    // Detect device type
    let device = 'desktop';
    if (/mobile/i.test(userAgent)) {
      device = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = 'tablet';
    }

    await AnalyticsModel.track({
      page: data.page,
      ipAddress,
      userAgent,
      referer: data.referer,
      device,
    });

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    console.error('Track analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics stats (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await AnalyticsModel.getStats(days);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get analytics stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent visits (Admin only)
router.get('/recent', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const visits = await AnalyticsModel.getRecentVisits(limit);

    res.json({
      success: true,
      data: visits,
    });
  } catch (error) {
    console.error('Get recent visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
