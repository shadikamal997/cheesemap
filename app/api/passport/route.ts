import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Get or create passport
    let passport = await prisma.passport.findUnique({
      where: { userId: user.userId },
      include: {
        stamps: {
          include: {
            business: {
              select: {
                displayName: true,
                city: true,
                region: true,
              },
            },
          },
          orderBy: { acquiredAt: 'desc' },
          take: 20,
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });

    // Create passport if it doesn't exist
    if (!passport) {
      passport = await prisma.passport.create({
        data: {
          userId: user.userId,
        },
        include: {
          stamps: {
            include: {
              business: {
                select: {
                  displayName: true,
                  city: true,
                  region: true,
                },
              },
            },
            orderBy: { acquiredAt: 'desc' },
            take: 20,
          },
          achievements: {
            include: {
              achievement: true,
            },
            orderBy: { unlockedAt: 'desc' },
          },
        },
      });
    }

    return NextResponse.json({ passport });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching passport' },
      { status: 500 }
    );
  }
}
