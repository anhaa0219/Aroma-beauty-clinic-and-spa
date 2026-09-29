'use client';

import { salonInfo, servicesList } from "@/lib/data";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  // Grab just the first 3 services to feature on the homepage
  const featuredServices = servicesList.slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      
      {/* 1. HERO SECTION */}
      <div 
        className="relative w-full min-h-[75vh] flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="relative z-10 flex flex-col items-center mt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
            Welcome to Aroma Spa
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto mb-10 drop-shadow-md">
            Experience relaxation and beauty in the heart of the city. <br/>
            📍 {salonInfo.details.location}
          </p>
          <button 
            onClick={() => router.push('/booking')} 
            className="bg-primary text-primary-foreground px-10 py-4 rounded-md text-xl font-bold hover:opacity-90 transition-opacity shadow-xl"
          >
            Book an Appointment
          </button>
        </div>
      </div>

      {/* 2. INTRODUCTION SECTION */}
      <div className="w-full bg-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Our Philosophy</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            At Aroma Spa, we believe that true beauty begins with inner peace. 
            Inspired by the healing powers of the ocean, our treatments use premium 
            marine-based products to rejuvenate your body and mind. Step away from the 
            bustle of Ulaanbaatar and immerse yourself in a sanctuary of tranquility.
          </p>
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-muted rounded-full mb-3 flex items-center justify-center text-muted-foreground shadow-inner text-xs">
              Photo
            </div>
            <p className="text-lg font-semibold text-primary">{salonInfo.owner.lastName} {salonInfo.owner.firstName}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Founder & Manager</p>
          </div>
        </div>
      </div>

      {/* 3. WHY CHOOSE US (Value Proposition) */}
      <div className="w-full bg-muted/30 py-20 px-4 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">The Aroma Spa Difference</h2>
            <p className="text-muted-foreground">What makes our sanctuary truly special.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-background rounded-xl shadow-sm border border-border">
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="text-xl font-bold text-primary mb-3">Marine-Based Healing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">We use exclusive Thalgo products rich in ocean minerals to naturally rejuvenate your skin and body.</p>
            </div>
            <div className="p-8 bg-background rounded-xl shadow-sm border border-border">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-primary mb-3">Expert Specialists</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Our team consists of certified professionals with years of experience in high-end beauty and wellness.</p>
            </div>
            <div className="p-8 bg-background rounded-xl shadow-sm border border-border">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-primary mb-3">Tranquil Environment</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Step out of Ulaanbaatar's busy streets and into a calm, meticulously designed oasis of peace.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. POPULAR SERVICES PREVIEW */}
      <div className="w-full py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Popular Treatments</h2>
              <p className="text-muted-foreground">Our most requested relaxing experiences.</p>
            </div>
            <button 
              onClick={() => router.push('/services')} 
              className="hidden md:block text-primary font-bold hover:opacity-80 transition-opacity"
            >
              View All Services &rarr;
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map(service => (
              <div key={service.id} className="border border-border bg-card p-6 rounded-lg shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 grow">⏱ {service.durationMinutes} minutes</p>
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <span className="font-bold text-primary">₮{service.price.toLocaleString()}</span>
                  <button 
                    onClick={() => router.push(`/booking?serviceId=${service.id}`)} 
                    className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile-only view all button */}
          <button 
            onClick={() => router.push('/services')} 
            className="mt-8 w-full md:hidden text-primary font-bold text-center border border-primary py-3 rounded-md hover:bg-muted"
          >
            View All Services
          </button>
        </div>
      </div>

      {/* 5. FINAL CALL TO ACTION */}
      <div className="w-full bg-primary py-20 px-4 text-center text-primary-foreground">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to treat yourself?</h2>
          <p className="mb-10 opacity-90 text-lg">
            Book your appointment today and secure your time with our expert specialists. 
            Walk-ins are welcome, but reservations guarantee your spot.
          </p>
          <button 
            onClick={() => router.push('/booking')} 
            className="bg-background text-primary px-10 py-4 rounded-md font-extrabold text-lg hover:bg-muted transition-colors shadow-xl"
          >
            Book Your Appointment Now
          </button>
        </div>
      </div>

    </div>
  );
}