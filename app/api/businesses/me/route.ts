import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * GET /api/businesses/me
 * Get the current user's business profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Find business owned by current user
    const business = await prisma.business.findFirst({
      where: { ownerId: user.userId },
      include: {
        _count: {
          select: {
            inventory: true,
            tours: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ business });
  } catch (error: any) {
    console.error('Error fetching user business:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}
