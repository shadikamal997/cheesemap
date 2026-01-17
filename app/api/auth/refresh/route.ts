import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyRefreshToken, generateAccessToken, hashToken } from '@/lib/auth/jwt';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = refreshSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data;

    // Verify token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if token exists and not revoked
    const tokenHash = await hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        userId: payload.userId,
        revoked: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: 'Invalid or revoked refresh token' },
        { status: 401 }
      );
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User account not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create new session
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setMinutes(sessionExpiresAt.getMinutes() + 15);

    const sessionTokenHash = await hashToken(newAccessToken);
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionTokenHash,
        ipAddress,
        userAgent,
        expiresAt: sessionExpiresAt,
      },
    });

    return NextResponse.json({
      accessToken: newAccessToken,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while refreshing token' },
      { status: 500 }
    );
  }
}
