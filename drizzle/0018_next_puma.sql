ALTER TABLE "users" ADD COLUMN "supabase_uid" uuid;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_expires_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_secret";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_two_factor_enabled";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "recovery_codes";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_email_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_expires_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_supabase_uid_unique" UNIQUE("supabase_uid");