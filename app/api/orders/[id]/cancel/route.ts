import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const cancelSchema = z.object({
  reason: z.string().min(10, 'Cancellation reason must be at least 10 characters'),
  refundRequested: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        business: { select: { ownerId: true } },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only customer or business owner can cancel
    if (
      order.customerId !== user.userId &&
      order.business.ownerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = cancelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Cancel order and restore stock
    const cancelled = await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        await tx.shopInventory.update({
          where: { id: item.inventoryId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order
      return await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: user.userId,
          cancellationReason: validation.data.reason,
          refundStatus: validation.data.refundRequested ? 'PENDING' : null,
        },
        include: {
          items: {
            include: {
              inventory: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: cancelled,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while cancelling order' },
      { status: 500 }
    );
  }
}
