import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
