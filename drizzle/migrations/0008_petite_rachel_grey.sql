CREATE TABLE "lookout" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"frequency" text NOT NULL,
	"cron_schedule" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"next_run_at" timestamp NOT NULL,
	"qstash_schedule_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_run_at" timestamp,
	"last_run_chat_id" text,
	"run_history" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp,
	"brand_id" text,
	"business_id" text,
	"card_issuing_country" text,
	"card_last_four" text,
	"card_network" text,
	"card_type" text,
	"currency" text NOT NULL,
	"digital_products_delivered" boolean DEFAULT false,
	"discount_id" text,
	"error_code" text,
	"error_message" text,
	"payment_link" text,
	"payment_method" text,
	"payment_method_type" text,
	"settlement_amount" integer,
	"settlement_currency" text,
	"settlement_tax" integer,
	"status" text,
	"subscription_id" text,
	"tax" integer,
	"total_amount" integer NOT NULL,
	"billing" json,
	"customer" json,
	"disputes" json,
	"metadata" json,
	"product_cart" json,
	"refunds" json,
	"cloudpayments_transaction_id" text,
	"cloudpayments_invoice_id" text,
	"cloudpayments_subscription_id" text,
	"payment_provider" text DEFAULT 'cloudpayments' NOT NULL,
	"card_token" text,
	"test_mode" boolean DEFAULT false,
	"ip_address" text,
	"ip_country" text,
	"ip_city" text,
	"ip_region" text,
	"ip_district" text,
	"ip_latitude" text,
	"ip_longitude" text,
	"card_first_six" text,
	"card_exp_date" text,
	"issuer" text,
	"issuer_bank_country" text,
	"description" text,
	"user_id" text
);
--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "customerId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "checkoutId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "cloudpayments_subscription_id" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "cloudpayments_account_id" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "payment_provider" text DEFAULT 'cloudpayments' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "max_periods" integer;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "successful_transactions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "failed_transactions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "last_transaction_date" timestamp;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "next_transaction_date" timestamp;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "paused_until" timestamp;--> statement-breakpoint
ALTER TABLE "lookout" ADD CONSTRAINT "lookout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;