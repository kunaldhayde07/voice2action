import Vote from '../models/Vote.model';
import Issue from '../models/Issue.model';
import User from '../models/User.model';

import { createNotification } from './notification.service';
import { recalculatePriorityScore } from './priority.service';

import {
  REPUTATION_POINTS,
  SOCKET_EVENTS,
} from '../config/constants';

import { getIO } from '../socket/socket';

export const toggleVote = async (
  issueId: string,
  userId: string
): Promise<{
  voted: boolean;
  votesCount: number;
  priorityScore: number;
}> => {
  const issue = await Issue.findById(issueId);

  if (!issue) {
    throw new Error('Issue not found');
  }

  if (
    issue.status === 'resolved' ||
    issue.status === 'rejected'
  ) {
    throw new Error(
      'Cannot vote on resolved or rejected issues'
    );
  }

  const existingVote = await Vote.findOne({
    issue: issueId,
    user: userId,
  });

  let voted: boolean;
  let votesCount: number;

  if (existingVote) {
    // Remove vote
    await Vote.findByIdAndDelete(
      existingVote._id
    );

    await Issue.findByIdAndUpdate(issueId, {
      $inc: {
        votesCount: -1,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: {
        votesCount: -1,
      },
    });

    voted = false;

    votesCount = Math.max(
      0,
      issue.votesCount - 1
    );
  } else {
    // Add vote
    await Vote.create({
      issue: issueId,
      user: userId,
    });

    await Issue.findByIdAndUpdate(issueId, {
      $inc: {
        votesCount: 1,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: {
        reputationPoints:
          REPUTATION_POINTS.VOTE,

        votesCount: 1,
      },
    });

    voted = true;

    votesCount =
      issue.votesCount + 1;

    // Notify issue creator
    if (
      issue.createdBy.toString() !==
      userId
    ) {
      try {
        await createNotification({
          recipient: issue.createdBy,
          sender: userId,
          type: 'vote_received',
          title:
            'Someone voted on your issue!',
          message: `Your issue "${issue.title}" received a new vote.`,
          issue: issue._id,
        });
      } catch {
        // Ignore notification errors
      }
    }
  }

  // Recalculate priority score
  let priorityScore = issue.priorityScore;

  try {
    priorityScore =
      await recalculatePriorityScore(
        issueId
      );
  } catch {
    // Ignore recalculation failure
  }

  // Real-time socket update
  try {
    const io = getIO();

    io.emit(
      SOCKET_EVENTS.VOTE_UPDATED,
      {
        issueId,
        votesCount,
        priorityScore,
        userId,
      }
    );
  } catch {
    // Socket not initialized
  }

  return {
    voted,
    votesCount,
    priorityScore,
  };
};

export const getUserVotedIssues =
  async (
    userId: string
  ): Promise<string[]> => {
    const votes = await Vote.find({
      user: userId,
    })
      .select('issue')
      .lean();

    return votes.map((vote: any) =>
      vote.issue.toString()
    );
  };

export const hasUserVoted = async (
  issueId: string,
  userId: string
): Promise<boolean> => {
  const vote = await Vote.findOne({
    issue: issueId,
    user: userId,
  });

  return !!vote;
};