import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || new Date().toISOString();
    const to = searchParams.get('to');

    const where: any = {
      tourId: id,
      date: { gte: new Date(from) },
    };

    if (to) {
      where.date.lte = new Date(to);
    }

    const schedules = await prisma.tourSchedule.findMany({
      where,
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
          select: {
            participants: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const availability = schedules.map(schedule => {
      const bookedParticipants = schedule.bookings.reduce(
        (sum, booking) => sum + booking.participants,
        0
      );
      const available = schedule.maxParticipants - bookedParticipants;

      return {
        id: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        maxParticipants: schedule.maxParticipants,
        bookedParticipants,
        availableSpots: available,
        isAvailable: available > 0,
        price: schedule.priceOverride,
      };
    });

    return NextResponse.json({ availability });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching availability' },
      { status: 500 }
    );
  }
}
