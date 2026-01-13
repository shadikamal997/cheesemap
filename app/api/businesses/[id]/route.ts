import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const updateBusinessSchema = z.object({
  displayName: z.string().min(2).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  addressLine1: z.string().min(5).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2).optional(),
  postalCode: z.string().regex(/^\d{5}$/).optional(),
  region: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        hours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        specialties: {
          orderBy: { displayOrder: 'asc' },
        },
        deliverySettings: true,
        _count: {
          select: {
            reviews: true,
            orders: true,
            tours: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ business });

  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching business' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    if (business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to update this business' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateBusinessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updated = await prisma.business.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Business updated successfully',
      business: updated,
    });

  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating business' },
      { status: 500 }
    );
  }
}
