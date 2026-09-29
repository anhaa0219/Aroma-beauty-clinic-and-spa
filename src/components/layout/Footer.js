'use client';

import { useRouter } from 'next/navigation';
import { salonInfo } from '@/lib/data';

export default function Footer() {
  const router = useRouter();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Treatments', path: '/services' },
    { name: 'SoCheck', path: '/socheck' },
    { name: 'Clinic', path: '/clinic' },
    { name: 'Our Team', path: '/staff' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <footer className="bg-background relative mt-auto font-sans">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-70"></div>
      
      {/* Adjusted padding: pt-12 on mobile, pt-20 on desktop */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-8 md:pb-10">
        
        {/* Adjusted grid: tighter gap-10 on mobile, added sm:grid-cols-2 for landscape phones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 mb-10 md:mb-16">
          
          <div className="hidden md:flex md:col-span-12 lg:col-span-5 flex-col items-start">
            <img 
              src="/logo-removebg-preview.png" 
              alt="Aroma Beauty Clinic & Spa"
              className="w-48 lg:w-56 h-auto object-contain mb-6 cursor-pointer hover:opacity-80 transition-opacity mix-blend-multiply dark:mix-blend-screen"
              onClick={() => router.push('/')}
            />
            <p className="text-muted-foreground font-light leading-relaxed max-w-sm text-sm md:text-base">
              Experience advanced aesthetic treatments and ultimate relaxation in the heart of Ulaanbaatar. Your sanctuary for premium marine-based wellness.
            </p>
          </div>

          <div className="md:col-span-5 lg:col-span-3 lg:ml-auto">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-5 md:mb-6">Explore</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <span 
                    onClick={() => router.push(link.path)} 
                    className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
                  >
                    <span className="h-[1px] w-0 bg-primary mr-0 group-hover:w-4 group-hover:mr-2 transition-all duration-300 ease-out"></span>
                    {link.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 lg:col-span-4 lg:ml-auto">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-5 md:mb-6">Contact & Visit</h4>
            <ul className="space-y-5 text-sm text-muted-foreground font-light">
              <li className="flex gap-4 items-start group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="leading-relaxed">{salonInfo.details.location}</span>
              </li>
              
              <li className="flex gap-4 items-center group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.89-1.424-5.224-3.758-6.648-6.648l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span>{salonInfo.details.bookingPhone}</span>
              </li>
              
              <li className="flex gap-4 items-center group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>{salonInfo.owner.email}</span>
              </li>
            </ul>
          </div>
          
        </div>

        <div className="border-t border-border/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-light text-muted-foreground tracking-wide text-center md:text-left">
            &copy; {new Date().getFullYear()} AROMA BEAUTY CLINIC & SPA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-light text-muted-foreground tracking-wide">SECURE PAYMENTS BY</span>
            <span className="text-xs font-bold text-foreground tracking-widest uppercase">QPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}