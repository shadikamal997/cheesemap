import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
  cancellationReason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const booking = await prisma.tourBooking.findUnique({
      where: { id: params.id },
      include: {
        schedule: {
          include: {
            tour: {
              include: {
                business: {
                  select: { ownerId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify access
    const isOwner = booking.customerId === user.userId;
    const isBusinessOwner = booking.schedule.tour.business.ownerId === user.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isBusinessOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Customers can only cancel their own bookings
    if (isOwner && !isBusinessOwner && !isAdmin && validation.data.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Customers can only cancel bookings' },
        { status: 403 }
      );
    }

    const updated = await prisma.tourBooking.update({
      where: { id: params.id },
      data: {
        status: validation.data.status,
        ...(validation.data.status === 'CANCELLED' && {
          cancellationReason: validation.data.cancellationReason,
        }),
      },
      include: {
        schedule: {
          include: {
            tour: {
              include: {
                business: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updated,
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating booking' },
      { status: 500 }
    );
  }
}
