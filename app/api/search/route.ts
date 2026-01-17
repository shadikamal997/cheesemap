import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type'); // 'business' | 'cheese'
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `search:${type}:${q}:${limit}`;
    const cached = await cacheGet<any[]>(cacheKey);
    
    if (cached) {
      return NextResponse.json({ results: cached, cached: true });
    }

    let results: any[] = [];

    if (!type || type === 'business') {
      const businesses = await prisma.business.findMany({
        where: {
          AND: [
            { verificationStatus: 'VERIFIED' },
            { isVisible: true },
            {
              OR: [
                { displayName: { contains: q, mode: 'insensitive' } },
                { legalName: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
                { region: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          displayName: true,
          type: true,
          city: true,
          region: true,
          latitude: true,
          longitude: true,
        },
        take: limit,
      });

      results.push(...businesses.map(b => ({ ...b, _type: 'business' })));
    }

    if (!type || type === 'cheese') {
      const inventory = await prisma.shopInventory.findMany({
        where: {
          AND: [
            { isAvailable: true },
            {
              OR: [
                { cheeseName: { contains: q, mode: 'insensitive' } },
                { cheeseType: { contains: q, mode: 'insensitive' } },
                { producerName: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          cheeseName: true,
          cheeseType: true,
          isAop: true,
          businessId: true,
          business: {
            select: {
              displayName: true,
              city: true,
            },
          },
        },
        take: limit,
      });

      results.push(...inventory.map(i => ({ ...i, _type: 'cheese' })));
    }

    // Cache for 5 minutes
    await cacheSet(cacheKey, results, 300);

    return NextResponse.json({ results, cached: false });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}
