import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

// Fields allowed for DRAFT batches (full edit)
const draftUpdateSchema = z.object({
  batchNumber: z.string().min(1).optional(),
  cheeseName: z.string().min(2).optional(),
  cheeseType: z.string().optional(),
  milkType: z.enum(['COW', 'GOAT', 'SHEEP', 'BUFFALO', 'MIXED']).optional(),
  productionDate: z.string().transform(str => new Date(str)).optional(),
  initialQuantityKg: z.number().positive().optional(),
  currentQuantityKg: z.number().min(0).optional(),
  pricePerKg: z.number().positive().optional(),
  quantityProduced: z.number().positive().optional(),
  quantityRemaining: z.number().min(0).optional(),
  unitType: z.enum(['KG', 'PIECE', 'LITER', 'GRAM', 'PORTION']).optional(),
  minimumAgeDays: z.number().min(0).optional(),
  targetAgeDays: z.number().min(0).optional(),
  location: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'PRODUCTION', 'AGING', 'READY', 'FINISHED', 'CONVERTED', 'DEPLETED', 'FAILED', 'DISCARDED', 'SOLD']).optional(),
});

// Fields allowed for AGING batches (limited edit)
const agingUpdateSchema = z.object({
  cheeseName: z.string().min(2).optional(), // Display name only
  notes: z.string().optional(),
  targetAgeDays: z.number().min(0).optional(), // Expected aging duration
  location: z.string().optional(),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
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
        business: {
          select: { id: true, ownerId: true, displayName: true },
        },
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

    // Verify ownership
    if (batch.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to view this batch' },
        { status: 403 }
      );
    }

    return NextResponse.json({ batch });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching batch' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    // Fetch batch with ownership check
    const batch = await prisma.farmBatch.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
        agingLogs: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (batch.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to update this batch' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // STATE-BASED VALIDATION
    if (batch.status === 'FINISHED' || batch.status === 'SOLD' || batch.status === 'CONVERTED') {
      return NextResponse.json(
        { 
          error: 'Batch is finished and cannot be edited',
          detail: 'This batch has been archived and is now read-only. View the aging history for details.'
        },
        { status: 403 }
      );
    }

    let validation;
    let allowedFields: string[] = [];

    if (batch.status === 'DRAFT') {
      // DRAFT: Full edit allowed
      validation = draftUpdateSchema.safeParse(body);
      allowedFields = Object.keys(draftUpdateSchema.shape);
    } else if (batch.status === 'AGING' || batch.status === 'PRODUCTION' || batch.status === 'READY') {
      // AGING: Limited edit only
      validation = agingUpdateSchema.safeParse(body);
      allowedFields = Object.keys(agingUpdateSchema.shape);

      // Check if trying to edit forbidden fields
      const forbiddenFields = [
        'cheeseType', 'milkType', 'productionDate', 
        'initialQuantityKg', 'currentQuantityKg',
        'quantityProduced', 'quantityRemaining', 'pricePerKg', 'unitType'
      ];
      const attemptedForbiddenFields = forbiddenFields.filter(field => body.hasOwnProperty(field));

      if (attemptedForbiddenFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Batch is already aging and core fields cannot be edited',
            detail: `These fields are locked: ${attemptedForbiddenFields.join(', ')}. Use aging logs to record quantity/quality changes.`,
            forbiddenFields: attemptedForbiddenFields,
            allowedFields
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid batch status for editing' },
        { status: 400 }
      );
    }

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors,
          allowedFields
        },
        { status: 400 }
      );
    }

    // Update batch
    const updated = await prisma.farmBatch.update({
      where: { id },
      data: validation.data,
      include: {
        business: {
          select: {
            displayName: true,
          },
        },
        agingLogs: {
          orderBy: { loggedAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      message: 'Batch updated successfully',
      batch: updated,
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating batch' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    // Fetch batch with ownership check
    const batch = await prisma.farmBatch.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
        agingLogs: {
          select: { id: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (batch.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to delete this batch' },
        { status: 403 }
      );
    }

    // STATE-BASED DELETION RULES
    if (batch.status !== 'DRAFT') {
      return NextResponse.json(
        { 
          error: 'Cannot delete batch after production has started',
          detail: 'Only DRAFT batches can be deleted. This batch has aging history and must be preserved for traceability.',
          currentStatus: batch.status
        },
        { status: 403 }
      );
    }

    // Prevent deletion if aging logs exist (extra safety)
    if (batch.agingLogs.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete batch with aging logs',
          detail: 'This batch has historical data that must be preserved.',
          agingLogCount: batch.agingLogs.length
        },
        { status: 403 }
      );
    }

    // Delete the batch
    await prisma.farmBatch.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting batch' },
      { status: 500 }
    );
  }
}
