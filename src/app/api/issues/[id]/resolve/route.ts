import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import IssueModel from '@/lib/models/Issue';
import { broadcast } from '@/lib/websocket';
import { calculatePriorityScore } from '@/lib/priorityEngine';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = req.headers.get('x-authority-token');
    if (authHeader !== process.env.AUTHORITY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resolvedImage, resolvedNote } = body;

    const issue = await IssueModel.findById(params.id);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    issue.status = 'resolved';
    if (resolvedImage) issue.resolvedImage = resolvedImage;
    if (resolvedNote) issue.resolvedNote = resolvedNote;
    issue.priorityScore = calculatePriorityScore(
      issue.voteCount,
      issue.createdAt,
      'resolved',
      issue.category
    );

    await issue.save();

    broadcast({
      type: 'status_update',
      issueId: params.id,
      status: 'resolved',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, issue: issue.toJSON() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to resolve issue' }, { status: 500 });
  }
}