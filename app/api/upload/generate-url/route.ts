import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { getSignedUploadUrl, generateFileKey, validateFile } from '@/lib/storage';
import { prisma } from '@/lib/db';

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  contentType: z.string().min(1, 'Content type is required'),
  folder: z.enum(['business', 'product', 'tour', 'profile']).default('business'),
  entityId: z.string().optional(), // businessId, productId, tourId, etc.
});

const MAX_FILE_SIZE_MB = parseInt(process.env.FILE_UPLOAD_MAX_MB || '5');

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const validation = uploadRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fileName, fileSize, contentType, folder, entityId } = validation.data;

    // Validate file type and size
    const mockFile = { size: fileSize, type: contentType } as File;
    const fileValidation = validateFile(mockFile, MAX_FILE_SIZE_MB);

    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Validate ownership if entityId is provided
    if (entityId && folder !== 'profile') {
      let isOwner = false;

      switch (folder) {
        case 'business':
          const business = await prisma.business.findUnique({
            where: { id: entityId },
            select: { ownerId: true },
          });
          isOwner = business?.ownerId === user.userId;
          break;

        case 'product':
          // For products, check if user owns the business that owns the product
          const product = await prisma.shopInventory.findUnique({
            where: { id: entityId },
            select: { business: { select: { ownerId: true } } },
          });
          isOwner = product?.business.ownerId === user.userId;
          break;

        case 'tour':
          const tour = await prisma.tour.findUnique({
            where: { id: entityId },
            select: { business: { select: { ownerId: true } } },
          });
          isOwner = tour?.business.ownerId === user.userId;
          break;
      }

      if (!isOwner && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to upload to this entity' },
          { status: 403 }
        );
      }
    }

    // Generate unique file key
    const fileKey = generateFileKey(folder, fileName);

    // Generate signed upload URL (1 hour expiry)
    const uploadUrl = await getSignedUploadUrl(fileKey, contentType, 3600);

    // Store upload intent in database for tracking
    const uploadIntent = await prisma.fileUpload.create({
      data: {
        fileKey,
        originalName: fileName,
        contentType,
        fileSize,
        folder,
        entityId,
        uploadedById: user.userId,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });

    return NextResponse.json({
      uploadUrl,
      fileKey,
      intentId: uploadIntent.id,
      expiresAt: uploadIntent.expiresAt,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while generating upload URL' },
      { status: 500 }
    );
  }
}