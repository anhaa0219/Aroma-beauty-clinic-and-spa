'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesList, staffList } from '@/lib/data';

// We wrap the main logic in a component to safely use useSearchParams in Next.js
function TimeSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Get the choices from the URL
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');

  // Find the actual data objects
  const service = servicesList.find(s => s.id === serviceId);
  const staff = staffList.find(s => s.id === staffId);

  // 2. React state for Date and Time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);

  // Hardcoded dummy time slots for the MVP
  // Later, you will calculate these based on staff.schedule and booked appointments
  const availableSlots = ["10:00", "10:30", "11:00", "12:00", "13:30", "14:00", "15:00", "16:30", "17:00"];

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      // Pass EVERYTHING to the final payment page
      router.push(`/booking/payment?serviceId=${serviceId}&staffId=${staffId}&date=${selectedDate}&time=${selectedTime}`);
    }
  };

  // Prevent crashing if someone visits this page directly without selecting a service first
  if (!service || !staff) {
    return (
      <div className="text-center py-20 text-foreground">
        <h2 className="text-2xl font-bold text-primary mb-4">No service selected</h2>
        <button onClick={() => router.push('/booking')} className="text-primary underline">Go back to step 1</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-foreground">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-primary text-center">
        Choose Date & Time
      </h1>

      {/* --- SUMMARY CARD --- */}
      <div className="bg-muted/30 border border-border p-6 rounded-lg mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground mb-1">You are booking:</p>
          <p className="font-bold text-lg text-primary">{service.name}</p>
          <p className="text-sm text-foreground">with {staff.firstName} {staff.lastName}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-primary">₮{service.price.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{service.durationMinutes} mins</p>
        </div>
      </div>

      {/* --- DATE PICKER --- */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-primary">1. Select a Date</h2>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          // Prevent picking past dates
          min={new Date().toISOString().split('T')[0]}
          className="w-full md:w-1/2 p-3 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* --- TIME SLOTS GRID --- */}
      {selectedDate && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold mb-4 text-primary">2. Select a Time</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {availableSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-md font-medium transition-all ${
                  selectedTime === time
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- CONTINUE BUTTON --- */}
      <div className="flex justify-end border-t border-border pt-8">
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className={`px-8 py-3 rounded-md text-lg font-medium transition-all ${
            selectedDate && selectedTime
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
          }`}
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  );
}

// Next.js requires this wrapper for client components reading URL params
export default function BookingStepTwo() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <TimeSelectionContent />
    </Suspense>
  );
}