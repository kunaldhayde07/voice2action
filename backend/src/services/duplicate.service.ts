import Issue from '../models/Issue.model';
import { IIssue } from '../types';
import { DUPLICATE_DETECTION_RADIUS_METERS } from '../config/constants';

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  nearbyIssues: Array<{
    _id: string;
    title: string;
    category: string;
    status: string;
    votesCount: number;
    distance: number;
    address: string;
  }>;
}

export const checkForDuplicates = async (
  latitude: number,
  longitude: number,
  category: string,
  excludeIssueId?: string
): Promise<DuplicateCheckResult> => {
  const query: Record<string, unknown> = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: DUPLICATE_DETECTION_RADIUS_METERS,
      },
    },
    category,
    status: { $nin: ['resolved', 'rejected', 'duplicate'] },
  };

  if (excludeIssueId) {
    query._id = { $ne: excludeIssueId };
  }

  const nearbyIssues = (await Issue.find(query)
    .select('title category status votesCount address location createdAt')
    .limit(5)
    .lean()) as unknown as (IIssue & { location: { coordinates: number[] } })[];

  const issuesWithDistance = nearbyIssues.map((issue) => {
    const [issLng, issLat] = issue.location.coordinates;
    const distance = calculateDistance(latitude, longitude, issLat, issLng);

    return {
      _id: issue._id.toString(),
      title: issue.title,
      category: issue.category,
      status: issue.status,
      votesCount: issue.votesCount,
      distance: Math.round(distance),
      address: issue.address,
    };
  });

  return {
    hasDuplicates: issuesWithDistance.length > 0,
    nearbyIssues: issuesWithDistance,
  };
};

// Haversine formula to calculate distance in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}