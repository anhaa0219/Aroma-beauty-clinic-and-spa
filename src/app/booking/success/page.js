'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesList, staffList, salonInfo } from '@/lib/data';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grab the finalized details from the URL
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const service = servicesList.find(s => s.id === serviceId);
  const staff = staffList.find(s => s.id === staffId);

  // If someone lands here by accident without booking
  if (!service || !staff || !date || !time) {
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
        </div>

        {/* Ticket Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <p className="font-bold text-lg text-foreground">{date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Time</p>
              <p className="font-bold text-lg text-foreground">{time}</p>
            </div>
          </div>

          <div className="space-y-4 border-b border-border pb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Specialist</span>
              <span className="font-semibold">{staff.firstName} {staff.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{service.durationMinutes} mins</span>
            </div>
          </div>

          {/* Location details so they know where to go */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-primary mb-2">Location</h3>
            <p className="text-sm text-muted-foreground">{salonInfo.details.location}</p>
            <p className="text-sm text-muted-foreground mt-1">Phone: {salonInfo.details.bookingPhone}</p>
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
    <Suspense fallback={<div className="text-center py-20">Loading your ticket...</div>}>
      <SuccessContent />
    </Suspense>
  );
}