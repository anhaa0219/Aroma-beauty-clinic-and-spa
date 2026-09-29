'use client';

import { servicesList } from '@/lib/data';
import { useRouter } from 'next/navigation';

// Helper function for nice section titles
const getCategoryTitle = (category) => {
  switch (category) {
    case 'Body Spa': return '🌿 Биеийн Спа (Body Spa)';
    case 'Facial': return '✨ Нүүрний Арчилгаа (Facial)';
    case 'Hair': return '💆‍♀️ Үсний Эмчилгээ (Hair)';
    default: return category;
  }
};

export default function ServicesPage() {
  const router = useRouter();

  // Group the treatments by their category
  const groupedTreatments = servicesList.reduce((acc, treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {});

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-6xl mx-auto text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-primary">
        Our Treatments
      </h1>
      <p className="text-lg text-muted-foreground mb-10 text-center max-w-2xl">
        Discover our range of premium treatments designed to help you relax, rejuvenate, and feel your absolute best.
      </p>
      
      <div className="w-full">
        {/* Loop through each category block */}
        {Object.entries(groupedTreatments).map(([category, treatments]) => (
          <div key={category} className="mb-16 w-full">
            
            {/* --- SECTION HEADER --- */}
            <div className="border-b-2 border-border pb-3 mb-8">
              <h2 className="text-2xl font-bold text-primary">
                {getCategoryTitle(category)}
              </h2>
            </div>

            {/* --- YOUR ORIGINAL GRID & CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {treatments.map((service) => (
                <div 
                  key={service.id} 
                  className="border border-border bg-card text-card-foreground rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  {/* Top part of the card */}
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold mb-3 text-primary">{service.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>⏱ {service.durationMinutes} minutes</span>
                    </div>
                    <p className="text-sm text-foreground opacity-90 mb-6">
                      {service.description}
                    </p>
                  </div>
                  
                  {/* Bottom part of the card with Price and Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <span className="text-2xl font-bold text-primary">
  {service.price ? `₮${service.price.toLocaleString()}` : 'Үнэ лавлах'}
</span>
                    <button 
                      onClick={() => router.push(`/booking?serviceId=${service.id}`)} 
                      className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Book This
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}