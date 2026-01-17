import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { processImage, uploadToS3, generateFileKey } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Only JPEG, PNG, and WebP are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process images
    const sizes = await processImage(buffer);

    // Upload all sizes
    const baseKey = generateFileKey(folder, file.name);
    
    const [thumbnailUrl, mediumUrl, largeUrl] = await Promise.all([
      uploadToS3(sizes.thumbnail, generateFileKey(folder, file.name, 'thumbnail'), 'image/jpeg'),
      uploadToS3(sizes.medium, generateFileKey(folder, file.name, 'medium'), 'image/jpeg'),
      uploadToS3(sizes.large, generateFileKey(folder, file.name, 'large'), 'image/jpeg'),
    ]);

    return NextResponse.json({
      message: 'File uploaded successfully',
      urls: {
        thumbnail: thumbnailUrl,
        medium: mediumUrl,
        large: largeUrl,
        original: largeUrl, // Use large as original
      },
      filename: file.name,
      size: file.size,
      type: file.type,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while uploading file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
