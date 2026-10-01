import mongoose from 'mongoose';

// One-time SMS login code. Only a hash of the code is stored.
const OtpCodeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB deletes expired codes automatically
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.OtpCode) mongoose.deleteModel('OtpCode');

export default mongoose.model('OtpCode', OtpCodeSchema);
