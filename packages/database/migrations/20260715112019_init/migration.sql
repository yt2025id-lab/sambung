-- CreateEnum
CREATE TYPE "RemittanceStatus" AS ENUM ('initiated', 'swapping', 'waiting_anchor', 'settled', 'failed', 'cancelled', 'refunded');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "google_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "stellar_address" TEXT,
    "phone" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "kyc_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipients" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "nmid" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "phone" TEXT,
    "bank_code" TEXT,
    "bank_account" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "tx_count" INTEGER NOT NULL DEFAULT 0,
    "total_received" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remittances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient_id" UUID,
    "recipient_nmid" TEXT NOT NULL,
    "recipient_provider" TEXT NOT NULL,
    "recipient_phone" TEXT,
    "amount_usdc" DECIMAL(20,7) NOT NULL,
    "amount_idr" BIGINT NOT NULL,
    "fee_usdc" DECIMAL(20,7) NOT NULL DEFAULT 0,
    "fee_idr" BIGINT NOT NULL DEFAULT 0,
    "rate_at_tx" DECIMAL(12,2),
    "status" "RemittanceStatus" NOT NULL DEFAULT 'initiated',
    "failure_reason" TEXT,
    "stellar_tx_hash" TEXT,
    "soroban_payment_id" TEXT,
    "pjp_partner_id" TEXT,
    "pjp_tx_id" TEXT,
    "anchor_quote_id" TEXT,
    "anchor_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remittances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_cache" (
    "id" UUID NOT NULL,
    "base_asset" TEXT NOT NULL,
    "quote_asset" TEXT NOT NULL,
    "bid" DECIMAL(12,2) NOT NULL,
    "ask" DECIMAL(12,2) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'soroswap',
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pjp_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "api_base_url" TEXT NOT NULL,
    "api_key_hash" TEXT NOT NULL,
    "webhook_url" TEXT,
    "webhook_secret" TEXT,
    "supports_qris" BOOLEAN NOT NULL DEFAULT true,
    "supports_bank" BOOLEAN NOT NULL DEFAULT false,
    "fee_bps" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "health_status" TEXT NOT NULL DEFAULT 'healthy',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pjp_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stellar_address_key" ON "users"("stellar_address");

-- CreateIndex
CREATE INDEX "recipients_user_id_idx" ON "recipients"("user_id");

-- CreateIndex
CREATE INDEX "recipients_nmid_idx" ON "recipients"("nmid");

-- CreateIndex
CREATE INDEX "remittances_user_id_idx" ON "remittances"("user_id");

-- CreateIndex
CREATE INDEX "remittances_status_idx" ON "remittances"("status");

-- CreateIndex
CREATE INDEX "remittances_created_at_idx" ON "remittances"("created_at");

-- CreateIndex
CREATE INDEX "remittances_stellar_tx_hash_idx" ON "remittances"("stellar_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "rate_cache_base_asset_quote_asset_key" ON "rate_cache"("base_asset", "quote_asset");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remittances" ADD CONSTRAINT "remittances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remittances" ADD CONSTRAINT "remittances_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
