import mongoose from 'mongoose';

const mathGameSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    config: {
      age: { type: Number, required: true },
      topic: { type: String, required: true },
      difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
      theme: { type: String, required: true },
    },
    generatedContent: {
      gameTitle: String,
      rules: String,
      boardLayout: String,
      activities: [String],
      rewards: [String],
    },
  },
  { timestamps: true }
);

export const MathGame = mongoose.model('MathGame', mathGameSchema);
