import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Check cache
    const cacheKey = `autocomplete:${q}:${limit}`;
    const cached = await cacheGet<any[]>(cacheKey);
    
    if (cached) {
      return NextResponse.json({ suggestions: cached });
    }

    const [businesses, cheeses] = await Promise.all([
      prisma.business.findMany({
        where: {
          AND: [
            { verificationStatus: 'VERIFIED' },
            { isVisible: true },
            { displayName: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          displayName: true,
          city: true,
        },
        take: limit,
      }),

      prisma.shopInventory.findMany({
        where: {
          AND: [
            { isAvailable: true },
            { cheeseName: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          cheeseName: true,
          isAop: true,
        },
        distinct: ['cheeseName'],
        take: limit,
      }),
    ]);

    const suggestions = [
      ...businesses.map(b => ({
        type: 'business',
        id: b.id,
        text: b.displayName,
        subtitle: b.city,
      })),
      ...cheeses.map(c => ({
        type: 'cheese',
        text: c.cheeseName,
        subtitle: c.isAop ? 'AOP' : null,
      })),
    ];

    // Cache for 10 minutes
    await cacheSet(cacheKey, suggestions, 600);

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
