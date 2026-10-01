import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock, Mail, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { salonInfo } from '@/lib/data';
import BrandLogo from '@/components/layout/BrandLogo';

const QUICK_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Treatments', path: '/services' },
  { name: 'SoCheck', path: '/socheck' },
  { name: 'Clinic', path: '/clinic' },
  { name: 'Our Team', path: '/staff' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const ACCOUNT_LINKS = [
  { name: 'Цаг захиалах', path: '/booking' },
  { name: 'Миний бүртгэл', path: '/account' },
  { name: 'Loyalty Member', path: '/account' },
];

function ColumnTitle({ children }) {
  return (
    <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-amber-300 mb-5">
      <span className="w-4 h-px bg-amber-300/70" />
      {children}
    </h4>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
    >
      {children}
      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </Link>
  );
}

export default function Footer() {
  const { details, owner } = salonInfo;
  const telHref = `tel:${details.bookingPhone.replace(/\D/g, '')}`;

  return (
    <footer className="relative mt-auto overflow-hidden bg-linear-to-b from-[#004a58] to-[#00303a] text-white">
      {/* Decorative glows + watermark */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-teal-300/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-amber-300/10 blur-3xl" />
      <p
        aria-hidden
        className="pointer-events-none select-none absolute -bottom-6 md:-bottom-12 left-1/2 -translate-x-1/2 text-[22vw] md:text-[16rem] font-extrabold leading-none tracking-tighter text-white/[0.03] whitespace-nowrap"
      >
        AROMA
      </p>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-8">
        {/* --- CTA --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-6 md:p-10 mb-14 md:mb-20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="w-4 h-4" /> Aroma Beauty Clinic & Spa
            </p>
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-3">Өөртөө цаг гаргаарай</h3>
            <p className="text-white/70 mt-2 max-w-xl">
              Онлайнаар хэдхэн алхмаар цагаа захиалж, үйлчилгээ бүрээрээ Loyalty Member болоход ойртоорой.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/booking"
              className="group h-12 inline-flex items-center justify-center gap-2 px-7 rounded-full bg-white text-primary font-extrabold shadow-xl shadow-black/20 hover:-translate-y-0.5 transition-transform"
            >
              Цаг захиалах
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href={telHref}
              className="h-12 inline-flex items-center justify-center gap-2 px-6 rounded-full border border-white/30 text-white font-bold hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" /> {details.bookingPhone}
            </a>
          </div>
        </div>

        {/* --- COLUMNS --- */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-12 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-12 lg:col-span-4">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo variant="dark" className="h-28 md:h-32" />
            </Link>
            <p className="text-white/65 leading-relaxed text-sm mt-6 max-w-sm">
              Experience advanced aesthetic treatments and ultimate relaxation in the heart of Ulaanbaatar. Your
              sanctuary for premium marine-based wellness.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-4 lg:col-span-2">
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <FooterLink href={link.path}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-3 lg:col-span-2">
            <ColumnTitle>Захиалга</ColumnTitle>
            <ul className="space-y-3">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.path}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & hours */}
          <div className="col-span-2 md:col-span-5 lg:col-span-4">
            <ColumnTitle>Contact & Visit</ColumnTitle>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-amber-300" />
                </span>
                <span className="text-sm text-white/80 leading-relaxed pt-1.5">{details.location}</span>
              </li>
              <li className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={telHref}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3 hover:bg-white/10 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-amber-300" />
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{details.bookingPhone}</span>
                </a>
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-300" />
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block text-[11px] text-white/50">Өдөр бүр</span>
                    <span className="font-semibold tabular-nums">{details.workingHours}</span>
                  </span>
                </div>
              </li>
              <li>
                <a
                  href={`mailto:${owner.email}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.05] border border-white/10 p-3 hover:bg-white/10 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-amber-300" />
                  </span>
                  <span className="text-sm text-white/80 truncate">{owner.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50 tracking-wide text-center md:text-left">
            &copy; {new Date().getFullYear()} Aroma Beauty Clinic & Spa. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-2 h-8 px-4 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Secure payments by <b className="text-white tracking-widest">QPAY</b>
          </span>
        </div>
      </div>
    </footer>
  );
}
