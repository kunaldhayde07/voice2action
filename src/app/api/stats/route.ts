import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import IssueModel from '@/lib/models/Issue';
import VoteModel from '@/lib/models/Vote';

export async function GET() {
  try {
    await connectDB();

    const [
      totalIssues,
      statusCounts,
      categoryCounts,
      totalVotes,
      recentActivity,
      topIssues,
    ] = await Promise.all([
      IssueModel.countDocuments(),
      IssueModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      IssueModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      VoteModel.countDocuments(),
      IssueModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      IssueModel.find({ status: { $ne: 'resolved' } })
        .sort({ priorityScore: -1 })
        .limit(10)
        .lean(),
    ]);

    const statusMap = statusCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {} as Record<string, number>
    );

    const categoryMap = categoryCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      {} as Record<string, number>
    );

    return NextResponse.json({
      totalIssues,
      pendingCount: statusMap.pending || 0,
      inProgressCount: statusMap.in_progress || 0,
      resolvedCount: statusMap.resolved || 0,
      totalVotes,
      categoryCounts: categoryMap,
      recentActivity,
      topIssues,
    });
  } catch (err) {
    console.error('[GET /api/stats]', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}