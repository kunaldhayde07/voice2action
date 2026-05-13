import Issue from '../models/Issue.model';
import { IIssue } from '../types';
import { DUPLICATE_DETECTION_RADIUS_METERS } from '../config/constants';
import { buildGeoWithinQuery, calculateDistanceMeters } from '../utils/geo.utils';

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
    category,
    status: {
      $nin: ['resolved', 'rejected', 'duplicate'],
    },
    location: buildGeoWithinQuery(
      latitude,
      longitude,
      DUPLICATE_DETECTION_RADIUS_METERS
    ),
  };

  if (excludeIssueId) {
    query._id = { $ne: excludeIssueId };
  }

  const nearbyIssues = (await Issue.find(query)
    .select('title category status votesCount address location createdAt')
    .limit(50)
    .lean()) as unknown as (IIssue & {
    location?: { coordinates?: number[] };
  })[];

  const issuesWithDistance = nearbyIssues
    .filter((issue) => {
      return (
        issue.location?.coordinates &&
        issue.location.coordinates.length >= 2
      );
    })
    .map((issue) => {
      const [issLng, issLat] = issue.location!.coordinates!;
      const distance = calculateDistanceMeters(
        latitude,
        longitude,
        issLat,
        issLng
      );

      return {
        _id: issue._id.toString(),
        title: issue.title,
        category: issue.category,
        status: issue.status,
        votesCount: issue.votesCount,
        distance: Math.round(distance),
        address: issue.address,
      };
    })
    .sort((a, b) => a.distance - b.distance);

  return {
    hasDuplicates: issuesWithDistance.length > 0,
    nearbyIssues: issuesWithDistance,
  };
};
