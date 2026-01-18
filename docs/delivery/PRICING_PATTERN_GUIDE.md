/**
 * CheeseMap Pricing Pattern
 * 
 * This file shows the standard pattern for adding plan enforcement
 * to any API route that creates resources or accesses features.
 * 
 * Copy this pattern when building new features that need plan limits.
 */

// ============================================================================
// PATTERN 1: PRODUCT/RESOURCE CREATION WITH LIMIT
// ============================================================================

// Example: Creating a new product
import { NextRequest, NextResponse } from 'next/server';
import { checkCanCreateProduct, incrementProductUsage, PricingError } from '@/lib/plan-enforcement';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST_PRODUCT_CREATION_EXAMPLE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // 2. Get business
    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // 3. Validate input
    const body = await request.json();
    // ... validation code ...

    // ⭐ 4. CHECK PLAN LIMIT (BEFORE database write)
    try {
      await checkCanCreateProduct(business.id);
    } catch (error) {
      if (error instanceof PricingError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: 402 } // 402 Payment Required
        );
      }
      throw error;
    }

    // 5. Create resource in database
    const product = await prisma.shopInventory.create({
      data: {
        businessId: business.id,
        cheeseName: body.cheeseName,
        // ... other fields ...
      },
    });

    // ⭐ 6. INCREMENT USAGE (AFTER successful creation)
    try {
      await incrementProductUsage(business.id);
    } catch (err) {
      console.error('Usage tracking failed:', err);
      // Don't fail the request if usage update fails
    }

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATTERN 2: FEATURE ACCESS CONTROL
// ============================================================================

import { checkCanAccessAnalytics, checkCanCreatePromotion } from '@/lib/plan-enforcement';

export async function GET_ANALYTICS_EXAMPLE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
    });

    // ⭐ CHECK FEATURE ACCESS
    try {
      await checkCanAccessAnalytics(business.id);
    } catch (error) {
      if (error instanceof PricingError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: 402 } // 402 Payment Required
        );
      }
      throw error;
    }

    // Feature is allowed, proceed with analytics logic
    const analytics = await prisma.order.groupBy({
      by: ['status'],
      where: { businessId: business.id },
      _count: true,
    });

    return NextResponse.json({ analytics });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATTERN 3: BULK/BATCH OPERATIONS WITH LIMITS
// ============================================================================

import { checkCanCreateProducts } from '@/lib/plan-enforcement';

export async function POST_BULK_PRODUCTS_EXAMPLE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
    });

    const body = await request.json();
    const productsToAdd = body.products; // Array of products

    // ⭐ CHECK BULK LIMITS (check if we can add N products)
    try {
      await checkCanCreateProducts(business.id, productsToAdd.length);
    } catch (error) {
      if (error instanceof PricingError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: 402 }
        );
      }
      throw error;
    }

    // Create all products
    const created = await prisma.shopInventory.createMany({
      data: productsToAdd.map(p => ({
        ...p,
        businessId: business.id,
      })),
    });

    // ⭐ INCREMENT USAGE FOR EACH PRODUCT ADDED
    for (let i = 0; i < productsToAdd.length; i++) {
      try {
        await incrementProductUsage(business.id);
      } catch (err) {
        console.error('Usage tracking failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      count: created.count,
    }, { status: 201 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATTERN 4: DELETION OPERATIONS (DECREMENT USAGE)
// ============================================================================

import { decrementProductUsage } from '@/lib/plan-enforcement';

export async function DELETE_PRODUCT_EXAMPLE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
    });

    // Get product ID from URL
    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();

    // Verify business owns this product
    const product = await prisma.shopInventory.findUnique({
      where: { id: productId },
    });

    if (!product || product.businessId !== business.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete the product
    await prisma.shopInventory.delete({
      where: { id: productId },
    });

    // ⭐ DECREMENT USAGE (after successful deletion)
    try {
      await decrementProductUsage(business.id);
    } catch (err) {
      console.error('Usage tracking failed:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted',
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATTERN 5: FRONTEND - DISABLE BUTTON WHEN LIMIT REACHED
// ============================================================================

import { useEffect, useState } from 'react';

export function AddProductButtonExample() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      const response = await fetch(`/api/businesses/${businessId}/plan`);
      if (response.ok) {
        setPlan(await response.json());
      }
      setLoading(false);
    }
    fetchPlan();
  }, []);

  const isAtLimit =
    plan &&
    plan.plan.maxProducts !== -1 &&
    plan.usage.productsCount >= plan.plan.maxProducts;

  return (
    <>
      {isAtLimit && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-4">
          <p>Product limit reached. Upgrade to continue.</p>
        </div>
      )}

      <button
        disabled={isAtLimit}
        className={`px-4 py-2 rounded ${
          isAtLimit
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isAtLimit ? 'Limit Reached' : 'Add Product'}
      </button>
    </>
  );
}

// ============================================================================
// PATTERN 6: COMMON ERROR HANDLING
// ============================================================================

// All enforcement functions throw PricingError with these codes:
type ErrorCode = 'PLAN_LIMIT_REACHED' | 'UPGRADE_REQUIRED';

function handlePricingError(error: unknown) {
  if (error instanceof PricingError) {
    const statusCode = error.code === 'PLAN_LIMIT_REACHED' ? 402 : 402;
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: statusCode }
    );
  }

  // Not a pricing error, re-throw
  throw error;
}

// ============================================================================
// QUICK REFERENCE: AVAILABLE FUNCTIONS
// ============================================================================

/*
SERVER-SIDE (lib/plan-enforcement.ts)
=====================================

Validation (call BEFORE action):
- checkCanCreateProduct(businessId) → throws if limit reached
- checkCanCreateProducts(businessId, quantity) → batch check
- checkCanAcceptOrder(businessId) → throws if order limit hit
- checkCanCreateTour(businessId) → throws if tour limit hit
- checkCanAccessAnalytics(businessId) → throws if not in plan
- checkCanCreatePromotion(businessId) → throws if not Professional

Usage Tracking (call AFTER successful action):
- incrementProductUsage(businessId)
- decrementProductUsage(businessId)
- incrementOrderUsage(businessId)
- incrementTourUsage(businessId)
- decrementTourUsage(businessId)
- incrementPromotionUsage(businessId)

Lifecycle:
- resetUsageIfNeeded(businessId) → resets at billing boundary

Get Info:
- getBusinessSubscriptionWithPlan(businessId) → returns subscription + plan + usage

ERROR CODES (check with: error.code)
====================================
- PLAN_LIMIT_REACHED: Hard limit exceeded
- UPGRADE_REQUIRED: Feature not in plan

Both throw at HTTP 402 Payment Required

PRICING CONSTANTS (lib/pricing.ts)
==================================
- PRICING_PLANS.ESSENTIAL/GROWTH/PROFESSIONAL
- getAllPlans()
- getDefaultPlan()
- getPlanByTier(tier)
- formatPlanPrice(eur)
- formatLimit(number) → "Unlimited" or number
- canDowngradePlan(currentPlan, targetPlan, usage)

================================
FOLLOW THIS PATTERN FOR ALL NEW FEATURES
================================
*/
