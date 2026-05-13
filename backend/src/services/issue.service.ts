import Issue from '../models/Issue.model';
import User from '../models/User.model';
import { calculatePriorityScore } from './priority.service';
import { REPUTATION_POINTS } from '../config/constants';
import { PaginationOptions } from '../types';
import {
  buildGeoWithinQuery,
  isValidLatitude,
  isValidLongitude,
  isValidRadius,
} from '../utils/geo.utils';

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

  if (
    typeof filters.lat === 'number' &&
    typeof filters.lng === 'number' &&
    isValidLatitude(filters.lat) &&
    isValidLongitude(filters.lng)
  ) {
    const radius =
      typeof filters.radius === 'number' && isValidRadius(filters.radius)
        ? filters.radius
        : 5000;

    query.location = buildGeoWithinQuery(filters.lat, filters.lng, radius);
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [issues, total] = await Promise.all([
    Issue.find(query)
      .populate('createdBy', 'name avatar reputationPoints role')
      .sort(pagination.sort || '-priorityScore')
      .skip(skip)
      .limit(pagination.limit)
      .lean(),
    Issue.countDocuments(query),
  ]);

  return { issues, total };
};
