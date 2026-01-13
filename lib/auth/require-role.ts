// Script to fix requireRole middleware to accept both string and string[]
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from './middleware';

/**
 * Require specific role(s) for API access
 * Can accept a single role string or an array of roles
 */
export async function requireRole(request: NextRequest, roles: string | string[]) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}
