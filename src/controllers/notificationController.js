import {
  getNotifications, markAsRead, markAllAsRead, getUnreadCount,
} from '../services/notificationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const list = asyncHandler(async (req, res) => {
  const data = await getNotifications(req.user._id);
  res.json({ success: true, data });
});

export const read = asyncHandler(async (req, res) => {
  const data = await markAsRead(req.user._id, req.params.id);
  res.json({ success: true, data });
});

export const readAll = asyncHandler(async (req, res) => {
  const data = await markAllAsRead(req.user._id);
  res.json({ success: true, data });
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  res.json({ success: true, data: { count } });
});
