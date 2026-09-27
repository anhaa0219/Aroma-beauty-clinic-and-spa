'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to control which bookings are visible. Defaults to showing only active ones.
  const [filter, setFilter] = useState('Active'); 

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
        setBookings(bookings.map(b => b.orderId === orderId ? { ...b, status: newStatus } : b));
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  // NEW: Filter the bookings array before we draw the table
  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'Active') return booking.status === 'Confirmed';
    if (filter === 'Completed') return booking.status === 'Completed';
    if (filter === 'Cancelled') return booking.status === 'Cancelled';
    return true; // 'All' shows everything
  });

  if (loading) return <div className="p-10 text-center text-primary">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 text-foreground">
      
      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Aroma Spa Admin</h1>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-muted-foreground">Show:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-border bg-card text-foreground rounded-md p-2 outline-none focus:ring-2 focus:ring-primary shadow-sm"
          >
            <option value="Active">Active (Confirmed)</option>
            <option value="Completed">Completed History</option>
            <option value="Cancelled">Cancelled</option>
            <option value="All">All Appointments</option>
          </select>
        </div>
      </div>
      
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
            {/* We map over filteredBookings instead of all bookings */}
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-muted-foreground">
                  No {filter.toLowerCase()} bookings found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
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
                      booking.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm space-x-2">
                    {booking.status === 'Confirmed' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(booking.orderId, 'Completed')}
                          className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900 transition-colors"
                        >
                          Complete
                        </button>
                        <button 
                          onClick={() => updateStatus(booking.orderId, 'Cancelled')}
                          className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:hover:bg-red-900 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {booking.status === 'Cancelled' && (
                      <button 
                        onClick={() => updateStatus(booking.orderId, 'Confirmed')}
                        className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900 transition-colors"
                      >
                        Restore
                      </button>
                    )}

                    {booking.status === 'Completed' && (
                      <span className="text-muted-foreground italic text-xs ml-2">Finished ✓</span>
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