'use client';

import { staffList } from "@/lib/data";
import { useRouter } from 'next/navigation';

export default function StaffPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-6xl mx-auto text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary">Meet Our Team</h1>
      
      {/* Changed to 1 column (flex-col) to give the portfolio room */}
      <div className="flex flex-col gap-10 w-full max-w-4xl">
        {staffList.map((staff) => (
          <div 
            key={staff.id} 
            className="border border-border bg-card text-card-foreground rounded-lg p-6 md:p-8 shadow-sm flex flex-col"
          >
            {/* Top Section: Staff Info */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className="w-24 h-24 bg-muted rounded-full flex-shrink-0 flex items-center justify-center text-muted-foreground text-sm shadow-inner">
                Photo
              </div>
              
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-primary">{staff.firstName} {staff.lastName}</h2>
                <p className="text-foreground font-medium mb-2">{staff.role}</p>
                <div className="flex flex-col md:flex-row md:gap-4">
                  <p className="text-sm text-muted-foreground mb-1">📞 {staff.phone}</p>
                  <p className="text-sm text-muted-foreground">✉️ {staff.email}</p>
                </div>
              </div>

              {/* Book Button (Hidden on tiny mobile screens, shows on bottom instead) */}
              <button 
                onClick={() => router.push(`/booking?staffId=${staff.id}`)}
                className="hidden md:block bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Book {staff.firstName}
              </button>
            </div>

            {/* Bottom Section: Portfolio Gallery */}
            <div>
              <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">
                Portfolio & Work
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {staff.portfolio.map((img, index) => (
                  // Right now these are grey placeholder boxes. 
                  // Later, you can swap the <div> for an <img src={img} /> tag.
                  <div 
                    key={index} 
                    className="aspect-square bg-muted rounded-md flex items-center justify-center border border-border shadow-sm"
                  >
                    <span className="text-xs text-muted-foreground font-medium">Work {index + 1}</span>
                  </div>
                ))}
              </div>

              {/* Mobile-only Book Button (Shows under portfolio on small screens) */}
              <button 
                onClick={() => router.push(`/booking?staffId=${staff.id}`)}
                className="mt-6 w-full md:hidden bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Book {staff.firstName}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}