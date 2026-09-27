import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Paid', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Prevent double-booking for the same staff member on active appointments
BookingSchema.index(
  { staffId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'Cancelled' } },
  }
);

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);