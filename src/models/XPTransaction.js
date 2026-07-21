import mongoose from 'mongoose';

const xpTransactionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    source: { type: String, enum: ['practice', 'assignment', 'bonus', 'streak'], required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const XPTransaction = mongoose.model('XPTransaction', xpTransactionSchema);
