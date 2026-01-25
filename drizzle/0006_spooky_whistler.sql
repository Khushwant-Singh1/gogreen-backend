CREATE TABLE "analytics" (
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
ALTER TABLE "products" ADD COLUMN "pdf_url" varchar(500);--> statement-breakpoint
CREATE INDEX "analytics_page_idx" ON "analytics" USING btree ("page");--> statement-breakpoint
CREATE INDEX "analytics_date_idx" ON "analytics" USING btree ("created_at");