import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const createBookingSchema = z.object({
  scheduleId: z.string(),
  participants: z.number().min(1).max(100),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  specialRequests: z.string().optional(),
});

function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRB-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    const where: any = {};

    if (businessId) {
      // Business viewing their bookings
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { ownerId: true },
      });

      if (!business || (business.ownerId !== user.userId && user.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      where.schedule = { tour: { businessId } };
    } else {
      // Customer viewing their bookings
      where.customerId = user.userId;
    }

    const bookings = await prisma.tourBooking.findMany({
      where,
      include: {
        schedule: {
          include: {
            tour: {
              include: {
                business: {
                  select: {
                    displayName: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check schedule availability
    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: data.scheduleId },
      include: {
        tour: {
          select: {
            pricePerPerson: true,
            approvalStatus: true,
            isActive: true,
          },
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
          select: {
            participants: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    if (schedule.tour.approvalStatus !== 'APPROVED' || !schedule.tour.isActive) {
      return NextResponse.json(
        { error: 'Tour is not available for booking' },
        { status: 400 }
      );
    }

    const bookedParticipants = schedule.bookings.reduce(
      (sum, b) => sum + b.participants,
      0
    );

    if (bookedParticipants + data.participants > schedule.maxParticipants) {
      return NextResponse.json(
        { error: 'Not enough available spots' },
        { status: 400 }
      );
    }

    // Calculate price
    const pricePerPerson = schedule.priceOverride || schedule.tour.pricePerPerson;
    const totalPrice = pricePerPerson * data.participants;

    const booking = await prisma.tourBooking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        scheduleId: data.scheduleId,
        tourId: schedule.tourId,
        tourScheduleId: data.scheduleId, // For backward compatibility
        customerId: user.userId,
        participants: data.participants,
        pricePerPerson,
        totalPrice,
        status: 'PENDING',
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        specialRequests: data.specialRequests,
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
      message: 'Booking created successfully',
      booking,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating booking' },
      { status: 500 }
    );
  }
}
