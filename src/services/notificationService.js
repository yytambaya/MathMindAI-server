import { Notification } from '../models/Notification.js';

export async function createNotification(userId, type, title, message, data = {}, io) {
  const notification = await Notification.create({ userId, type, title, message, data });

  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }

  return notification;
}

export async function getNotifications(userId, limit = 20) {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function markAsRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
}

export async function markAllAsRead(userId) {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { message: 'All notifications marked as read' };
}

export async function getUnreadCount(userId) {
  return Notification.countDocuments({ userId, read: false });
}
