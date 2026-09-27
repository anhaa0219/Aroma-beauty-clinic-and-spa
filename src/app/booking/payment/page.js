'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesList, staffList } from '@/lib/data';
import Navbar from '@/components/layout/Navbar';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve all data passed from previous steps
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  // Look up the full details for display
  const service = servicesList.find(s => s.id === serviceId);
  const staff = staffList.find(s => s.id === staffId);

  // Form state for customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimulatePayment = async () => {
    setIsSubmitting(true);

    const bookingData = {
      customerName,
      customerPhone,
      serviceId,
      serviceName: service?.name || 'Unknown Service',
      staffId,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
      date,
      time,
      price: service?.price || 0,
    };

    try {
      // Send the data to your MongoDB API
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      // Parse the JSON response from the database
      const data = await res.json();

      if (data.success && data.data?.orderId) {
        // SUCCESS: Redirect to the new confirmation page with the order ID
        router.push(`/booking/success?orderId=${data.data.orderId}`);
      } else {
        // FAIL: Show the specific error (e.g., time slot already booked)
        alert(data.error || "Something went wrong with the booking.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If someone navigates here without selecting a service first
  if (!serviceId || !date) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-xl text-primary mb-4">Missing booking details.</p>
        <button onClick={() => router.push('/booking')} className="text-primary underline">Start Over</button>
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col'>
       <Navbar/>
    <div className="max-w-4xl mx-auto py-12 px-4 text-foreground">
     
      <button 
        onClick={() => router.back()} 
        className="mb-6 text-primary font-medium hover:opacity-70 flex items-center transition-opacity"
      >
        &larr; Back
      </button>

      <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary text-center">
        Finalize & Pay
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* --- 1. CUSTOMER DETAILS FORM --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Your Details</h2>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g., Ankhbayar M."
                className="w-full border border-border rounded-md p-3 bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground">Phone Number</label>
              <input 
                type="tel" 
                placeholder="e.g., 99887766"
                className="w-full border border-border rounded-md p-3 bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- 2. ORDER SUMMARY & PAYMENT --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">Order Summary</h2>
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl shadow-sm mb-6">
            <div className="space-y-3 mb-6 pb-6 border-b border-primary/10">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialist:</span>
                <span className="font-medium">{staff?.firstName} {staff?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{time}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xl font-extrabold text-primary">
              <span>Total to Pay:</span>
              <span>₮{service?.price.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={!customerName || !customerPhone || isSubmitting}
            className={`w-full py-4 rounded-md text-lg font-bold transition-all shadow-md ${
              customerName && customerPhone && !isSubmitting
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Pay with QPay'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}