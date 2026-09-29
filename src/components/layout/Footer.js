'use client';

import { useRouter } from 'next/navigation';
import { salonInfo } from '@/lib/data';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-muted/20 border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Aroma Spa</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experience relaxation and beauty in the heart of Ulaanbaatar. 
              Your sanctuary for premium marine-based treatments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span onClick={() => router.push('/')} className="hover:text-primary transition-colors cursor-pointer">Home</span>
              </li>
              <li>
                <span onClick={() => router.push('/services')} className="hover:text-primary transition-colors cursor-pointer">Services</span>
              </li>
              <li>
                <span onClick={() => router.push('/staff')} className="hover:text-primary transition-colors cursor-pointer">Our Team</span>
              </li>
              <li>
                <span onClick={() => router.push('/contact')} className="hover:text-primary transition-colors cursor-pointer">Contact</span>
              </li>
              <li>
                <span onClick={() => router.push('/socheck')} className="hover:text-primary transition-colors cursor-pointer">SoCheck</span>
              </li>
              <li>
                <span onClick={() => router.push('/clinic')} className="hover:text-primary transition-colors cursor-pointer">Clinic</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>📍</span> 
                <span>{salonInfo.details.location}</span>
              </li>
              <li className="flex gap-2">
                <span>📞</span> 
                <span>{salonInfo.details.bookingPhone}</span>
              </li>
              <li className="flex gap-2">
                <span>✉️</span> 
                <span>{salonInfo.owner.email}</span>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Aroma Spa. All rights reserved.</p>
          <p>Powered by QPay</p>
        </div>
      </div>
    </footer>
  );
}