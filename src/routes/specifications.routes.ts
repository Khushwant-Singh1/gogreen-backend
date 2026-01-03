import { Router, type Request, type Response , type IRouter } from 'express';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.middleware.js';
import { db } from '../db/index.js';
import { productSpecifications } from '../db/schema.js';
import { TableDataSchema, SpecificationContentSchema } from '../types/specification.js';
import { eq, and } from 'drizzle-orm';
import { AuditLogModel } from '../models/audit-log.model.js';
import { ActionType } from '../types/auth.js';

const router :IRouter = Router();

// Get all specifications for a product (public)
router.get('/product/:productId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }
    
    const includeInactive = req.query.includeInactive === 'true';

    const conditions = includeInactive
      ? eq(productSpecifications.productId, productId)
      : and(
          eq(productSpecifications.productId, productId),
          eq(productSpecifications.isActive, true)
        );

    const specs = await db
      .select()
      .from(productSpecifications)
      .where(conditions)
      .orderBy(productSpecifications.displayOrder);

    res.json({
      success: true,
      data: specs,
    });
  } catch (error) {
    console.error('Get specifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specification by ID (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Specification ID is required' });
      return;
    }

    const spec = await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.id, id))
      .limit(1);

    if (!spec || spec.length === 0) {
      res.status(404).json({ error: 'Specification not found' });
      return;
    }

    res.json({
      success: true,
      data: spec[0],
    });
  } catch (error) {
    console.error('Get specification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create specification (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, title, type, content, displayOrder } = req.body;

    // Validate required fields
    if (!productId || !title || !content) {
      res.status(400).json({ error: 'Product ID, title, and content are required' });
      return;
    }

    // Validate content structure with Zod
    let validatedContent;
    try {
      if (type === 'grid' || type === 'matrix' || !type) {
        validatedContent = TableDataSchema.parse(content);
      } else {
        validatedContent = SpecificationContentSchema.parse(content);
      }
    } catch (validationError) {
      res.status(400).json({ 
        error: 'Invalid content structure', 
        details: validationError 
      });
      return;
    }

    // Insert into database
    const result = await db.insert(productSpecifications).values({
      productId,
      title,
      type: type || 'grid',
      content: validatedContent,
      displayOrder: displayOrder || '0',
      isActive: true,
    }).returning();

    // Log the action
    if (req.user) {
      await AuditLogModel.create({
        userId: req.user.id,
        action: ActionType.CREATE,
        resourceType: 'product_specification',
        resourceId: result[0]!.id,
        details: { title, productId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.status(201).json({
      success: true,
      data: result[0]!,
    });
  } catch (error) {
    console.error('Create specification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update specification (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, type, content, displayOrder, isActive } = req.body;
    
    if (!id) {
      res.status(400).json({ error: 'Specification ID is required' });
      return;
    }

    // Check if specification exists
    const existing = await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      res.status(404).json({ error: 'Specification not found' });
      return;
    }

    // Validate content if provided
    let validatedContent;
    if (content) {
      try {
        if (type === 'grid' || type === 'matrix' || !type) {
          validatedContent = TableDataSchema.parse(content);
        } else {
          validatedContent = SpecificationContentSchema.parse(content);
        }
      } catch (validationError) {
        res.status(400).json({ 
          error: 'Invalid content structure', 
          details: validationError 
        });
        return;
      }
    }

    // Update the specification
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (validatedContent !== undefined) updateData.content = validatedContent;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const result = await db
      .update(productSpecifications)
      .set(updateData)
      .where(eq(productSpecifications.id, id))
      .returning();

    // Log the action
    if (req.user) {
      await AuditLogModel.create({
        userId: req.user.id,
        action: ActionType.UPDATE,
        resourceType: 'product_specification',
        resourceId: id,
        details: { updates: updateData },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.json({
      success: true,
      data: result[0]!,
    });
  } catch (error) {
    console.error('Update specification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete specification (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Specification ID is required' });
      return;
    }

    // Check if specification exists
    const existing = await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      res.status(404).json({ error: 'Specification not found' });
      return;
    }

    // Delete the specification
    await db
      .delete(productSpecifications)
      .where(eq(productSpecifications.id, id));

    // Log the action
    if (req.user) {
      await AuditLogModel.create({
        userId: req.user.id,
        action: ActionType.DELETE,
        resourceType: 'product_specification',
        resourceId: id,
        details: { title: existing[0]!.title },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.json({
      success: true,
      message: 'Specification deleted successfully',
    });
  } catch (error) {
    console.error('Delete specification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle active status (admin only)
router.patch('/:id/toggle-active', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Specification ID is required' });
      return;
    }

    // Get current status
    const existing = await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      res.status(404).json({ error: 'Specification not found' });
      return;
    }

    // Toggle the status
    const result = await db
      .update(productSpecifications)
      .set({ 
        isActive: !existing[0]!.isActive,
        updatedAt: new Date(),
      })
      .where(eq(productSpecifications.id, id))
      .returning();

    // Log the action
    if (req.user) {
      await AuditLogModel.create({
        userId: req.user.id,
        action: ActionType.UPDATE,
        resourceType: 'product_specification',
        resourceId: id,
        details: { 
          action: 'toggle_active',
          newStatus: result[0]!.isActive,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.json({
      success: true,
      data: result[0]!,
    });
  } catch (error) {
    console.error('Toggle specification status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
