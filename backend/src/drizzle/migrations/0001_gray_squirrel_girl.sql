ALTER TABLE "contacts" ADD COLUMN "blocked_by" uuid;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "user_id_lt_other_id" CHECK ("contacts"."user_id" < "contacts"."other_id");