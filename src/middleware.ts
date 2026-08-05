import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Protect admin routes and admin API endpoints
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminSecret = process.env.ADMIN_SECRET || 'transfer-admin-secret-2026';
    const providedKey = searchParams.get('admin_key') || request.headers.get('x-admin-key');

    if (!providedKey || providedKey !== adminSecret) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin authentication secret is required to access admin APIs.' },
          { status: 401 }
        );
      }

      // Redirect unauthenticated public users accessing /admin pages back to /more
      const redirectUrl = new URL('/more', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
