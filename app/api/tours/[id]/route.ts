import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const updateTourSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  durationMinutes: z.number().min(30).optional(),
  maxCapacity: z.number().min(1).max(100).optional(),
  maxParticipants: z.number().min(1).max(100).optional(),
  pricePerPerson: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  includedInPrice: z.array(z.string()).optional(),
  meetingPoint: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    // Verify ownership
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    if (tour.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to update this tour' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateTourSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updated = await prisma.tour.update({
      where: { id },
      data: validation.data,
      include: {
        business: {
          select: {
            displayName: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Tour updated successfully',
      tour: updated,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while updating tour' },
      { status: 500 }
    );
  }
}
