import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

const approveTourSchema = z.object({
  approve: z.boolean(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(request, 'ADMIN');
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id },
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = approveTourSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { approve, notes } = validation.data;

    const updated = await prisma.tour.update({
      where: { id },
      data: {
        approvalStatus: approve ? 'APPROVED' : 'REJECTED',
        isActive: approve,
      },
    });

    return NextResponse.json({
      message: approve ? 'Tour approved successfully' : 'Tour rejected',
      tour: updated,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while approving tour' },
      { status: 500 }
    );
  }
}
