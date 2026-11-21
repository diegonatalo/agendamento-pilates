ALTER TABLE "studio_settings" ADD COLUMN "business_type" text;--> statement-breakpoint
-- Contas que já existiam eram todas de estúdio de pilates.
UPDATE "studio_settings" SET "business_type" = 'pilates' WHERE "business_type" IS NULL;
