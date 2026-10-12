// Server-only QPay v2 client: invoices, payment checks and eBarimt (tax receipt) 3.0.
// Docs: https://developer.qpay.mn — the browser never talks to QPay directly.

const SANDBOX_URL = 'https://merchant-sandbox.qpay.mn/v2';
// QPay's public sandbox merchant (shared test login) — only used outside production
const SANDBOX_LOGIN = { username: 'TEST_MERCHANT', password: '123456', invoiceCode: 'TEST_INVOICE' };

function config() {
  const { QPAY_BASE_URL, QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE } = process.env;
  if (QPAY_USERNAME && QPAY_PASSWORD && QPAY_INVOICE_CODE) {
    return {
      baseUrl: (QPAY_BASE_URL || 'https://merchant.qpay.mn/v2').replace(/\/$/, ''),
      username: QPAY_USERNAME,
      password: QPAY_PASSWORD,
      invoiceCode: QPAY_INVOICE_CODE,
    };
  }
  if (process.env.NODE_ENV === 'production') throw new Error('QPay is not configured (QPAY_* env vars)');
  return { baseUrl: SANDBOX_URL, ...SANDBOX_LOGIN };
}

// eBarimt 3.0 tax details for invoices (from the salon's tax registration / QPay onboarding)
//   QPAY_EBARIMT_DISTRICT_CODE        district (дүүрэг) code of the salon, e.g. Khan-Uul
//   QPAY_EBARIMT_CLASSIFICATION_CODE  product/service classification (БҮТК) code for the treatments
//   QPAY_EBARIMT_TAX_TYPE             1 = VAT (НӨАТ) payer, 2 = VAT 0%, 3 = VAT exempt (default 1)
function ebarimtConfig() {
  const district = process.env.QPAY_EBARIMT_DISTRICT_CODE?.trim();
  if (!district) return null;
  return {
    districtCode: district,
    classificationCode: process.env.QPAY_EBARIMT_CLASSIFICATION_CODE?.trim() || undefined,
    taxType: process.env.QPAY_EBARIMT_TAX_TYPE?.trim() || '1',
  };
}

// Sandbox payments can't be made with a real bank app, so dev/sandbox allows a simulated payment
export const isQpaySandbox = () => config().baseUrl === SANDBOX_URL;

// Access tokens last ~24h; cache one per server process and renew a minute early
let cachedToken = null;
async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const { baseUrl, username, password } = config();
  const res = await fetch(`${baseUrl}/auth/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`QPay auth failed (${res.status})`);
  const data = await res.json();
  // expires_in is a unix timestamp (seconds)
  const expiresAt = data.expires_in > 1e9 ? data.expires_in * 1000 : Date.now() + 3_600_000;
  cachedToken = { value: data.access_token, expiresAt };
  return cachedToken.value;
}

async function call(method, path, body) {
  const send = async () =>
    fetch(`${config().baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  let res = await send();
  if (res.status === 401) {
    cachedToken = null; // token revoked/expired early — log in again once
    res = await send();
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const error = new Error(`QPay ${path} failed (${res.status}): ${data.error || data.message || text}`.slice(0, 300));
    error.status = res.status;
    throw error;
  }
  return data;
}

/**
 * Create a QPay invoice. The amount always comes from our own booking record.
 * lines: [{ description, quantity, unitPrice }] — the treatments (must add up to amount)
 * taxCustomer: company register for a company receipt (eBarimt 3.0)
 * Returns { invoiceId, qrText, shortUrl, urls: [{ name, description, logo, link }] }
 */
export async function createInvoice({ orderId, amount, description, callbackUrl, lines = [], taxCustomer }) {
  const tax = ebarimtConfig();
  const data = await call('POST', '/invoice', {
    invoice_code: config().invoiceCode,
    sender_invoice_no: orderId,
    invoice_receiver_code: 'terminal',
    invoice_description: description.slice(0, 255),
    amount,
    callback_url: callbackUrl,
    // eBarimt 3.0: tax details travel with the invoice so the receipt can be issued after payment
    ...(tax && {
      district_code: tax.districtCode,
      tax_type: tax.taxType,
      calculate_vat: tax.taxType === '1',
      ...(taxCustomer && { tax_customer_code: taxCustomer }),
      lines: lines.map((l) => ({
        line_description: l.description.slice(0, 255),
        line_quantity: l.quantity,
        line_unit_price: l.unitPrice,
        ...(tax.classificationCode && { classification_code: tax.classificationCode }),
      })),
    }),
  });
  return {
    invoiceId: data.invoice_id,
    qrText: data.qr_text,
    shortUrl: data.qPay_shortUrl,
    urls: (data.urls || []).map(({ name, description: label, logo, link }) => ({ name, description: label, logo, link })),
  };
}

// The PAID payment of an invoice, or null. This is the only thing we trust — never a callback's body.
export async function findPaidPayment(invoiceId) {
  const data = await call('POST', '/payment/check', {
    object_type: 'INVOICE',
    object_id: invoiceId,
    offset: { page_number: 1, page_limit: 100 },
  });
  const paid = (data.rows || []).find((r) => r.payment_status === 'PAID');
  return paid
    ? { paymentId: String(paid.payment_id), amount: Number(paid.payment_amount), paidAt: paid.payment_date }
    : null;
}

export async function cancelInvoice(invoiceId) {
  await call('DELETE', `/invoice/${encodeURIComponent(invoiceId)}`);
}

/**
 * Issue the eBarimt for a paid payment.
 * receiverType: 'CITIZEN' (receiver = phone) or 'COMPANY' (receiver = company register number)
 * Returns { id, qrData, lottery }
 */
export async function createEbarimt({ paymentId, receiverType, receiver }) {
  const tax = ebarimtConfig();
  const data = await call('POST', '/ebarimt_v3/create', {
    payment_id: paymentId,
    ebarimt_receiver_type: receiverType,
    ebarimt_receiver: receiver || '',
    ...(tax && { district_code: tax.districtCode }),
    ...(tax?.classificationCode && { classification_code: tax.classificationCode }),
  });
  return { id: data.id, qrData: data.ebarimt_qr_data, lottery: data.ebarimt_lottery };
}

const getJson = async (url) => {
  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
  return res.json();
};

// Two public registries of the tax authority; they may refuse requests from servers outside Mongolia
const COMPANY_LOOKUPS = [
  async (register) => {
    const data = await getJson(`https://info.ebarimt.mn/rest/merchant/info?regno=${register}`);
    return data.found && data.name ? { name: String(data.name).trim() } : null;
  },
  async (register) => {
    const tin = await getJson(`https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${register}`);
    if (tin.status !== 200 || !tin.data) return null; // "not found" answer
    const info = await getJson(`https://api.ebarimt.mn/api/info/check/getInfo?tin=${tin.data}`);
    return info.data?.found && info.data.name ? { name: String(info.data.name).trim() } : null;
  },
];

/**
 * Look up a company by its 7-digit register number in the tax authority's public registry.
 * Returns { name } when found, null when it doesn't exist; throws when no registry can be reached.
 */
export async function lookupCompany(register) {
  let lastError;
  for (const lookup of COMPANY_LOOKUPS) {
    try {
      return await lookup(register);
    } catch (error) {
      lastError = error;
    }
  }
  console.error('Company lookup unreachable:', lastError?.message);
  throw new Error('Tax registry unreachable');
}

export const isValidCompanyRegister = (value) => typeof value === 'string' && /^\d{7}$/.test(value.trim());
