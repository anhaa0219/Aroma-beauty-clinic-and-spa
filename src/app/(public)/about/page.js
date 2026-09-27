'use client';

import { salonInfo } from "@/lib/data";
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-4xl mx-auto text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-primary">
        About Aroma Spa
      </h1>
      
      {/* Placeholder for real interior photo */}
      <div 
        className="w-full h-64 md:h-96 bg-muted rounded-lg mb-10 shadow-sm bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>

      <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
        <p>
          Founded with a passion for wellness, <strong>Aroma Spa</strong> is a premium sanctuary located in Ulaanbaatar. We specialize in bringing the healing powers of the ocean directly to you through our signature marine-based treatments.
        </p>
        
        <p>
          Our highly trained team uses exclusively top-tier products, ensuring every haircut, manicure, and massage is a restorative experience. We believe that true beauty begins with inner peace, and our tranquil environment is designed to help you escape the daily grind.
        </p>

        <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg my-8">
          <h2 className="text-xl font-bold text-primary mb-2">Our Mission</h2>
          <p className="text-base text-foreground">
            To provide world-class relaxation and beauty services that rejuvenate both body and mind, using sustainable and effective marine therapies.
          </p>
        </div>

        <p>
          Led by {salonInfo.owner.lastName} {salonInfo.owner.firstName}, our dedicated staff is here to provide a personalized experience tailored specifically to your needs.
        </p>
      </div>

      <button 
        onClick={() => router.push('/booking')}
        className="mt-12 bg-primary text-primary-foreground px-8 py-3 rounded-md text-lg font-medium hover:opacity-90 shadow-sm transition-all"
      >
        Experience It Yourself
      </button>
    </div>
  );
}