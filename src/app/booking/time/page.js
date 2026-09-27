'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Standard salon working hours
const ALL_TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

function BookingTimeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Grab the selections from Step 1
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);

  // MOCK BACKEND DATA: 
  // Once your API is connected, you will fetch all bookings for `selectedDate` 
  // and extract their times into this array. For now, 13:00 and 14:00 are simulated as "Occupied".
  const occupiedTimes = ["13:00", "14:00"];

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      // Pass all selections to the final customer details page
      router.push(`/booking/customer?serviceId=${serviceId}&staffId=${staffId}&date=${selectedDate}&time=${selectedTime}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-foreground">
      {/* Universal Back Button */}
      <button 
        onClick={() => router.back()} 
        className="mb-6 text-primary font-medium hover:opacity-70 flex items-center transition-opacity"
      >
        &larr; Back
      </button>

      <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary text-center">
        Select Date & Time
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* --- 1. DATE SELECTION --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">1. Choose a Date</h2>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <input 
              type="date" 
              className="w-full border border-border rounded-md p-4 bg-background text-foreground focus:ring-2 focus:ring-primary outline-none cursor-pointer text-lg"
              value={selectedDate}
              // Prevent selecting dates in the past
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(null); // Reset time if they change the date
              }}
            />
            {!selectedDate && (
              <p className="text-sm text-muted-foreground mt-4">
                Please select a date to check availability.
              </p>
            )}
          </div>
        </div>

        {/* --- 2. TIME SELECTION --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">2. Choose a Time</h2>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm min-h-[300px]">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a date first
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {ALL_TIME_SLOTS.map((time) => {
                  const isOccupied = occupiedTimes.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-md text-sm font-bold transition-all border ${
                        isOccupied
                          ? 'bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50' // Disabled styling
                          : isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-md' // Selected styling
                            : 'bg-background text-foreground border-border hover:border-primary hover:text-primary' // Available styling
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTINUE BUTTON --- */}
      <div className="flex justify-end border-t border-border pt-8">
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className={`px-8 py-3 rounded-md text-lg font-medium transition-all ${
            selectedDate && selectedTime
              ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
          }`}
        >
          Continue to Details
        </button>
      </div>
    </div>
  );
}

export default function BookingTimePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Loading calendar...</div>}>
      <BookingTimeContent />
    </Suspense>
  );
}