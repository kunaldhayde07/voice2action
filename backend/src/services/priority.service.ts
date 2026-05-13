import Issue from '../models/Issue.model';
import { NEARBY_DENSITY_RADIUS_METERS, URGENCY_FACTORS } from '../config/constants';
import { buildGeoWithinQuery } from '../utils/geo.utils';

interface PriorityParams {
  votesCount: number;
  urgency: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  status: string;
}

export const calculatePriorityScore = async (
  params: PriorityParams
): Promise<number> => {
  const { votesCount, urgency, latitude, longitude, createdAt, status } = params;

  // Base vote score (each vote = 5 points)
  const voteScore = votesCount * 5;

  // Urgency factor
  const urgencyFactor = URGENCY_FACTORS[urgency as keyof typeof URGENCY_FACTORS] || 5;

  // Nearby issue density without $near, so count queries do not need geo sorting.
  const nearbyCount = await Issue.countDocuments({
    status: { $ne: 'resolved' },
    location: buildGeoWithinQuery(
      latitude,
      longitude,
      NEARBY_DENSITY_RADIUS_METERS
    ),
  });

  const nearbyDensityScore = Math.min(nearbyCount * 2, 20); // Cap at 20 points

  // Days unresolved bonus
  const now = Date.now();
  const createdTime = new Date(createdAt).getTime();
  const unresolvedDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
  const unresolvedScore = Math.min(unresolvedDays * 0.5, 15); // Cap at 15 points

  // Recency boost - newer issues get slight boost (within 24 hours = 10 points)
  const hoursOld = (now - createdTime) / (1000 * 60 * 60);
  const recencyBoost = hoursOld < 24 ? 10 : hoursOld < 72 ? 5 : 0;

  // Status penalty for resolved issues
  const statusPenalty = status === 'resolved' ? -50 : 0;

  const totalScore =
    voteScore +
    urgencyFactor +
    nearbyDensityScore +
    unresolvedScore +
    recencyBoost +
    statusPenalty;

  return Math.max(0, Math.round(totalScore * 10) / 10);
};

export const recalculatePriorityScore = async (issueId: string): Promise<number> => {
  const issue = await Issue.findById(issueId);
  if (!issue) return 0;

  const score = await calculatePriorityScore({
    votesCount: issue.votesCount,
    urgency: issue.urgency,
    latitude: issue.location.coordinates[1],
    longitude: issue.location.coordinates[0],
    createdAt: issue.createdAt,
    status: issue.status,
  });

  await Issue.findByIdAndUpdate(issueId, { priorityScore: score });
  return score;
};
