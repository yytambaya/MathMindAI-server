import { Question, StudentProfile, Progress, Lesson } from '../models/index.js';
import { CURRICULUM } from '../config/constants.js';
import { updateMastery, getAdaptiveDifficulty, getRecommendations } from '../services/masteryService.js';
import { awardXP, updateStreak, checkAndAwardBadges } from '../services/gamificationService.js';
import { startOfDay } from '../utils/helpers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getTopics = asyncHandler(async (req, res) => {
  res.json({ success: true, data: CURRICULUM });
});

export const getQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, limit = 10 } = req.query;
  const studentId = req.user?._id;

  let effectiveDifficulty = difficulty || 'Medium';
  let needsHints = false;

  if (studentId && topic) {
    const adaptive = await getAdaptiveDifficulty(studentId, topic, difficulty);
    effectiveDifficulty = adaptive.difficulty;
    needsHints = adaptive.needsHints;
  }

  const filter = {};
  if (topic) filter.topic = topic;
  if (effectiveDifficulty) filter.difficulty = effectiveDifficulty;

  const sampleSize = Math.min(parseInt(limit), 20);
  let questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: sampleSize } },
  ]);

  if (questions.length === 0 && filter.difficulty) {
    const fallbackFilter = { ...filter };
    delete fallbackFilter.difficulty;
    questions = await Question.aggregate([
      { $match: fallbackFilter },
      { $sample: { size: sampleSize } },
    ]);
  }

  const sanitized = questions.map((q) => ({
    _id: q._id,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    hint: needsHints ? q.hint : undefined,
    points: q.points,
  }));

  res.json({ success: true, data: { questions: sanitized, needsHints, effectiveDifficulty } });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, answer, timeSpent = 0 } = req.body;
  const studentId = req.user._id;

  const question = await Question.findById(questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

  const isCorrect = answer === question.correctAnswer;

  const profile = await StudentProfile.findOne({ userId: studentId });
  profile.totalAttempts += 1;
  if (isCorrect) profile.correctAnswers += 1;
  await profile.save();

  const mastery = await updateMastery(studentId, question.category, question.topic, isCorrect, timeSpent);

  const today = startOfDay();
  await Progress.findOneAndUpdate(
    { studentId, date: today, period: 'daily' },
    { $inc: { questionsAttempted: 1, questionsCorrect: isCorrect ? 1 : 0 } },
    { upsert: true }
  );

  let xpResult = null;
  let newBadges = [];

  if (isCorrect) {
    xpResult = await awardXP(studentId, question.difficulty, 'practice', questionId, req.io);
    await updateStreak(studentId);
    newBadges = await checkAndAwardBadges(studentId, req.io);
  }

  res.json({
    success: true,
    data: {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: !isCorrect ? question.hint : undefined,
      xpEarned: xpResult?.earned || 0,
      totalXp: xpResult?.xp || profile.xp,
      level: xpResult?.level || profile.level,
      mastery: mastery.masteryPercent,
      newBadges,
    },
  });
});

export const getRecommendationsHandler = asyncHandler(async (req, res) => {
  const data = await getRecommendations(req.user._id);
  res.json({ success: true, data });
});

export const getLessons = asyncHandler(async (req, res) => {
  const { category, topic } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (topic) filter.topic = topic;

  const lessons = await Lesson.find(filter).sort({ category: 1, order: 1 });

  let completedIds = [];
  if (req.user) {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    completedIds = profile?.completedLessonIds?.map((id) => id.toString()) || [];
  }

  const data = lessons.map((lesson) => ({
    ...lesson.toObject(),
    completed: completedIds.includes(lesson._id.toString()),
  }));

  res.json({ success: true, data });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

  let completed = false;
  if (req.user) {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    completed = profile?.completedLessonIds?.some((id) => id.toString() === lesson._id.toString()) || false;
  }

  res.json({ success: true, data: { ...lesson.toObject(), completed } });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

  const profile = await StudentProfile.findOne({ userId: studentId });
  const alreadyDone = profile.completedLessonIds?.some((id) => id.toString() === lesson._id.toString());

  if (!alreadyDone) {
    profile.completedLessonIds = profile.completedLessonIds || [];
    profile.completedLessonIds.push(lesson._id);
    profile.lessonsCompleted += 1;
    await profile.save();

    const today = startOfDay();
    await Progress.findOneAndUpdate(
      { studentId, date: today, period: 'daily' },
      { $inc: { lessonsCompleted: 1 } },
      { upsert: true }
    );
    await updateStreak(studentId);
  }

  res.json({
    success: true,
    data: { lessonsCompleted: profile.lessonsCompleted, xpBonus: 0 },
  });
});
