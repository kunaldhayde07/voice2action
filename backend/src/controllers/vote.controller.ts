import { Request, Response, NextFunction } from 'express';
import { toggleVote, getUserVotedIssues } from '../services/vote.service';
import { sendSuccess } from '../utils/response.utils';

export const voteOnIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await toggleVote(
      req.params.issueId,
      req.user!._id.toString()
    );

    sendSuccess(res, result.voted ? 'Vote added successfully' : 'Vote removed successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getMyVotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const votedIssueIds = await getUserVotedIssues(req.user!._id.toString());
    sendSuccess(res, 'Your votes retrieved', { votedIssueIds });
  } catch (error) {
    next(error);
  }
};