import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { optionalAuth } from '@/lib/auth/middleware';

interface BusinessFilters {
  latitude?: number;
  longitude?: number;
  radius?: number; // kilometers
  type?: string;
  region?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await optionalAuth(request);
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: BusinessFilters = {
      latitude: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      longitude: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 50, // Default 50km
      type: searchParams.get('type') || undefined,
      region: searchParams.get('region') || undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Validate geospatial params
    if (filters.latitude !== undefined && filters.longitude !== undefined) {
      if (filters.latitude < -90 || filters.latitude > 90) {
        return NextResponse.json(
          { error: 'Latitude must be between -90 and 90' },
          { status: 400 }
        );
      }
      if (filters.longitude < -180 || filters.longitude > 180) {
        return NextResponse.json(
          { error: 'Longitude must be between -180 and 180' },
          { status: 400 }
        );
      }
    }

    // Build where clause
    const where: any = {
      isVisible: true,
      verificationStatus: 'VERIFIED',
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.region) {
      where.region = filters.region;
    }

    // Execute query with geospatial filtering
    let businesses;
    
    if (filters.latitude && filters.longitude) {
      // PostGIS radius search
      // Convert km to meters for ST_DWithin
      const radiusMeters = (filters.radius || 50) * 1000;
      
      businesses = await prisma.$queryRaw`
        SELECT 
          b.id,
          b.type,
          b."displayName" as "displayName",
          b.description,
          b."addressLine1" as address,
          b.city,
          b."postalCode" as "postalCode",
          b.region,
          b.latitude,
          b.longitude,
          b.phone,
          b.email,
          b.website,
          b."verificationStatus" as "verificationStatus",
          ST_Distance(
            ST_MakePoint(b.longitude, b.latitude)::geography,
            ST_MakePoint(${filters.longitude}, ${filters.latitude})::geography
          ) / 1000 as "distanceKm",
          (
            SELECT json_agg(
              json_build_object(
                'cheeseName', bs."cheeseName",
                'isSignature', bs."isSignature"
              )
            )
            FROM business_specialties bs
            WHERE bs."businessId" = b.id
            ORDER BY bs."displayOrder"
            LIMIT 3
          ) as specialties,
          (
            SELECT AVG(r.rating)::float
            FROM reviews r
            WHERE r."businessId" = b.id AND r."isVisible" = true
          ) as "avgRating",
          (
            SELECT COUNT(*)::int
            FROM reviews r
            WHERE r."businessId" = b.id AND r."isVisible" = true
          ) as "reviewCount"
        FROM businesses b
        WHERE 
          b."isVisible" = true
          AND b."verificationStatus" = 'VERIFIED'
          ${filters.type ? prisma.$queryRaw`AND b.type = ${filters.type}` : prisma.$queryRaw``}
          ${filters.region ? prisma.$queryRaw`AND b.region = ${filters.region}` : prisma.$queryRaw``}
          AND ST_DWithin(
            ST_MakePoint(b.longitude, b.latitude)::geography,
            ST_MakePoint(${filters.longitude}, ${filters.latitude})::geography,
            ${radiusMeters}
          )
        ORDER BY "distanceKm" ASC
        LIMIT ${filters.limit}
        OFFSET ${filters.offset}
      `;
    } else {
      // No geospatial filter - regular query
      businesses = await prisma.business.findMany({
        where,
        select: {
          id: true,
          type: true,
          displayName: true,
          description: true,
          addressLine1: true,
          city: true,
          postalCode: true,
          region: true,
          latitude: true,
          longitude: true,
          phone: true,
          email: true,
          website: true,
          verificationStatus: true,
          specialties: {
            select: {
              cheeseName: true,
              isSignature: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
            take: 3,
          },
          reviews: {
            select: {
              rating: true,
            },
            where: {
              isVisible: true,
            },
          },
        },
        take: filters.limit,
        skip: filters.offset,
        orderBy: {
          displayName: 'asc',
        },
      });

      // Calculate avg rating
      businesses = businesses.map((b: any) => ({
        ...b,
        address: b.addressLine1,
        avgRating: b.reviews.length > 0 
          ? b.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / b.reviews.length 
          : null,
        reviewCount: b.reviews.length,
        reviews: undefined, // Remove raw reviews
      }));
    }

    // Add user-specific data if authenticated
    if (user) {
      const businessList = businesses as any[];
      const savedPlaces = await prisma.savedPlace.findMany({
        where: {
          userId: user.userId,
          businessId: {
            in: businessList.map(b => b.id),
          },
        },
        select: {
          businessId: true,
        },
      });

      const savedIds = new Set(savedPlaces.map((sp: any) => sp.businessId));
      
      businesses = businessList.map(b => ({
        ...b,
        isSaved: savedIds.has(b.id),
      }));
    }

    return NextResponse.json({
      businesses,
      total: Array.isArray(businesses) ? businesses.length : 0,
      filters: {
        ...filters,
        authenticated: !!user,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching businesses' },
      { status: 500 }
    );
  }
}
