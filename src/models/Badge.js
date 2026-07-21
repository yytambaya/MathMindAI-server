import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏅' },
    criteria: { type: String },
  },
  { timestamps: true }
);

export const Badge = mongoose.model('Badge', badgeSchema);
