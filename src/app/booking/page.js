'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { servicesList, staffList } from '@/lib/data';
import Navbar from '@/components/layout/Navbar';

// Helper function for nice section titles
const getCategoryTitle = (category) => {
  switch (category) {
    case 'Body Spa': return '🌿 Биеийн Спа (Body Spa)';
    case 'Facial': return '✨ Нүүрний Арчилгаа (Facial)';
    case 'Hair': return '💆‍♀️ Үсний Эмчилгээ (Hair)';
    case 'Clinic': return '💉 Клиник (Clinic)'; // In case you add clinic items here
    default: return category || 'Бусад (Other)';
  }
};

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

  // Group the services by their category
  const groupedServices = servicesList.reduce((acc, service) => {
    // If a service is missing a category, it goes to 'Other'
    const cat = service.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(service);
    return acc;
  }, {});

  return (
    <div className='w-full flex flex-col'>
      <Navbar/>
      <div className="max-w-4xl mx-auto py-12 px-4 text-foreground w-full">
        <button 
          onClick={() => router.back()} 
          className="mb-6 text-primary font-medium hover:opacity-70 flex items-center transition-opacity"
        >
          &larr; Back
        </button>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary text-center">
          Book Your Appointment
        </h1>

        {/* --- 1. SERVICE SELECTION (Categorized) --- */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-primary bg-secondary p-3 rounded-lg">
            1. Select a Service
          </h2>
          
          {Object.entries(groupedServices).map(([category, services]) => (
            <div key={category} className="mb-8">
              
              {/* Category Header */}
              <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">
                {getCategoryTitle(category)}
              </h3>
              
              {/* Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`border p-6 rounded-lg cursor-pointer transition-all ${
                      selectedService === service.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md' // Highlighted Marine Blue style
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <h4 className="text-md font-semibold mb-2 leading-tight">{service.name}</h4>
                    <div className="flex justify-between items-center text-sm mt-4">
                      <span className="text-muted-foreground flex items-center gap-1">
                        ⏱️ {service.durationMinutes} мин
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {/* Crash-proof price check */}
                        {service.price ? `₮${service.price.toLocaleString()}` : 'Үнэ лавлах'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          ))}
        </div>

        {/* --- 2. STAFF SELECTION --- */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-primary bg-secondary p-3 rounded-lg">
            2. Select a Specialist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff.id)}
                className={`border p-6 rounded-lg cursor-pointer flex items-center gap-4 transition-all ${
                  selectedStaff === staff.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="w-16 h-16 bg-muted rounded-full flex-shrink-0 flex items-center justify-center text-3xl overflow-hidden shadow-inner border border-border">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg">{staff.firstName} {staff.lastName}</h3>
                  <p className="text-sm font-medium text-foreground mt-1">{staff.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- CONTINUE BUTTON --- */}
        <div className="flex justify-end border-t border-border pt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl">
          <button
            onClick={handleContinue}
            disabled={!selectedService || !selectedStaff}
            className={`px-8 py-3 rounded-md text-lg font-bold transition-all shadow-md ${
              selectedService && selectedStaff
                ? 'bg-primary text-primary-foreground hover:opacity-90 transform hover:-translate-y-0.5'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
            }`}
          >
            Continue to Date & Time
          </button>
        </div>
        
      </div>
    </div>
  );
}