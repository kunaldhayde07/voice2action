import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/report',
  '/issues',
  '/my-reports',
  '/map',
  '/notifications',
  '/profile',
];

// Routes that require admin role
const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/issues',
  '/admin/analytics',
  '/admin/users',
];

// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login', '/register'];

function getTokenFromRequest(request: NextRequest): string | null {
  // Check cookie
  const cookieToken = request.cookies.get('accessToken')?.value;
  if (cookieToken) return cookieToken;

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

function decodeJwtPayload(
  token: string
): { id: string; role: string; exp: number } | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;

    const payload = JSON.parse(
      Buffer.from(base64Payload, 'base64').toString('utf-8')
    );
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: { exp: number }): boolean {
  return Date.now() >= payload.exp * 1000;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);
  const payload = token ? decodeJwtPayload(token) : null;
  const isValidToken =
    payload !== null && !isTokenExpired(payload);

  // ── Redirect authenticated users away from auth pages ──────────────────────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isValidToken) {
    const redirectUrl =
      payload?.role === 'admin' || payload?.role === 'super_admin'
        ? '/admin/dashboard'
        : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // ── Protect citizen routes ─────────────────────────────────────────────────
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Protect admin routes ───────────────────────────────────────────────────
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute) {
    if (!isValidToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin =
      payload?.role === 'admin' || payload?.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ── Add security headers ───────────────────────────────────────────────────
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};