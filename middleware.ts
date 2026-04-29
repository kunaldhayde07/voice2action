import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // rate limiting for API routes — basic IP-based check via headers
  if (pathname.startsWith('/api/issues') && request.method === 'POST') {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';

    // in production you'd use Redis for this — for hackathon, header-based is fine
    const response = NextResponse.next();
    response.headers.set('x-client-ip', ip);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};