'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  
  // State to track if the mobile menu is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Treatments', path: '/services' },
    { name: 'SoCheck', path: '/socheck' },
    { name: 'Clinic', path: '/clinic' },
    { name: 'Our Team', path: '/staff' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  // Helper function to handle routing and close the menu on mobile
  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        
        {/* Brand Logo */}
        <img 
          src="/logo-removebg-preview.png" 
          alt="Aroma Beauty Clinic & Spa"
          onClick={() => handleNavigation('/')} 
          className="h-12 md:h-14 w-auto cursor-pointer object-contain hover:opacity-80 transition-opacity"
        />

        {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
        <div className="hidden md:flex items-center gap-5 lg:gap-8">
          {navLinks.map((link) => (
            <span 
              key={link.name}
              onClick={() => handleNavigation(link.path)} 
              className="text-sm font-medium cursor-pointer text-foreground/80 hover:text-primary transition-colors relative group whitespace-nowrap"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
            </span>
          ))}
          
          <button 
  onClick={() => handleNavigation('/booking')} 
  className="relative overflow-hidden group bg-primary text-primary-foreground px-8 py-3 rounded-full text-base font-bold cursor-pointer mt-6 mb-4 w-full transition-all duration-300 active:scale-95 shadow-md"
>
  {/* Button Text & Animated Arrow */}
  <span className="relative z-10 flex items-center justify-center gap-2">
    Book Now 
    <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 ease-out">
      &rarr;
    </span>
  </span>
  
  {/* The Shiny Sweep Effect */}
  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out z-0"></div>
</button>
        </div>

        {/* --- MOBILE MENU TOGGLE BUTTON (Hidden on Desktop) --- */}
        <button 
          className="md:hidden p-2 text-foreground focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            // 'X' Close Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-xl flex flex-col px-6 py-4">
          
          {/* Menu Links with Light Separators */}
          <div className="flex flex-col divide-y divide-border/40">
            {navLinks.map((link) => (
              <span 
                key={link.name}
                onClick={() => handleNavigation(link.path)} 
                className="text-lg font-medium cursor-pointer text-foreground/90 hover:text-primary transition-colors py-4 text-center"
              >
                {link.name}
              </span>
            ))}
          </div>

          {/* Book Now Button */}
          <button 
  onClick={() => handleNavigation('/booking')} 
  className=" bg-primary text-primary-foreground px-8 py-3 rounded-full text-base font-bold cursor-pointer mt-6 mb-4 w-full transition-all duration-300 ease-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 active:scale-95"
>
  Book Now
</button>
         
        </div>
      )}
    </nav>
  );
}