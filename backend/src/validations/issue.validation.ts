import { z } from 'zod';
import { ISSUE_CATEGORIES, URGENCY_LEVELS } from '../config/constants';

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  category: z.enum(ISSUE_CATEGORIES as unknown as [string, ...string[]]),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(300, 'Address cannot exceed 300 characters')
    .trim(),
  urgency: z
    .enum(Object.values(URGENCY_LEVELS) as [string, ...string[]])
    .optional()
    .default('medium'),
  tags: z.array(z.string().trim().toLowerCase()).optional().default([]),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    'pending',
    'under_review',
    'in_progress',
    'resolved',
    'rejected',
    'duplicate',
  ]),
  note: z.string().max(500).optional(),
  rejectionReason: z.string().max(500).optional(),
  duplicateOf: z.string().optional(),
});

export const issueQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z
    .enum(['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'duplicate'])
    .optional(),
  category: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  radius: z.string().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;