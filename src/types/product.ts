import { z } from 'zod';

// Product validation schema
export const ProductSchema = z.object({
  subcategoryId: z.string().uuid(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().optional(),
  images: z.array(z.string()).optional(),
  specifications: z.any().optional(),
  features: z.array(z.string()).optional(),
  seoKeywords: z.array(z.string()).optional(),
  displayOrder: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const UpdateProductSchema = ProductSchema.partial();

// Type exports
export type ProductInput = z.infer<typeof ProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
