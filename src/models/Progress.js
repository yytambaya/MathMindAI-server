import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    xpEarned: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    timeSpentMinutes: { type: Number, default: 0 },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  },
  { timestamps: true }
);

progressSchema.index({ studentId: 1, date: 1, period: 1 });

export const Progress = mongoose.model('Progress', progressSchema);
