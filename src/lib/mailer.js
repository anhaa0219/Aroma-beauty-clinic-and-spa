// Sends email through Resend's HTTP API (https://resend.com — free tier is plenty for a salon).
// Configure in .env (and in Vercel):
//   RESEND_API_KEY = re_xxxxxxxx
//   MAIL_FROM      = "Aroma Spa <no-reply@your-domain.mn>"  (domain must be verified in Resend)
// Without RESEND_API_KEY the email is printed to the server console (development only).
export const isMailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail({ to, subject, text, html }) {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email provider is not configured (RESEND_API_KEY)');
    }
    console.log(`\n📧 [DEV EMAIL] to ${to} — ${subject}\n${text}\n`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'Aroma Spa <onboarding@resend.dev>',
      to: [to],
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Email provider error ${res.status}: ${await res.text().catch(() => '')}`);
  }
}

// The login-code email (Mongolian), plain and HTML versions
export function loginCodeEmail(code) {
  const text = `Таны Aroma Spa-д нэвтрэх код: ${code}\n\nКод 5 минутын турш хүчинтэй. Хэрэв та энэ кодыг хүсээгүй бол энэ имэйлийг үл тоомсорлоно уу.`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#13343b">
      <p style="font-size:13px;letter-spacing:2px;color:#b8860b;margin:0">AROMA BEAUTY CLINIC &amp; SPA</p>
      <h1 style="font-size:20px;margin:12px 0 4px">Таны нэвтрэх код</h1>
      <p style="margin:0 0 16px;color:#5b7479">Доорх кодыг нэвтрэх хуудсанд оруулна уу.</p>
      <p style="font-size:34px;font-weight:bold;letter-spacing:8px;background:#eef6f7;color:#006072;text-align:center;padding:16px;border-radius:12px;margin:0">${code}</p>
      <p style="font-size:12px;color:#8aa0a4;margin-top:16px">Код 5 минутын турш хүчинтэй. Хэрэв та энэ кодыг хүсээгүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
    </div>`;
  return { subject: `Aroma Spa нэвтрэх код: ${code}`, text, html };
}
