# Product Specifications System

This document explains the product specifications system with flexible JSONB table structures.

## Overview

The system supports flexible table specifications using PostgreSQL's JSONB column type, allowing for:
- Standard grid tables
- Complex merged header tables
- Multiple rows and columns
- Dynamic table rendering
- Boolean checkmarks for features

## Database Schema

### `product_specifications` Table

- `id`: UUID primary key
- `product_id`: References products table
- `title`: Specification table title
- `type`: 'grid', 'matrix', or 'chart'
- `content`: JSONB column storing the full table structure
- `display_order`: Display ordering
- `is_active`: Active/inactive status
- `created_at`, `updated_at`: Timestamps

### Relations

- Products have many specifications (one-to-many)
- Specifications belong to one product
- Categories → Subcategories → Products → Specifications

## Content Structure

### Table Data Format

```typescript
{
  headers: [
    [
      { id: "h1", value: "Column 1", colSpan: 1, rowSpan: 1 },
      { id: "h2", value: "Column 2", colSpan: 2, rowSpan: 1 }
    ],
    [
      { id: "h3", value: "Sub 1", colSpan: 1, rowSpan: 1 },
      { id: "h4", value: "Sub 2", colSpan: 1, rowSpan: 1 }
    ]
  ],
  rows: [
    [
      { id: "r1c1", value: "Row Header", isHeader: true },
      { id: "r1c2", value: "Value 1" },
      { id: "r1c3", value: true } // Boolean for checkmark
    ]
  ]
}
```

### Cell Properties

- `id`: Unique identifier for React keys
- `value`: String, number, or boolean
- `colSpan`: Horizontal merge (default: 1)
- `rowSpan`: Vertical merge (default: 1)
- `align`: 'left', 'center', 'right'
- `isHeader`: Renders as `<th>` if true
- `className`: Custom CSS classes

## API Endpoints

### Get Specifications
- `GET /api/specifications/product/:productId`
- Query params: `includeInactive=true`

### Get Single Specification
- `GET /api/specifications/:id`

### Create Specification
- `POST /api/specifications`
- Body: `{ productId, title, type, content, displayOrder }`
- Validates content with Zod schema

### Update Specification
- `PUT /api/specifications/:id`
- Body: Same as create (partial)

### Delete Specification
- `DELETE /api/specifications/:id`

### Toggle Active Status
- `PATCH /api/specifications/:id/toggle-active`

## Frontend Components

### SpecificationTable
Renders a single table specification with:
- Merged cells support
- Boolean checkmarks
- Striped rows
- Responsive design

### ProductSpecifications
Container component that:
- Fetches all specifications for a product
- Filters active specifications
- Renders multiple tables

### Admin UI
Located at `/admin/products/[id]/specifications`:
- Visual table builder
- Add/edit/delete specifications
- Toggle active/inactive status
- Preview tables
- Configurable rows/columns

## Usage Example

### Creating a Specification

1. Go to Products Management
2. Click "Specs" button for a product
3. Click "Add Specification"
4. Configure table dimensions
5. Click "Initialize Table"
6. Fill in cell values
7. Save

### Displaying on Frontend

```tsx
import { ProductSpecifications } from '@/components/ProductSpecifications';

<ProductSpecifications specifications={specifications} />
```

## Migration Steps

1. Generate migration:
   ```bash
   cd backend
   pnpm drizzle-kit generate
   ```

2. Apply migration:
   ```bash
   pnpm drizzle-kit push
   ```

3. Restart backend server

## Benefits of JSONB Approach

✅ Flexible structure - no rigid schema
✅ Supports complex merged cells
✅ Easy to add new table types
✅ No complex joins for rendering
✅ Version control friendly (JSON diffs)
✅ Fast queries with PostgreSQL JSONB
✅ TypeScript type safety with Zod validation

## Future Enhancements

- Chart visualization support
- Import/export table data (CSV, Excel)
- Table templates for common formats
- Drag-and-drop cell merging UI
- Copy specifications between products
