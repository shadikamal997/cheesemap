-- CreateEnum
CREATE TYPE "PricingTier" AS ENUM ('ESSENTIAL', 'GROWTH', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "SupportLevel" AS ENUM ('STANDARD', 'PRIORITY', 'DEDICATED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'PENDING');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "tier" "PricingTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceEur" DOUBLE PRECISION NOT NULL,
    "billingPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "maxProducts" INTEGER NOT NULL,
    "maxOrdersPerMonth" INTEGER NOT NULL,
    "maxActiveTours" INTEGER NOT NULL,
    "hasAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "hasPromotions" BOOLEAN NOT NULL DEFAULT false,
    "supportLevel" "SupportLevel" NOT NULL,
    "supportResponseTimeHours" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_subscriptions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialStartAt" TIMESTAMP(3),
    "trialEndAt" TIMESTAMP(3),
    "trialActive" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_usage" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "productsCount" INTEGER NOT NULL DEFAULT 0,
    "ordersThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "activeToursCount" INTEGER NOT NULL DEFAULT 0,
    "promotionsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "folder" TEXT NOT NULL,
    "entityId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_tier_key" ON "subscription_plans"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "business_subscriptions_businessId_key" ON "business_subscriptions"("businessId");

-- CreateIndex
CREATE INDEX "business_subscriptions_status_nextBillingDate_trialEndAt_idx" ON "business_subscriptions"("status", "nextBillingDate", "trialEndAt");

-- CreateIndex
CREATE UNIQUE INDEX "plan_usage_subscriptionId_key" ON "plan_usage"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "file_uploads_fileKey_key" ON "file_uploads"("fileKey");

-- CreateIndex
CREATE INDEX "file_uploads_uploadedById_idx" ON "file_uploads"("uploadedById");

-- CreateIndex
CREATE INDEX "file_uploads_expiresAt_idx" ON "file_uploads"("expiresAt");

-- AddForeignKey
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_usage" ADD CONSTRAINT "plan_usage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "business_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
