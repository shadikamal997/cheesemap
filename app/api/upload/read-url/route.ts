import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/middleware';
import { getSignedReadUrl } from '@/lib/storage';
import { prisma } from '@/lib/db';

const readUrlSchema = z.object({
  fileKey: z.string().min(1, 'File key is required'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const validation = readUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fileKey } = validation.data;

    // Verify user has access to this file
    // Check if they own the entity associated with the file
    const uploadRecord = await prisma.fileUpload.findUnique({
      where: { fileKey },
      select: {
        uploadedById: true,
        folder: true,
        entityId: true,
        isCompleted: true,
      },
    });

    if (!uploadRecord || !uploadRecord.isCompleted) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check ownership based on folder type
    let hasAccess = uploadRecord.uploadedById === user.userId;

    if (!hasAccess && uploadRecord.entityId) {
      switch (uploadRecord.folder) {
        case 'business':
          const business = await prisma.business.findUnique({
            where: { id: uploadRecord.entityId },
            select: { ownerId: true },
          });
          hasAccess = business?.ownerId === user.userId;
          break;

        case 'product':
          const product = await prisma.shopInventory.findUnique({
            where: { id: uploadRecord.entityId },
            select: { business: { select: { ownerId: true } } },
          });
          hasAccess = product?.business.ownerId === user.userId;
          break;

        case 'tour':
          const tour = await prisma.tour.findUnique({
            where: { id: uploadRecord.entityId },
            select: { business: { select: { ownerId: true } } },
          });
          hasAccess = tour?.business.ownerId === user.userId;
          break;
      }
    }

    if (!hasAccess && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to access this file' },
        { status: 403 }
      );
    }

    // Generate signed read URL (1 hour expiry)
    const readUrl = await getSignedReadUrl(fileKey, 3600);

    return NextResponse.json({ readUrl });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while generating read URL' },
      { status: 500 }
    );
  }
}