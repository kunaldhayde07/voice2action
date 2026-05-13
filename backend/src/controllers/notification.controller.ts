import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification.model';
import { markNotificationsAsRead, getUnreadCount } from '../services/notification.service';
import { sendSuccess } from '../utils/response.utils';
import { getPaginationOptions, createPaginatedResult } from '../utils/pagination.utils';

const getUserId = (req: Request): string => {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  return req.user._id.toString();
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = getPaginationOptions(req.query as Record<string, string | undefined>);
    const skip = (pagination.page - 1) * pagination.limit;
    const userId = getUserId(req);

    const query: Record<string, unknown> = { recipient: req.user._id };
    const isRead = typeof req.query.isRead === 'string' ? req.query.isRead === 'true' : undefined;
    if (isRead !== undefined) {
      query.isRead = isRead;
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
    const { notificationIds } = req.body as { notificationIds?: string | string[] };
    const sanitizedIds = Array.isArray(notificationIds)
      ? notificationIds
      : notificationIds
      ? [notificationIds]
      : undefined;
    await markNotificationsAsRead(getUserId(req), sanitizedIds);
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