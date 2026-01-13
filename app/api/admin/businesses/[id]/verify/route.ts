import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

const verifySchema = z.object({
  approve: z.boolean(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (admin instanceof NextResponse) return admin;

    const business = await prisma.business.findUnique({
      where: { id: params.id },
      include: {
        verificationRequests: {
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { approve, notes, rejectionReason } = validation.data;

    // Update verification request
    if (business.verificationRequests[0]) {
      await prisma.verificationRequest.update({
        where: { id: business.verificationRequests[0].id },
        data: {
          status: approve ? 'approved' : 'rejected',
          reviewedBy: admin.userId,
          reviewedAt: new Date(),
          reviewNotes: notes,
          rejectionReason: approve ? null : rejectionReason,
        },
      });
    }

    // Update business status
    const updated = await prisma.business.update({
      where: { id: params.id },
      data: {
        verificationStatus: approve ? 'VERIFIED' : 'REJECTED',
        isVisible: approve,
        ...(approve && { verifiedAt: new Date() }),
      },
    });

    // TODO: Send notification email to business owner

    return NextResponse.json({
      message: approve ? 'Business verified successfully' : 'Business rejected',
      business: updated,
    });

  } catch (error) {
    console.error('Verify business error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying business' },
      { status: 500 }
    );
  }
}
