import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    hint: { type: String, required: true },
    points: { type: Number, default: 10 },
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1, difficulty: 1 });

export const Question = mongoose.model('Question', questionSchema);
