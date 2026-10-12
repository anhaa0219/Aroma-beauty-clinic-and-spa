import mongoose from 'mongoose';

// A counter for one rate-limit window, e.g. "login-ip:<hash>:<window>". Stored in MongoDB because
// serverless instances don't share memory. Expired windows are deleted automatically.
const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.RateLimit) mongoose.deleteModel('RateLimit');

export default mongoose.model('RateLimit', RateLimitSchema);
