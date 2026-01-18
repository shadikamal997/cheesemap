import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const batchSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  cheeseName: z.string().min(2, 'Cheese name is required'),
  cheeseType: z.string().optional(),
  milkType: z.enum(['COW', 'GOAT', 'SHEEP', 'BUFFALO', 'MIXED']),
  productionDate: z.string().transform(str => new Date(str)),
  initialQuantityKg: z.number().positive(),
  currentQuantityKg: z.number().min(0),
  pricePerKg: z.number().positive(),
  quantityProduced: z.number().positive(),
  quantityRemaining: z.number().min(0),
  unitType: z.enum(['KG', 'PIECE', 'LITER', 'GRAM', 'PORTION']),
  minimumAgeDays: z.number().min(0).default(0),
  targetAgeDays: z.number().min(0).optional(),
  status: z.enum(['DRAFT', 'PRODUCTION', 'AGING', 'READY', 'FINISHED', 'CONVERTED', 'DEPLETED', 'FAILED', 'DISCARDED', 'SOLD']).default('DRAFT'),
  location: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
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

    if (business.type !== 'FARM' && business.type !== 'BOTH') {
      return NextResponse.json(
        { error: 'Only farms can access batch inventory' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const batches = await prisma.farmBatch.findMany({
      where: {
        businessId: business.id,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        agingLogs: {
          orderBy: { loggedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { productionDate: 'desc' },
    });

    return NextResponse.json({ batches });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching batches' },
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

    if (business.type !== 'FARM' && business.type !== 'BOTH') {
      return NextResponse.json(
        { error: 'Only farms can create batches' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = batchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const batch = await prisma.farmBatch.create({
      data: {
        ...validation.data,
        businessId: business.id,
      },
    });

    return NextResponse.json({
      message: 'Batch created successfully',
      batch,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating batch' },
      { status: 500 }
    );
  }
}
