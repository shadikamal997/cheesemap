import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';
import { prisma } from '@/lib/db';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

/**
 * Get user from request authorization header
 */
export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return null;
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }
// Check email verification
  if (!user.emailVerified) {
    return NextResponse.json(
      { error: 'Email verification required. Please verify your email address.' },
      { status: 403 }
    );
  }

  
  return user;
}

/**
 * Require specific role(s)
 * Can accept a single role string or an array of roles
 */
export async function requireRole(request: NextRequest, roles: string | string[]) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden. Insufficient permissions.' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Optional authentication (for endpoints that work both with/without auth)
 */
export async function optionalAuth(request: NextRequest) {
  return await getUserFromRequest(request);
}
