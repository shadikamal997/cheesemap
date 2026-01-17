import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { rateLimitMiddleware } from './lib/rate-limit'; // Redis not compatible with Edge runtime
import { verifyAccessToken } from './lib/auth/jwt';

// Paths that require authentication
const protectedPaths = ['/dashboard'];

// Role-specific dashboard paths
const roleDashboards: Record<string, string> = {
  'ADMIN': '/dashboard/admin',
  'SHOP': '/dashboard/shop',
  'FARM': '/dashboard/farm',
  'VISITOR': '/dashboard/visitor',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NOTE: Rate limiting disabled in middleware (Edge runtime doesn't support Redis)
  // Rate limiting is still active in API routes (Node.js runtime)
  
  // Apply rate limiting based on path
  // let rateLimitConfig: 'public' | 'auth' | 'api' | 'business' = 'public';

  // if (pathname.startsWith('/api/auth')) {
  //   rateLimitConfig = 'auth';
  // } else if (pathname.startsWith('/api/')) {
  //   rateLimitConfig = 'api';
  // } else if (pathname.startsWith('/dashboard/business')) {
  //   rateLimitConfig = 'business';
  // }

  // Check rate limit
  // const rateLimitResponse = await rateLimitMiddleware(request, undefined, rateLimitConfig);
  // if (rateLimitResponse) {
  //   return rateLimitResponse;
  // }

  // Check if path requires authentication
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    const payload = await verifyAccessToken(token);
    
    if (!payload) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('accessToken');
      return response;
    }

    // Check role-based access for dashboards
    if (pathname.startsWith('/dashboard/')) {
      const requestedDashboard = pathname.split('/')[2]; // admin, shop, farm, visitor
      const userRole = payload.role as string;
      const allowedDashboard = roleDashboards[userRole];

      // Admin can access all dashboards
      if (userRole !== 'ADMIN') {
        const userDashboardPath = allowedDashboard.split('/')[2];
        
        // If user tries to access wrong dashboard, redirect to their own
        if (requestedDashboard !== userDashboardPath) {
          return NextResponse.redirect(new URL(allowedDashboard, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
