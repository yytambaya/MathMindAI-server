import { v4 as uuidv4 } from 'uuid';

export function generateInviteCode() {
  return uuidv4().slice(0, 8).toUpperCase();
}

export function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

export function calculateMasteryPercent(correct, attempts) {
  if (attempts === 0) return 0;
  return Math.round((correct / attempts) * 100);
}

export function getDifficultyAdjustment(masteryPercent) {
  if (masteryPercent > 80) return 'increase';
  if (masteryPercent < 50) return 'decrease';
  return 'maintain';
}

export function adjustDifficulty(current, adjustment) {
  const levels = ['Easy', 'Medium', 'Hard'];
  const idx = levels.indexOf(current);
  if (adjustment === 'increase' && idx < 2) return levels[idx + 1];
  if (adjustment === 'decrease' && idx > 0) return levels[idx - 1];
  return current;
}

export function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export function isYesterday(date, today) {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
