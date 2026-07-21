import { solveWithCalculator } from '../services/geminiService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const solve = asyncHandler(async (req, res) => {
  const { input } = req.body;
  const result = await solveWithCalculator(input);
  res.json({ success: true, data: result });
});
