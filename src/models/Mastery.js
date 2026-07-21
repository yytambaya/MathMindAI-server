import mongoose from 'mongoose';

const masterySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    topic: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    masteryPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

masterySchema.index({ studentId: 1, topic: 1 }, { unique: true });

export const Mastery = mongoose.model('Mastery', masterySchema);
