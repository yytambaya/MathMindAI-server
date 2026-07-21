import {
  User, StudentProfile, ParentProfile, Progress,
} from '../models/index.js';
import { generateWeeklyReport } from '../services/geminiService.js';
import { getStudentAnalytics } from '../services/analyticsService.js';
import { getGamificationStats } from '../services/gamificationService.js';
import { getStudentMastery, getRecommendations, getWeakTopics } from '../services/masteryService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const linkChild = asyncHandler(async (req, res) => {
  const { email, inviteCode } = req.body;

  let student;
  if (inviteCode) {
    const profile = await StudentProfile.findOne({ inviteCode });
    if (!profile) throw new AppError('Invalid invite code', 404);
    student = await User.findById(profile.userId);
  } else if (email) {
    student = await User.findOne({ email, role: 'student' });
  }

  if (!student) throw new AppError('Student not found', 404);

  const parentProfile = await ParentProfile.findOne({ userId: req.user._id });
  if (!parentProfile.children.includes(student._id)) {
    parentProfile.children.push(student._id);
    await parentProfile.save();
  }

  const studentProfile = await StudentProfile.findOne({ userId: student._id });
  if (!studentProfile.linkedParentIds.includes(req.user._id)) {
    studentProfile.linkedParentIds.push(req.user._id);
    await studentProfile.save();
  }

  res.json({ success: true, data: { child: { id: student._id, firstName: student.firstName, lastName: student.lastName } } });
});

export const getChildren = asyncHandler(async (req, res) => {
  const parentProfile = await ParentProfile.findOne({ userId: req.user._id }).populate('children', 'firstName lastName email');
  res.json({ success: true, data: parentProfile?.children || [] });
});

export const getChildProgress = asyncHandler(async (req, res) => {
  const childId = req.params.id;
  const parentProfile = await ParentProfile.findOne({ userId: req.user._id });
  if (!parentProfile?.children.some((c) => c.toString() === childId)) {
    throw new AppError('Child not linked', 403);
  }

  const [analytics, gamification, mastery, recommendations, weakAreas] = await Promise.all([
    getStudentAnalytics(childId),
    getGamificationStats(childId),
    getStudentMastery(childId),
    getRecommendations(childId),
    getWeakTopics(childId, 5),
  ]);

  res.json({
    success: true,
    data: {
      ...gamification,
      analytics,
      mastery,
      recommendations,
      weakAreas: weakAreas.map((m) => ({
        topic: m.topic,
        category: m.category,
        masteryPercent: m.masteryPercent,
      })),
    },
  });
});

export const getWeeklyReport = asyncHandler(async (req, res) => {
  const childId = req.params.id;
  const parentProfile = await ParentProfile.findOne({ userId: req.user._id });
  if (!parentProfile?.children.some((c) => c.toString() === childId)) {
    throw new AppError('Child not linked', 403);
  }

  const child = await User.findById(childId);
  const analytics = await getStudentAnalytics(childId);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weeklyProgress = await Progress.find({
    studentId: childId,
    period: 'daily',
    date: { $gte: weekStart },
  });

  const report = await generateWeeklyReport(
    `${child.firstName} ${child.lastName}`,
    { analytics, weeklyProgress }
  );

  res.json({ success: true, data: { report } });
});
