/**
 * Server-side plan enforcement helpers
 * Used in API routes to block over-limit actions
 */

import { PrismaClient } from "@prisma/client";
import { getPlanByTier, checkProductLimit, checkOrderLimit, checkTourLimit, PricingError } from "./pricing";
import { enforceTrialExpiration } from "./trial";

const prisma = new PrismaClient();

// ============================================================================
// BUSINESS VALIDATION
// ============================================================================

/**
 * Get business subscription with plan info
 * Checks both TRIAL and ACTIVE statuses
 */
export async function getBusinessSubscriptionWithPlan(businessId: string) {
  // First check if trial has expired
  await enforceTrialExpiration(businessId);

  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: {
      plan: true,
      usage: true,
    },
  });

  if (!subscription) {
    throw new PricingError(
      "UPGRADE_REQUIRED",
      "Business account requires an active subscription"
    );
  }

  // Allow both TRIAL and ACTIVE status
  if (subscription.status !== "TRIAL" && subscription.status !== "ACTIVE") {
    throw new PricingError(
      "UPGRADE_REQUIRED",
      `Subscription status is ${subscription.status}. Please contact support.`
    );
  }

  return subscription;
}

// ============================================================================
// PRODUCT LIMIT ENFORCEMENT
// ============================================================================

/**
 * Check if business can create a new product
 */
export async function checkCanCreateProduct(businessId: string): Promise<void> {
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  const plan = getPlanByTier(subscription.plan.tier);

  // Count existing products
  const productCount = await prisma.shopInventory.count({
    where: { businessId },
  });

  const check = checkProductLimit(plan, productCount);
  if (!check.allowed) {
    throw new PricingError("PLAN_LIMIT_REACHED", check.message || "Product limit reached");
  }
}

/**
 * Batch check multiple product creations
 */
export async function checkCanCreateProducts(
  businessId: string,
  quantity: number
): Promise<void> {
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  const plan = getPlanByTier(subscription.plan.tier);

  const productCount = await prisma.shopInventory.count({
    where: { businessId },
  });

  const check = checkProductLimit(plan, productCount + quantity - 1);
  if (!check.allowed) {
    throw new PricingError(
      "PLAN_LIMIT_REACHED",
      `Cannot add ${quantity} products. ${check.message}`
    );
  }
}

// ============================================================================
// ORDER LIMIT ENFORCEMENT
// ============================================================================

/**
 * Get current month's order count for business
 */
async function getCurrentMonthOrderCount(businessId: string): Promise<number> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return prisma.order.count({
    where: {
      businessId,
      createdAt: {
        gte: firstDayOfMonth,
        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
    },
  });
}

/**
 * Check if business can accept a new order
 */
export async function checkCanAcceptOrder(businessId: string): Promise<void> {
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  const plan = getPlanByTier(subscription.plan.tier);

  const orderCount = await getCurrentMonthOrderCount(businessId);

  const check = checkOrderLimit(plan, orderCount);
  if (!check.allowed) {
    throw new PricingError("PLAN_LIMIT_REACHED", check.message || "Order limit reached for this month");
  }
}

// ============================================================================
// TOUR LIMIT ENFORCEMENT
// ============================================================================

/**
 * Count active tours for business
 */
async function getActiveTourCount(businessId: string): Promise<number> {
  return prisma.tour.count({
    where: {
      businessId,
      status: "LIVE",
    },
  });
}

/**
 * Check if business can create a new tour
 */
export async function checkCanCreateTour(businessId: string): Promise<void> {
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  const plan = getPlanByTier(subscription.plan.tier);

  const tourCount = await getActiveTourCount(businessId);

  const check = checkTourLimit(plan, tourCount);
  if (!check.allowed) {
    throw new PricingError("PLAN_LIMIT_REACHED", check.message || "Active tour limit reached");
  }
}

// ============================================================================
// FEATURE ACCESS ENFORCEMENT
// ============================================================================

/**
 * Check if business can access analytics
 */
export async function checkCanAccessAnalytics(businessId: string): Promise<void> {
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  const plan = getPlanByTier(subscription.plan.tier);

  if (!plan.hasAnalytics) {
    throw new PricingError(
      "UPGRADE_REQUIRED",
      "Analytics is only available on Growth and Professional plans"
    );
  }
}

/**
 * Check if business can create promotions
 */
export async function checkCanCreatePromotion(businessId: string): Promise<void> {
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  const plan = getPlanByTier(subscription.plan.tier);

  if (!plan.hasPromotions) {
    throw new PricingError(
      "UPGRADE_REQUIRED",
      "Promotions are only available on the Professional plan"
    );
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Increment product count in usage
 */
export async function incrementProductUsage(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true },
  });

  if (!subscription || !subscription.usage) {
    throw new Error("Subscription not found");
  }

  await prisma.planUsage.update({
    where: { id: subscription.usage.id },
    data: {
      productsCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Decrement product count in usage
 */
export async function decrementProductUsage(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true },
  });

  if (!subscription || !subscription.usage) {
    throw new Error("Subscription not found");
  }

  await prisma.planUsage.update({
    where: { id: subscription.usage.id },
    data: {
      productsCount: {
        decrement: 1,
      },
    },
  });
}

/**
 * Increment order count in usage
 */
export async function incrementOrderUsage(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true },
  });

  if (!subscription || !subscription.usage) {
    throw new Error("Subscription not found");
  }

  await prisma.planUsage.update({
    where: { id: subscription.usage.id },
    data: {
      ordersThisPeriod: {
        increment: 1,
      },
    },
  });
}

/**
 * Increment tour count in usage
 */
export async function incrementTourUsage(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true },
  });

  if (!subscription || !subscription.usage) {
    throw new Error("Subscription not found");
  }

  await prisma.planUsage.update({
    where: { id: subscription.usage.id },
    data: {
      activeToursCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Decrement tour count in usage
 */
export async function decrementTourUsage(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true },
  });

  if (!subscription || !subscription.usage) {
    throw new Error("Subscription not found");
  }

  await prisma.planUsage.update({
    where: { id: subscription.usage.id },
    data: {
      activeToursCount: {
        decrement: 1,
      },
    },
  });
}

/**
 * Increment promotions used count
 */
export async function incrementPromotionUsage(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true },
  });

  if (!subscription || !subscription.usage) {
    throw new Error("Subscription not found");
  }

  await prisma.planUsage.update({
    where: { id: subscription.usage.id },
    data: {
      promotionsUsed: {
        increment: 1,
      },
    },
  });
}

// ============================================================================
// BILLING PERIOD RESET
// ============================================================================

/**
 * Reset usage counters if billing period has ended
 * Called at the start of API operations to ensure fresh counts
 */
export async function resetUsageIfNeeded(businessId: string): Promise<void> {
  const subscription = await prisma.businessSubscription.findUnique({
    where: { businessId },
    include: { usage: true, plan: true },
  });

  if (!subscription || !subscription.usage) {
    return;
  }

  const now = new Date();
  if (now > subscription.currentPeriodEnd) {
    // Calculate new period
    const billingPeriodDays = subscription.plan.billingPeriodDays;
    const newPeriodStart = subscription.currentPeriodEnd;
    const newPeriodEnd = new Date(newPeriodStart);
    newPeriodEnd.setDate(newPeriodEnd.getDate() + billingPeriodDays);

    await prisma.$transaction([
      // Update subscription dates
      prisma.businessSubscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          nextBillingDate: newPeriodEnd,
        },
      }),
      // Reset usage
      prisma.planUsage.update({
        where: { id: subscription.usage.id },
        data: {
          ordersThisPeriod: 0,
          lastResetAt: now,
        },
      }),
    ]);
  }
}
