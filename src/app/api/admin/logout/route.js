import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('aroma_vip_pass');
  return NextResponse.json({ success: true });
}
