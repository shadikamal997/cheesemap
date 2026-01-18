/**
 * Trial Management API
 * GET /api/businesses/[id]/trial - Get trial status
 * POST /api/businesses/[id]/trial/cancel - Cancel trial
 */

import { NextRequest, NextResponse } from "next/server";
import { getTrialInfo, cancelTrial, TrialError } from "@/lib/trial";

// GET /api/businesses/[id]/trial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // TODO: Add permission check

    const trialInfo = await getTrialInfo(businessId);

    if (!trialInfo) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trial: trialInfo,
    });
  } catch (error: any) {
    console.error("Error fetching trial info:", error);
    if (error instanceof TrialError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch trial status" }, { status: 500 });
  }
}

// POST /api/businesses/[id]/trial/cancel
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

    const result = await cancelTrial(businessId);

    return NextResponse.json({
      success: true,
      message: result.message,
      canceledAt: result.canceledAt,
      accessUntil: result.accessUntil,
    });
  } catch (error: any) {
    console.error("Error canceling trial:", error);
    if (error instanceof TrialError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to cancel trial" }, { status: 500 });
  }
}
