import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
