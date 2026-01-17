import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { deleteFromS3 } from '@/lib/storage';

const addImageSchema = z.object({
  url: z.string().url(),
  displayOrder: z.number().min(0).optional(),
  caption: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    // Verify business ownership
    const business = await prisma.business.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = addImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrder = await prisma.businessImage.findFirst({
      where: { businessId: id },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const image = await prisma.businessImage.create({
      data: {
        businessId: id,
        url: validation.data.url,
        displayOrder: validation.data.displayOrder ?? (maxOrder?.displayOrder ?? -1) + 1,
        caption: validation.data.caption,
      },
    });

    return NextResponse.json({
      message: 'Image added successfully',
      image,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while adding image' },
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

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID required' },
        { status: 400 }
      );
    }

    // Get image and verify ownership
    const image = await prisma.businessImage.findUnique({
      where: { id: imageId },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (image.business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Delete from S3 (extract key from URL)
    try {
      const url = new URL(image.url);
      const key = url.pathname.substring(1); // Remove leading /
      await deleteFromS3(key);
    } catch (err) {
      // S3 deletion failed, continue with DB deletion
    }

    // Delete from database
    await prisma.businessImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({
      message: 'Image deleted successfully',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while deleting image' },
      { status: 500 }
    );
  }
}
