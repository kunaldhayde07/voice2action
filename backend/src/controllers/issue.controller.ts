import { getUserVotedIssues, hasUserVoted } from '../services/vote.service';
import { Request, Response, NextFunction } from 'express';
import { createIssueService, getIssuesService } from '../services/issue.service';
import { checkForDuplicates } from '../services/duplicate.service';
import { compressImage } from '../middleware/upload.middleware';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils';
import { getPaginationOptions, createPaginatedResult } from '../utils/pagination.utils';
import { getIO } from '../socket/socket';
import { SOCKET_EVENTS } from '../config/constants';
import Issue from '../models/Issue.model';
import IssueStatusLog from '../models/IssueStatusLog.model';
import { createNotification } from '../services/notification.service';
import { recalculatePriorityScore } from '../services/priority.service';
import User from '../models/User.model';
import { REPUTATION_POINTS } from '../config/constants';
import { reverseGeocode } from '../services/geocoding.service';

export const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body;
   const files = (req.files as any[]) || [];

// Validate required fields
if (
  !body.title ||
  !body.description ||
  !body.category ||
  !body.latitude ||
  !body.longitude ||
  !body.address
  ) {
  sendError(
    res,
    'All required fields are required',
    400
  );
  return;
  }

  // Safe coordinate parsing
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  // Validate coordinates
  if (
  Number.isNaN(latitude) ||
  Number.isNaN(longitude)
  ) {
  sendError(
    res,
    'Invalid latitude or longitude',
    400
  );
  return;
  }

  // Parse tags safely
let tags: string[] = [];

if (body.tags) {
  try {
    if (typeof body.tags === 'string') {
      tags = body.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.tags)) {
      tags = body.tags;
    }
  } catch (error) {
    console.error('Tags parsing failed:', error);
    tags = [];
  }
}

    // Process uploaded images
    const images: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          await compressImage(file.path);

          images.push(
          `/uploads/issues/${file.filename}`
          );
          } catch (compressionError) {
          console.error(
          'Image compression failed:',
          compressionError
        );
        }
      }
    }

    const issue = await createIssueService({
      title: body.title,
      description: body.description,
      category: body.category,
      latitude,
      longitude,
      address: body.address,
      urgency: body.urgency || 'medium',
      tags,
      images,
      createdBy: (req.user as any)!._id.toString(),
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name avatar reputationPoints role')
      .lean();

    // Emit real-time event
    try {
      const io = getIO();
      io.emit(SOCKET_EVENTS.NEW_ISSUE, populatedIssue);
    } catch {
      // Socket not ready
    }

    sendCreated(res, 'Issue reported successfully! Thank you for your contribution.', {
      issue: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = getPaginationOptions(req.query as Record<string, string>);

    const filters: Record<string, unknown> = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.urgency) filters.urgency = req.query.urgency;
    if (req.query.search) filters.search = req.query.search;

    if (req.query.lat && req.query.lng) {
      filters.lat = parseFloat(req.query.lat as string);
      filters.lng = parseFloat(req.query.lng as string);
      filters.radius = req.query.radius
        ? parseFloat(req.query.radius as string)
        : 5000;
    }

    const { issues, total } = await getIssuesService(filters, pagination);

    // Check if user has voted on these issues
    let votedIssueIds: string[] = [];

    if (req.user) {
    votedIssueIds =
    await getUserVotedIssues(
      (req.user as any)._id.toString()
    );
    }
    
    const issuesWithVoteStatus = issues.map((issue) => ({
      ...issue,
      hasVoted: votedIssueIds.includes(issue._id.toString()),
    }));

    const result = createPaginatedResult(issuesWithVoteStatus, total, pagination);

    sendSuccess(res, 'Issues retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name avatar reputationPoints role isVerified')
      .populate('assignedTo', 'name avatar role')
      .lean();

    if (!issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    // Increment views
    await Issue.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

  // Check vote status
  let hasVoted = false;

  if (req.user) {
  hasVoted = await hasUserVoted(
    req.params.id,
    (req.user as any)._id.toString()
  );
  } 

    // Get status logs
    const statusLogs = await IssueStatusLog.find({ issue: req.params.id })
      .populate('changedBy', 'name role')
      .sort('-createdAt')
      .lean();

    sendSuccess(res, 'Issue retrieved successfully', {
      issue: { ...issue, hasVoted },
      statusLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssueStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, note, rejectionReason, duplicateOf } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    const previousStatus = issue.status;

    const updateData: Record<string, unknown> = { status };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (duplicateOf) updateData.duplicateOf = duplicateOf;
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email avatar');

    // Create status log
    await IssueStatusLog.create({
      issue: issue._id,
      previousStatus,
      newStatus: status,
      changedBy: (req.user as any)!._id,
      note,
    });

    // Update priority score
    const priorityScore = await recalculatePriorityScore(issue._id.toString());

    // Update user reputation if resolved
    if (status === 'resolved' && previousStatus !== 'resolved') {
      await User.findByIdAndUpdate(issue.createdBy, {
        $inc: {
          reputationPoints: REPUTATION_POINTS.ISSUE_RESOLVED,
          resolvedIssuesCount: 1,
        },
      });
    }

    // Send notification to issue creator
    const notificationType =
      status === 'resolved' ? 'issue_resolved' : 'issue_status_changed';
    const notificationTitle =
      status === 'resolved'
        ? '🎉 Your issue has been resolved!'
        : `Issue status updated to ${status.replace('_', ' ')}`;
    const notificationMessage =
      status === 'resolved'
        ? `Your issue "${issue.title}" has been resolved. Thank you for reporting!`
        : `Your issue "${issue.title}" status has been changed to ${status.replace('_', ' ')}.${note ? ` Note: ${note}` : ''}`;

    await createNotification({
      recipient: issue.createdBy,
      sender: (req.user as any)!._id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      issue: issue._id,
    });

    // Emit real-time event
    try {
      const io = getIO();
      io.emit(SOCKET_EVENTS.ISSUE_UPDATED, {
        issueId: issue._id,
        status,
        priorityScore,
        updatedBy: (req.user as any)!._id,
      });

      if (status === 'resolved') {
        io.emit(SOCKET_EVENTS.ISSUE_RESOLVED, {
          issueId: issue._id,
          resolvedBy: (req.user as any)!._id,
        });
      }
    } catch {
      // Socket not ready
    }

    sendSuccess(res, 'Issue status updated successfully', { issue: updatedIssue });
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    // Only creator or admin can delete
    const isCreator = issue.createdBy.toString() === (req.user as any)!._id.toString();
    const isAdmin = (req.user as any)!.role === 'admin' || (req.user as any)!.role === 'super_admin';

    if (!isCreator && !isAdmin) {
      sendError(res, 'Not authorized to delete this issue', 403);
      return;
    }

    await Issue.findByIdAndDelete(req.params.id);

    sendSuccess(res, 'Issue deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const checkDuplicates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { latitude, longitude, category } = req.query;

    if (!latitude || !longitude || !category) {
      sendError(res, 'latitude, longitude, and category are required', 400);
      return;
    }

    const result = await checkForDuplicates(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      category as string
    );

    sendSuccess(res, 'Duplicate check completed', result);
  } catch (error) {
    next(error);
  }
};

export const getMyIssues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = getPaginationOptions(req.query as Record<string, string>);
    const skip = (pagination.page - 1) * pagination.limit;

    const filters: Record<string, unknown> = {
      createdBy: (req.user as any)!._id,
    };
    if (req.query.status) filters.status = req.query.status;

    const [issues, total] = await Promise.all([
      Issue.find(filters)
        .sort(pagination.sort || '-createdAt')
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Issue.countDocuments(filters),
    ]);

    const result = createPaginatedResult(issues, total, pagination);
    sendSuccess(res, 'Your issues retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getNearbyIssues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      lat,
      lng,
      radius = '5000',
      limit = '20',
    } = req.query;

    if (!lat || !lng) {
      sendError(
        res,
        'lat and lng are required',
        400
      );
      return;
    }

    // Fetch issues normally
    const allIssues = await Issue.find({
      status: { $ne: 'resolved' },
    })
      .populate('createdBy', 'name avatar')
      .lean();

    // Filter nearby manually
    const nearbyIssues = allIssues.filter(
      (issue: any) => {
        if (
          !issue.location ||
          !issue.location.coordinates
        ) {
          return false;
        }

        const [issLng, issLat] =
          issue.location.coordinates;

        const distance =
          calculateDistance(
            parseFloat(lat as string),
            parseFloat(lng as string),
            issLat,
            issLng
          );

        return (
          distance <=
          parseFloat(radius as string)
        );
      }
    );

    sendSuccess(
      res,
      'Nearby issues retrieved',
      {
        issues: nearbyIssues.slice(
          0,
          parseInt(limit as string, 10)
        ),
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getMapIssues = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { south, west, north, east, status, category } = req.query;

    const query: Record<string, unknown> = {};

    if (south && west && north && east) {
      query.location = {
        $geoWithin: {
          $box: [
            [parseFloat(west as string), parseFloat(south as string)],
            [parseFloat(east as string), parseFloat(north as string)],
          ],
        },
      };
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const issues = await Issue.find(query)
      .select('title category status urgency location votesCount priorityScore address createdAt')
      .limit(500)
      .lean();

    sendSuccess(res, 'Map issues retrieved', { issues });
  } catch (error) {
    next(error);
  }
};

export const reverseGeocodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      sendError(res, 'lat and lng are required', 400);
      return;
    }

    const result = await reverseGeocode(
  parseFloat(lat as string),
  parseFloat(lng as string)
);

    sendSuccess(res, 'Geocoding successful', result);
  } catch (error) {
    next(error);
  }
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ =
    ((lat2 - lat1) * Math.PI) / 180;

  const Δλ =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) *
      Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}