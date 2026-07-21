import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    badges: [{ type: String }],
    lessonsCompleted: { type: Number, default: 0 },
    completedLessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    assignmentsCompleted: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    linkedParentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
