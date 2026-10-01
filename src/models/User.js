import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // Normalized 8-digit Mongolian number
    name: { type: String, trim: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Re-register on reload so schema edits apply in `next dev`
if (mongoose.models.User) mongoose.deleteModel('User');

export default mongoose.model('User', UserSchema);
