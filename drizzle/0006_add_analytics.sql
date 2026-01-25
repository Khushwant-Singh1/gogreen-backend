-- Create analytics table for tracking website visitors
CREATE TABLE IF NOT EXISTS "analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page" varchar(500) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"referer" varchar(500),
	"country" varchar(100),
	"device" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Create indexes for better analytics query performance
CREATE INDEX IF NOT EXISTS "analytics_page_idx" ON "analytics" ("page");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_date_idx" ON "analytics" ("created_at");
