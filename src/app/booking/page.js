'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { servicesList, staffList } from '@/lib/data';

export default function BookingStepOne() {
  const router = useRouter();
  
  // React state to remember what the user clicked
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleContinue = () => {
    // Only proceed if both are selected
    if (selectedService && selectedStaff) {
      // Send the user to the Time page with their choices attached to the URL
      router.push(`/booking/time?serviceId=${selectedService}&staffId=${selectedStaff}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary text-center">
        Book Your Appointment
      </h1>

      {/* --- 1. SERVICE SELECTION --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-primary">1. Select a Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesList.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`border p-6 rounded-lg cursor-pointer transition-all ${
                selectedService === service.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' // Highlighted Marine Blue style
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{service.durationMinutes} minutes</span>
                <span className="font-bold text-primary text-lg">₮{service.price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 2. STAFF SELECTION --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-primary">2. Select a Specialist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaff(staff.id)}
              className={`border p-6 rounded-lg cursor-pointer flex items-center gap-4 transition-all ${
                selectedStaff === staff.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="w-16 h-16 bg-muted rounded-full flex-shrink-0 flex items-center justify-center text-muted-foreground text-xs">
                Photo
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg">{staff.firstName} {staff.lastName}</h3>
                <p className="text-sm text-muted-foreground">{staff.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CONTINUE BUTTON --- */}
      <div className="flex justify-end border-t border-border pt-8">
        <button
          onClick={handleContinue}
          disabled={!selectedService || !selectedStaff}
          className={`px-8 py-3 rounded-md text-lg font-medium transition-all ${
            selectedService && selectedStaff
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' // Greyed out if not ready
          }`}
        >
          Continue to Date & Time
        </button>
      </div>
    </div>
  );
}