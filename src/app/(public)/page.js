'use client';

import { salonInfo } from "@/lib/data";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full">
      
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE */}
      {/* I added a high-quality spa placeholder image from Unsplash. 
          To use your own, replace the URL below with '/images/your-photo.jpg' 
          after saving it in your public/images folder. */}
      <div 
        className="relative w-full min-h-[75vh] flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay so the white text is easy to read over the photo */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        {/* Content on top of the image */}
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
      <div className="w-full bg-background py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Our Philosophy</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            At Aroma Spa, we believe that true beauty begins with inner peace. 
            Inspired by the healing powers of the ocean, our treatments use premium 
            marine-based products to rejuvenate your body and mind. Step away from the 
            bustle of Ulaanbaatar and immerse yourself in a sanctuary of tranquility.
          </p>
          
          {/* Owner Sign-off */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted rounded-full mb-4 flex items-center justify-center text-muted-foreground shadow-inner">
              Photo
            </div>
            <p className="text-xl font-semibold text-primary">{salonInfo.owner.lastName} {salonInfo.owner.firstName}</p>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Founder & Manager</p>
          </div>
        </div>
      </div>

    </div>
  );
}