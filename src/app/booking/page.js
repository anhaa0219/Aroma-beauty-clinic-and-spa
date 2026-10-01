'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesList, clinicList } from '@/lib/data';
import Navbar from '@/components/layout/Navbar';
import { WORKER_COUNT, findService, serializeItems } from '@/lib/schedule';

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

const bookableServices = [
  ...servicesList,
  ...clinicList.map((service) => ({ ...service, category: 'Clinic' })),
];

function BookingStepOneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // { serviceId: quantity } — each unit is one person, i.e. one worker
  // (a service can be preselected from the Treatments page)
  const [quantities, setQuantities] = useState(() => {
    const id = searchParams.get('serviceId');
    return findService(id) ? { [id]: 1 } : {};
  });

  const totalPeople = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = Object.entries(quantities).reduce(
    (sum, [id, q]) => sum + (findService(id)?.price || 0) * q,
    0
  );
  const isFull = totalPeople >= WORKER_COUNT;

  const changeQuantity = (serviceId, delta) =>
    setQuantities((prev) => {
      const current = prev[serviceId] || 0;
      const total = Object.values(prev).reduce((sum, q) => sum + q, 0);
      if (delta > 0 && total >= WORKER_COUNT) return prev;
      const next = { ...prev, [serviceId]: Math.max(0, current + delta) };
      if (next[serviceId] === 0) delete next[serviceId];
      return next;
    });

  const handleContinue = () => {
    if (totalPeople > 0) {
      const items = Object.entries(quantities).map(([serviceId, quantity]) => ({ serviceId, quantity }));
      // Send the user to the Time page with their choices attached to the URL
      router.push(`/booking/time?items=${serializeItems(items)}`);
    }
  };

  // Group the services by their category
  const groupedServices = bookableServices.reduce((acc, service) => {
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
            1. Select Treatments
          </h2>
          <p className="text-sm text-muted-foreground mb-6 -mt-2">
            Хэдэн хүн үйлчлүүлэх вэ? Нэг эмчилгээ = нэг хүн. Нэг удаад {WORKER_COUNT} хүртэл хүн захиалах боломжтой.
            <br />
            How many people are coming? Each treatment is one person. Book up to {WORKER_COUNT} at once.
          </p>

          {Object.entries(groupedServices).map(([category, services]) => (
            <div key={category} className="mb-8">
              
              {/* Category Header */}
              <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">
                {getCategoryTitle(category)}
              </h3>
              
              {/* Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const qty = quantities[service.id] || 0;
                  return (
                    <div
                      key={service.id}
                      onClick={() => qty === 0 && changeQuantity(service.id, 1)}
                      className={`border p-6 rounded-lg transition-all ${
                        qty > 0
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md' // Highlighted Marine Blue style
                          : isFull
                            ? 'border-border bg-card opacity-60'
                            : 'border-border bg-card hover:border-primary/50 cursor-pointer'
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
                      {qty > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                          <span className="text-sm font-medium text-foreground">Хүний тоо (People)</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => changeQuantity(service.id, -1)}
                              aria-label="Remove one"
                              className="w-8 h-8 rounded-full border border-primary text-primary font-bold hover:bg-primary/10"
                            >
                              −
                            </button>
                            <span className="w-4 text-center font-bold text-primary">{qty}</span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(service.id, 1)}
                              disabled={isFull}
                              aria-label="Add one"
                              className="w-8 h-8 rounded-full border border-primary text-primary font-bold hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
            </div>
          ))}
        </div>

        {/* --- CONTINUE BUTTON --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl">
          <div className="text-sm">
            <p className="font-bold text-primary">
              {totalPeople} / {WORKER_COUNT} хүн (people)
            </p>
            {totalPeople > 0 && (
              <p className="text-muted-foreground">Нийт: ₮{totalPrice.toLocaleString()}</p>
            )}
          </div>
          <button
            onClick={handleContinue}
            disabled={totalPeople === 0}
            className={`px-8 py-3 rounded-md text-lg font-bold transition-all shadow-md ${
              totalPeople > 0
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

export default function BookingStepOne() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>}>
      <BookingStepOneContent />
    </Suspense>
  );
}
