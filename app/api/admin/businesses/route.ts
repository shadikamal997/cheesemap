import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireRole(request, 'ADMIN');
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const businesses = await prisma.business.findMany({
      where: {
        verificationStatus: status as any,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            inventory: true,
            batches: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ businesses });

  } catch (error) {
    console.error('Get pending businesses error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching businesses' },
      { status: 500 }
    );
  }
}
