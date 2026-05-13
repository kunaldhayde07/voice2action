import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import Issue from '../models/Issue.model';
import Vote from '../models/Vote.model';
import { IUser } from '../types';
import { sendSuccess, sendError } from '../utils/response.utils';
import { hashPassword } from '../utils/bcrypt.utils';

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const [reportedCount, resolvedCount] = await Promise.all([
      Issue.countDocuments({ createdBy: req.params.id }),
      Issue.countDocuments({ createdBy: req.params.id, status: 'resolved' }),
    ]);

    sendSuccess(res, 'User profile retrieved', {
      user: { ...user, reportedCount, resolvedCount },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, bio, location } = req.body;
    const updateData: Record<string, string> = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    // Handle avatar upload
    if (req.file) {
      updateData.avatar = `/uploads/issues/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
    (req.user as IUser)._id,
    updateData,
    {
    new: true,
    runValidators: true,
    }
    ).select('-password');

    sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(
    (req.user as IUser)._id
    ).select('+password');
    if (!user || !user.password) {
      sendError(res, 'Cannot change password for OAuth accounts', 400);
      return;
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(
    (req.user as IUser)._id,
    { password: hashedPassword }
    );

    sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || '10', 10);

    const topContributors = await User.find({ isActive: true, role: 'citizen' })
      .select('name avatar reputationPoints reportedIssuesCount resolvedIssuesCount votesCount')
      .sort('-reputationPoints')
      .limit(limit)
      .lean();

    sendSuccess(res, 'Leaderboard retrieved', { leaderboard: topContributors });
  } catch (error) {
    next(error);
  }
};