import { NextResponse } from 'next/server';

export function proxy(req) {
  const url = req.nextUrl;

  // Protect /admin and /api/admin... BUT let them see the login page!
  if (
    (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) ||
    (url.pathname.startsWith('/api/admin') && !url.pathname.startsWith('/api/admin/login'))
  ) {
    // Check for our custom VIP cookie
    const session = req.cookies.get('aroma_vip_pass');

    // If no cookie, redirect them to the beautiful login page
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};