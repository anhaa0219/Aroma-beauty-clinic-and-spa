// Sends an SMS through your provider's HTTP API.
// Configure in .env:
//   SMS_API_URL   = endpoint that accepts POST JSON { to, text }
//   SMS_API_KEY   = sent as "Authorization: Bearer <key>"
// Adapt the request body below if your provider (MessagePro, Unitel, Mobicom, Skytel...) expects other field names.
// Without configuration the message is printed to the server console (development only).
export async function sendSms(to, text) {
  const url = process.env.SMS_API_URL;

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMS provider is not configured (SMS_API_URL)');
    }
    console.log(`\n📱 [DEV SMS] to ${to}: ${text}\n`);
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SMS_API_KEY || ''}`,
    },
    body: JSON.stringify({ to, text }),
  });
  if (!res.ok) {
    throw new Error(`SMS provider error ${res.status}: ${await res.text().catch(() => '')}`);
  }
}
