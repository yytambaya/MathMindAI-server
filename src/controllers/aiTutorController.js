import { v4 as uuidv4 } from 'uuid';
import { ChatHistory } from '../models/index.js';
import { chatWithDanny } from '../services/geminiService.js';
import { getWeakTopics } from '../services/masteryService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const chat = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;
  const studentId = req.user._id;
  const sid = sessionId || uuidv4();

  await ChatHistory.create({ studentId, sessionId: sid, role: 'user', content: message });

  const history = await ChatHistory.find({ studentId, sessionId: sid }).sort({ createdAt: 1 });
  const weakTopics = await getWeakTopics(studentId, 3);

  const messages = history.map((h) => ({ role: h.role, content: h.content }));
  const response = await chatWithDanny(messages, weakTopics);

  await ChatHistory.create({ studentId, sessionId: sid, role: 'assistant', content: response });

  res.json({ success: true, data: { sessionId: sid, message: response } });
});

export const getSessions = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const sessions = await ChatHistory.aggregate([
    { $match: { studentId } },
    {
      $group: {
        _id: '$sessionId',
        updatedAt: { $max: '$createdAt' },
        messageCount: { $sum: 1 },
      },
    },
    { $sort: { updatedAt: -1 } },
    { $limit: 30 },
  ]);

  const sessionIds = sessions.map((s) => s._id);
  const firstUserMessages = await ChatHistory.find({
    studentId,
    sessionId: { $in: sessionIds },
    role: 'user',
  })
    .sort({ createdAt: 1 })
    .select('sessionId content');

  const titleBySession = {};
  for (const msg of firstUserMessages) {
    if (!titleBySession[msg.sessionId]) {
      titleBySession[msg.sessionId] = msg.content.slice(0, 60);
    }
  }

  res.json({
    success: true,
    data: sessions.map((s) => ({
      sessionId: s._id,
      title: titleBySession[s._id] || 'Math tutoring session',
      messageCount: s.messageCount,
      updatedAt: s.updatedAt,
    })),
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.json({ success: true, data: [] });
  }

  const history = await ChatHistory.find({ studentId: req.user._id, sessionId })
    .sort({ createdAt: 1 })
    .select('role content createdAt');

  res.json({ success: true, data: history });
});
