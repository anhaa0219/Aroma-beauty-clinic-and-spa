import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_MAX_AGE_SECONDS, createAdminToken } from '@/lib/adminAuth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Signed token instead of a static value, so the cookie can't be forged
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE, createAdminToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ADMIN_MAX_AGE_SECONDS,
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Incorrect username or password 🌸' }, { status: 401 });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
