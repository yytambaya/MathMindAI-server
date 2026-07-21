import { getGamificationStats, getLeaderboard } from '../services/gamificationService.js';
import { getStudentAnalytics, getTeacherAnalytics } from '../services/analyticsService.js';
import { getStudentMastery } from '../services/masteryService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const data = await getGamificationStats(req.user._id);
  res.json({ success: true, data });
});

export const getLeaderboardHandler = asyncHandler(async (req, res) => {
  const data = await getLeaderboard(parseInt(req.query.limit) || 20);
  res.json({ success: true, data });
});

export const getProgress = asyncHandler(async (req, res) => {
  const data = await getStudentAnalytics(req.user._id);
  res.json({ success: true, data });
});

export const getMastery = asyncHandler(async (req, res) => {
  const data = await getStudentMastery(req.user._id);
  res.json({ success: true, data });
});

export const getTeacherStats = asyncHandler(async (req, res) => {
  const data = await getTeacherAnalytics(req.user._id);
  res.json({ success: true, data });
});
