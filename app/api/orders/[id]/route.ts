import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'READY', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
  note: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        business: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            email: true,
            addressLine1: true,
            city: true,
            postalCode: true,
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            inventory: {
              select: {
                cheeseName: true,
                cheeseType: true,
                imageUrl: true,
                unitType: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify access
    const business = await prisma.business.findUnique({
      where: { id: order.businessId },
      select: { ownerId: true },
    });

    if (
      order.customerId !== user.userId &&
      business?.ownerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching order' },
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { businessId: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify business owner
    const business = await prisma.business.findUnique({
      where: { id: order.businessId },
      select: { ownerId: true },
    });

    if (business?.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PAID', 'CANCELLED'],
      PAID: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'SHIPPED'],
      READY: ['DELIVERED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
    };

    if (
      order.status !== validation.data.status &&
      !validTransitions[order.status]?.includes(validation.data.status)
    ) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${validation.data.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: validation.data.status,
        ...(validation.data.status === 'COMPLETED' && {
          completedAt: new Date(),
        }),
        ...(validation.data.status === 'CANCELLED' && {
          cancelledAt: new Date(),
        }),
      },
      include: {
        items: {
          include: {
            inventory: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updated,
    });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating order' },
      { status: 500 }
    );
  }
}
