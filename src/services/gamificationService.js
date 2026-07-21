import {
  StudentProfile, XPTransaction, Mastery, Progress, Leaderboard, Notification,
} from '../models/index.js';
import { XP_REWARDS, BADGE_DEFINITIONS } from '../config/constants.js';
import { calculateLevel, isSameDay, isYesterday, startOfDay } from '../utils/helpers.js';

export async function awardXP(studentId, difficulty, source, questionId, io) {
  const amount = XP_REWARDS[difficulty] || 10;
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) return null;

  profile.xp += amount;
  profile.level = calculateLevel(profile.xp);
  await profile.save();

  await XPTransaction.create({ studentId, amount, source, questionId, description: `${source} reward` });

  await Leaderboard.findOneAndUpdate(
    { studentId },
    { xp: profile.xp },
    { upsert: true }
  );

  const today = startOfDay();
  await Progress.findOneAndUpdate(
    { studentId, date: today, period: 'daily' },
    { $inc: { xpEarned: amount } },
    { upsert: true }
  );

  if (io) {
    io.to(studentId.toString()).emit('xp_update', { xp: profile.xp, level: profile.level, earned: amount });
  }

  return { xp: profile.xp, level: profile.level, earned: amount };
}

export async function updateStreak(studentId) {
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) return;

  const today = new Date();
  const lastActivity = profile.lastActivityDate;

  if (lastActivity && isSameDay(lastActivity, today)) return profile.streak;

  if (lastActivity && isYesterday(lastActivity, today)) {
    profile.streak += 1;
  } else {
    profile.streak = 1;
  }

  if (profile.streak > profile.longestStreak) {
    profile.longestStreak = profile.streak;
  }

  profile.lastActivityDate = today;
  await profile.save();
  return profile.streak;
}

export async function checkAndAwardBadges(studentId, io) {
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) return [];

  const newBadges = [];
  const earned = new Set(profile.badges || []);

  const checks = [
    { slug: 'first_win', condition: profile.correctAnswers >= 1 },
    { slug: 'streak_7', condition: profile.streak >= 7 },
    { slug: 'streak_30', condition: profile.streak >= 30 },
    { slug: 'consistency_champion', condition: profile.streak >= 5 },
  ];

  const algebraMasteries = await Mastery.find({ studentId, category: 'Algebra' });
  const geometryMasteries = await Mastery.find({ studentId, category: 'Geometry' });

  if (algebraMasteries.length >= 5 && algebraMasteries.every((m) => m.masteryPercent >= 80)) {
    checks.push({ slug: 'algebra_master', condition: true });
  }
  if (geometryMasteries.length >= 7 && geometryMasteries.every((m) => m.masteryPercent >= 80)) {
    checks.push({ slug: 'geometry_expert', condition: true });
  }

  for (const check of checks) {
    if (check.condition && !earned.has(check.slug)) {
      profile.badges.push(check.slug);
      const badgeDef = BADGE_DEFINITIONS.find((b) => b.slug === check.slug);
      newBadges.push(badgeDef);

      await Notification.create({
        userId: studentId,
        type: 'badge',
        title: 'New Badge Earned!',
        message: `You earned the ${badgeDef?.name || check.slug} badge!`,
        data: { badge: check.slug },
      });

      if (io) {
        io.to(studentId.toString()).emit('badge_earned', { badge: badgeDef });
      }
    }
  }

  if (newBadges.length) await profile.save();
  return newBadges;
}

export async function getLeaderboard(limit = 20) {
  const entries = await Leaderboard.find()
    .sort({ xp: -1 })
    .limit(limit)
    .populate('studentId', 'firstName lastName');

  return entries.map((e, i) => ({
    rank: i + 1,
    studentId: e.studentId?._id,
    displayName: e.displayName || `${e.studentId?.firstName || ''} ${e.studentId?.lastName || ''}`.trim(),
    xp: e.xp,
  }));
}

export async function getGamificationStats(studentId) {
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) return null;

  const accuracy = profile.totalAttempts > 0
    ? Math.round((profile.correctAnswers / profile.totalAttempts) * 100)
    : 0;

  const badges = BADGE_DEFINITIONS.filter((b) => profile.badges?.includes(b.slug));
  const allBadges = BADGE_DEFINITIONS.map((b) => ({
    ...b,
    earned: profile.badges?.includes(b.slug) || false,
  }));

  const masteries = await Mastery.find({ studentId });
  const currentMastery = masteries.length
    ? Math.round(masteries.reduce((sum, m) => sum + m.masteryPercent, 0) / masteries.length)
    : 0;

  return {
    xp: profile.xp,
    level: profile.level,
    streak: profile.streak,
    longestStreak: profile.longestStreak,
    badges,
    allBadges,
    lessonsCompleted: profile.lessonsCompleted,
    assignmentsCompleted: profile.assignmentsCompleted,
    accuracy,
    currentMastery,
    totalAttempts: profile.totalAttempts,
    correctAnswers: profile.correctAnswers,
  };
}
