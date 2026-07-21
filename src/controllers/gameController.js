import { MathGame } from '../models/index.js';
import { generateMathGame } from '../services/geminiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createGame = asyncHandler(async (req, res) => {
  const { age, topic, difficulty, theme } = req.body;
  const generatedContent = await generateMathGame({ age, topic, difficulty, theme });

  const game = await MathGame.create({
    parentId: req.user._id,
    config: { age, topic, difficulty, theme },
    generatedContent,
  });

  res.status(201).json({ success: true, data: game });
});

export const getGames = asyncHandler(async (req, res) => {
  const games = await MathGame.find({ parentId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: games });
});

export const getGame = asyncHandler(async (req, res) => {
  const game = await MathGame.findOne({ _id: req.params.id, parentId: req.user._id });
  if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
  res.json({ success: true, data: game });
});
