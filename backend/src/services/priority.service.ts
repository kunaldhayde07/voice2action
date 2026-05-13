import Issue from '../models/Issue.model';
import { URGENCY_FACTORS } from '../config/constants';

interface PriorityParams {
  votesCount: number;
  urgency: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  status: string;
}

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6378100; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculatePriorityScore = async (
  params: PriorityParams
): Promise<number> => {
  const { votesCount, urgency, latitude, longitude, createdAt, status } = params;

  // Base vote score (each vote = 5 points)
  const voteScore = votesCount * 5;

  // Urgency factor
  const urgencyFactor = URGENCY_FACTORS[urgency as keyof typeof URGENCY_FACTORS] || 5;

  // Nearby issue density (within 1km) - using aggregation pipeline
  const nearbyIssues = await Issue.find({
    status: { $ne: 'resolved' },
    'location.coordinates': { $exists: true },
  })
    .select('location')
    .limit(100)
    .lean();

  // Calculate distance manually for each issue
  const nearbyCount = nearbyIssues.filter((issue: any) => {
    if (!issue.location || !issue.location.coordinates || issue.location.coordinates.length < 2) {
      return false;
    }
    const [issueLng, issueLat] = issue.location.coordinates;
    const distance = calculateDistance(latitude, longitude, issueLat, issueLng);
    return distance <= 1000; // 1km
  }).length;

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