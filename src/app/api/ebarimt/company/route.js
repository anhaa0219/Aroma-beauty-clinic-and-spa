import { NextResponse } from 'next/server';
import { isValidCompanyRegister, lookupCompany } from '@/lib/qpay';

// GET ?register=1234567 → the company's official name, so the customer can confirm it
export async function GET(req) {
  const register = new URL(req.url).searchParams.get('register')?.trim() || '';
  if (!isValidCompanyRegister(register)) {
    return NextResponse.json({ success: false, error: 'Регистрийн дугаар 7 оронтой байна' }, { status: 400 });
  }
  try {
    const company = await lookupCompany(register);
    if (!company) {
      return NextResponse.json({ success: false, error: 'Ийм регистртэй байгууллага олдсонгүй' }, { status: 404 });
    }
    return NextResponse.json({ success: true, register, name: company.name });
  } catch (error) {
    console.error('Company lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Татварын системээс шалгаж чадсангүй. Дахин оролдоно уу.' },
      { status: 502 }
    );
  }
}
