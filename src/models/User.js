import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Login identity (verified by email code)
    name: { type: String, trim: true },
    // Saved once by the customer in their profile, then locked. One account per phone.
    phone: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Unique only among accounts that have set a phone
UserSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });

// Re-register on reload so schema edits apply in `next dev`
if (mongoose.models.User) mongoose.deleteModel('User');

export default mongoose.model('User', UserSchema);
