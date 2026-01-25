-- Enable pg_trgm extension for trigram similarity matching (handles typos)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- Create trigram indexes for fuzzy search on product names
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING gin (name gin_trgm_ops);
--> statement-breakpoint
-- Create trigram index for fuzzy search on product descriptions
CREATE INDEX IF NOT EXISTS products_description_trgm_idx ON products USING gin (description gin_trgm_ops);
