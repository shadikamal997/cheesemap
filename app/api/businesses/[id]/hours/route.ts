import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const hoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isClosed: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hours = await prisma.businessHours.findMany({
      where: { businessId: id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ hours });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching hours' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = z.array(hoursSchema).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Delete existing hours
    await prisma.businessHours.deleteMany({
      where: { businessId: id },
    });

    // Create new hours
    const hours = await prisma.businessHours.createMany({
      data: validation.data.map(h => ({
        ...h,
        businessId: id,
      })),
    });

    const newHours = await prisma.businessHours.findMany({
      where: { businessId: id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({
      message: 'Hours updated successfully',
      hours: newHours,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while updating hours' },
      { status: 500 }
    );
  }
}
