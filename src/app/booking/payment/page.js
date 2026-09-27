'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesList, staffList } from '@/lib/data';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const service = servicesList.find(s => s.id === serviceId);
  const staff = staffList.find(s => s.id === staffId);

  // New state variables for real API data
  const [isGenerating, setIsGenerating] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  useEffect(() => {
    // We only want this to run once when the page loads
    if (!service) return;

    async function generateQPayInvoice() {
      try {
        // 1. Call our new secure backend API
        const response = await fetch('/api/qpay/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: service.price,
            serviceName: service.name
          })
        });

        const data = await response.json();

        if (data.success) {
          // 2. If successful, save the real QR code to state!
          setQrData({
            qr_image: data.qr_image,
            invoice_id: data.invoice_id
          });
          setApiMessage("Scan to pay");
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("API call failed:", error);
        // 3. Fallback for MVP testing since we don't have real credentials yet
        setApiMessage("Preview Mode: Waiting for real QPay keys");
      } finally {
        setIsGenerating(false);
      }
    }

    generateQPayInvoice();
  }, [service]);

  const handleSimulatePayment = () => {
    router.push(`/booking/success?serviceId=${serviceId}&staffId=${staffId}&date=${date}&time=${time}`);
  };

  if (!service || !staff || !date || !time) {
    return (
      <div className="text-center py-20 text-foreground">
        <h2 className="text-2xl font-bold text-primary mb-4">Missing booking details</h2>
        <button onClick={() => router.push('/booking')} className="text-primary underline">Start over</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-foreground flex flex-col md:flex-row gap-8">
      
      {/* --- LEFT SIDE: THE RECEIPT --- */}
      <div className="w-full md:w-1/2">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-primary">
          Review & Pay
        </h1>
        <div className="border border-border bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold border-b border-border pb-4 mb-4 text-primary">Appointment Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold text-right">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Specialist</span>
              <span className="font-semibold text-right">{staff.firstName} {staff.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-semibold text-right">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-semibold text-right">{time}</span>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-primary">Total to Pay</span>
            <span className="text-2xl font-extrabold text-primary">₮{service.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: QPAY UI --- */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center border border-border bg-card p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-2">Pay with QPay</h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          {apiMessage || "Connecting to secure payment gateway..."}
        </p>

        {isGenerating ? (
          <div className="w-64 h-64 bg-muted animate-pulse flex items-center justify-center rounded-lg border border-border">
            <span className="text-muted-foreground text-sm font-medium">Generating Invoice...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            
            {/* REAL QR CODE RENDERER */}
            <div className="w-64 h-64 bg-white border-2 border-primary p-4 rounded-lg flex flex-col items-center justify-center mb-6 shadow-md overflow-hidden">
              {qrData?.qr_image ? (
                // If we got a real image from QPay, show it!
                <img src={`data:image/png;base64,${qrData.qr_image}`} alt="QPay QR Code" className="w-full h-full object-contain" />
              ) : (
                // Fallback dummy QR code
                <div className="w-full h-full border-4 border-dashed border-muted-foreground flex items-center justify-center bg-gray-50">
                  <span className="font-bold text-muted-foreground text-center px-2">
                    Dummy QR<br/><span className="text-xs font-normal">(Needs real QPay keys)</span>
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 animate-pulse">Waiting for payment confirmation...</p>
            
            {/* MVP TEST BUTTON */}
            <button 
              onClick={handleSimulatePayment}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              [TEST] Simulate Successful Payment
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function BookingStepThree() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Checkout...</div>}>
      <PaymentContent />
    </Suspense>
  );
}