import { Mastery } from '../models/Mastery.js';
import { calculateMasteryPercent, getDifficultyAdjustment, adjustDifficulty } from '../utils/helpers.js';

export async function updateMastery(studentId, category, topic, isCorrect, timeSpent = 0) {
  let mastery = await Mastery.findOne({ studentId, topic });
  if (!mastery) {
    mastery = new Mastery({ studentId, category, topic });
  }

  mastery.attempts += 1;
  if (isCorrect) mastery.correctAnswers += 1;
  else mastery.wrongAnswers += 1;

  mastery.averageTime = mastery.attempts === 1
    ? timeSpent
    : (mastery.averageTime * (mastery.attempts - 1) + timeSpent) / mastery.attempts;

  mastery.masteryPercent = calculateMasteryPercent(mastery.correctAnswers, mastery.attempts);
  mastery.confidenceScore = Math.min(100, mastery.masteryPercent + (mastery.streak || 0) * 5);

  await mastery.save();
  return mastery;
}

export async function getAdaptiveDifficulty(studentId, topic, requestedDifficulty) {
  const mastery = await Mastery.findOne({ studentId, topic });
  if (!mastery) return { difficulty: requestedDifficulty || 'Easy', needsHints: false };

  const adjustment = getDifficultyAdjustment(mastery.masteryPercent);
  const difficulty = adjustDifficulty(requestedDifficulty || 'Medium', adjustment);

  return {
    difficulty,
    needsHints: mastery.masteryPercent < 50,
    masteryPercent: mastery.masteryPercent,
  };
}

export async function getWeakTopics(studentId, limit = 5) {
  return Mastery.find({ studentId })
    .sort({ masteryPercent: 1 })
    .limit(limit);
}

export async function getStudentMastery(studentId) {
  return Mastery.find({ studentId }).sort({ category: 1, topic: 1 });
}

export async function getRecommendations(studentId) {
  const weakTopics = await getWeakTopics(studentId, 3);
  if (weakTopics.length === 0) {
    return { message: 'Great job! Keep practicing to maintain your mastery.', topics: [] };
  }
  return {
    message: `Focus on improving: ${weakTopics.map((t) => t.topic).join(', ')}`,
    topics: weakTopics.map((t) => ({
      topic: t.topic,
      category: t.category,
      masteryPercent: t.masteryPercent,
      suggestion: t.masteryPercent < 50 ? 'Review lessons and use hints' : 'Practice more questions',
    })),
  };
}
