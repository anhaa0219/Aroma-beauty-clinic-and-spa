'use client';

import { servicesList } from "@/lib/data";
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-6xl mx-auto text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-primary">
        Our Services
      </h1>
      <p className="text-lg text-muted-foreground mb-10 text-center max-w-2xl">
        Discover our range of premium treatments designed to help you relax, rejuvenate, and feel your absolute best.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {servicesList.map((service) => (
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
                A premium, relaxing experience tailored exactly to your needs using our signature spa techniques.
              </p>
            </div>
            
            {/* Bottom part of the card with Price and Button */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
              <span className="text-2xl font-bold text-primary">₮{service.price.toLocaleString()}</span>
              <button 
                // Notice how this sends them to booking with the service already selected!
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
  );
}