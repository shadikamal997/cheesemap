/**
 * Plan Management API
 * GET /api/businesses/[id]/plan - Get current plan and usage
 * POST /api/businesses/[id]/plan/upgrade - Upgrade plan
 * POST /api/businesses/[id]/plan/downgrade - Downgrade plan
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanByTier, canDowngradePlan, getAllPlans, PRICING_PLANS, DowngradeCheckResult } from "@/lib/pricing";
import { getBusinessSubscriptionWithPlan } from "@/lib/plan-enforcement";

// GET /api/businesses/[id]/plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // Verify user has access to this business
    // TODO: Add permission check

    const subscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
      include: {
        plan: true,
        usage: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const plan = getPlanByTier(subscription.plan.tier);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: subscription.plan.tier,
        planName: subscription.plan.name,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        nextBillingDate: subscription.nextBillingDate,
        priceEur: subscription.plan.priceEur,
        autoRenew: subscription.autoRenew,
      },
      plan: {
        maxProducts: plan.maxProducts,
        maxOrdersPerMonth: plan.maxOrdersPerMonth,
        maxActiveTours: plan.maxActiveTours,
        hasAnalytics: plan.hasAnalytics,
        hasPromotions: plan.hasPromotions,
        supportLevel: plan.supportLevel,
      },
      usage: {
        productsCount: subscription.usage?.productsCount || 0,
        ordersThisPeriod: subscription.usage?.ordersThisPeriod || 0,
        activeToursCount: subscription.usage?.activeToursCount || 0,
        promotionsUsed: subscription.usage?.promotionsUsed || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

// POST /api/businesses/[id]/plan/upgrade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // TODO: Add permission check

    const body = await request.json();
    const { targetTier } = body;

    if (!targetTier) {
      return NextResponse.json({ error: "Target tier required" }, { status: 400 });
    }

    const subscription = await getBusinessSubscriptionWithPlan(businessId);
    const currentPlan = getPlanByTier(subscription.plan.tier);
    const targetPlan = getPlanByTier(targetTier);

    // Check if this is actually an upgrade (higher price or better features)
    if (currentPlan.priceEur >= targetPlan.priceEur) {
      return NextResponse.json(
        { error: "Can only upgrade to a higher tier" },
        { status: 400 }
      );
    }

    // Update subscription
    const now = new Date();
    const newPeriodEnd = new Date(now);
    newPeriodEnd.setDate(newPeriodEnd.getDate() + targetPlan.billingPeriodDays);

    const updatedSubscription = await prisma.businessSubscription.update({
      where: { id: subscription.id },
      data: {
        planId: (await prisma.subscriptionPlan.findUnique({
          where: { tier: targetTier },
        }))!.id,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
      },
      include: { plan: true, usage: true },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${targetPlan.name}`,
      subscription: {
        tier: updatedSubscription.plan.tier,
        planName: updatedSubscription.plan.name,
        status: updatedSubscription.status,
        priceEur: updatedSubscription.plan.priceEur,
      },
    });
  } catch (error: any) {
    console.error("Error upgrading plan:", error);
    if (error.code === "PLAN_LIMIT_REACHED") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to upgrade plan" }, { status: 500 });
  }
}

// DELETE /api/businesses/[id]/plan/downgrade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // TODO: Add permission check

    const body = await request.json();
    const { targetTier } = body;

    if (!targetTier) {
      return NextResponse.json({ error: "Target tier required" }, { status: 400 });
    }

    const subscription = await getBusinessSubscriptionWithPlan(businessId);
    const currentPlan = getPlanByTier(subscription.plan.tier);
    const targetPlan = getPlanByTier(targetTier);

    // Check if this is actually a downgrade
    if (currentPlan.priceEur <= targetPlan.priceEur) {
      return NextResponse.json(
        { error: "Can only downgrade to a lower tier" },
        { status: 400 }
      );
    }

    // Get current usage
    const productCount = await prisma.shopInventory.count({
      where: { businessId },
    });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const orderCount = await prisma.order.count({
      where: {
        businessId,
        createdAt: {
          gte: firstDayOfMonth,
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    });

    const tourCount = await prisma.tour.count({
      where: { businessId, status: "LIVE" },
    });

    // Check if downgrade is possible
    const downgradeCheck = canDowngradePlan(currentPlan, targetPlan, {
      productCount,
      orderCount,
      activeTourCount: tourCount,
      hasAnalyticsUsage: (subscription.usage?.activeToursCount || 0) > 0,
      hasPromotionsUsage: (subscription.usage?.promotionsUsed || 0) > 0,
    });

    if (!downgradeCheck.allowed) {
      return NextResponse.json(
        {
          error: "Cannot downgrade with current usage",
          blockingIssues: downgradeCheck.blockingIssues,
        },
        { status: 400 }
      );
    }

    // Update subscription
    const newPeriodEnd = new Date(now);
    newPeriodEnd.setDate(newPeriodEnd.getDate() + targetPlan.billingPeriodDays);

    const targetPlanRecord = await prisma.subscriptionPlan.findUnique({
      where: { tier: targetTier },
    });

    if (!targetPlanRecord) {
      return NextResponse.json({ error: "Target plan not found" }, { status: 404 });
    }

    const updatedSubscription = await prisma.businessSubscription.update({
      where: { id: subscription.id },
      data: {
        planId: targetPlanRecord.id,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
      },
      include: { plan: true, usage: true },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully downgraded to ${targetPlan.name}`,
      subscription: {
        tier: updatedSubscription.plan.tier,
        planName: updatedSubscription.plan.name,
        status: updatedSubscription.status,
        priceEur: updatedSubscription.plan.priceEur,
      },
    });
  } catch (error: any) {
    console.error("Error downgrading plan:", error);
    if (error.code === "PLAN_LIMIT_REACHED") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to downgrade plan" }, { status: 500 });
  }
}
