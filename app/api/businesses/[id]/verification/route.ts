import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const verificationSchema = z.object({
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
  })).optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: params.id },
      select: { ownerId: true, verificationStatus: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.ownerId !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    if (business.verificationStatus === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Business is already verified' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = verificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        businessId: params.id,
        requestedBy: user.userId,
        status: 'pending',
        documents: validation.data.documents || [],
        submittedNotes: validation.data.notes,
      },
    });

    // Update business status
    await prisma.business.update({
      where: { id: params.id },
      data: { verificationStatus: 'PENDING' },
    });

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      request: verificationRequest,
    });

  } catch (error) {
    console.error('Submit verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting verification' },
      { status: 500 }
    );
  }
}
