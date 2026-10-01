import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/adminAuth';

export function proxy(req) {
  const url = req.nextUrl;

  // Protect /admin and /api/admin... BUT let them see the login page!
  if (
    (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) ||
    (url.pathname.startsWith('/api/admin') && !url.pathname.startsWith('/api/admin/login'))
  ) {
    // Only a cookie signed with our secret counts — a hand-typed value cannot pass.
    const token = req.cookies.get(ADMIN_COOKIE)?.value;

    if (!verifyAdminToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
