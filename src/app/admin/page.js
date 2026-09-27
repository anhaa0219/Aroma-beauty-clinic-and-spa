'use client';

import { useRouter } from 'next/navigation';

// Dummy data for the MVP so the owner can see how it will look
const mockBookings = [
  { id: "ORD-001", customer: "Nomin-Erdene", phone: "99887766", service: "Эмэгтэй үс тайралт", staff: "Anu", date: "2026-09-28", time: "10:00", status: "Paid" },
  { id: "ORD-002", customer: "Khulan", phone: "88990011", service: "Энгийн маникюр", staff: "Saraa", date: "2026-09-28", time: "13:30", status: "Pending" },
  { id: "ORD-003", customer: "Gerel", phone: "77665544", service: "Бүтэн биеийн массаж", staff: "Saraa", date: "2026-09-29", time: "15:00", status: "Paid" },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/20 p-8 text-foreground">
      
      {/* Admin Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Salon Admin</h1>
          <p className="text-muted-foreground mt-1">Manage your daily appointments</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 border border-border bg-card rounded-md text-sm font-medium hover:bg-muted transition-colors"
        >
          View Live Website
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-sm">
          {/* FIXED: Used &apos; instead of an apostrophe */}
          <p className="text-sm font-medium opacity-90">Today&apos;s Appointments</p>
          <p className="text-4xl font-extrabold mt-2">12</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
          <p className="text-4xl font-extrabold text-primary mt-2">3</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Revenue (Today)</p>
          <p className="text-4xl font-extrabold text-primary mt-2">₮450,000</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="max-w-6xl mx-auto bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/10">
          <h2 className="text-lg font-bold text-primary">Upcoming Bookings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Order ID</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Service</th>
                <th className="px-6 py-3 font-semibold">Staff</th>
                {/* FIXED: Used &amp; instead of & */}
                <th className="px-6 py-3 font-semibold">Date &amp; Time</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{booking.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{booking.customer}</p>
                    <p className="text-xs text-muted-foreground">{booking.phone}</p>
                  </td>
                  <td className="px-6 py-4">{booking.service}</td>
                  <td className="px-6 py-4">{booking.staff}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{booking.date}</p>
                    <p className="text-xs text-muted-foreground">{booking.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'Paid' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}