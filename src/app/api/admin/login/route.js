import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      
     
      const cookieStore = await cookies();
      cookieStore.set('aroma_vip_pass', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Incorrect username or password 🌸' }, { status: 401 });
  } catch (error) {
    console.error("Login API Error:", error); // This will tell us if it breaks!
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}