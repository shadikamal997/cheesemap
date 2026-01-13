import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const scheduleSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxParticipants: z.number().min(1).optional(),
  priceOverride: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = { tourId: params.id };
    if (from) {
      where.date = { gte: new Date(from) };
    }
    if (to) {
      where.date = { ...where.date, lte: new Date(to) };
    }

    const schedules = await prisma.tourSchedule.findMany({
      where,
      include: {
        bookings: {
          select: {
            id: true,
            participants: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ schedules });

  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching schedules' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
      include: { business: { select: { ownerId: true } } },
    });

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    if (tour.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check if schedule already exists for this date/time
    const existing = await prisma.tourSchedule.findFirst({
      where: {
        tourId: params.id,
        date: validation.data.date,
        startTime: validation.data.startTime,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Schedule already exists for this date and time' },
        { status: 409 }
      );
    }

    const schedule = await prisma.tourSchedule.create({
      data: {
        tourId: params.id,
        date: validation.data.date,
        startTime: validation.data.startTime,
        maxCapacity: validation.data.maxParticipants || tour.maxCapacity,
        maxParticipants: validation.data.maxParticipants || tour.maxCapacity,
        priceOverride: validation.data.priceOverride,
        notes: validation.data.notes,
      },
    });

    return NextResponse.json({
      message: 'Schedule created successfully',
      schedule,
    }, { status: 201 });

  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating schedule' },
      { status: 500 }
    );
  }
}
