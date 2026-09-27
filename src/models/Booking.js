import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  staffId: { type: String, required: true },
  staffName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);