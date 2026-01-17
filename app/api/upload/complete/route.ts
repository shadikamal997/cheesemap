import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

const completeUploadSchema = z.object({
  intentId: z.string().min(1, 'Intent ID is required'),
  entityType: z.enum(['business', 'product', 'tour', 'profile']),
  entityId: z.string().min(1, 'Entity ID is required'),
  displayOrder: z.number().min(0).optional(),
  caption: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const validation = completeUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { intentId, entityType, entityId, displayOrder, caption } = validation.data;

    // Find the upload intent
    const uploadIntent = await prisma.fileUpload.findUnique({
      where: { id: intentId },
    });

    if (!uploadIntent) {
      return NextResponse.json(
        { error: 'Upload intent not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (uploadIntent.uploadedById !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to complete this upload' },
        { status: 403 }
      );
    }

    // Check if intent has expired
    if (uploadIntent.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Upload intent has expired' },
        { status: 400 }
      );
    }

    // Check if already completed
    if (uploadIntent.isCompleted) {
      return NextResponse.json(
        { error: 'Upload already completed' },
        { status: 400 }
      );
    }

    // Verify the entity exists and user owns it
    let entityExists = false;
    switch (entityType) {
      case 'business':
        const business = await prisma.business.findUnique({
          where: { id: entityId },
          select: { ownerId: true },
        });
        entityExists = business?.ownerId === user.userId;
        break;

      case 'product':
        const product = await prisma.shopInventory.findUnique({
          where: { id: entityId },
          select: { business: { select: { ownerId: true } } },
        });
        entityExists = product?.business.ownerId === user.userId;
        break;

      case 'tour':
        const tour = await prisma.tour.findUnique({
          where: { id: entityId },
          select: { business: { select: { ownerId: true } } },
        });
        entityExists = tour?.business.ownerId === user.userId;
        break;

      case 'profile':
        entityExists = entityId === user.userId;
        break;
    }

    if (!entityExists && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Entity not found or not authorized' },
        { status: 404 }
      );
    }

    // Create the appropriate record based on entity type
    let result;
    switch (entityType) {
      case 'business':
        // Get current max order
        const maxOrder = await prisma.businessImage.findFirst({
          where: { businessId: entityId },
          orderBy: { displayOrder: 'desc' },
          select: { displayOrder: true },
        });

        result = await prisma.businessImage.create({
          data: {
            businessId: entityId,
            url: uploadIntent.fileKey, // Store key, not URL
            displayOrder: displayOrder ?? (maxOrder?.displayOrder ?? -1) + 1,
            caption,
          },
        });
        break;

      case 'product':
        // Update product image URL
        result = await prisma.shopInventory.update({
          where: { id: entityId },
          data: { imageUrl: uploadIntent.fileKey },
        });
        break;

      case 'tour':
        result = await prisma.tour.update({
          where: { id: entityId },
          data: { imageUrl: uploadIntent.fileKey },
        });
        break;

      case 'profile':
        result = await prisma.user.update({
          where: { id: entityId },
          data: { avatarUrl: uploadIntent.fileKey },
        });
        break;
    }

    // Mark upload as completed
    await prisma.fileUpload.update({
      where: { id: intentId },
      data: {
        isCompleted: true,
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Upload completed successfully',
      result,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while completing upload' },
      { status: 500 }
    );
  }
}