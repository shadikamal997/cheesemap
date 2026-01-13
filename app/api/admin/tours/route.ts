import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

const approveTourSchema = z.object({
  approve: z.boolean(),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireRole(request, 'ADMIN');
    if (adminCheck instanceof NextResponse) return adminCheck;

    const tours = await prisma.tour.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      include: {
        business: {
          select: {
            id: true,
            displayName: true,
            city: true,
            region: true,
            verificationStatus: true,
          },
        },
        _count: {
          select: {
            schedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tours });

  } catch (error) {
    console.error('Get pending tours error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tours' },
      { status: 500 }
    );
  }
}
