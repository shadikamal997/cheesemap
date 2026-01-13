import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const inventorySchema = z.object({
  cheeseName: z.string().min(2, 'Cheese name is required'),
  cheeseType: z.string().optional(),
  regionOfOrigin: z.string().optional(),
  producerName: z.string().optional(),
  isAop: z.boolean().default(false),
  isBio: z.boolean().default(false),
  milkType: z.enum(['COW', 'GOAT', 'SHEEP', 'BUFFALO', 'MIXED']).optional(),
  sku: z.string().min(1, 'SKU is required'),
  pricePerUnit: z.number().positive('Price must be positive'),
  unitType: z.enum(['KG', 'PIECE', 'GRAM_100']),
  stockQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  isDeliveryAvailable: z.boolean().default(false),
  description: z.string().optional(),
  tastingNotes: z.string().optional(),
  pairingSuggestions: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Get user's business
    const business = await prisma.business.findUnique({
      where: { ownerId: user.userId },
      select: { id: true, type: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for this user' },
        { status: 404 }
      );
    }

    if (business.type === 'FARM') {
      return NextResponse.json(
        { error: 'Farms should use /api/batches for inventory' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available') === 'true';

    const inventory = await prisma.shopInventory.findMany({
      where: {
        businessId: business.id,
        ...(available ? { isAvailable: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ inventory });

  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching inventory' },
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
      select: { id: true, type: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for this user' },
        { status: 404 }
      );
    }

    if (business.type === 'FARM') {
      return NextResponse.json(
        { error: 'Farms should use /api/batches for inventory' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = inventorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const skuExists = await prisma.shopInventory.findUnique({
      where: { sku: validation.data.sku },
    });

    if (skuExists) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }

    const item = await prisma.shopInventory.create({
      data: {
        ...validation.data,
        businessId: business.id,
      },
    });

    return NextResponse.json({
      message: 'Inventory item created successfully',
      item,
    }, { status: 201 });

  } catch (error) {
    console.error('Create inventory error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating inventory item' },
      { status: 500 }
    );
  }
}
