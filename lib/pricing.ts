/**
 * CheeseMap Pricing Model
 * Authoritative pricing logic for all business plans
 */

import { PricingTier, SupportLevel, Prisma } from "@prisma/client";

// ============================================================================
// PRICING PLAN DEFINITIONS (AUTHORITATIVE)
// ============================================================================

export const PRICING_PLANS = {
  ESSENTIAL: {
    tier: PricingTier.ESSENTIAL,
    name: "Essential",
    description: "Perfect for starting your cheese business",
    priceEur: 25,
    billingPeriodDays: 30,
    maxProducts: 10,
    maxOrdersPerMonth: 30,
    maxActiveTours: 0,
    hasAnalytics: false,
    hasPromotions: false,
    supportLevel: SupportLevel.STANDARD,
    supportResponseTimeHours: 72,
  },
  GROWTH: {
    tier: PricingTier.GROWTH,
    name: "Growth",
    description: "For growing cheese businesses",
    priceEur: 55,
    billingPeriodDays: 30,
    maxProducts: 50,
    maxOrdersPerMonth: -1, // unlimited
    maxActiveTours: 5,
    hasAnalytics: true,
    hasPromotions: false,
    supportLevel: SupportLevel.PRIORITY,
    supportResponseTimeHours: 24,
  },
  PROFESSIONAL: {
    tier: PricingTier.PROFESSIONAL,
    name: "Professional",
    description: "For established cheese businesses",
    priceEur: 95,
    billingPeriodDays: 30,
    maxProducts: -1, // unlimited
    maxOrdersPerMonth: -1, // unlimited
    maxActiveTours: -1, // unlimited
    hasAnalytics: true,
    hasPromotions: true,
    supportLevel: SupportLevel.DEDICATED,
    supportResponseTimeHours: 1, // same-day
  },
} as const;

// ============================================================================
// PLAN DEFAULTS & UTILITIES
// ============================================================================

/**
 * Get plan definition by tier
 */
export function getPlanByTier(tier: PricingTier) {
  const plan =
    PRICING_PLANS[tier as keyof typeof PRICING_PLANS];
  if (!plan) {
    throw new Error(`Unknown pricing tier: ${tier}`);
  }
  return plan;
}

/**
 * Get the default (Essential) plan for new businesses
 */
export function getDefaultPlan() {
  return PRICING_PLANS.ESSENTIAL;
}

/**
 * Check if a value is unlimited (-1)
 */
function isUnlimited(value: number): boolean {
  return value === -1;
}

// ============================================================================
// LIMIT VALIDATION (BACKEND ENFORCEMENT)
// ============================================================================

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  isUnlimited: boolean;
  message?: string;
}

/**
 * Check if product creation is allowed
 */
export function checkProductLimit(
  plan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS],
  currentCount: number
): LimitCheckResult {
  const limit = plan.maxProducts;
  const isUn = isUnlimited(limit);

  return {
    allowed: isUn || currentCount < limit,
    current: currentCount,
    limit: isUn ? -1 : limit,
    isUnlimited: isUn,
    message:
      !isUn && currentCount >= limit
        ? `PLAN_LIMIT_REACHED: You've reached your product limit of ${limit}. Upgrade to continue.`
        : undefined,
  };
}

/**
 * Check if order acceptance is allowed
 */
export function checkOrderLimit(
  plan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS],
  currentCount: number
): LimitCheckResult {
  const limit = plan.maxOrdersPerMonth;
  const isUn = isUnlimited(limit);

  return {
    allowed: isUn || currentCount < limit,
    current: currentCount,
    limit: isUn ? -1 : limit,
    isUnlimited: isUn,
    message:
      !isUn && currentCount >= limit
        ? `PLAN_LIMIT_REACHED: You've reached your monthly order limit of ${limit}. Upgrade to continue.`
        : undefined,
  };
}

/**
 * Check if tour creation is allowed
 */
export function checkTourLimit(
  plan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS],
  currentCount: number
): LimitCheckResult {
  const limit = plan.maxActiveTours;
  const isUn = isUnlimited(limit);

  return {
    allowed: isUn || currentCount < limit,
    current: currentCount,
    limit: isUn ? -1 : limit,
    isUnlimited: isUn,
    message:
      !isUn && currentCount >= limit
        ? `PLAN_LIMIT_REACHED: You've reached your active tour limit of ${limit}. Upgrade to continue.`
        : undefined,
  };
}

/**
 * Check if analytics access is allowed
 */
export function checkAnalyticsAccess(
  plan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS]
): { allowed: boolean; message?: string } {
  return {
    allowed: plan.hasAnalytics,
    message: !plan.hasAnalytics
      ? "UPGRADE_REQUIRED: Analytics is only available on Growth and Professional plans."
      : undefined,
  };
}

/**
 * Check if promotions/featured placement is allowed
 */
export function checkPromotionsAccess(
  plan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS]
): { allowed: boolean; message?: string } {
  return {
    allowed: plan.hasPromotions,
    message: !plan.hasPromotions
      ? "UPGRADE_REQUIRED: Promotions are only available on the Professional plan."
      : undefined,
  };
}

// ============================================================================
// PLAN COMPARISONS & UPGRADE LOGIC
// ============================================================================

/**
 * Check if downgrade is allowed based on current usage
 */
export interface DowngradeCheckResult {
  allowed: boolean;
  blockingIssues: string[];
}

export function canDowngradePlan(
  currentPlan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS],
  targetPlan: (typeof PRICING_PLANS)[keyof typeof PRICING_PLANS],
  currentUsage: {
    productCount: number;
    orderCount: number;
    activeTourCount: number;
    hasAnalyticsUsage: boolean;
    hasPromotionsUsage: boolean;
  }
): DowngradeCheckResult {
  const issues: string[] = [];

  // Check products
  if (
    !isUnlimited(targetPlan.maxProducts) &&
    currentUsage.productCount > targetPlan.maxProducts
  ) {
    issues.push(
      `You have ${currentUsage.productCount} products but ${targetPlan.name} only allows ${targetPlan.maxProducts}`
    );
  }

  // Check tours
  if (
    !isUnlimited(targetPlan.maxActiveTours) &&
    currentUsage.activeTourCount > targetPlan.maxActiveTours
  ) {
    issues.push(
      `You have ${currentUsage.activeTourCount} active tours but ${targetPlan.name} only allows ${targetPlan.maxActiveTours}`
    );
  }

  // Check analytics
  if (currentUsage.hasAnalyticsUsage && !targetPlan.hasAnalytics) {
    issues.push(`Your plan currently uses analytics which is not available in ${targetPlan.name}`);
  }

  // Check promotions
  if (currentUsage.hasPromotionsUsage && !targetPlan.hasPromotions) {
    issues.push(`Your plan currently uses promotions which are not available in ${targetPlan.name}`);
  }

  return {
    allowed: issues.length === 0,
    blockingIssues: issues,
  };
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Format price for display
 */
export function formatPlanPrice(priceEur: number): string {
  return `€${priceEur.toFixed(2)}/month`;
}

/**
 * Get display limit text (shows "Unlimited" or number)
 */
export function formatLimit(limit: number): string {
  return isUnlimited(limit) ? "Unlimited" : limit.toString();
}

/**
 * Get all plans sorted by price
 */
export function getAllPlans() {
  return Object.values(PRICING_PLANS).sort((a, b) => a.priceEur - b.priceEur);
}

/**
 * Get plan with best value for tourists (always free)
 */
export function getVisitorPlan() {
  return {
    tier: "VISITOR" as const,
    name: "Visitor",
    description: "Explore cheese businesses and experiences",
    priceEur: 0,
    billingPeriodDays: null,
    features: [
      "Browse all cheese businesses",
      "View tours and tastings",
      "Make bookings",
      "Join the cheese passport program",
    ],
  };
}

// ============================================================================
// BILLING & SUBSCRIPTION HELPERS
// ============================================================================

/**
 * Calculate next billing date
 */
export function calculateNextBillingDate(
  billingPeriodDays: number,
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + billingPeriodDays);
  return nextDate;
}

/**
 * Check if subscription needs renewal
 */
export function isSubscriptionExpired(nextBillingDate: Date): boolean {
  return new Date() > nextBillingDate;
}

/**
 * Get days until subscription renewal
 */
export function getDaysUntilRenewal(nextBillingDate: Date): number {
  const now = new Date();
  const diff = nextBillingDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// VALIDATION HELPERS FOR API ROUTES
// ============================================================================

/**
 * Error class for pricing-related validation
 */
export class PricingError extends Error {
  constructor(
    public code: "PLAN_LIMIT_REACHED" | "UPGRADE_REQUIRED" | "INVALID_PLAN",
    message: string
  ) {
    super(message);
    this.name = "PricingError";
  }
}

/**
 * Validate business has active plan (for all business users)
 * Visitors should never reach this
 */
export function validateBusinessHasPlan(
  subscription: {
    status: string;
  } | null
): void {
  if (!subscription || subscription.status !== "ACTIVE") {
    throw new PricingError(
      "UPGRADE_REQUIRED",
      "Business account requires an active subscription"
    );
  }
}
