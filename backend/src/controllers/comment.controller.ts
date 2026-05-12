import { Request, Response, NextFunction } from 'express';
import Comment from '../models/Comment.model';
import Issue from '../models/Issue.model';
import { createNotification } from '../services/notification.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils';
import { getPaginationOptions, createPaginatedResult } from '../utils/pagination.utils';
import { REPUTATION_POINTS } from '../config/constants';
import User from '../models/User.model';

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    const isAdmin =
      req.user!.role === 'admin' || req.user!.role === 'super_admin';

    const comment = await Comment.create({
      issue: issue._id,
      author: req.user!._id,
      content: req.body.content,
      isAdminComment: isAdmin,
    });

    // Increment comment count
    await Issue.findByIdAndUpdate(issue._id, {
      $inc: { commentsCount: 1 },
    });

    // Award reputation points
    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { reputationPoints: REPUTATION_POINTS.COMMENT },
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar role isVerified')
      .lean();

    // Notify issue creator
    if (issue.createdBy.toString() !== req.user!._id.toString()) {
      await createNotification({
        recipient: issue.createdBy,
        sender: req.user!._id,
        type: 'comment_received',
        title: 'New comment on your issue',
        message: `${req.user!.name} commented on your issue "${issue.title}"`,
        issue: issue._id,
      });
    }

    sendCreated(res, 'Comment added successfully', { comment: populatedComment });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = getPaginationOptions(req.query as Record<string, string>);
    const skip = (pagination.page - 1) * pagination.limit;

    const [comments, total] = await Promise.all([
      Comment.find({ issue: req.params.issueId })
        .populate('author', 'name avatar role isVerified reputationPoints')
        .sort('-createdAt')
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Comment.countDocuments({ issue: req.params.issueId }),
    ]);

    const result = createPaginatedResult(comments, total, pagination);
    sendSuccess(res, 'Comments retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      sendError(res, 'Comment not found', 404);
      return;
    }

    const isAuthor = comment.author.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';

    if (!isAuthor && !isAdmin) {
      sendError(res, 'Not authorized to delete this comment', 403);
      return;
    }

    await Comment.findByIdAndDelete(req.params.id);
    await Issue.findByIdAndUpdate(comment.issue, {
      $inc: { commentsCount: -1 },
    });

    sendSuccess(res, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};