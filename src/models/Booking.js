import mongoose from 'mongoose';

// One treatment line of a group order; each unit of quantity takes one worker
const BookingItemSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// A team member (staffList in lib/data.js) who performed the treatment
const BookingWorkerSchema = new mongoose.Schema(
  {
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true }, // Normalized 8-digit number; links bookings to the customer's account and Loyalty Member progress
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Set when booked by a logged-in customer
    source: { type: String, enum: ['online', 'phone', 'walk-in'], default: 'online' },
    note: { type: String, trim: true },
    items: { type: [BookingItemSchema], default: undefined },
    people: { type: Number, default: 1 }, // Workers needed = number of treatments booked
    serviceId: { type: String }, // First item's service (kept for older code/bookings)
    serviceName: { type: String, required: true }, // Summary, e.g. "Jasmin Spa ×2, Facial"
    // Legacy single specialist (older bookings). Capacity is pooled across all workers.
    staffId: { type: String },
    staffName: { type: String },
    // Who actually did the job — chosen by the admin when marking the booking Completed
    workers: { type: [BookingWorkerSchema], default: undefined },
    completedAt: { type: Date },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Start, format: HH:MM
    endTime: { type: String }, // Format: HH:MM (time + durationMinutes)
    durationMinutes: { type: Number }, // Longest treatment in the order
    price: { type: Number, required: true }, // Order total
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Paid', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Speeds up the per-day availability lookups
BookingSchema.index({ date: 1, status: 1 });
// Customer history / Loyalty Member lookups
BookingSchema.index({ customerPhone: 1 });

// Re-register on reload so schema edits apply in `next dev`
// (reusing mongoose.models.Booking kept the old schema that required staffId/staffName)
if (mongoose.models.Booking) mongoose.deleteModel('Booking');

export default mongoose.model('Booking', BookingSchema);