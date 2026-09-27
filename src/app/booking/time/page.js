'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

const ALL_TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

function BookingTimeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch occupied slots from MongoDB whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setOccupiedTimes([]);
      return;
    }

    async function fetchAvailability() {
      setLoadingSlots(true);
      try {
        const query = new URLSearchParams({ date: selectedDate });
        if (staffId) query.append('staffId', staffId);

        const res = await fetch(`/api/bookings?${query.toString()}`);
        const data = await res.json();

        if (data.success) {
          setOccupiedTimes(data.occupiedTimes || []);
        }
      } catch (err) {
        console.error('Error fetching occupied slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchAvailability();
  }, [selectedDate, staffId]);

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      router.push(`/booking/payment?serviceId=${serviceId}&staffId=${staffId}&date=${selectedDate}&time=${selectedTime}`);
    }
  };

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
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(null);
              }}
            />
          </div>
        </div>

        {/* --- 2. TIME SELECTION --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">2. Choose a Time</h2>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm min-h-[300px]">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-full text-muted-foreground pt-16">
                Select a date first
              </div>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center h-full text-primary pt-16">
                Checking availability...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {ALL_TIME_SLOTS.map((time) => {
                  const isOccupied = occupiedTimes.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-md text-sm font-bold transition-all border ${
                        isOccupied
                          ? 'bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-40 line-through'
                          : isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
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
          Continue to Payment
        </button>
      </div>
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