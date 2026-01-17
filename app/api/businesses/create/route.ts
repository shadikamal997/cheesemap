import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

const createBusinessSchema = z.object({
  type: z.enum(['SHOP', 'FARM', 'BOTH']),
  legalName: z.string().min(2, 'Legal name is required'),
  displayName: z.string().min(2, 'Display name is required'),
  siret: z.string().regex(/^\d{14}$/, 'SIRET must be 14 digits'),
  description: z.string().optional(),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits'),
  region: z.string().min(2, 'Region is required'),
  latitude: z.number().min(41).max(51, 'Location must be in France'),
  longitude: z.number().min(-5).max(10, 'Location must be in France'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Check if user already has a business
    const existingBusiness = await prisma.business.findUnique({
      where: { ownerId: user.userId },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'You already have a business registered' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const validation = createBusinessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check SIRET uniqueness
    const siretExists = await prisma.business.findUnique({
      where: { siret: data.siret },
    });

    if (siretExists) {
      return NextResponse.json(
        { error: 'SIRET number already registered' },
        { status: 409 }
      );
    }

    // Create business in DRAFT state
    const business = await prisma.business.create({
      data: {
        ownerId: user.userId,
        type: data.type,
        legalName: data.legalName,
        displayName: data.displayName,
        siret: data.siret,
        description: data.description,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        postalCode: data.postalCode,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        website: data.website,
        verificationStatus: 'DRAFT',
        isVisible: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update user role to SHOP or FARM
    await prisma.user.update({
      where: { id: user.userId },
      data: { role: data.type === 'FARM' ? 'FARM' : 'SHOP' },
    });

    return NextResponse.json({
      message: 'Business created successfully',
      business,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating business' },
      { status: 500 }
    );
  }
}
