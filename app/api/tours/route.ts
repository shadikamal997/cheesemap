import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const createTourSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tourType: z.enum(['GUIDED_TOUR', 'TASTING', 'WORKSHOP', 'VISIT', 'COMBINATION']),
  durationMinutes: z.number().min(30),
  maxCapacity: z.number().min(1).max(100),
  maxParticipants: z.number().min(1).max(100),
  pricePerPerson: z.number().min(0),
  ageRestriction: z.number().min(0).default(0),
  languages: z.array(z.string()).default(['fr']),
  includedInPrice: z.array(z.string()).optional(),
  requiresBooking: z.boolean().default(true),
  cancellationPolicy: z.string().optional(),
  meetingPoint: z.string().optional(),
  difficultyLevel: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const approved = searchParams.get('approved') === 'true';

    const where: any = {};
    if (businessId) {
      where.businessId = businessId;
    }
    if (approved) {
      where.approvalStatus = 'APPROVED';
      where.isActive = true;
    }

    const tours = await prisma.tour.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            displayName: true,
            city: true,
            region: true,
          },
        },
        schedules: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: { date: 'asc' },
          take: 5,
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tours });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching tours' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
      select: { id: true, type: true, verificationStatus: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for this user' },
        { status: 404 }
      );
    }

    if (business.type !== 'FARM' && business.type !== 'BOTH') {
      return NextResponse.json(
        { error: 'Only farms can create tours' },
        { status: 400 }
      );
    }

    if (business.verificationStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Business must be verified to create tours' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = createTourSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const tour = await prisma.tour.create({
      data: {
        ...validation.data,
        businessId: business.id,
        maxCapacity: validation.data.maxCapacity || 20,
        approvalStatus: 'PENDING',
        isActive: false,
      },
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
      message: 'Tour created successfully. Pending admin approval.',
      tour,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating tour' },
      { status: 500 }
    );
  }
}
