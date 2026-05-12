import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification.model';
import { markNotificationsAsRead, getUnreadCount } from '../services/notification.service';
import { sendSuccess } from '../utils/response.utils';
import { getPaginationOptions, createPaginatedResult } from '../utils/pagination.utils';

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = getPaginationOptions(req.query as Record<string, string>);
    const skip = (pagination.page - 1) * pagination.limit;

    const query: Record<string, unknown> = { recipient: req.user!._id };
    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name avatar')
        .populate('issue', 'title status')
        .sort('-createdAt')
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Notification.countDocuments(query),
      getUnreadCount(req.user!._id.toString()),
    ]);

    const result = createPaginatedResult(notifications, total, pagination);
    sendSuccess(res, 'Notifications retrieved', { ...result, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { notificationIds } = req.body;
    await markNotificationsAsRead(req.user!._id.toString(), notificationIds);
    sendSuccess(res, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await markNotificationsAsRead(req.user!._id.toString());
    sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await getUnreadCount(req.user!._id.toString());
    sendSuccess(res, 'Unread count retrieved', { count });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user!._id,
    });
    sendSuccess(res, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};