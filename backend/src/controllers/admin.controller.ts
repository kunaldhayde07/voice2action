import { Request, Response, NextFunction } from 'express';
import Issue from '../models/Issue.model';
import User from '../models/User.model';
import Vote from '../models/Vote.model';
import Comment from '../models/Comment.model';
import { sendSuccess } from '../utils/response.utils';
import { getPaginationOptions, createPaginatedResult } from '../utils/pagination.utils';
import { getIO } from '../socket/socket';
import { SOCKET_EVENTS } from '../config/constants';
import { createNotification } from '../services/notification.service';

export const getAdminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalIssues,
      pendingIssues,
      resolvedIssues,
      inProgressIssues,
      totalUsers,
      totalVotes,
      recentIssues,
      categoryStats,
      urgencyStats,
      monthlyTrend,
      topIssues,
      resolutionRateData,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: 'in_progress' }),
      User.countDocuments({ role: 'citizen' }),
      Vote.countDocuments(),
      Issue.find()
        .populate('createdBy', 'name avatar')
        .sort('-createdAt')
        .limit(5)
        .lean(),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Issue.aggregate([
        { $group: { _id: '$urgency', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
      Issue.find({ status: { $ne: 'resolved' } })
        .sort('-priorityScore')
        .limit(10)
        .populate('createdBy', 'name')
        .lean(),
      Issue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Calculate avg resolution time
    const resolvedWithTime = await Issue.find({
      status: 'resolved',
      resolvedAt: { $exists: true },
    })
      .select('createdAt resolvedAt')
      .lean();

    let avgResolutionDays = 0;
    if (resolvedWithTime.length > 0) {
      const totalDays = resolvedWithTime.reduce((acc, issue) => {
        if (issue.resolvedAt) {
          const days =
            (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return acc + days;
        }
        return acc;
      }, 0);
      avgResolutionDays = Math.round(totalDays / resolvedWithTime.length);
    }

    const resolutionRate =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // Emit analytics update to admin room
    try {
      const io = getIO();
      io.to('admin:room').emit(SOCKET_EVENTS.ANALYTICS_UPDATE, {
        totalIssues,
        pendingIssues,
        resolvedIssues,
        totalUsers,
      });
    } catch {
      // Socket not ready
    }

    sendSuccess(res, 'Admin dashboard data retrieved', {
      stats: {
        totalIssues,
        pendingIssues,
        resolvedIssues,
        inProgressIssues,
        totalUsers,
        totalVotes,
        resolutionRate,
        avgResolutionDays,
      },
      recentIssues,
      categoryStats,
      urgencyStats,
      monthlyTrend: monthlyTrend.reverse(),
      topIssues,
      resolutionRateData,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = getPaginationOptions(req.query as Record<string, string>);
    const skip = (pagination.page - 1) * pagination.limit;

    const query: Record<string, unknown> = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(pagination.sort || '-createdAt')
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const result = createPaginatedResult(users, total, pagination);
    sendSuccess(res, 'Users retrieved', result);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    sendSuccess(res, 'User role updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      sendSuccess(res, 'User not found');
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, {
      user: { _id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!issue) {
      sendSuccess(res, 'Issue not found');
      return;
    }

    await createNotification({
      recipient: issue.createdBy,
      sender: (req.user as any)?._id,
      type: 'issue_verified',
      title: '✅ Your issue has been verified!',
      message: `Your issue "${issue.title}" has been verified by an admin.`,
      issue: issue._id,
    });

    sendSuccess(
      res,
      'Issue verified successfully',
      { issue }
    );
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      issuesByCategory,
      issuesByStatus,
      issuesByUrgency,
      dailyIssues,
      topAreas,
      engagementStats,
    ] = await Promise.all([
      Issue.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $group: { _id: '$urgency', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Issue.aggregate([
        {
          $group: {
            _id: '$address',
            count: { $sum: 1 },
            avgVotes: { $avg: '$votesCount' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Issue.aggregate([
        {
          $group: {
            _id: null,
            totalVotes: { $sum: '$votesCount' },
            totalComments: { $sum: '$commentsCount' },
            totalViews: { $sum: '$viewsCount' },
            avgPriorityScore: { $avg: '$priorityScore' },
          },
        },
      ]),
    ]);

    sendSuccess(res, 'Analytics retrieved successfully', {
      issuesByCategory,
      issuesByStatus,
      issuesByUrgency,
      dailyIssues,
      topAreas,
      engagementStats: engagementStats[0] || {},
    });
  } catch (error) {
    next(error);
  }
};