import { z } from 'zod';

// A single cell definition with support for merged cells and various content types
export const CellSchema = z.object({
  id: z.string(), // Unique ID for React keys
  value: z.union([z.string(), z.number(), z.boolean()]), // Supports text, numbers, or checks
  colSpan: z.number().optional().default(1), // For horizontal merging
  rowSpan: z.number().optional().default(1), // For vertical merging
  align: z.enum(['left', 'center', 'right']).optional().default('center'),
  isHeader: z.boolean().optional(), // If true, renders as <th>
  className: z.string().optional(), // Custom CSS classes
});

// The full table structure supporting complex layouts
export const TableDataSchema = z.object({
  // Headers are an array of rows (to support stacked/merged headers)
  headers: z.array(z.array(CellSchema)),
  // Body is standard rows
  rows: z.array(z.array(CellSchema)),
});

// Chart data structure for visualization
export const ChartDataSchema = z.object({
  type: z.enum(['line', 'bar', 'pie', 'area']),
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
  })),
});

// Union type for different specification content types
export const SpecificationContentSchema = z.union([
  TableDataSchema,
  ChartDataSchema,
]);

// Type exports
export type TableCell = z.infer<typeof CellSchema>;
export type TableData = z.infer<typeof TableDataSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;
export type SpecificationContent = z.infer<typeof SpecificationContentSchema>;
