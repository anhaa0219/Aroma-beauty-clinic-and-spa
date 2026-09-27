import { salonInfo } from "@/lib/data";

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-5xl mx-auto text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-primary">
        Contact & Location
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* Salon Details Card */}
        <div className="border border-border bg-card p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-6">Salon Information</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-1">📍 Location</h3>
              <p className="text-muted-foreground">{salonInfo.details.location}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">📞 Booking Phone</h3>
              <p className="text-muted-foreground">{salonInfo.details.bookingPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">⏰ Working Hours</h3>
              <p className="text-muted-foreground">{salonInfo.details.workingHours}</p>
            </div>
          </div>
        </div>

        {/* Management / Owner Details Card */}
        <div className="border border-border bg-card p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-6">Management</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-1">👤 Owner</h3>
              <p className="text-muted-foreground">
                {salonInfo.owner.lastName} {salonInfo.owner.firstName}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">📱 Phone</h3>
              <p className="text-muted-foreground">{salonInfo.owner.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">✉️ Email</h3>
              <p className="text-muted-foreground">{salonInfo.owner.email}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}