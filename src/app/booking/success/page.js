'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { salonInfo } from '@/lib/data';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grab the orderId from the URL (e.g., ?orderId=ORD-123456-789)
  const orderId = searchParams.get('orderId');

  const [booking, setBooking] = useState(null);
  // Nothing to load without an order ID
  const [loading, setLoading] = useState(!!orderId);

  // Fetch the real booking details from MongoDB
  useEffect(() => {
    if (!orderId) return;

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${orderId}`);
        const data = await res.json();

        if (data.success) {
          setBooking(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch booking', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-20 text-primary">Loading your ticket...</div>;
  }

  // If someone lands here by accident or the DB lookup fails
  if (!booking) {
    return (
      <div className="text-center py-20 text-foreground">
        <h2 className="text-2xl font-bold text-primary mb-4">No booking found</h2>
        <button onClick={() => router.push('/')} className="text-primary underline">Go to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-foreground flex flex-col items-center">
      
      {/* SUCCESS TICKET CARD */}
      <div className="w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        
        {/* Header - Marine Blue */}
        <div className="bg-primary p-6 text-center text-primary-foreground">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            {/* Simple SVG Checkmark */}
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Booking Confirmed!</h1>
          <p className="opacity-90 mt-2">Thank you for choosing Aroma Spa.</p>
          <div className="mt-4 inline-block bg-primary-foreground/20 px-4 py-1 rounded-full text-sm font-semibold tracking-wider">
            {booking.orderId}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <p className="font-bold text-lg text-foreground">{booking.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Time</p>
              <p className="font-bold text-lg text-foreground">{booking.time}{booking.endTime ? ` – ${booking.endTime}` : ''}</p>
            </div>
          </div>

          <div className="space-y-4 border-b border-border pb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span className="font-semibold">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold">{booking.serviceName}</span>
            </div>
            {booking.people > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">People</span>
                <span className="font-semibold">{booking.people}</span>
              </div>
            )}
            {booking.staffName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialist</span>
                <span className="font-semibold">{booking.staffName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-primary">₮{booking.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Location details */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-primary mb-2">Location</h3>
            <p className="text-sm text-muted-foreground">{salonInfo?.details?.location || "Ulaanbaatar, Mongolia"}</p>
            <p className="text-sm text-muted-foreground mt-1">Phone: {salonInfo?.details?.bookingPhone || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Back to Home Button */}
      <button 
        onClick={() => router.push('/')} 
        className="mt-8 px-8 py-3 bg-card border border-border text-foreground rounded-md font-medium hover:bg-muted transition-colors shadow-sm"
      >
        Return to Homepage
      </button>

    </div>
  );
}

// Next.js Suspense wrapper for URL reading
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-primary">Loading your ticket...</div>}>
      <SuccessContent />
    </Suspense>
  );
}