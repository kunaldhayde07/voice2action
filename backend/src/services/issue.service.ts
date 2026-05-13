import Issue from '../models/Issue.model';
import User from '../models/User.model';
import { calculatePriorityScore } from './priority.service';
import { REPUTATION_POINTS } from '../config/constants';
import { PaginationOptions } from '../types';

interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  urgency: string;
  tags: string[];
  images: string[];
  createdBy: string;
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

export const createIssueService = async (data: CreateIssueData) => {
  const priorityScore = await calculatePriorityScore({
    votesCount: 0,
    urgency: data.urgency,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: new Date(),
    status: 'pending',
  });

  const issue = await Issue.create({
    title: data.title,
    description: data.description,
    category: data.category,
    images: data.images,
    location: {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    },
    address: data.address,
    urgency: data.urgency,
    tags: data.tags,
    createdBy: data.createdBy,
    priorityScore,
  });

  // Update user reputation
  await User.findByIdAndUpdate(data.createdBy, {
    $inc: {
      reputationPoints: REPUTATION_POINTS.REPORT_ISSUE,
      reportedIssuesCount: 1,
    },
  });

  return issue;
};

export const getIssuesService = async (
  filters: Record<string, unknown>,
  pagination: PaginationOptions
) => {
  const query: Record<string, unknown> = {};

  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.urgency) query.urgency = filters.urgency;
  if (filters.createdBy) query.createdBy = filters.createdBy;

  if (filters.search) {
    query.$text = { $search: filters.search as string };
  }

  // Geo filter
  if (filters.lat && filters.lng) {
    const radius = (filters.radius as number) || 5000; // default 5km
    // Geo filter will be applied after fetch
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [issues, total] = await Promise.all([
    Issue.find(query)
      .populate('createdBy', 'name avatar reputationPoints role')
      .sort(pagination.sort || '-priorityScore')
      .lean(),
    Issue.countDocuments(query),
  ]);

  // Apply geo filter manually if needed
  let filteredIssues = issues;
  if (filters.lat && filters.lng) {
    const lat = filters.lat as number;
    const lng = filters.lng as number;
    const radius = (filters.radius as number) || 5000; // default 5km

    filteredIssues = (issues as any[]).filter((issue: any) => {
      if (!issue.location || !issue.location.coordinates || issue.location.coordinates.length < 2) {
        return false;
      }
      const [issueLng, issueLat] = issue.location.coordinates;
      const distance = calculateDistance(lat, lng, issueLat, issueLng);
      return distance <= radius;
    });
  }

  return { 
    issues: (filteredIssues as any[]).slice(skip, skip + pagination.limit), 
    total: filteredIssues.length 
  };
};