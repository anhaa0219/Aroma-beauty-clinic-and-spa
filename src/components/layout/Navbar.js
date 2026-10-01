'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Crown, Menu, UserRound, X } from 'lucide-react';
import useCustomer from '@/hooks/useCustomer';
import BrandLogo from '@/components/layout/BrandLogo';

const NAV_LINKS = [
  { name: 'Treatments', path: '/services' },
  { name: 'SoCheck', path: '/socheck' },
  { name: 'Clinic', path: '/clinic' },
  { name: 'Our Team', path: '/staff' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

// Login link for guests, account link (with Loyalty Member crown) for logged-in customers
function AccountLink({ customer, onClick, className = '' }) {
  if (customer.status === 'loading') {
    return <span className={`h-10 w-28 rounded-full bg-muted/60 animate-pulse ${className}`} />;
  }
  if (customer.status !== 'customer') {
    return (
      <Link
        href="/login"
        onClick={onClick}
        className={`h-10 inline-flex items-center justify-center gap-2 px-4 rounded-full text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 whitespace-nowrap transition-colors ${className}`}
      >
        <UserRound className="w-4 h-4" /> Нэвтрэх
      </Link>
    );
  }
  const { user, loyalty } = customer;
  return (
    <Link
      href="/account"
      onClick={onClick}
      className={`h-10 inline-flex items-center justify-center gap-2 pl-1.5 pr-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
        loyalty?.isMember
          ? 'bg-linear-to-r from-amber-100 to-amber-50 text-amber-900 border border-amber-300'
          : 'bg-muted text-foreground border border-border hover:border-primary/40'
      } ${className}`}
    >
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          loyalty?.isMember ? 'bg-amber-400 text-white' : 'bg-primary text-primary-foreground'
        }`}
      >
        {loyalty?.isMember ? <Crown className="w-4 h-4" /> : <UserRound className="w-4 h-4" />}
      </span>
      {loyalty?.isMember ? (
        <span className="leading-none text-left">
          <span className="block text-[13px] font-bold">Loyalty Member</span>
          <span className="block text-[10px] font-medium opacity-75 mt-0.5">{loyalty.daysLeft} хоног үлдсэн</span>
        </span>
      ) : (
        <span className="truncate max-w-36">{user.name || 'Миний бүртгэл'}</span>
      )}
    </Link>
  );
}

function BookNowButton({ onClick, className = '' }) {
  return (
    <Link
      href="/booking"
      onClick={onClick}
      className={`group relative overflow-hidden h-10 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all whitespace-nowrap ${className}`}
    >
      <span className="relative z-10">Book Now</span>
      <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      {/* Shiny sweep */}
      <span className="absolute inset-0 translate-x-[-150%] bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const customer = useCustomer();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto h-16 md:h-20 px-4 md:px-8 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
          <BrandLogo variant="light" priority className="h-12 md:h-16" />
        </Link>

        {/* --- DESKTOP LINKS --- */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`h-10 inline-flex items-center px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.path)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground/75 hover:text-primary hover:bg-primary/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* --- DESKTOP ACTIONS --- */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <AccountLink customer={customer} />
          <BookNowButton />
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button
          className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-xl px-4 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={closeMenu}
                className={`flex items-center justify-center h-12 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground/90 hover:bg-muted hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
            <AccountLink customer={customer} onClick={closeMenu} className="w-full h-12" />
            <BookNowButton onClick={closeMenu} className="w-full h-12 text-base" />
          </div>
        </div>
      )}
    </nav>
  );
}
