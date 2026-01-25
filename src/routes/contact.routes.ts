import { Router, type Request, type Response, type IRouter } from 'express';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.middleware.js';
import { ContactModel } from '../models/contact.model.js';
import { z } from 'zod';
import { AuditLogModel } from '../models/audit-log.model.js';
import { ActionType } from '../types/auth.js';

const router: IRouter = Router();

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

// Public: Submit contact form
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = contactSchema.parse(req.body);
    const fullName = `${data.firstName} ${data.lastName}`;
    
    await ContactModel.create({
      name: fullName,
      email: data.email,
      phone: data.phone,
      message: data.message
    });
    
    // Optional: Trigger email notification here (skipped for simplicity as per user prompt focused on admin panel viewing)
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.issues });
      return;
    }
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all submissions
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await ContactModel.getAll(page, limit);
    res.json(result.data); // Return array directly to match expected frontend format or use { data, meta }
    // Frontend expects array currently based on existing code `res.data`.
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update status
router.patch('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || !status) {
      res.status(400).json({ error: 'Missing id or status' });
      return;
    }
    
    const updated = await ContactModel.updateStatus(id, status);
    
    if (!updated) {
      res.status(404).json({ error: 'Contact submission not found' });
      return;
    }

    // Log audit
    await AuditLogModel.create({
        userId: req.user.userId,
        action: ActionType.UPDATE,
        resourceType: 'contact_submission',
        resourceId: id,
        details: { status },
      });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete submission
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Missing id' });
      return;
    }
    
    const deleted = await ContactModel.delete(id);
    
    if (!deleted) {
      res.status(404).json({ error: 'Contact submission not found' });
      return;
    }

    // Log audit
    await AuditLogModel.create({
        userId: req.user.userId,
        action: ActionType.DELETE,
        resourceType: 'contact_submission',
        resourceId: id,
        details: {},
      });
    
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete contact submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
