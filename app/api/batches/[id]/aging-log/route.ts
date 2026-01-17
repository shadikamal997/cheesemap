import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const agingLogSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  weightKg: z.number().positive().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const batch = await prisma.farmBatch.findUnique({
      where: { id },
      include: {
        business: { select: { ownerId: true } },
        agingLogs: {
          orderBy: { loggedAt: 'desc' },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    if (batch.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ logs: batch.agingLogs });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching aging logs' },
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

    const batch = await prisma.farmBatch.findUnique({
      where: { id },
      include: { business: { select: { ownerId: true } } },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    if (batch.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = agingLogSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const log = await prisma.agingLog.create({
      data: {
        ...validation.data,
        batchId: id,
        loggedBy: user.userId,
      },
    });

    // Update batch with latest data
    if (validation.data.weightKg) {
      await prisma.farmBatch.update({
        where: { id },
        data: { currentQuantityKg: validation.data.weightKg },
      });
    }

    return NextResponse.json({
      message: 'Aging log created successfully',
      log,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating aging log' },
      { status: 500 }
    );
  }
}
