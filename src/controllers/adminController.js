import {
  User, Question, Lesson, ChatHistory, Assignment,
} from '../models/index.js';
import { getPlatformAnalytics } from '../services/analyticsService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash -refreshToken').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(isActive !== undefined && { isActive }), ...(role && { role }) },
    { new: true }
  ).select('-passwordHash -refreshToken');
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'User deactivated' });
});

export const getQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;

  const questions = await Question.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await Question.countDocuments(filter);
  res.json({ success: true, data: { questions, total, page: parseInt(page) } });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!question) throw new AppError('Question not found', 404);
  res.json({ success: true, data: question });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Question deleted' });
});

export const getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find().sort({ category: 1, order: 1 });
  res.json({ success: true, data: lessons });
});

export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.create(req.body);
  res.status(201).json({ success: true, data: lesson });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const history = await ChatHistory.find({ flagged: req.query.flagged === 'true' })
    .populate('studentId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: history });
});

export const moderateChat = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (action === 'delete') {
    await ChatHistory.findByIdAndDelete(req.params.id);
  } else if (action === 'flag') {
    await ChatHistory.findByIdAndUpdate(req.params.id, { flagged: true });
  }
  res.json({ success: true, message: `Chat ${action}d` });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await getPlatformAnalytics();
  res.json({ success: true, data });
});
