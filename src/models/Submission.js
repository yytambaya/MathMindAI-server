import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    solution: { type: String, default: '' },
    answers: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      answer: String,
      isCorrect: Boolean,
    }],
    aiScore: { type: Number, default: 0 },
    aiFeedback: { type: String, default: '' },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    graded: { type: Boolean, default: false },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', submissionSchema);
