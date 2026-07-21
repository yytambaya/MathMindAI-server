import {
  StudentProfile, Mastery, Progress, XPTransaction, Submission, Assignment, User,
} from '../models/index.js';
import { startOfDay, startOfWeek, startOfMonth } from '../utils/helpers.js';

export async function getStudentAnalytics(studentId) {
  const profile = await StudentProfile.findOne({ userId: studentId });
  const masteries = await Mastery.find({ studentId });
  const xpHistory = await XPTransaction.find({ studentId }).sort({ createdAt: -1 }).limit(30);

  const today = startOfDay();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();

  const [dailyProgress, weeklyProgress, monthlyProgress] = await Promise.all([
    Progress.find({ studentId, period: 'daily', date: { $gte: weekStart } }).sort({ date: 1 }),
    Progress.aggregate([
      { $match: { studentId, period: 'daily', date: { $gte: monthStart } } },
      { $group: { _id: { $week: '$date' }, xpEarned: { $sum: '$xpEarned' }, questionsAttempted: { $sum: '$questionsAttempted' } } },
    ]),
    Progress.aggregate([
      { $match: { studentId, period: 'daily' } },
      { $group: { _id: { $month: '$date' }, xpEarned: { $sum: '$xpEarned' }, questionsAttempted: { $sum: '$questionsAttempted' } } },
    ]),
  ]);

  return {
    profile: {
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      streak: profile?.streak || 0,
      accuracy: profile?.totalAttempts ? Math.round((profile.correctAnswers / profile.totalAttempts) * 100) : 0,
    },
    mastery: masteries,
    xpGrowth: xpHistory.map((t) => ({ date: t.createdAt, amount: t.amount })),
    dailyProgress,
    weeklyProgress,
    monthlyProgress,
    completionRate: profile?.totalAttempts
      ? Math.round((profile.correctAnswers / profile.totalAttempts) * 100)
      : 0,
  };
}

export async function getTeacherAnalytics(teacherId) {
  const assignments = await Assignment.find({ teacherId });
  const assignmentIds = assignments.map((a) => a._id);

  const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
    .populate('studentId', 'firstName lastName');

  const studentScores = {};
  const topicScores = {};

  for (const sub of submissions) {
    const sid = sub.studentId?._id?.toString();
    if (sid) {
      if (!studentScores[sid]) studentScores[sid] = { name: `${sub.studentId.firstName} ${sub.studentId.lastName}`, scores: [], total: 0, count: 0 };
      studentScores[sid].scores.push(sub.score);
      studentScores[sid].total += sub.score;
      studentScores[sid].count += 1;
    }
  }

  for (const assignment of assignments) {
    const subs = submissions.filter((s) => s.assignmentId.toString() === assignment._id.toString());
    const avg = subs.length ? subs.reduce((a, s) => a + s.score, 0) / subs.length : 0;
    topicScores[assignment.topic] = topicScores[assignment.topic] || { scores: [], total: 0, count: 0 };
    topicScores[assignment.topic].scores.push(avg);
    topicScores[assignment.topic].total += avg;
    topicScores[assignment.topic].count += 1;
  }

  const studentRanking = Object.values(studentScores)
    .map((s) => ({ name: s.name, averageScore: s.count ? Math.round(s.total / s.count) : 0 }))
    .sort((a, b) => b.averageScore - a.averageScore);

  const weakTopics = Object.entries(topicScores)
    .map(([topic, data]) => ({ topic, averageScore: data.count ? Math.round(data.total / data.count) : 0 }))
    .sort((a, b) => a.averageScore - b.averageScore);

  const heatmap = [];
  for (const assignment of assignments) {
    const subs = submissions.filter((s) => s.assignmentId.toString() === assignment._id.toString());
    for (const sub of subs) {
      heatmap.push({
        student: `${sub.studentId?.firstName} ${sub.studentId?.lastName}`,
        topic: assignment.topic,
        score: sub.score,
      });
    }
  }

  return {
    studentCount: Object.keys(studentScores).length,
    assignmentCount: assignments.length,
    averageScores: Object.entries(topicScores).map(([topic, d]) => ({
      topic,
      average: d.count ? Math.round(d.total / d.count) : 0,
    })),
    weakTopics,
    studentRanking,
    heatmap,
  };
}

export async function getPlatformAnalytics() {
  const [userCount, studentCount, questionCount, assignmentCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    (await import('../models/Question.js')).Question.countDocuments(),
    Assignment.countDocuments(),
  ]);

  return { userCount, studentCount, questionCount, assignmentCount };
}
