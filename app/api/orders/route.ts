import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const createOrderSchema = z.object({
  items: z.array(z.object({
    inventoryId: z.string(),
    quantity: z.number().positive(),
    pricePerUnit: z.number().positive(),
    itemName: z.string(),
    unitType: z.enum(['KG', 'PIECE', 'LITER', 'GRAM', 'PORTION']),
    unitPrice: z.number().positive(),
  })).min(1, 'At least one item is required'),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),
  deliveryAddress: z.object({
    recipientName: z.string(),
    recipientPhone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    postalCode: z.string(),
    countryCode: z.string().default('FR'),
  }).optional(),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'CASH', 'TRANSFER']),
  customerName: z.string(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const businessId = searchParams.get('businessId');

    // Determine if user is viewing their own orders or business orders
    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
      select: { id: true },
    });

    const where: any = {};

    if (businessId) {
      // Business viewing their orders
      if (!business || business.id !== businessId) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }
      where.businessId = businessId;
    } else {
      // Customer viewing their orders
      where.customerId = user.userId;
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            displayName: true,
            city: true,
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            inventory: {
              select: {
                cheeseName: true,
                imageUrl: true,
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate all items belong to same business and have stock
    const inventoryIds = data.items.map(i => i.inventoryId);
    const inventoryItems = await prisma.shopInventory.findMany({
      where: { id: { in: inventoryIds } },
      include: { business: true },
    });

    if (inventoryItems.length !== data.items.length) {
      return NextResponse.json(
        { error: 'Some items not found' },
        { status: 404 }
      );
    }

    const businessIds = [...new Set(inventoryItems.map(i => i.businessId))];
    if (businessIds.length > 1) {
      return NextResponse.json(
        { error: 'All items must be from the same business' },
        { status: 400 }
      );
    }

    const businessId = businessIds[0];

    // Check stock availability
    for (const item of data.items) {
      const inventory = inventoryItems.find(i => i.id === item.inventoryId);
      if (!inventory || inventory.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${inventory?.cheeseName || 'item'}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
      return sum + (item.quantity * item.pricePerUnit);
    }, 0);

    // Get delivery fee if delivery
    let deliveryFee = 0;
    if (data.deliveryMethod === 'DELIVERY') {
      const deliverySettings = await prisma.deliverySettings.findUnique({
        where: { businessId },
      });
      deliveryFee = deliverySettings?.packagingFee || 0;
    }

    const total = subtotal + deliveryFee;

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          businessId,
          customerId: user.userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          status: 'PENDING',
          deliveryMethod: data.deliveryMethod,
          deliveryNotes: data.deliveryNotes,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          subtotal,
          deliveryFee,
          total,
          totalAmount: total,
          items: {
            create: data.items.map(item => ({
              inventoryId: item.inventoryId,
              itemName: item.itemName,
              quantity: item.quantity,
              unitType: item.unitType,
              pricePerUnit: item.pricePerUnit,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.pricePerUnit,
              lineTotal: item.quantity * item.unitPrice,
              inventory: {
                connect: { id: item.inventoryId }
              },
            })),
          },
          deliveryAddress: data.deliveryAddress ? {
            create: data.deliveryAddress
          } : undefined,
        },
        include: {
          items: {
            include: {
              inventory: true,
            },
          },
          business: true,
        },
      });

      // Reserve stock
      for (const item of data.items) {
        await tx.shopInventory.update({
          where: { id: item.inventoryId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      message: 'Order created successfully',
      order,
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating order' },
      { status: 500 }
    );
  }
}
