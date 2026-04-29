import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import IssueModel from '@/lib/models/Issue';
import VoteModel from '@/lib/models/Vote';
import { calculatePriorityScore } from '@/lib/priorityEngine';
import { broadcast } from '@/lib/websocket';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { voterFingerprint } = body;

    if (!voterFingerprint) {
      return NextResponse.json({ error: 'Voter fingerprint required' }, { status: 400 });
    }

    const issue = await IssueModel.findById(params.id);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    if (issue.status === 'resolved') {
      return NextResponse.json({ error: 'Cannot vote on resolved issues' }, { status: 400 });
    }

    // check for existing vote
    const existingVote = await VoteModel.findOne({
      issueId: params.id,
      voterFingerprint,
    });

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted on this issue' }, { status: 409 });
    }

    // create vote
    await VoteModel.create({
      issueId: params.id,
      voterFingerprint,
    });

    issue.voteCount += 1;
    issue.priorityScore = calculatePriorityScore(
      issue.voteCount,
      issue.createdAt,
      issue.status,
      issue.category
    );

    await issue.save();

    broadcast({
      type: 'vote_update',
      issueId: params.id,
      voteCount: issue.voteCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      voteCount: issue.voteCount,
      priorityScore: issue.priorityScore,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 });
    }
    console.error('[POST /api/issues/[id]/vote]', err);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}