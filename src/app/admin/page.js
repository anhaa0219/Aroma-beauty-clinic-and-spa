'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bookings on load
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Update the UI immediately
        setBookings(bookings.map(b => b.orderId === orderId ? { ...b, status: newStatus } : b));
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-10 text-center text-primary">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 text-foreground">
      <h1 className="text-3xl font-bold mb-8 text-primary">Aroma Spa Admin</h1>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="p-4 font-semibold text-sm">Order ID</th>
              <th className="p-4 font-semibold text-sm">Client</th>
              <th className="p-4 font-semibold text-sm">Date & Time</th>
              <th className="p-4 font-semibold text-sm">Specialist</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-muted-foreground">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 text-sm font-mono text-muted-foreground">{booking.orderId}</td>
                  <td className="p-4 text-sm">
                    <p className="font-semibold text-foreground">{booking.customerName}</p>
                    <p className="text-muted-foreground text-xs">{booking.customerPhone}</p>
                  </td>
                  <td className="p-4 text-sm">
                    <p className="font-semibold text-foreground">{booking.date}</p>
                    <p className="text-muted-foreground">{booking.time}</p>
                  </td>
                  <td className="p-4 text-sm text-foreground">{booking.staffName}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm space-x-2">
                    {booking.status !== 'Cancelled' && (
                      <button 
                        onClick={() => updateStatus(booking.orderId, 'Cancelled')}
                        className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:hover:bg-red-900 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === 'Cancelled' && (
                      <button 
                        onClick={() => updateStatus(booking.orderId, 'Confirmed')}
                        className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900 transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}