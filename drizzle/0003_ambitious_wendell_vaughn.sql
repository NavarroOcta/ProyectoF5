CREATE TABLE IF NOT EXISTS "pitch_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pitch_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text NOT NULL,
	"close_time" text NOT NULL,
	CONSTRAINT "pitch_schedules_pitch_id_day_of_week_unique" UNIQUE("pitch_id","day_of_week")
);
--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "reservations_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "pitches" ADD COLUMN "price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "payment_method" text DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pitch_schedules" ADD CONSTRAINT "pitch_schedules_pitch_id_pitches_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";