import Notification from '../models/Notification.model';
import { INotification, NotificationType } from '../types';
import { getIO } from '../socket/socket';
import { SOCKET_EVENTS } from '../config/constants';
import { Types } from 'mongoose';

interface CreateNotificationParams {
  recipient: string | Types.ObjectId;
  sender?: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  issue?: string | Types.ObjectId;
}

export const createNotification = async (
  params: CreateNotificationParams
): Promise<INotification> => {
  const notification = await Notification.create(params);

  const populatedNotification = await Notification.findById(notification._id)
    .populate('sender', 'name avatar')
    .populate('issue', 'title')
    .lean();

  // Emit real-time notification via Socket.IO
  try {
    const io = getIO();
    io.to(`user:${params.recipient.toString()}`).emit(
      SOCKET_EVENTS.NEW_NOTIFICATION,
      populatedNotification
    );
  } catch {
    // Socket.IO not initialized yet, skip
  }

  return notification;
};

export const markNotificationsAsRead = async (
  userId: string,
  notificationIds?: string[]
): Promise<void> => {
  const query: Record<string, unknown> = { recipient: userId };

  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  await Notification.updateMany(query, { isRead: true });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};