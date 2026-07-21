import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    xp: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    displayName: { type: String, default: '' },
  },
  { timestamps: true }
);

leaderboardSchema.index({ xp: -1 });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
