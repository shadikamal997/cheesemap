import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const updateInventorySchema = z.object({
  pricePerUnit: z.number().positive().optional(),
  stockQuantity: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isDeliveryAvailable: z.boolean().optional(),
  description: z.string().optional(),
  tastingNotes: z.string().optional(),
  pairingSuggestions: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Verify ownership
    const item = await prisma.shopInventory.findUnique({
      where: { id: params.id },
      include: { business: { select: { ownerId: true } } },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (item.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateInventorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updated = await prisma.shopInventory.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json({
      message: 'Inventory updated successfully',
      item: updated,
    });

  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating inventory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const item = await prisma.shopInventory.findUnique({
      where: { id: params.id },
      include: { business: { select: { ownerId: true } } },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (item.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await prisma.shopInventory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Inventory item deleted successfully',
    });

  } catch (error) {
    console.error('Delete inventory error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting inventory' },
      { status: 500 }
    );
  }
}
