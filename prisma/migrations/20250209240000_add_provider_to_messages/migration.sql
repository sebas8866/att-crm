-- Add provider and externalId columns to messages table
-- This migration supports dual-provider SMS (Twilio + Telnyx)

-- Add provider column with default 'twilio' for existing records
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'twilio';

-- Rename twilioSid to externalId for provider-agnostic ID storage
ALTER TABLE "messages" RENAME COLUMN "twilio_sid" TO "external_id";

-- Create index on provider for efficient filtering
CREATE INDEX IF NOT EXISTS "idx_messages_provider" ON "messages"("provider");

-- Update comments
COMMENT ON COLUMN "messages"."provider" IS 'SMS provider: twilio or telnyx';
COMMENT ON COLUMN "messages"."external_id" IS 'Provider-specific message ID (Twilio SID or Telnyx ID)';
