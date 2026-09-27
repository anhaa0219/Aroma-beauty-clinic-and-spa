'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between p-4 border-b border-border bg-background">
      {/* Logo / Brand Name */}
      <span 
        onClick={() => router.push('/')} 
        className="text-xl font-bold tracking-tight cursor-pointer text-primary"
      >
        Aroma Spa
      </span>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <span 
          onClick={() => router.push('/services')} 
          className="text-sm font-medium cursor-pointer text-foreground hover:text-primary transition-colors"
        >
          Services
        </span>
        <span 
          onClick={() => router.push('/staff')} 
          className="text-sm font-medium cursor-pointer text-foreground hover:text-primary transition-colors"
        >
          Our Team
        </span>
        <span 
          onClick={() => router.push('/contact')} 
          className="text-sm font-medium cursor-pointer text-foreground hover:text-primary transition-colors"
        >
          Contact
        </span>
        <span onClick={() => router.push('/about')} className="text-sm font-medium cursor-pointer text-foreground hover:text-primary transition-colors">
  About
</span>
        {/* Booking Button */}
        <button 
          onClick={() => router.push('/booking')} 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </nav>
  );
}