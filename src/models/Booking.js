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

// Online payment through QPay (the amount is always the booking's own price)
const BookingPaymentSchema = new mongoose.Schema(
  {
    method: { type: String, default: 'qpay' },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    invoiceId: { type: String },
    qrText: { type: String },
    shortUrl: { type: String },
    urls: { type: [{ _id: false, name: String, description: String, logo: String, link: String }], default: undefined },
    paymentId: { type: String },
    paidAmount: { type: Number },
    paidAt: { type: Date },
    checkedAt: { type: Date }, // Last time QPay was asked about this invoice (throttles checks)
    paidLate: { type: Boolean }, // Paid after the 15-min hold ran out — the admin should double-check the slot
    simulated: { type: Boolean }, // Test payment in the QPay sandbox (development only)
  },
  { _id: false }
);

// Tax receipt (eBarimt 3.0), issued through QPay once the payment is received
const BookingEbarimtSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['CITIZEN', 'COMPANY'], default: 'CITIZEN' },
    register: { type: String }, // Company register number (COMPANY only)
    companyName: { type: String }, // From the tax authority's registry, not typed by the customer
    status: { type: String, enum: ['pending', 'issuing', 'issued', 'failed'], default: 'pending' },
    receiptId: { type: String },
    qrData: { type: String },
    lottery: { type: String },
    issuedAt: { type: Date },
    error: { type: String },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true }, // Normalized 8-digit number, for contacting the customer
    // Links the booking to a customer account. Email is verified at login, so history and
    // Loyalty Member progress are matched by userId/email — never by the (unverified) phone.
    customerEmail: { type: String, trim: true, lowercase: true },
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
    // AwaitingPayment: online booking holding its slot until holdUntil while the customer pays.
    // Once paid it becomes Pending (the admin's usual flow); unpaid holds turn Expired.
    status: {
      type: String,
      enum: ['AwaitingPayment', 'Pending', 'Confirmed', 'Paid', 'Completed', 'Cancelled', 'Expired'],
      default: 'Pending',
    },
    holdUntil: { type: Date },
    payment: { type: BookingPaymentSchema, default: undefined },
    ebarimt: { type: BookingEbarimtSchema, default: undefined },
  },
  { timestamps: true }
);

// Speeds up the per-day availability lookups
BookingSchema.index({ date: 1, status: 1 });
// Customer history / Loyalty Member lookups
BookingSchema.index({ customerEmail: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ customerPhone: 1 });
BookingSchema.index({ status: 1, holdUntil: 1 });

// Re-register on reload so schema edits apply in `next dev`
// (reusing mongoose.models.Booking kept the old schema that required staffId/staffName)
if (mongoose.models.Booking) mongoose.deleteModel('Booking');

export default mongoose.model('Booking', BookingSchema);