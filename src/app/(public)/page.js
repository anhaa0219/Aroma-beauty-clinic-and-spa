'use client';

import { salonInfo, servicesList } from "@/lib/data"; 
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  const featuredServices = servicesList.slice(0, 3);

  return (
    <div className="flex flex-col w-full font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        
        {/* --- DESKTOP Background Image (Hidden on phones) --- */}
        <div 
          className="hidden md:block absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop')" }}
        />

        {/* --- MOBILE Background Image (Hidden on tablets/laptops) --- */}
        <div 
          className="block md:hidden absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop')" }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center mt-16 max-w-4xl">
          <span className="text-primary tracking-[0.3em] uppercase text-sm font-bold mb-4 drop-shadow-md">
            Welcome to your sanctuary
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-xl">
            Aroma Beauty Clinic & Spa
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light drop-shadow-md">
            Experience advanced aesthetic treatments and ultimate relaxation in the heart of Ulaanbaatar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
            <button 
              onClick={() => router.push('/booking')} 
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTRODUCTION SECTION */}
      <div className="w-full bg-background py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-bold tracking-[0.2em] text-primary uppercase mb-3">Our Philosophy</h2>
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 text-foreground">True beauty begins with inner peace.</h3>
          
          <div className="w-12 h-1 bg-primary/30 mx-auto mb-8 rounded-full"></div>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto font-light">
            Inspired by the healing powers of the ocean, our treatments use premium 
            marine-based products to rejuvenate your body and mind. Step away from the 
            bustle of the city and immerse yourself in a meticulously designed sanctuary of tranquility.
          </p>
          
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted rounded-full mb-4 flex items-center justify-center text-3xl shadow-inner border border-border">
              👩‍⚕️
            </div>
            <p className="text-lg font-bold text-foreground">{salonInfo.owner.lastName} {salonInfo.owner.firstName}</p>
            <p className="text-xs text-primary uppercase tracking-[0.15em] mt-1 font-semibold">Founder & Manager</p>
          </div>
        </div>
      </div>

      {/* 3. WHY CHOOSE US */}
      <div className="w-full bg-secondary/30 py-24 px-4 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Aroma Spa Difference</h2>
            <p className="text-muted-foreground font-light text-lg">What makes our sanctuary truly special.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-10 bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 group">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🌊
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Marine Healing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Exclusive Thalgo products rich in ocean minerals to naturally rejuvenate your skin and body.</p>
            </div>
            <div className="p-10 bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 group">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                ✨
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Expert Specialists</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Our team consists of highly certified professionals with years of experience in aesthetic medicine.</p>
            </div>
            <div className="p-10 bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 group">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🌿
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Tranquil Oasis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Escape the busy streets into our calm, quiet, and beautifully designed wellness environment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. POPULAR SERVICES */}
      <div className="w-full py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-primary uppercase mb-2">Taste of Luxury</h2>
              <h3 className="text-3xl font-bold text-foreground">Featured Treatments</h3>
            </div>
            <button 
              onClick={() => router.push('/services')} 
              className="hidden md:flex items-center text-primary font-bold hover:opacity-70 transition-opacity"
            >
              View Full Menu <span className="ml-2">&rarr;</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map(service => (
              <div key={service.id} className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col group">
                <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{service.name}</h4>
                <p className="text-sm text-muted-foreground mb-8 grow">⏱ {service.durationMinutes} minutes</p>
                <div className="flex justify-between items-center border-t border-border pt-6 mt-auto">
                  <span className="font-bold text-primary text-lg">
                    {service.price ? `₮${service.price.toLocaleString()}` : 'Үнэ лавлах'}
                  </span>
                  <button 
                    onClick={() => router.push(`/booking?serviceId=${service.id}`)} 
                    className="text-sm bg-primary/10 text-primary px-6 py-2 rounded-full font-bold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => router.push('/services')} 
            className="mt-10 w-full md:hidden text-primary font-bold text-center border-2 border-primary/20 py-4 rounded-xl hover:bg-primary/5 transition-colors"
          >
            View Full Menu
          </button>
        </div>
      </div>

      {/* 5. FINAL Loyalty Member CALL TO ACTION */}
      <div className="w-full py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to treat yourself?</h2>
          <p className="mb-10 text-primary-foreground/80 text-lg md:text-xl font-light max-w-2xl">
            Secure your time with our expert specialists. Experience the ultimate fusion of advanced clinical care and spa relaxation.
          </p>
          <button 
            onClick={() => router.push('/booking')} 
            className="bg-background text-primary px-12 py-5 rounded-full font-extrabold text-lg hover:scale-105 transition-transform shadow-2xl"
          >
            Reserve Your Experience
          </button>
        </div>
      </div>

    </div>
  );
}