// src/app/api/qpay/invoice/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Get the booking details sent from our frontend
    const body = await request.json();
    const { amount, serviceName } = body;

    // --- STEP 1: GET QPAY ACCESS TOKEN ---
    // (Replace these with your real QPay Sandbox or Production credentials later)
    const QPAY_USERNAME = "YOUR_QPAY_USERNAME";
    const QPAY_PASSWORD = "YOUR_QPAY_PASSWORD";
    const QPAY_ENV_URL = "https://merchant.qpay.mn/v2"; // Use sandbox URL if testing

    // QPay requires Basic Auth (base64 encoded username:password)
    const basicAuth = Buffer.from(`${QPAY_USERNAME}:${QPAY_PASSWORD}`).toString('base64');

    const tokenResponse = await fetch(`${QPAY_ENV_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to authenticate with QPay");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // --- STEP 2: CREATE THE INVOICE ---
    // Generate a unique invoice number for this booking (e.g., ARMA-16983482)
    const invoiceNo = `ARMA-${Date.now()}`;

    const invoicePayload = {
      invoice_code: "YOUR_INVOICE_CODE", // Provided by QPay when you register
      sender_invoice_no: invoiceNo,
      invoice_receiver_code: "terminal", 
      invoice_description: `Aroma Spa: ${serviceName}`,
      amount: amount,
      callback_url: "https://yourwebsite.mn/api/qpay/callback" // Where QPay sends background updates
    };

    const invoiceResponse = await fetch(`${QPAY_ENV_URL}/invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoicePayload)
    });

    if (!invoiceResponse.ok) {
      throw new Error("Failed to create QPay invoice");
    }

    const invoiceData = await invoiceResponse.json();

    // 3. Send the QR code and Bank App links back to your frontend!
    return NextResponse.json({
      success: true,
      invoice_id: invoiceData.invoice_id,
      qr_text: invoiceData.qr_text,
      qr_image: invoiceData.qr_image, // Base64 string for the image
      urls: invoiceData.urls // Deep links for mobile apps (Khan bank, etc.)
    });

  } catch (error) {
    console.error("QPay API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}